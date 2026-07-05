"use client";

// Add / edit / delete a guest from the dashboard Tamu list. The parent keys this
// modal per (mode, guest id) so it remounts with fresh field state each open.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";
import { PhoneInput } from "@/components/atoms/phone-input";
import { addGuest, deleteGuest, updateGuest } from "@/server/actions/guests";
import type { GuestsData } from "@/server/queries/dashboard";

type GuestRow = GuestsData["guests"][number];

const INPUT =
  "w-full bg-cream border border-beige rounded-[12px] px-[14px] py-[10px] font-body text-[14px] text-charcoal outline-none transition-colors focus:border-burgundy focus:bg-paper placeholder:text-faint";
const LABEL =
  "font-body text-[11px] font-semibold tracking-[0.16em] uppercase text-muted-ink mb-[6px] block";

const SIDES: { value: GuestRow["side"]; label: string }[] = [
  { value: "both", label: "Bersama" },
  { value: "groom", label: "Pengantin Pria" },
  { value: "bride", label: "Pengantin Wanita" },
];
// Sentinel <option> that swaps the select for a free-text input.
const ADD_SIDE = "__add_side__";
const STATUSES: { value: GuestRow["status"]; label: string }[] = [
  { value: "pending", label: "Belum balas" },
  { value: "confirmed", label: "Hadir" },
  { value: "declined", label: "Tidak hadir" },
];

export function GuestFormModal({
  mode,
  guest,
  customSides = [],
  open,
  onClose,
}: {
  mode: "add" | "edit";
  guest: GuestRow | null;
  /** Non-canonical side values already used by this wedding's guests. */
  customSides?: string[];
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(guest?.name ?? "");
  const [phone, setPhone] = useState(guest?.phone ?? "");
  const [group, setGroup] = useState(guest?.group ?? "");
  const [side, setSide] = useState<GuestRow["side"]>(guest?.side ?? "both");
  const [addingSide, setAddingSide] = useState(false);
  const [status, setStatus] = useState<GuestRow["status"]>(guest?.status ?? "pending");
  const [partySize, setPartySize] = useState(guest?.partySize != null ? String(guest.partySize) : "");
  const [foodChoice, setFoodChoice] = useState(guest?.foodChoice ?? "");
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!open) return null;

  function handleSave() {
    setError(null);
    if (!name.trim()) {
      setError("Nama tamu wajib diisi.");
      return;
    }
    if (!side.trim()) {
      setError("Sisi baru belum diisi.");
      return;
    }
    const fields = {
      name: name.trim(),
      phone: phone.trim(),
      group: group.trim(),
      side: side.trim(),
      status,
      partySize: partySize.trim() === "" ? null : Number(partySize),
      foodChoice: foodChoice.trim(),
    };
    if (fields.partySize !== null && !Number.isInteger(fields.partySize)) {
      setError("Jumlah harus berupa angka.");
      return;
    }
    startTransition(async () => {
      const r =
        mode === "edit" && guest
          ? await updateGuest({ id: guest.id, ...fields })
          : await addGuest(fields);
      if (r.ok) {
        router.refresh();
        onClose();
      } else {
        setError(r.error);
      }
    });
  }

  function handleDelete() {
    if (!guest) return;
    startTransition(async () => {
      const r = await deleteGuest({ id: guest.id });
      if (r.ok) {
        router.refresh();
        onClose();
      } else {
        setError(r.error);
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(26,26,26,0.45)] px-5"
      onClick={() => !pending && onClose()}
    >
      <div
        className="w-full max-w-[440px] bg-paper rounded-2xl border border-line p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="font-display italic text-[22px] text-charcoal">
            {mode === "edit" ? "Edit tamu" : "Tambah tamu"}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="w-7 h-7 rounded-full inline-flex items-center justify-center text-muted-ink hover:bg-cream cursor-pointer"
          >
            <Icon name="x" size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={LABEL} htmlFor="g-name">Nama tamu</label>
            <input id="g-name" className={INPUT} value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="mis. Budi Santoso" />
          </div>
          <div>
            <label className={LABEL} htmlFor="g-phone">Nomor WhatsApp</label>
            <PhoneInput id="g-phone" className={INPUT} value={phone} onChange={setPhone} placeholder="08xx → +62…" />
          </div>
          <div>
            <label className={LABEL} htmlFor="g-group">Grup</label>
            <input id="g-group" className={INPUT} value={group} onChange={(e) => setGroup(e.target.value)} maxLength={80} placeholder="mis. Keluarga" />
          </div>
          <div>
            <label className={LABEL} htmlFor="g-side">Sisi</label>
            {addingSide ? (
              <div className="flex items-center gap-2">
                <input
                  id="g-side"
                  className={INPUT}
                  value={side}
                  onChange={(e) => setSide(e.target.value)}
                  maxLength={40}
                  placeholder="mis. Teman Kantor"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => { setAddingSide(false); setSide(guest?.side ?? "both"); }}
                  aria-label="Batal tambah sisi"
                  className="w-7 h-7 shrink-0 rounded-full inline-flex items-center justify-center text-muted-ink hover:bg-cream cursor-pointer"
                >
                  <Icon name="x" size={12} />
                </button>
              </div>
            ) : (
              <select
                id="g-side"
                className={INPUT}
                value={side}
                onChange={(e) => {
                  if (e.target.value === ADD_SIDE) {
                    setAddingSide(true);
                    setSide("");
                  } else {
                    setSide(e.target.value);
                  }
                }}
              >
                {SIDES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                {/* Editing a guest whose custom side has no other users still shows it. */}
                {customSides
                  .concat(side && !SIDES.some((s) => s.value === side) && !customSides.includes(side) ? [side] : [])
                  .map((s) => <option key={s} value={s}>{s}</option>)}
                <option value={ADD_SIDE}>✚ Tambah sisi baru…</option>
              </select>
            )}
          </div>
          <div>
            <label className={LABEL} htmlFor="g-status">Status RSVP</label>
            <select id="g-status" className={INPUT} value={status} onChange={(e) => setStatus(e.target.value as GuestRow["status"])}>
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="g-party">Jumlah (pax)</label>
            <input id="g-party" className={INPUT} value={partySize} onChange={(e) => setPartySize(e.target.value)} inputMode="numeric" placeholder="mis. 2" />
          </div>
          <div className="col-span-2">
            <label className={LABEL} htmlFor="g-food">Makanan</label>
            <input id="g-food" className={INPUT} value={foodChoice} onChange={(e) => setFoodChoice(e.target.value)} maxLength={80} placeholder="mis. Reguler / Vegetarian" />
          </div>
        </div>

        {error && <div className="mt-3 text-[12px] text-burgundy">{error}</div>}

        <div className="mt-6 flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={handleSave} disabled={pending}>
            {pending ? "Menyimpan…" : mode === "edit" ? "Simpan perubahan" : "Tambah tamu"}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={pending}>
            Batal
          </Button>
          <div className="flex-1" />
          {mode === "edit" && guest && (
            confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-ink">Hapus?</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-burgundy border-burgundy hover:border-burgundy"
                  onClick={handleDelete}
                  disabled={pending}
                >
                  Ya, hapus
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)} disabled={pending}>
                  Batal
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="text-burgundy border-burgundy hover:border-burgundy"
                onClick={() => setConfirmDelete(true)}
                disabled={pending}
              >
                <Icon name="x" size={12} />
                Hapus
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
