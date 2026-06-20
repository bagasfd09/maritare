"use client";

import { useRef, useState, useTransition } from "react";
import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";
import { MiniInvite, type MiniInvitePalette } from "@/components/molecules/mini-invite";
import { updateTemplate, setTemplateCover } from "@/server/actions/template";
import type { AdminTemplateRow } from "@/server/queries/admin";
import { cn } from "@/lib/utils";

// Cover-upload guards mirror the sign route's contract
// (/api/admin/templates/cover-sign): only these image types, max 5 MB. Kept here
// so the admin gets a friendly Bahasa error before any network round-trip; the
// server re-validates anyway.
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_COVER_BYTES = 5_000_000;

// Curated category presets shown in the select. The DB column is free text, so
// the value passed to the action is whatever string sits here (presets only nudge
// the common cases; an existing odd value is preserved as an extra option below).
const CATEGORY_PRESETS = ["Editorial", "Romantic", "Rustic", "Minimal"] as const;

type SignResponse =
  | { ok: true; uploadUrl: string; objectKey: string }
  | { ok: false; error: string };

type AdminTemplateEditProps = {
  template: AdminTemplateRow;
  open: boolean;
  onClose: () => void;
};

// Friendly client-side validation; returns a Bahasa error string or null.
function validateCover(file: File): string | null {
  if (!ACCEPTED_TYPES.has(file.type)) {
    return `"${file.name}" formatnya nggak didukung. Pakai JPG, PNG, WebP, atau AVIF ya.`;
  }
  if (file.size > MAX_COVER_BYTES) {
    return `"${file.name}" kegedean (maks 5 MB).`;
  }
  return null;
}

