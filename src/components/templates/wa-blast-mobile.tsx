"use client";

// Mobile "Sebar via WhatsApp" — list-first quick-send. On a phone you leave the
// app for WhatsApp on every send, so a forced on-screen countdown (the desktop
// focus mode) is useless while backgrounded. Here the LIST is the focus mode:
// tap Kirim → WhatsApp opens → swipe back and the row has flipped to Terkirim,
// the next "Belum" guest is tagged Berikutnya. Pacing is the human round-trip.

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { MobileShell } from "@/components/templates/mobile-shell";
import { MobileCard, MobileChip, MobileChipRow } from "@/components/molecules/mobile-primitives";
import { Icon } from "@/components/atoms/icon";
import { Avatar, initials } from "@/components/atoms/avatar";
import { waMeLink } from "@/lib/invite-message";
import { normalizePhoneIntl } from "@/lib/phone";
import { markGuestInvited } from "@/server/actions/guests";
import type { WaBlastData } from "@/server/queries/dashboard";
import {
  WA,
  TONES,
  STATUS_META,
  type Guest,
  effStatus,
  validPhone,
  defaultTemplates,
  useWaTemplates,
  type Template,
  fillTemplate,
  WAGlyph,
  WAChat,
} from "@/components/templates/wa-blast-shared";

