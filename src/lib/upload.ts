// Browser-only client upload helper. Shared by every photo/audio upload site so
// they all get the SAME flow with REAL progress: presign (route handler) → PUT the
// bytes straight to R2 via XMLHttpRequest (fetch can't report upload progress, XHR
// can via `upload.onprogress`) → return the objectKey for the caller to register
// (addPhoto / save to a section).
//
// This module uses browser APIs (XMLHttpRequest) — import it ONLY from client
// components. It never touches server-only code, so it's safe to live under lib/.

export type UploadKind = "photo" | "audio" | "video" | "hero-image" | "share-image";

type SignResponse =
  | { ok: true; uploadUrl: string; objectKey: string }
  | { ok: false; error: string };

export type UploadResult =
  | { ok: true; objectKey: string }
  | { ok: false; error: string };

export type UploadOptions = {
  /** "photo" (gallery, quota-checked), "audio" (background music), "video"
   *  (folk hero cover), "hero-image", or "share-image" (link-preview image). */
  kind?: UploadKind;
  /** Called with an integer 0–100 as the bytes stream up to R2. */
  onProgress?: (percent: number) => void;
};

// PUT bytes to a presigned URL via XHR so we can report real upload progress.
// Resolves (never rejects) with ok/error so callers can branch without try/catch.
function putWithProgress(
  url: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<{ ok: true } | { ok: false; error: string }> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    // Content-Type must match the value signed by the route handler, or R2
    // rejects the PUT with 403.
    xhr.setRequestHeader("Content-Type", file.type);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve({ ok: true });
      } else {
        resolve({ ok: false, error: `Gagal mengunggah "${file.name}". Coba lagi.` });
      }
    };
    xhr.onerror = () => resolve({ ok: false, error: `Gagal mengunggah "${file.name}". Coba lagi.` });
    xhr.onabort = () => resolve({ ok: false, error: "Upload dibatalkan." });

    xhr.send(file);
  });
}

/**
 * Full client upload: presign → PUT (with progress) → return the R2 objectKey.
 *
 * `onProgress` fires 0 (signing done / upload started) up to 100 (PUT complete).
 * The caller is responsible for client-side file validation BEFORE calling this
 * (each site has its own size/type rules) and for registering the returned
 * objectKey (addPhoto / section save).
 */
export async function uploadToR2(file: File, opts: UploadOptions = {}): Promise<UploadResult> {
  const { kind = "photo", onProgress } = opts;

  // Reset the indicator to 0 while we sign (the PUT progress takes over after).
  onProgress?.(0);

  let signRes: Response;
  try {
    signRes = await fetch("/api/uploads/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type,
        size: file.size,
        kind,
      }),
    });
  } catch {
    return { ok: false, error: "Gagal menyiapkan upload. Coba lagi." };
  }

  let sign: SignResponse;
  try {
    sign = (await signRes.json()) as SignResponse;
  } catch {
    return { ok: false, error: "Gagal menyiapkan upload. Coba lagi." };
  }
  if (!sign.ok) return { ok: false, error: sign.error };

  const put = await putWithProgress(sign.uploadUrl, file, onProgress);
  if (!put.ok) return { ok: false, error: put.error };

  return { ok: true, objectKey: sign.objectKey };
}
