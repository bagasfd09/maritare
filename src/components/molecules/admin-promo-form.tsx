"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";
import { createPromo } from "@/server/actions/promo";
import { cn } from "@/lib/utils";

type DiscountType = "percent" | "fixed";

// Shared field/label classes so the inline create form matches the admin
// surface (cream inputs, hairline borders, uppercase micro-labels).
const FIELD =
  "w-full rounded-[9px] border border-line bg-cream px-3 py-2 font-body text-[12.5px] text-charcoal outline-none placeholder:text-faint focus:border-charcoal";
const LABEL =
  "block text-[9.5px] tracking-[0.14em] uppercase font-semibold mb-[5px] text-muted-ink";

// Turn a date-input value ("YYYY-MM-DD") into an offset ISO string (end of that
// day) that `createPromo`'s Zod schema accepts, or null when left empty.
function dateToIso(value: string): string | null {
  if (!value) {
    return null;
  }
  const d = new Date(`${value}T23:59:59`);
  if (Number.isNaN(d.getTime())) {
    return null;
  }
  return d.toISOString();
}

// Inline "Tambah promo" create form (desktop). Collapsed by default; expands to
// a card with the six fields, calls the real `createPromo` action inside a
// transition, surfaces errors inline, and refreshes the route on success so the
// server-fetched promo table picks up the new row.
export function AdminPromoForm({ className }: { className?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [scope, setScope] = useState("");
  const [quota, setQuota] = useState("");
  const [validUntil, setValidUntil] = useState("");

  const reset = () => {
    setCode("");
    setDiscountType("percent");
    setDiscountValue("");
    setScope("");
    setQuota("");
    setValidUntil("");
    setError(null);
  };

  const close = () => {
    setOpen(false);
    reset();
  };

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const value = Number(discountValue.replace(/[^\d]/g, ""));
    if (!Number.isFinite(value) || value <= 0) {
      setError("Nilai diskon harus lebih dari 0.");
      return;
    }

    const quotaTrimmed = quota.trim();
    let parsedQuota: number | null = null;
    if (quotaTrimmed !== "") {
      const n = Number(quotaTrimmed.replace(/[^\d]/g, ""));
      if (!Number.isFinite(n) || n <= 0) {
        setError("Kuota harus lebih dari 0, atau kosongkan untuk unlimited.");
        return;
      }
      parsedQuota = n;
    }

    startTransition(async () => {
      const result = await createPromo({
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: value,
        scope: scope.trim() || undefined,
        quota: parsedQuota,
        validUntil: dateToIso(validUntil),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      close();
      router.refresh();
    });
  };

  if (!open) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={className}
        onClick={() => setOpen(true)}
      >
        <Icon name="plus" size={12} />
        Tambah promo
      </Button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className={cn(
        "bg-paper border border-line rounded-[14px] p-[18px] flex flex-col gap-[14px] mb-3",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="font-display font-bold text-[15px] tracking-[-0.01em] text-charcoal">
          Tambah promo baru
        </div>
        <button
          type="button"
          aria-label="Tutup form promo"
          onClick={close}
          className="w-7 h-7 rounded-full border border-line bg-transparent inline-flex items-center justify-center text-charcoal cursor-pointer hover:bg-cream"
        >
          <Icon name="x" size={13} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-[14px]">
        <label className="block">
          <span className={LABEL}>Kode promo</span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="MIS. MARIT2026"
            autoCapitalize="characters"
            className={cn(FIELD, "uppercase tracking-[0.06em]")}
          />
        </label>
        <label className="block">
          <span className={LABEL}>Tipe diskon</span>
          <select
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as DiscountType)}
            className={FIELD}
          >
            <option value="percent">Persen (%)</option>
            <option value="fixed">Nominal (Rp)</option>
          </select>
        </label>
        <label className="block">
          <span className={LABEL}>
            {discountType === "percent" ? "Nilai diskon (%)" : "Nilai diskon (Rp)"}
          </span>
          <input
            value={discountValue}
            inputMode="numeric"
            onChange={(e) => setDiscountValue(e.target.value)}
            placeholder={discountType === "percent" ? "20" : "50000"}
            className={FIELD}
          />
        </label>
      </div>

      <div className="grid grid-cols-3 gap-[14px]">
        <label className="block">
          <span className={LABEL}>Berlaku untuk</span>
          <input
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            placeholder="Mis. Semua paket"
            className={FIELD}
          />
        </label>
        <label className="block">
          <span className={LABEL}>Kuota (kosong = unlimited)</span>
          <input
            value={quota}
            inputMode="numeric"
            onChange={(e) => setQuota(e.target.value)}
            placeholder="∞"
            className={FIELD}
          />
        </label>
        <label className="block">
          <span className={LABEL}>Berlaku s/d (opsional)</span>
          <input
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            className={FIELD}
          />
        </label>
      </div>

      {error && <div className="text-[11px] text-burgundy font-semibold">{error}</div>}

      <div className="flex items-center gap-2">
        <Button
          type="submit"
          size="sm"
          className="bg-forest-deep text-cream hover:bg-forest-deep"
          disabled={isPending}
        >
          <Icon name="check" size={12} />
          {isPending ? "Menyimpan…" : "Simpan promo"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={close} disabled={isPending}>
          Batal
        </Button>
      </div>
    </form>
  );
}
