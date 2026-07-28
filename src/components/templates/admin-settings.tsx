"use client";

import { useState, useTransition } from "react";

import { AdminShell } from "@/components/templates/admin-shell";
import { AdminTopBar } from "@/components/organisms/admin-topbar";
import { Button } from "@/components/atoms/button";
import { SectionNumber } from "@/components/atoms/section-number";
import { CHECKOUT_CHANNELS, CHECKOUT_GROUPS } from "@/lib/payment/channels";
import { saveAppSettings } from "@/server/actions/app-settings";
import type { AppSettings } from "@/server/queries/app-settings";

// Ports `.d-input` / `.d-input-lbl` from the design (mirrors settings-account).
const INPUT =
  "w-full bg-cream border border-beige rounded-[12px] px-[14px] py-3 font-body text-[14px] text-charcoal outline-none transition-colors focus:border-burgundy focus:bg-paper placeholder:text-faint";
const INPUT_LABEL =
  "font-body text-[11px] font-semibold tracking-[0.16em] uppercase text-muted-ink mb-2 block";

// Admin screen · Pengaturan (platform configuration). Edits the singleton
// app_settings row: brand name, support email, support WhatsApp, and which
// payment channels are switched off at checkout. Mutations are
// super-admin gated server-side; this form mirrors the customer settings-account
// pattern (useTransition + inline save status).
export function AdminSettings({ data }: { data: AppSettings }) {
  const [brandName, setBrandName] = useState(data.brandName);
  const [supportEmail, setSupportEmail] = useState(data.supportEmail);
  const [supportWhatsapp, setSupportWhatsapp] = useState(data.supportWhatsapp);
  const [disabled, setDisabled] = useState<string[]>(data.disabledChannels);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Counted off the catalog, not off `disabled.length` — a stale id left behind
  // by a channel we since dropped would otherwise fake a lower enabled count and
  // freeze the toggles.
  const enabledCount = CHECKOUT_CHANNELS.filter((c) => !disabled.includes(c.id)).length;

  // Flipping the LAST enabled channel off is blocked here as well as in the
  // action — customers must always have some way to pay.
  function toggleChannel(id: string) {
    setStatus(null);
    if (disabled.includes(id)) {
      setDisabled((prev) => prev.filter((c) => c !== id));
    } else if (enabledCount > 1) {
      setDisabled((prev) => [...prev, id]);
    }
  }

  const dirty =
    brandName.trim() !== data.brandName.trim() ||
    supportEmail.trim() !== data.supportEmail.trim() ||
    supportWhatsapp.trim() !== data.supportWhatsapp.trim() ||
    disabled.length !== data.disabledChannels.length ||
    disabled.some((id) => !data.disabledChannels.includes(id));

  function handleSave() {
    setStatus(null);
    startTransition(async () => {
      const result = await saveAppSettings({
        brandName: brandName.trim(),
        supportEmail: supportEmail.trim(),
        supportWhatsapp: supportWhatsapp.trim(),
        disabledChannels: disabled,
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

            </div>
          </section>

          <section className="max-w-[640px] mt-7">
            <SectionNumber className="text-[12px] mb-3">ii. Metode pembayaran</SectionNumber>

            <div className="bg-paper border border-line rounded-[14px] px-[22px] py-5">
              <p className="text-[12px] text-muted-ink leading-relaxed mb-[18px]">
                Matikan metode yang lagi bermasalah — pilihannya langsung hilang dari halaman
                checkout. Tagihan yang sudah terlanjur dibuat tetap bisa dibayar seperti biasa.{" "}
                <span className="font-semibold text-charcoal">
                  {enabledCount} dari {CHECKOUT_CHANNELS.length} metode aktif.
                </span>
              </p>

              {CHECKOUT_GROUPS.map((group) => (
                <div key={group.title} className="mb-[18px] last:mb-0">
                  <div className={INPUT_LABEL}>{group.title}</div>
                  <div className="grid grid-cols-2 gap-[10px]">
                    {group.options.map((o) => {
                      const on = !disabled.includes(o.id);
                      // The last one standing can't be switched off.
                      const locked = on && enabledCount === 1;
                      return (
                        <div
                          key={o.id}
                          className={`flex items-center gap-[10px] rounded-xl border px-[13px] py-[10px] ${on ? "border-line bg-cream" : "border-beige bg-cream/40"}`}
                        >
                          {o.logo ? (
                            <span className="w-11 h-[30px] rounded-md bg-white border border-line flex items-center justify-center shrink-0 px-[5px]">
                              {/* eslint-disable-next-line @next/next/no-img-element -- tiny local asset; matches the checkout picker */}
                              <img
                                src={o.logo}
                                alt=""
                                className={`max-h-[20px] w-auto object-contain ${on ? "" : "grayscale opacity-50"}`}
                                loading="lazy"
                              />
                            </span>
                          ) : (
                            <span
                              className={`min-w-11 px-[3px] h-[30px] rounded-md text-white flex items-center justify-center text-[8.5px] font-extrabold tracking-[0.04em] shrink-0 uppercase whitespace-nowrap ${on ? "" : "grayscale opacity-50"}`}
                              style={{ background: o.color }}
                            >
                              {o.badge}
                            </span>
                          )}

                          <span className="flex-1 min-w-0">
                            <span
                              className={`block text-[12.5px] font-semibold truncate ${on ? "text-charcoal" : "text-faint"}`}
                            >
                              {o.label}
                            </span>
                            <span className="block text-[10.5px] text-muted-ink mt-px">
                              {on ? "Aktif" : "Nonaktif"}
                            </span>
                          </span>

                          <button
                            type="button"
                            role="switch"
                            aria-checked={on}
                            aria-label={`${o.label} — ${on ? "aktif" : "nonaktif"}`}
                            disabled={locked}
                            title={locked ? "Minimal satu metode harus tetap aktif" : undefined}
                            onClick={() => toggleChannel(o.id)}
                            className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${locked ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${on ? "bg-forest-deep" : "bg-charcoal/20"}`}
                          >
                            <span
                              className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-cream transition-[left] shadow-sm ${on ? "left-[23px]" : "left-[3px]"}`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="max-w-[640px] flex items-center gap-3 mt-6">
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
      </main>
    </AdminShell>
  );
}