export function WaBlastMobile({ data }: { data: WaBlastData }) {
  const router = useRouter();
  const slug = data.weddingSlug;
  const coupleLabel = `${data.groomName} & ${data.brideName}`;
  const guests = data.guests;

  const defaults = useMemo(
    () => defaultTemplates(coupleLabel, data.dateLabel, data.venueLabel, data.timeLabel),
    [coupleLabel, data.dateLabel, data.venueLabel, data.timeLabel],
  );

  const [sentLocal, setSentLocal] = useState<Set<string>>(new Set());
  const { tplText, setTplText, persist } = useWaTemplates(defaults, data.savedTemplates);
  const [templateId, setTemplateId] = useState("undangan");
  const [filter, setFilter] = useState<"all" | "unsent" | "sent" | "followup">("all");
  const [query, setQuery] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  // Closing unmounts the textarea before its onBlur fires — persist here too.
  function closeSheet() {
    persist();
    setSheetOpen(false);
  }
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const template = tplText[templateId] ?? "";
  const templates: Template[] = defaults.map((t) => ({ ...t, text: tplText[t.id] ?? t.text }));
  const activeTemplateName = templates.find((t) => t.id === templateId)?.name ?? "";

  function send(g: Guest) {
    const target = normalizePhoneIntl(g.phone);
    if (!target) return;
    window.open(waMeLink(target, fillTemplate(template, g, slug)), "_blank", "noopener");
    setSentLocal((p) => new Set(p).add(g.id));
    markGuestInvited({ guestId: g.id }).then(() => router.refresh());
  }
  function copy(g: Guest) {
    try {
      navigator.clipboard.writeText(fillTemplate(template, g, slug));
    } catch {
      /* ignore */
    }
    setCopiedId(g.id);
    setTimeout(() => setCopiedId(null), 1400);
  }

  // counts
  const total = guests.length;
  const sentCount = guests.filter((g) => effStatus(g, sentLocal) !== "unsent").length;
  const remaining = total - sentCount;
  const openedCount = guests.filter((g) => effStatus(g, sentLocal) === "opened").length;
  const rsvpCount = guests.filter((g) => effStatus(g, sentLocal) === "rsvp").length;
  const followupIds = guests.filter((g) => effStatus(g, sentLocal) === "opened").map((g) => g.id);
  const pct = total > 0 ? Math.round((sentCount / total) * 100) : 0;
  const allDone = total > 0 && sentCount === total;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guests.filter((g) => {
      const st = effStatus(g, sentLocal);
      if (filter === "unsent" && st !== "unsent") return false;
      if (filter === "sent" && st === "unsent") return false;
      if (filter === "followup" && !followupIds.includes(g.id)) return false;
      if (q) {
        return (
          g.name.toLowerCase().includes(q) ||
          (g.group ?? "").toLowerCase().includes(q) ||
          (g.phone ?? "").replace(/\s/g, "").includes(q.replace(/\s/g, ""))
        );
      }
      return true;
    });
  }, [guests, sentLocal, filter, query, followupIds]);

  const nextGuest = useMemo(
    () => guests.find((g) => effStatus(g, sentLocal) === "unsent") ?? null,
    [guests, sentLocal],
  );
  const previewGuest = nextGuest ?? guests[0] ?? null;

  const STATUS_FILTERS: Array<[typeof filter, string]> = [
    ["all", `Semua ${total}`],
    ["unsent", `Belum ${remaining}`],
    ["sent", `Terkirim ${sentCount}`],
    ["followup", `Follow-up ${followupIds.length}`],
  ];
  const LEGEND: Array<[string, number, string]> = [
    ["Belum", remaining, "var(--color-terracotta)"],
    ["Terkirim", sentCount, WA.green],
    ["Dibuka", openedCount, "#3Fb6c0"],
    ["Konfirmasi", rsvpCount, "#5Fd08e"],
  ];

  return (
    <MobileShell
      active="tamu"
      eyebrow="Daftar Tamu · Sebar"
      title={<>Kirim, <span className="italic font-normal text-burgundy">satu per satu.</span></>}
      right={
        <a
          href="/dashboard/guests"
          aria-label="Kembali ke daftar tamu"
          className="w-9 h-9 rounded-full border border-charcoal/15 bg-paper inline-flex items-center justify-center"
        >
          <span style={{ display: "inline-flex", transform: "scaleX(-1)" }}>
            <Icon name="chevron-r" size={16} />
          </span>
        </a>
      }
    >
      {/* Progress strip */}
      <MobileCard tone="dark">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-[9.5px] tracking-[0.2em] uppercase font-semibold text-cream/55">
              Progres pengiriman
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display font-extrabold [font-variation-settings:'opsz'_144] text-[34px] leading-none text-peach">
                {sentCount}
              </span>
              <span className="font-display italic text-[13px] text-cream/60">/ {total} terkirim</span>
            </div>
          </div>
          <div className="text-right">
            <div className="font-display font-extrabold text-[22px] leading-none">{pct}%</div>
            <div className="text-[9px] tracking-[0.16em] uppercase text-cream/50 mt-1">tuntas</div>
          </div>
        </div>
        <div className="h-[8px] rounded-full bg-cream/15 overflow-hidden mt-3">
          <div className="h-full rounded-full transition-[width] duration-300" style={{ width: `${pct}%`, background: WA.green }} />
        </div>
        <div className="flex flex-wrap items-center gap-x-[14px] gap-y-1 mt-3">
          {LEGEND.map(([label, val, c]) => (
            <span key={label} className="inline-flex items-center gap-[5px] text-[10.5px] text-cream/70">
              <span className="w-[7px] h-[7px] rounded-full" style={{ background: c }} />
              <span className="font-semibold text-cream">{val}</span> {label}
            </span>
          ))}
        </div>
      </MobileCard>

      {/* Active-template bar → opens the editor sheet */}
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="flex items-center gap-3 w-full text-left bg-paper border border-line rounded-2xl px-4 py-[13px]"
      >
        <span className="w-9 h-9 rounded-[10px] bg-sage-soft text-[#2E3325] inline-flex items-center justify-center shrink-0">
          <Icon name="edit" size={15} />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-[10px] tracking-[0.14em] uppercase font-semibold text-muted-ink">
            Pesan template
          </span>
          <span className="block text-sm font-semibold text-charcoal truncate">{activeTemplateName}</span>
        </span>
        <span className="text-[11px] font-semibold text-burgundy shrink-0">Atur</span>
      </button>

      {/* Search */}
      <div className="flex items-center gap-[10px] bg-cream border border-beige rounded-[12px] px-[14px] py-[11px]">
        <Icon name="search" size={15} stroke="var(--color-faint)" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari nama atau nomor…"
          className="border-0 bg-transparent outline-none font-body text-sm text-charcoal flex-1"
        />
      </div>

      {/* Status filters */}
      <MobileChipRow>
        {STATUS_FILTERS.map(([k, label]) => (
          <MobileChip key={k} active={filter === k} onClick={() => setFilter(k)}>
            {label}
          </MobileChip>
        ))}
      </MobileChipRow>

      {allDone && (
        <MobileCard tone="sage" className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-full inline-flex items-center justify-center shrink-0" style={{ background: WA.green }}>
            <Icon name="check" size={16} stroke="#fff" strokeWidth={2.4} />
          </span>
          <div className="font-display italic text-[16px] text-[#2E3325]">
            Semua undangan sudah dikirim 🎉
          </div>
        </MobileCard>
      )}

      {/* Guest list — quick-send rows */}
      <MobileCard flush>
        {filtered.length === 0 ? (
          <div className="px-4 py-8 text-center font-display italic text-[14px] text-faint">
            Tidak ada tamu pada filter ini.
          </div>
        ) : (
          filtered.map((g, i) => {
            const st = effStatus(g, sentLocal);
            const meta = STATUS_META[st];
            const isNext = nextGuest?.id === g.id;
            const isSent = st !== "unsent";
            const bad = !validPhone(g);
            return (
              <div
                key={g.id}
                className="flex items-center gap-[10px] px-4 py-3 border-b border-line last:border-b-0"
                style={{
                  borderLeft: isNext ? "3px solid var(--color-burgundy)" : "3px solid transparent",
                  background: isSent ? "rgba(31,168,85,0.035)" : isNext ? "rgba(124,45,45,0.03)" : undefined,
                }}
              >
                <Avatar tone={TONES[i % 5]} size={40}>
                  {initials(g.name)}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-[6px]">
                    <span className="text-sm font-semibold truncate">{g.name}</span>
                    {isNext && (
                      <span className="shrink-0 text-[8.5px] tracking-[0.12em] uppercase font-bold text-burgundy bg-peach px-[6px] py-[1px] rounded-full">
                        Berikutnya
                      </span>
                    )}
                    {bad && (
                      <span className="shrink-0 text-[9px] font-semibold text-burgundy bg-[rgba(124,45,45,0.1)] px-[6px] py-[1px] rounded-full">
                        ⚠ nomor
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-ink truncate">
                    {g.group ?? "—"}
                    {g.phone ? ` · ${g.phone}` : " · tanpa nomor"}
                  </div>
                  <span
                    className="inline-flex items-center gap-[5px] mt-[5px] text-[10px] font-semibold rounded-full px-[8px] py-[2px]"
                    style={{ color: meta.color, background: meta.bg }}
                  >
                    <span className="w-[5px] h-[5px] rounded-full" style={{ background: meta.dot }} />
                    {meta.label}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-[6px] shrink-0">
                  {isSent ? (
                    <button
                      type="button"
                      onClick={() => send(g)}
                      disabled={bad}
                      className="inline-flex items-center gap-[6px] h-9 px-[14px] rounded-full text-[12px] font-semibold disabled:opacity-40"
                      style={{ border: `1px solid ${WA.green}`, color: WA.greenDeep, background: "transparent" }}
                    >
                      <WAGlyph size={13} color={WA.greenDeep} /> Ulang
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => send(g)}
                      disabled={bad}
                      className="inline-flex items-center gap-[6px] h-9 px-[15px] rounded-full text-[12px] font-semibold text-white disabled:opacity-40"
                      style={{ background: WA.green }}
                    >
                      <WAGlyph size={14} /> Kirim
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => copy(g)}
                    className="text-[11px] font-semibold text-muted-ink inline-flex items-center gap-[4px]"
                  >
                    <Icon name={copiedId === g.id ? "check" : "copy"} size={12} stroke={copiedId === g.id ? WA.greenDeep : "var(--color-muted-ink)"} />
                    {copiedId === g.id ? "Tersalin" : "Salin"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </MobileCard>

      {/* Template editor bottom sheet */}
      {sheetOpen && (
        <>
          <button
            type="button"
            aria-label="Tutup"
            onClick={closeSheet}
            className="fixed inset-0 z-40 bg-charcoal/40"
          />
          <div className="fixed inset-x-0 bottom-0 z-50 max-h-[82vh] overflow-y-auto rounded-t-2xl bg-paper border-t border-line px-4 pt-4 pb-7 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-display italic text-[18px] text-charcoal">Pesan template</div>
                <div className="text-[10.5px] text-muted-ink mt-[2px]">Dipakai untuk semua tombol kirim</div>
              </div>
              <button
                type="button"
                onClick={closeSheet}
                className="w-8 h-8 rounded-full border border-line inline-flex items-center justify-center"
              >
                <Icon name="x" size={15} />
              </button>
            </div>

            <MobileChipRow className="mb-3">
              {templates.map((t) => (
                <MobileChip key={t.id} active={templateId === t.id} onClick={() => setTemplateId(t.id)}>
                  {t.name}
                </MobileChip>
              ))}
            </MobileChipRow>

            <textarea
              value={template}
              onChange={(e) => setTplText((p) => ({ ...p, [templateId]: e.target.value }))}
              onBlur={persist}
              spellCheck={false}
              rows={7}
              className="w-full resize-none bg-cream border border-beige rounded-[12px] px-[14px] py-3 font-body text-[13px] leading-[1.55] text-charcoal outline-none focus:border-burgundy"
            />

            <div className="flex flex-wrap gap-[6px] mt-3">
              {[["{nama}", "Nama tamu"], ["{grup}", "Nama grup"], ["{link}", "Link undangan"]].map(([code, hint]) => (
                <span
                  key={code}
                  title={hint}
                  className="text-[10.5px] font-semibold bg-sage-soft text-[#2E3325] px-[9px] py-[4px] rounded-[7px]"
                >
                  {code}
                </span>
              ))}
            </div>

            {previewGuest && (
              <div className="mt-4">
                <div className="text-[9.5px] tracking-[0.2em] uppercase font-semibold text-muted-ink mb-[9px] flex items-center gap-[6px]">
                  <WAGlyph size={12} color="var(--color-muted-ink)" /> Tampilan di WhatsApp · {previewGuest.name.split(" ")[0]}
                </div>
                <WAChat text={fillTemplate(template, previewGuest, slug)} maxHeight={200} />
              </div>
            )}

            <button
              type="button"
              onClick={closeSheet}
              className="mt-4 w-full h-[46px] rounded-full bg-burgundy text-cream font-semibold text-[13px] tracking-[0.04em]"
            >
              Selesai
            </button>
          </div>
        </>
      )}
    </MobileShell>
  );
}