// Admin · Template edit — metadata form (name/style/category/status/featured/new)
// plus a cover-image section with direct-to-R2 presigned upload + remove. Mirrors
// the GuestsImportModal panel chrome and the Gallery upload flow.
export function AdminTemplateEdit({ template, open, onClose }: AdminTemplateEditProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState(template.name);
  const [style, setStyle] = useState(template.style);
  const [category, setCategory] = useState(template.category);
  const [status, setStatus] = useState<AdminTemplateRow["status"]>(template.status);
  const [featured, setFeatured] = useState(template.featured);
  const [isNew, setIsNew] = useState(template.new);

  const [saving, startSave] = useTransition();
  const [coverBusy, setCoverBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const busy = saving || coverBusy;

  // If the row's stored category isn't one of the presets, keep it selectable so
  // an existing value isn't silently dropped when the admin opens the modal.
  const categoryOptions =
    category && !CATEGORY_PRESETS.includes(category as (typeof CATEGORY_PRESETS)[number])
      ? [category, ...CATEGORY_PRESETS]
      : [...CATEGORY_PRESETS];

  function handleClose() {
    if (busy) return;
    setError(null);
    onClose();
  }

  function handleSave() {
    if (busy) return;
    setError(null);
    startSave(async () => {
      const res = await updateTemplate({
        id: template.templateId,
        name,
        style,
        category,
        status,
        featured,
        isNew,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
      onClose();
    });
  }

  // Cover upload: sign → PUT direct to R2 → setTemplateCover. Runs immediately on
  // file pick; on success the modal stays open so the admin sees the new cover.
  async function uploadCover(file: File) {
    const clientError = validateCover(file);
    if (clientError) {
      setError(clientError);
      return;
    }

    setError(null);
    setCoverBusy(true);
    try {
      // 1. Sign.
      let signRes: Response;
      try {
        signRes = await fetch("/api/admin/templates/cover-sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            templateId: template.templateId,
            contentType: file.type,
            size: file.size,
          }),
        });
      } catch {
        setError("Gagal menyiapkan upload. Coba lagi.");
        return;
      }

      let sign: SignResponse;
      try {
        sign = (await signRes.json()) as SignResponse;
      } catch {
        setError("Gagal menyiapkan upload. Coba lagi.");
        return;
      }
      if (!sign.ok) {
        setError(sign.error);
        return;
      }

      // 2. PUT bytes straight to R2 — never proxied through our server. The
      // Content-Type header must match the signed value or R2 rejects with 403.
      let putRes: Response;
      try {
        putRes = await fetch(sign.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
      } catch {
        setError(`Gagal mengunggah "${file.name}". Coba lagi.`);
        return;
      }
      if (!putRes.ok) {
        setError(`Gagal mengunggah "${file.name}". Coba lagi.`);
        return;
      }

      // 3. Persist the key.
      const saved = await setTemplateCover({ id: template.templateId, objectKey: sign.objectKey });
      if (!saved.ok) {
        setError(saved.error);
        return;
      }
      router.refresh();
    } finally {
      setCoverBusy(false);
    }
  }

  function onFilePicked(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    // Reset so picking the same file again re-fires onChange.
    e.target.value = "";
    if (file) {
      void uploadCover(file);
    }
  }

  function handleRemoveCover() {
    if (busy) return;
    setError(null);
    setCoverBusy(true);
    void (async () => {
      try {
        const res = await setTemplateCover({ id: template.templateId, objectKey: null });
        if (!res.ok) {
          setError(res.error);
          return;
        }
        router.refresh();
      } finally {
        setCoverBusy(false);
      }
    })();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop — click to close (disabled while busy). */}
      <button
        type="button"
        aria-label="Tutup"
        onClick={handleClose}
        disabled={busy}
        className="absolute inset-0 z-0 cursor-default border-none bg-[rgba(26,26,26,0.45)] disabled:cursor-not-allowed"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Edit template ${template.name}`}
        className="relative z-10 w-full max-w-[560px] max-h-[90vh] overflow-y-auto bg-paper border border-line rounded-2xl shadow-[0_24px_60px_rgba(26,26,26,0.28)]"
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-line sticky top-0 bg-paper z-[2]">
          <div>
            <div className="text-[10px] text-muted-ink tracking-[0.18em] uppercase font-semibold">
              Edit template
            </div>
            <h2 className="font-display font-extrabold text-[20px] text-charcoal leading-tight">
              {template.name}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Tutup"
            onClick={handleClose}
            disabled={busy}
            className="text-muted-ink hover:text-charcoal cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5">
          {/* Cover section */}
          <div>
            <div className="text-[10px] text-muted-ink tracking-[0.18em] uppercase font-semibold mb-2">
              Cover
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-[110px] h-[148px] shrink-0 rounded-[10px] overflow-hidden bg-cream border border-line flex items-center justify-center">
                {template.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- presigned R2 URLs are short-lived and not known at build time; next/image is not configured for arbitrary R2 hosts
                  <img
                    src={template.coverUrl}
                    alt={`Cover ${template.name}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <MiniInvite palette={template.id as MiniInvitePalette} width={110} scale={0.56} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-body text-[12px] text-muted-ink leading-[1.5] mb-3">
                  {template.coverUrl
                    ? "Cover khusus sedang dipakai. Ganti atau hapus untuk kembali ke preview palet."
                    : "Belum ada cover khusus — yang tampil sekarang preview palet. Unggah gambar (JPG, PNG, WebP, AVIF · maks 5 MB)."}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={busy}
                    className="inline-flex items-center gap-2 rounded-full border border-charcoal/25 bg-paper px-4 h-9 font-body font-medium text-[11px] tracking-[0.08em] uppercase text-charcoal cursor-pointer transition-colors hover:border-charcoal disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Icon name="upload" size={13} />
                    {coverBusy ? "Mengunggah…" : template.coverUrl ? "Ganti cover" : "Unggah cover"}
                  </button>
                  {template.coverUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveCover}
                      disabled={busy}
                      className="inline-flex items-center gap-2 rounded-full border border-charcoal/25 bg-paper px-4 h-9 font-body font-medium text-[11px] tracking-[0.08em] uppercase text-burgundy cursor-pointer transition-colors hover:border-burgundy disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Icon name="x" size={13} stroke="var(--color-burgundy)" />
                      Hapus cover
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onFilePicked}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-line" />

          {/* Metadata fields */}
          <div className="grid grid-cols-2 gap-4">
            <label className="col-span-2 flex flex-col gap-[6px]">
              <span className="text-[10px] text-muted-ink tracking-[0.18em] uppercase font-semibold">
                Nama
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama template"
                maxLength={80}
                className="py-[9px] px-3 rounded-md border border-line bg-paper font-body text-[13px] text-charcoal outline-none focus:border-charcoal transition-colors"
              />
            </label>

            <label className="flex flex-col gap-[6px]">
              <span className="text-[10px] text-muted-ink tracking-[0.18em] uppercase font-semibold">
                Gaya
              </span>
              <input
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                placeholder="mis. Klasik, Modern"
                maxLength={80}
                className="py-[9px] px-3 rounded-md border border-line bg-paper font-body text-[13px] text-charcoal outline-none focus:border-charcoal transition-colors"
              />
            </label>

            <label className="flex flex-col gap-[6px]">
              <span className="text-[10px] text-muted-ink tracking-[0.18em] uppercase font-semibold">
                Kategori
              </span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="py-[9px] px-3 rounded-md border border-line bg-paper font-body text-[13px] text-charcoal font-semibold outline-none focus:border-charcoal transition-colors"
              >
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="col-span-2 flex flex-col gap-[6px]">
              <span className="text-[10px] text-muted-ink tracking-[0.18em] uppercase font-semibold">
                Status
              </span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AdminTemplateRow["status"])}
                className="py-[9px] px-3 rounded-md border border-line bg-paper font-body text-[13px] text-charcoal font-semibold outline-none focus:border-charcoal transition-colors"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </label>
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-[10px]">
            <ToggleRow
              label="Featured"
              hint="Tampilkan di sorotan katalog"
              on={featured}
              onToggle={() => setFeatured((v) => !v)}
            />
            <ToggleRow
              label="Baru"
              hint="Beri tanda “Baru” pada template ini"
              on={isNew}
              onToggle={() => setIsNew((v) => !v)}
            />
          </div>

          {/* Inline error */}
          {error && (
            <div className="rounded-[10px] px-4 py-3 text-[12px] leading-[1.5] bg-[rgba(124,45,45,0.08)] text-burgundy">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-line bg-cream sticky bottom-0">
          <Button variant="ghost" onClick={handleClose} disabled={busy}>
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={busy || name.trim() === ""}
            className="disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Menyimpan…" : "Simpan"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Compact toggle row — label/hint on the left, a pill switch on the right.
function ToggleRow({
  label,
  hint,
  on,
  onToggle,
}: {
  label: string;
  hint: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 px-[14px] rounded-[10px] bg-cream border border-line">
      <div className="min-w-0">
        <div className="font-display italic text-[15px] text-charcoal leading-tight">{label}</div>
        <div className="text-[11px] text-muted-ink mt-[2px]">{hint}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={onToggle}
        className={cn(
          "relative w-11 h-6 rounded-full shrink-0 transition-colors cursor-pointer",
          on ? "bg-forest-deep" : "bg-charcoal/20",
        )}
      >
        <span
          className={cn(
            "absolute top-[3px] w-[18px] h-[18px] rounded-full bg-cream transition-[left] shadow-sm",
            on ? "left-[23px]" : "left-[3px]",
          )}
        />
      </button>
    </div>
  );
}
