"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";
import { createPromo, searchCustomers, type CustomerHit } from "@/server/actions/promo";
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

export type PromoFormPackage = { packageId: string; name: string };

// Inline "Tambah promo" create form. Collapsed by default; expands to a card:
// code / type / value, a REAL package restriction (select — enforced by
// resolvePromo, no more free-text "Berlaku untuk"), quota, end date, and an
// optional list of targeted customers picked from existing users via search.
export function AdminPromoForm({
  packages,
  className,
}: {
  packages: PromoFormPackage[];
  className?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [packageId, setPackageId] = useState(""); // "" = semua paket
  const [quota, setQuota] = useState("");
  const [validUntil, setValidUntil] = useState("");

  // Targeted-customer picker: debounced live search against existing users.
  const [userQuery, setUserQuery] = useState("");
  const [hits, setHits] = useState<CustomerHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<CustomerHit[]>([]);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (searchTimer.current !== null) {
        clearTimeout(searchTimer.current);
      }
    };
  }, []);

  function onUserQueryChange(q: string) {
    setUserQuery(q);
    if (searchTimer.current !== null) {
      clearTimeout(searchTimer.current);
    }
    if (q.trim().length < 2) {
      setHits([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      const result = await searchCustomers({ query: q });
      setSearching(false);
      setHits(result.ok ? result.customers : []);
    }, 300);
  }

  function addUser(hit: CustomerHit) {
    setSelectedUsers((prev) => (prev.some((u) => u.id === hit.id) ? prev : [...prev, hit]));
    setUserQuery("");
    setHits([]);
  }

  function removeUser(id: string) {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== id));
  }

  const reset = () => {
    setCode("");
    setDiscountType("percent");
    setDiscountValue("");
    setPackageId("");
    setQuota("");
    setValidUntil("");
    setUserQuery("");
    setHits([]);
    setSelectedUsers([]);
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
        packageId: packageId || null,
        allowedUserIds: selectedUsers.map((u) => u.id),
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[14px]">
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
            {discountType === "percent" ? "Nilai diskon (%) · 100 = gratis" : "Nilai diskon (Rp)"}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[14px]">
        <label className="block">
          <span className={LABEL}>Berlaku untuk paket</span>
          <select
            value={packageId}
            onChange={(e) => setPackageId(e.target.value)}
            className={FIELD}
          >
            <option value="">Semua paket</option>
            {packages.map((p) => (
              <option key={p.packageId} value={p.packageId}>
                Paket {p.name}
              </option>
            ))}
          </select>
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

      {/* Targeted customers — empty means every customer can redeem. */}
      <div>
        <span className={LABEL}>Khusus user tertentu (kosong = semua user)</span>
        {selectedUsers.length > 0 && (
          <div className="flex flex-wrap gap-[6px] mb-2">
            {selectedUsers.map((u) => (
              <span
                key={u.id}
                className="inline-flex items-center gap-[6px] rounded-full bg-cream border border-line pl-3 pr-[6px] py-[4px] text-[11.5px] text-charcoal"
              >
                {u.name || u.email}
                <button
                  type="button"
                  aria-label={`Hapus ${u.email}`}
                  onClick={() => removeUser(u.id)}
                  className="w-[18px] h-[18px] rounded-full bg-paper border border-line inline-flex items-center justify-center cursor-pointer hover:bg-peach"
                >
                  <Icon name="x" size={9} />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="relative">
          <input
            value={userQuery}
            onChange={(e) => onUserQueryChange(e.target.value)}
            placeholder="Cari nama / email user…"
            className={FIELD}
          />
          {userQuery.trim().length >= 2 && (hits.length > 0 || searching) && (
            <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-paper border border-line rounded-[10px] shadow-[0_14px_30px_rgba(26,26,26,0.14)] overflow-hidden">
              {searching ? (
                <div className="px-3 py-2 text-[11.5px] text-muted-ink">Mencari…</div>
              ) : (
                hits.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => addUser(h)}
                    className="block w-full text-left px-3 py-2 text-[12px] text-charcoal cursor-pointer hover:bg-cream"
                  >
                    <span className="font-semibold">{h.name || "—"}</span>{" "}
                    <span className="text-muted-ink">{h.email}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
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
