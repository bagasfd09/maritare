"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { uploadToR2 } from "@/lib/upload";
import { addPhoto, deletePhoto, setClosingPhoto, setCoverPhoto } from "@/server/actions/photos";
import type { Gallery } from "@/server/queries/photos";

// Shared gallery interactivity (uploads with real progress, delete, cover /
// closing selection) so the desktop and mobile screens behave identically —
// same split as useCheckout. Layout stays each screen's own concern.

// Client-side upload guards mirror the sign route's contract: only these image
// types, at most 10 MB per file. Friendly Bahasa error before any network
// round-trip; the server re-validates anyway.
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_BYTES = 10_000_000;

function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.has(file.type)) {
    return `"${file.name}" formatnya nggak didukung. Pakai JPG, PNG, WebP, atau AVIF ya.`;
  }
  if (file.size > MAX_BYTES) {
    return `"${file.name}" kegedean (maks 10 MB).`;
  }
  return null;
}

export function useGallery(gallery: Gallery) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null);
  const [fileProgress, setFileProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The photo id a mutation (delete / cover / closing) is in flight for.
  const [pendingPhotoId, setPendingPhotoId] = useState<string | null>(null);

  const { used, limit } = gallery;
  const isUnlimited = limit === null;
  const remaining = isUnlimited ? null : Math.max(0, limit - used);
  const busy = uploading !== null || isPending;

  // Overall batch progress: finished files + the in-flight file's fraction.
  const overallPct = uploading
    ? Math.min(100, Math.round(((uploading.done + fileProgress / 100) / uploading.total) * 100))
    : 0;

  // Upload one file: presign + PUT-with-progress → register via addPhoto.
  // No label: photos are photos, not filenames (labels made ugly filter chips).
  async function uploadOne(file: File): Promise<string | null> {
    const clientError = validateFile(file);
    if (clientError) {
      return clientError;
    }
    const up = await uploadToR2(file, { kind: "photo", onProgress: setFileProgress });
    if (!up.ok) {
      return up.error;
    }
    const add = await addPhoto({ objectKey: up.objectKey });
    if (!add.ok) {
      return add.error;
    }
    return null;
  }

  function handleFiles(fileList: FileList | null) {
    if (busy) {
      return;
    }
    const files = fileList ? Array.from(fileList) : [];
    if (files.length === 0) {
      return;
    }

    setError(null);
    if (!isUnlimited && remaining !== null && files.length > remaining) {
      setError(
        remaining === 0
          ? "Kuota foto paketmu sudah penuh."
          : `Sisa kuota cuma ${remaining} foto, tapi kamu pilih ${files.length}.`,
      );
      return;
    }

    setUploading({ done: 0, total: files.length });
    setFileProgress(0);

    startTransition(async () => {
      let firstError: string | null = null;
      for (let i = 0; i < files.length; i += 1) {
        const fileError = await uploadOne(files[i]);
        if (fileError && !firstError) {
          firstError = fileError;
        }
        setUploading({ done: i + 1, total: files.length });
        setFileProgress(0);
      }
      router.refresh();
      if (firstError) {
        setUploading(null);
        setError(firstError);
      } else {
        // Hold the completed 100% one beat so the final frame isn't batched away.
        setTimeout(() => setUploading(null), 400);
      }
    });
  }

  function handleDrop(event: React.DragEvent<HTMLElement>) {
    event.preventDefault();
    setIsDragOver(false);
    handleFiles(event.dataTransfer.files);
  }
  function handleDragOver(event: React.DragEvent<HTMLElement>) {
    event.preventDefault();
    if (!isDragOver) {
      setIsDragOver(true);
    }
  }
  function handleDragLeave(event: React.DragEvent<HTMLElement>) {
    event.preventDefault();
    setIsDragOver(false);
  }
  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    handleFiles(event.target.files);
    event.target.value = ""; // same file picked twice must re-fire onChange
  }
  function openFilePicker() {
    if (!busy) {
      fileInputRef.current?.click();
    }
  }

  // One runner for every per-photo mutation so pending/error handling can't drift.
  function runPhotoAction(photoId: string, action: () => Promise<{ ok: boolean; error?: string }>) {
    if (busy || pendingPhotoId !== null) {
      return;
    }
    setError(null);
    setPendingPhotoId(photoId);
    startTransition(async () => {
      const result = await action();
      setPendingPhotoId(null);
      if (!result.ok) {
        setError(result.error ?? "Gagal. Coba lagi.");
        return;
      }
      router.refresh();
    });
  }

  const handleDelete = (photoId: string) => runPhotoAction(photoId, () => deletePhoto({ photoId }));
  /** Toggle: setting the current cover again clears it. */
  const handleSetCover = (photoId: string, isCover: boolean) =>
    runPhotoAction(photoId, () => setCoverPhoto({ photoId: isCover ? null : photoId }));
  const handleSetClosing = (photoId: string, isClosing: boolean) =>
    runPhotoAction(photoId, () => setClosingPhoto({ photoId: isClosing ? null : photoId }));

  return {
    fileInputRef,
    uploading,
    overallPct,
    isDragOver,
    error,
    pendingPhotoId,
    busy,
    isUnlimited,
    remaining,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleInputChange,
    openFilePicker,
    handleDelete,
    handleSetCover,
    handleSetClosing,
  };
}
