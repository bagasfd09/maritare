// Browser-only client upload helper. Shared by every photo/audio upload site so
// they all get the SAME flow with REAL progress: presign (route handler) → PUT the
// bytes straight to R2 via XMLHttpRequest (fetch can't report upload progress, XHR
// can via `upload.onprogress`) → return the objectKey for the caller to register
// (addPhoto / save to a section).
//
// This module uses browser APIs (XMLHttpRequest) — import it ONLY from client
// components. It never touches server-only code, so it's safe to live under lib/.

export type UploadKind =
  | "photo"
  | "audio"
  | "video"
  | "hero-image"
  | "share-image"
  | "momen-image"
  | "group-badge";

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

// Shrink a user photo BEFORE upload: cap the longest edge and re-encode to WebP.
// Phone photos are routinely 4000px / 5-10MB; guests then download them at full
// resolution (the CDN resize only kicks in once a custom domain is configured —
// on r2.dev the /cdn-cgi/image params are ignored). Capping at the source helps
// every delivery path and shrinks R2 storage/egress. Pure browser APIs — no dep.
//
// ponytail: 1600px cap + q0.82 is plenty for the ≤600px invitation column at
// retina; raise MAX_EDGE if a future full-bleed layout needs more detail.
const MAX_EDGE = 1600;

async function compressImage(file: File): Promise<File> {
  // Skip non-raster (svg/gif keep their own encoding) — only re-encode photos.
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob(res, "image/webp", 0.82),
    );
    // Fall back to the original if encoding failed or didn't actually save bytes.
    if (!blob || blob.size >= file.size) return file;
    const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([blob], name, { type: "image/webp" });
  } catch {
    return file; // decode unsupported / OOM — upload the original untouched.
  }
}

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

  // Image kinds get resized/re-encoded client-side; audio/video pass through.
  // Sign with the (possibly) compressed file so name/type/size all match the PUT.
  if (kind !== "audio" && kind !== "video") {
    file = await compressImage(file);
  }

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
