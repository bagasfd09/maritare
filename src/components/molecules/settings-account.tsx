"use client";

import { useState, useTransition } from "react";

import { Avatar } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";
import { PhoneInput } from "@/components/atoms/phone-input";
import { Display, Em } from "@/components/atoms/typography";
import { SectionNumber } from "@/components/atoms/section-number";
import { saveProfile } from "@/server/actions/settings";

// Ports `.d-input` / `.d-input-lbl` from the design.
const INPUT =
  "w-full bg-cream border border-beige rounded-[12px] px-[14px] py-3 font-body text-[14px] text-charcoal outline-none transition-colors focus:border-burgundy focus:bg-paper placeholder:text-faint";
const INPUT_DISABLED =
  "w-full bg-cream/60 border border-beige rounded-[12px] px-[14px] py-3 font-body text-[14px] text-muted-ink outline-none cursor-not-allowed";
const INPUT_LABEL =
  "font-body text-[11px] font-semibold tracking-[0.16em] uppercase text-muted-ink mb-2 block";

type Profile = {
  name: string;
  email: string;
  phone: string | null;
  initials: string;
};

// Settings · section i: profile card + account details form (display name +
// WhatsApp). Email is the Google sign-in identity and is not editable here.
export function SettingsAccount({ profile }: { profile: Profile }) {
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const dirty = name.trim() !== profile.name.trim() || phone.trim() !== (profile.phone ?? "").trim();
  const headerName = profile.name.trim() || profile.email;

  function handleSave() {
    setStatus(null);
    startTransition(async () => {
      const result = await saveProfile({ name: name.trim(), phone: phone.trim() });
      if (result.ok) {
        setStatus({ ok: true, msg: "Tersimpan." });
      } else {
        setStatus({ ok: false, msg: result.error });
      }
    });
  }

  return (
    <section id="account" className="scroll-mt-6">
      <SectionNumber className="text-[12px] mb-1">i. Akun</SectionNumber>
      <Display as="div" className="text-[26px] mb-4">
        Identitas <Em className="text-burgundy">kamu.</Em>
      </Display>

      <div className="bg-paper border border-line rounded-[14px] px-[22px] py-5 flex items-center gap-[18px] mb-[14px]">
        <Avatar tone="burgundy" size={56} className="text-[20px]">
          {profile.initials}
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="font-display italic text-[22px] text-charcoal truncate">{headerName}</div>
          <div className="text-[12px] text-muted-ink mt-[2px] truncate">
            {profile.email}
            {profile.phone ? ` · ${profile.phone}` : ""}
          </div>
        </div>
        <Button variant="ghost" size="sm" disabled title="Segera hadir">
          <Icon name="upload" size={12} />
          Ganti foto
        </Button>
      </div>

      <div className="bg-paper border border-line rounded-[14px] px-[22px] py-5 grid grid-cols-2 gap-[18px]">
        <div>
          <label className={INPUT_LABEL} htmlFor="set-name">Nama tampilan</label>
          <input
            id="set-name"
            className={INPUT}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            placeholder="Nama kamu"
          />
        </div>
        <div>
          <label className={INPUT_LABEL} htmlFor="set-email">Email</label>
          <input
            id="set-email"
            className={INPUT_DISABLED}
            value={profile.email}
            disabled
            readOnly
          />
        </div>
        <div>
          <label className={INPUT_LABEL} htmlFor="set-phone">Nomor WhatsApp</label>
          <PhoneInput
            id="set-phone"
            className={INPUT}
            value={phone}
            onChange={setPhone}
            placeholder="mis. +62 812-3456-7890"
          />
        </div>
        <div>
          <label className={INPUT_LABEL}>Metode masuk</label>
          <div className="flex items-center gap-[10px] px-[14px] py-3 bg-cream border border-beige rounded-[12px] font-body text-[14px] text-muted-ink">
            <Icon name="check" size={14} stroke="var(--color-sage)" />
            <span className="flex-1">Masuk dengan Google</span>
          </div>
        </div>

        <div className="col-span-2 flex items-center gap-3 pt-1">
          <Button size="sm" variant="primary" onClick={handleSave} disabled={isPending || !dirty}>
            {isPending ? "Menyimpan…" : "Simpan perubahan"}
          </Button>
          {status && (
            <span className={status.ok ? "text-[12px] text-sage" : "text-[12px] text-burgundy"}>
              {status.msg}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
