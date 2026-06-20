"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/atoms/button";
import { Display, Em } from "@/components/atoms/typography";
import { SectionNumber } from "@/components/atoms/section-number";
import { saveWeddingDetails } from "@/server/actions/wedding";
import type { SettingsData } from "@/server/queries/dashboard";

const INPUT =
  "w-full bg-cream border border-beige rounded-[12px] px-[14px] py-3 font-body text-[14px] text-charcoal outline-none transition-colors focus:border-burgundy focus:bg-paper placeholder:text-faint";
const LABEL =
  "font-body text-[11px] font-semibold tracking-[0.16em] uppercase text-muted-ink mb-2 block";

// Settings · Detail undangan: edit the core wedding fields (date / names /
// venue / city) that drive the countdown, dashboard, and guestbook header.
export function SettingsWedding({ wedding }: { wedding: SettingsData["wedding"] }) {
  const router = useRouter();
  const [groomName, setGroomName] = useState(wedding.groomName);
  const [brideName, setBrideName] = useState(wedding.brideName);
  const [eventDate, setEventDate] = useState(wedding.eventDate ?? "");
  const [venue, setVenue] = useState(wedding.venue ?? "");
  const [city, setCity] = useState(wedding.city ?? "");
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const dirty =
    groomName.trim() !== wedding.groomName.trim() ||
    brideName.trim() !== wedding.brideName.trim() ||
    eventDate !== (wedding.eventDate ?? "") ||
    venue.trim() !== (wedding.venue ?? "").trim() ||
    city.trim() !== (wedding.city ?? "").trim();

  function handleSave() {
    setStatus(null);
    if (!groomName.trim() || !brideName.trim()) {
      setStatus({ ok: false, msg: "Nama kedua mempelai wajib diisi." });
      return;
    }
    startTransition(async () => {
      const r = await saveWeddingDetails({
        groomName: groomName.trim(),
        brideName: brideName.trim(),
        eventDate: eventDate || "",
        venue: venue.trim(),
        city: city.trim(),
      });
      if (r.ok) {
        setStatus({ ok: true, msg: "Tersimpan." });
        router.refresh();
      } else {
        setStatus({ ok: false, msg: r.error });
      }
    });
  }

  return (
    <section id="undangan" className="scroll-mt-6">
      <SectionNumber className="text-[12px] mb-1">ii. Detail undangan</SectionNumber>
      <Display as="div" className="text-[26px] mb-4">
        Tanggal &amp; <Em className="text-burgundy">acara.</Em>
      </Display>

      <div className="bg-paper border border-line rounded-[14px] px-[22px] py-5 grid grid-cols-2 gap-[18px]">
        <div>
          <label className={LABEL} htmlFor="w-date">Tanggal nikah</label>
          <input
            id="w-date"
            type="date"
            className={INPUT}
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
          />
        </div>
        <div>
          <label className={LABEL} htmlFor="w-city">Kota</label>
          <input id="w-city" className={INPUT} value={city} onChange={(e) => setCity(e.target.value)} maxLength={80} placeholder="mis. Yogyakarta" />
        </div>
        <div>
          <label className={LABEL} htmlFor="w-groom">Nama mempelai pria</label>
          <input id="w-groom" className={INPUT} value={groomName} onChange={(e) => setGroomName(e.target.value)} maxLength={80} />
        </div>
        <div>
          <label className={LABEL} htmlFor="w-bride">Nama mempelai wanita</label>
          <input id="w-bride" className={INPUT} value={brideName} onChange={(e) => setBrideName(e.target.value)} maxLength={80} />
        </div>
        <div className="col-span-2">
          <label className={LABEL} htmlFor="w-venue">Lokasi / venue</label>
          <input id="w-venue" className={INPUT} value={venue} onChange={(e) => setVenue(e.target.value)} maxLength={160} placeholder="mis. Pendopo Kayon" />
        </div>

        <div className="col-span-2 flex items-center gap-3 pt-1">
          <Button size="sm" variant="primary" onClick={handleSave} disabled={pending || !dirty}>
            {pending ? "Menyimpan…" : "Simpan detail"}
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
