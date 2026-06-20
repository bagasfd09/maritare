"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/atoms/button";
import { createTicket } from "@/server/actions/support";

// Ports `.d-input` / `.d-input-lbl` from the design (matches settings-account).
const INPUT =
  "w-full bg-cream border border-beige rounded-[12px] px-[14px] py-3 font-body text-[14px] text-charcoal outline-none transition-colors focus:border-burgundy focus:bg-paper placeholder:text-faint";
const INPUT_LABEL =
  "font-body text-[11px] font-semibold tracking-[0.16em] uppercase text-muted-ink mb-2 block";

// Settings · Bantuan: open a support ticket. Uses the same inline-status pattern
// as SettingsAccount (sage on success, burgundy on error).
export function SettingsSupport() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const canSend = subject.trim().length > 0 && body.trim().length > 0;

  function handleSend() {
    setStatus(null);
    startTransition(async () => {
      const result = await createTicket({ subject: subject.trim(), body: body.trim() });
      if (result.ok) {
        setStatus({ ok: true, msg: "Tiket terkirim — tim kami akan membalas lewat email." });
        setSubject("");
        setBody("");
      } else {
        setStatus({ ok: false, msg: result.error });
      }
    });
  }

  return (
    <div className="bg-paper border border-line rounded-[14px] px-[22px] py-5 flex flex-col gap-[18px]">
      <div>
        <label className={INPUT_LABEL} htmlFor="support-subject">Subjek</label>
        <input
          id="support-subject"
          className={INPUT}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={120}
          placeholder="mis. Cara ubah slug undangan"
        />
      </div>
      <div>
        <label className={INPUT_LABEL} htmlFor="support-body">Pesan</label>
        <textarea
          id="support-body"
          className={`${INPUT} min-h-[120px] resize-y`}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
          placeholder="Ceritakan kendalamu sedetail mungkin ya…"
        />
      </div>
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="primary"
          onClick={handleSend}
          disabled={isPending || !canSend}
        >
          {isPending ? "Mengirim…" : "Kirim tiket"}
        </Button>
        {status && (
          <span className={status.ok ? "text-[12px] text-sage" : "text-[12px] text-burgundy"}>
            {status.msg}
          </span>
        )}
      </div>
    </div>
  );
}
