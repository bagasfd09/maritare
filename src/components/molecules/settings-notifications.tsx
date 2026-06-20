"use client";

import { useState, useTransition } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/atoms/button";
import { Display, Em } from "@/components/atoms/typography";
import { SectionNumber } from "@/components/atoms/section-number";
import {
  NOTIFICATION_ROWS,
  type NotificationChannel,
  type NotificationKind,
  type NotificationPrefs,
} from "@/lib/notifications";
import { saveNotifications } from "@/server/actions/settings";

// Interactive on/off switch.
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-2 justify-self-center">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={onToggle}
        className={cn(
          "w-[34px] h-5 rounded-full relative cursor-pointer shrink-0 transition-colors",
          on ? "bg-sage" : "bg-beige",
        )}
      >
        <span
          className={cn(
            "absolute top-[2px] w-4 h-4 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.18)] transition-[left]",
            on ? "left-4" : "left-[2px]",
          )}
        />
      </button>
    </div>
  );
}

// Settings · section iii: email/WhatsApp notification preferences.
export function SettingsNotifications({ prefs: initial }: { prefs: NotificationPrefs }) {
  const [prefs, setPrefs] = useState<NotificationPrefs>(initial);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const dirty = JSON.stringify(prefs) !== JSON.stringify(initial);

  function toggle(kind: NotificationKind, channel: keyof NotificationChannel) {
    setStatus(null);
    setPrefs((prev) => ({
      ...prev,
      [kind]: { ...prev[kind], [channel]: !prev[kind][channel] },
    }));
  }

  function handleSave() {
    setStatus(null);
    startTransition(async () => {
      const result = await saveNotifications({ prefs });
      if (result.ok) {
        setStatus({ ok: true, msg: "Tersimpan." });
      } else {
        setStatus({ ok: false, msg: result.error });
      }
    });
  }

  return (
    <section id="notifikasi" className="scroll-mt-6">
      <SectionNumber className="text-[12px] mb-1">iv. Notifikasi</SectionNumber>
      <Display as="div" className="text-[26px] mb-4">
        Kapan kami <Em className="text-burgundy">kasih kabar?</Em>
      </Display>

      <div className="bg-paper border border-line rounded-[14px] px-[22px] py-2">
        {NOTIFICATION_ROWS.map((n, i) => (
          <div
            key={n.kind}
            className={cn(
              "grid grid-cols-[1fr_80px_80px] gap-4 items-center py-[14px]",
              i < NOTIFICATION_ROWS.length - 1 && "border-b border-line",
            )}
          >
            <div>
              <div className="text-[13px] font-semibold">{n.label}</div>
              <div className="text-[11px] text-muted-ink mt-[2px]">{n.desc}</div>
            </div>
            <Toggle on={prefs[n.kind].email} onToggle={() => toggle(n.kind, "email")} />
            <Toggle on={prefs[n.kind].wa} onToggle={() => toggle(n.kind, "wa")} />
          </div>
        ))}
        <div className="grid grid-cols-[1fr_80px_80px] gap-4 items-center pt-[10px] pb-3 border-t border-line mt-1">
          <div />
          <div className="text-[9px] text-muted-ink tracking-[0.22em] uppercase font-bold text-center">
            Email
          </div>
          <div className="text-[9px] text-muted-ink tracking-[0.22em] uppercase font-bold text-center">
            WhatsApp
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-[14px]">
        <Button size="sm" variant="primary" onClick={handleSave} disabled={isPending || !dirty}>
          {isPending ? "Menyimpan…" : "Simpan preferensi"}
        </Button>
        {status && (
          <span className={status.ok ? "text-[12px] text-sage" : "text-[12px] text-burgundy"}>
            {status.msg}
          </span>
        )}
      </div>
    </section>
  );
}
