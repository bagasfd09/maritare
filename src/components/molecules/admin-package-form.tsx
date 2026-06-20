"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";
import { adminCreatePackage, adminUpdatePackage } from "@/server/actions/package";
import type { AdminPackageRow } from "@/server/queries/admin";
import { cn } from "@/lib/utils";

// Shared field/label classes so the form matches the admin surface (cream
// inputs, hairline borders, uppercase micro-labels) — mirrors AdminPromoForm.
const FIELD =
  "w-full rounded-[9px] border border-line bg-cream px-3 py-2 font-body text-[12.5px] text-charcoal outline-none placeholder:text-faint focus:border-charcoal";
const LABEL =
  "block text-[9.5px] tracking-[0.14em] uppercase font-semibold mb-[5px] text-muted-ink";

type AdminPackageFormProps =
  | { mode: "create"; package?: undefined; className?: string }
  | { mode: "edit"; package: AdminPackageRow; className?: string };

// Parse a numeric text field. Empty → null when `allowEmpty`, else null signals
// "invalid / missing". Strips non-digits so "Rp 50.000" style input still works.
function parseIntField(raw: string): number | null {
  const cleaned = raw.replace(/[^\d]/g, "");
  if (cleaned === "") {
    return null;
  }
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

// "Tambah/Edit paket" form modal. Collapsed to a trigger button by default; on
// open it renders a centered dialog with every editable field, calls the real
// create/update Server Action inside a transition, surfaces errors inline, and
// refreshes the route on success so the server-fetched package grid re-renders.
export function AdminPackageForm(props: AdminPackageFormProps) {
  const { mode, className } = props;
  const pkg = mode === "edit" ? props.package : null;

  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Seed edit fields from the existing row; create starts blank.
  const [slug, setSlug] = useState(pkg?.slug ?? "");
  const [name, setName] = useState(pkg?.name ?? "");
  const [price, setPrice] = useState(pkg ? String(pkg.price) : "");
  const [durationDays, setDurationDays] = useState(pkg ? String(pkg.days) : "");
  // guests === -1 means unlimited → show empty so the placeholder reads "∞".
  const [guestLimit, setGuestLimit] = useState(
    pkg && pkg.guests !== -1 ? String(pkg.guests) : "",
  );
  const [photoLimit, setPhotoLimit] = useState(
    pkg && pkg.photoLimit != null ? String(pkg.photoLimit) : "",
  );
  const [tagline, setTagline] = useState(pkg?.tagline ?? "");
  const [perksText, setPerksText] = useState(pkg ? pkg.perks.join("\n") : "");
  const [featured, setFeatured] = useState(pkg?.featured ?? false);
  const [active, setActive] = useState(pkg?.active ?? true);

  const reset = () => {
    setSlug(pkg?.slug ?? "");
    setName(pkg?.name ?? "");
    setPrice(pkg ? String(pkg.price) : "");
    setDurationDays(pkg ? String(pkg.days) : "");
    setGuestLimit(pkg && pkg.guests !== -1 ? String(pkg.guests) : "");
    setPhotoLimit(pkg && pkg.photoLimit != null ? String(pkg.photoLimit) : "");
    setTagline(pkg?.tagline ?? "");
    setPerksText(pkg ? pkg.perks.join("\n") : "");
    setFeatured(pkg?.featured ?? false);
    setActive(pkg?.active ?? true);
    setError(null);
  };

  const close = () => {
    setOpen(false);
    reset();
  };

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const priceValue = parseIntField(price);
    if (priceValue === null || priceValue <= 0) {
      setError("Harga harus lebih dari 0.");
      return;
    }

    const durationValue = parseIntField(durationDays);
    if (durationValue === null || durationValue <= 0) {
      setError("Durasi (hari) harus lebih dari 0.");
      return;
    }

    // Empty = unlimited (null). A present-but-invalid value is rejected.
    const guestTrimmed = guestLimit.trim();
    let guestValue: number | null = null;
    if (guestTrimmed !== "") {
      const n = parseIntField(guestTrimmed);
      if (n === null || n <= 0) {
        setError("Batas tamu harus lebih dari 0, atau kosongkan untuk unlimited.");
        return;
      }
      guestValue = n;
    }

    const photoTrimmed = photoLimit.trim();
    let photoValue: number | null = null;
    if (photoTrimmed !== "") {
      const n = parseIntField(photoTrimmed);
      if (n === null || n <= 0) {
        setError("Batas foto harus lebih dari 0, atau kosongkan untuk unlimited.");
        return;
      }
      photoValue = n;
    }

    // One perk per line → trimmed, blank lines dropped.
    const perks = perksText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const taglineTrimmed = tagline.trim();

    startTransition(async () => {
      const result =
        mode === "edit" && pkg
          ? await adminUpdatePackage({
              id: pkg.packageId,
              name: name.trim(),
              price: priceValue,
              durationDays: durationValue,
              guestLimit: guestValue,
              photoLimit: photoValue,
              tagline: taglineTrimmed || undefined,
              perks,
              featured,
              active,
            })
          : await adminCreatePackage({
              slug: slug.trim().toLowerCase(),
              name: name.trim(),
              price: priceValue,
              durationDays: durationValue,
              guestLimit: guestValue,
              photoLimit: photoValue,
              tagline: taglineTrimmed || undefined,
              perks,
              featured,
              active,
            });

      if (!result.ok) {
        setError(result.error);
        return;
      }
      close();
      router.refresh();
    });
  };

  // Trigger — a full button for create, a compact pill for edit (per-card).
  const trigger =
    mode === "create" ? (
      <Button
        variant="dark"
        size="sm"
        className={cn("bg-forest-deep text-cream", className)}
        onClick={() => setOpen(true)}
      >
        <Icon name="plus" size={12} />
        Paket baru
      </Button>
    ) : (
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={`Edit ${pkg?.name ?? "paket"}`}
        className={cn(
          "inline-flex items-center gap-[6px] rounded-full border px-[10px] py-[5px] text-[10px] font-semibold tracking-[0.1em] uppercase cursor-pointer transition-colors",
          pkg?.featured
            ? "border-[rgba(245,239,230,0.25)] text-cream hover:bg-[rgba(245,239,230,0.1)]"
            : "border-line text-charcoal hover:bg-cream",
          className,
        )}
      >
        <Icon name="edit" size={11} />
        Edit
      </button>
    );

  if (!open) {
    return trigger;
  }

  return (
    <>
      {/* Trigger stays mounted so layout doesn't jump while the modal is open. */}
      {trigger}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={mode === "create" ? "Tambah paket baru" : `Edit paket ${pkg?.name ?? ""}`}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[rgba(31,43,28,0.42)]"
        onClick={close}
      >
        <form
          onSubmit={submit}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[560px] max-h-[88vh] overflow-y-auto bg-paper border border-line rounded-[16px] p-[22px] flex flex-col gap-[16px] shadow-[0_24px_60px_rgba(26,26,26,0.22)]"
        >
          <div className="flex items-center justify-between">
            <div className="font-display font-bold text-[17px] tracking-[-0.01em] text-charcoal">
              {mode === "create" ? "Tambah paket baru" : `Edit paket ${pkg?.name ?? ""}`}
            </div>
            <button
              type="button"
              aria-label="Tutup form paket"
              onClick={close}
              className="w-7 h-7 rounded-full border border-line bg-transparent inline-flex items-center justify-center text-charcoal cursor-pointer hover:bg-cream"
            >
              <Icon name="x" size={13} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-[14px]">
            <label className="block">
              <span className={LABEL}>Nama paket</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mis. Gold"
                className={FIELD}
              />
            </label>
            <label className="block">
              <span className={LABEL}>
                Slug {mode === "edit" ? "(terkunci)" : ""}
              </span>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                placeholder="mis. gold"
                disabled={mode === "edit"}
                className={cn(FIELD, mode === "edit" && "opacity-60 cursor-not-allowed")}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-[14px]">
            <label className="block">
              <span className={LABEL}>Harga (Rp)</span>
              <input
                value={price}
                inputMode="numeric"
                onChange={(e) => setPrice(e.target.value)}
                placeholder="299000"
                className={FIELD}
              />
            </label>
            <label className="block">
              <span className={LABEL}>Durasi (hari)</span>
              <input
                value={durationDays}
                inputMode="numeric"
                onChange={(e) => setDurationDays(e.target.value)}
                placeholder="90"
                className={FIELD}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-[14px]">
            <label className="block">
              <span className={LABEL}>Batas tamu (kosong = unlimited)</span>
              <input
                value={guestLimit}
                inputMode="numeric"
                onChange={(e) => setGuestLimit(e.target.value)}
                placeholder="∞"
                className={FIELD}
              />
            </label>
            <label className="block">
              <span className={LABEL}>Batas foto (kosong = unlimited)</span>
              <input
                value={photoLimit}
                inputMode="numeric"
                onChange={(e) => setPhotoLimit(e.target.value)}
                placeholder="∞"
                className={FIELD}
              />
            </label>
          </div>

          <label className="block">
            <span className={LABEL}>Tagline (opsional)</span>
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Mis. Paling laris"
              className={FIELD}
            />
          </label>

          <label className="block">
            <span className={LABEL}>Perks (satu per baris)</span>
            <textarea
              value={perksText}
              onChange={(e) => setPerksText(e.target.value)}
              rows={5}
              placeholder={"Undangan digital\nRSVP & buku tamu\nGaleri foto"}
              className={cn(FIELD, "resize-y leading-[1.5]")}
            />
          </label>

          <div className="flex items-center gap-5">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-[15px] h-[15px] accent-burgundy"
              />
              <span className="text-[12px] font-semibold text-charcoal">Featured</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-[15px] h-[15px] accent-forest-deep"
              />
              <span className="text-[12px] font-semibold text-charcoal">Aktif</span>
            </label>
          </div>

          {error && (
            <div className="text-[11px] text-burgundy font-semibold">{error}</div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <Button
              type="submit"
              size="sm"
              className="bg-forest-deep text-cream hover:bg-forest-deep"
              disabled={isPending}
            >
              <Icon name="check" size={12} />
              {isPending
                ? "Menyimpan…"
                : mode === "create"
                  ? "Simpan paket"
                  : "Simpan perubahan"}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={close} disabled={isPending}>
              Batal
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
