"use client";

import { useState, useTransition } from "react";

import { AdminShell } from "@/components/templates/admin-shell";
import { AdminTopBar } from "@/components/organisms/admin-topbar";
import { Button } from "@/components/atoms/button";
import { SectionNumber } from "@/components/atoms/section-number";
import { saveAppSettings } from "@/server/actions/app-settings";
import type { AppSettings } from "@/server/queries/app-settings";

// Ports `.d-input` / `.d-input-lbl` from the design (mirrors settings-account).
const INPUT =
  "w-full bg-cream border border-beige rounded-[12px] px-[14px] py-3 font-body text-[14px] text-charcoal outline-none transition-colors focus:border-burgundy focus:bg-paper placeholder:text-faint";
const INPUT_LABEL =
  "font-body text-[11px] font-semibold tracking-[0.16em] uppercase text-muted-ink mb-2 block";

// Admin screen · Pengaturan (platform configuration). Edits the singleton
// app_settings row: brand name, support email, support WhatsApp. Mutations are
// super-admin gated server-side; this form mirrors the customer settings-account
// pattern (useTransition + inline save status).
export function AdminSettings({ data }: { data: AppSettings }) {
  const [brandName, setBrandName] = useState(data.brandName);
  const [supportEmail, setSupportEmail] = useState(data.supportEmail);
  const [supportWhatsapp, setSupportWhatsapp] = useState(data.supportWhatsapp);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const dirty =
    brandName.trim() !== data.brandName.trim() ||
    supportEmail.trim() !== data.supportEmail.trim() ||
    supportWhatsapp.trim() !== data.supportWhatsapp.trim();

  function handleSave() {
    setStatus(null);
    startTransition(async () => {
      const result = await saveAppSettings({
        brandName: brandName.trim(),
        supportEmail: supportEmail.trim(),
        supportWhatsapp: supportWhatsapp.trim(),
      });
      if (result.ok) {
        setStatus({ ok: true, msg: "Tersimpan." });
      } else {
        setStatus({ ok: false, msg: result.error });
      }
    });
  }

  return (
    <AdminShell active="settings">
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <AdminTopBar
          crumbs={["Admin", "Pengaturan"]}
          title="Pengaturan"
          eyebrow="Konfigurasi platform"
        />

        <div className="flex-1 overflow-y-auto px-9 py-6">
          <section className="max-w-[640px]">
            <SectionNumber className="text-[12px] mb-3">i. Identitas platform</SectionNumber>

            <div className="bg-paper border border-line rounded-[14px] px-[22px] py-5 grid grid-cols-2 gap-[18px]">
              <div className="col-span-2">
                <label className={INPUT_LABEL} htmlFor="set-brand">Nama brand</label>
                <input
                  id="set-brand"
                  className={INPUT}
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  maxLength={80}
                  placeholder="mis. Maritare"
                />
              </div>

              <div>
                <label className={INPUT_LABEL} htmlFor="set-support-email">Email support</label>
                <input
                  id="set-support-email"
                  type="email"
                  className={INPUT}
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  maxLength={255}
                  placeholder="mis. halo@maritare.id"
                />
              </div>

              <div>
                <label className={INPUT_LABEL} htmlFor="set-support-wa">WhatsApp support</label>
                <input
                  id="set-support-wa"
                  className={INPUT}
                  value={supportWhatsapp}
                  onChange={(e) => setSupportWhatsapp(e.target.value)}
                  maxLength={30}
                  placeholder="mis. +62 812-3456-7890"
                />
              </div>

              <div className="col-span-2 flex items-center gap-3 pt-1">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleSave}
                  disabled={isPending || !dirty}
                >
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
        </div>
      </main>
    </AdminShell>
  );
}
