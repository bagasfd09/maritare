"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { DashboardShell } from "@/components/templates/dashboard-shell";
import { DashboardTopBar } from "@/components/organisms/dashboard-topbar";
import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";
import { Avatar, initials } from "@/components/atoms/avatar";
import { FlowerMark } from "@/components/atoms/flower-mark";
import { Em } from "@/components/atoms/typography";
import { customSides } from "@/lib/guests-csv";
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
  fmtNow,
  WAGlyph,
  WADoubleTick,
  WAChat,
  Ring,
  WAFloralBg,
} from "@/components/templates/wa-blast-shared";

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "1px 6px", borderRadius: 5, background: "rgba(245,239,230,0.12)", color: "var(--color-peach)", fontSize: 10, fontWeight: 700 }}>
      {children}
    </span>
  );
}

// ───────────────────────────────────────────────────────────────────
// Main screen
// ───────────────────────────────────────────────────────────────────

export function WaBlast({ data }: { data: WaBlastData }) {
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
  const [sideFilter, setSideFilter] = useState<Guest["side"] | null>(null);
  const [query, setQuery] = useState("");
  const [focus, setFocus] = useState(false);
  const [cooldownSecs, setCooldownSecs] = useState(15);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const template = tplText[templateId] ?? "";
  const templates: Template[] = defaults.map((t) => ({ ...t, text: tplText[t.id] ?? t.text }));

  function markSent(id: string) {
    setSentLocal((p) => new Set(p).add(id));
    markGuestInvited({ guestId: id }).then(() => router.refresh());
  }
  function sendOne(g: Guest) {
    const intl = normalizePhoneIntl(g.phone);
    if (!intl) return;
    window.open(waMeLink(intl, fillTemplate(template, g, slug)), "_blank", "noopener");
    markSent(g.id);
  }
  function copyOne(g: Guest) {
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guests.filter((g) => {
      const st = effStatus(g, sentLocal);
      if (filter === "unsent" && st !== "unsent") return false;
      if (filter === "sent" && st === "unsent") return false;
      if (filter === "followup" && !followupIds.includes(g.id)) return false;
      if (sideFilter && g.side !== sideFilter) return false;
      if (q) {
        return (
          g.name.toLowerCase().includes(q) ||
          (g.group ?? "").toLowerCase().includes(q) ||
          (g.phone ?? "").replace(/\s/g, "").includes(q.replace(/\s/g, ""))
        );
      }
      return true;
    });
  }, [guests, sentLocal, filter, sideFilter, query, followupIds]);

  const nextGuest = useMemo(() => guests.find((g) => effStatus(g, sentLocal) === "unsent") ?? null, [guests, sentLocal]);

  const STATUS_FILTERS: Array<[typeof filter, string]> = [
    ["all", `Semua ${total}`],
    ["unsent", `Belum ${remaining}`],
    ["sent", `Terkirim ${sentCount}`],
    ["followup", `Follow-up ${followupIds.length}`],
  ];
  const SIDE_FILTERS: Array<[Guest["side"] | null, string]> = [
    [null, "Semua"],
    ["bride", "Wanita"],
    ["groom", "Pria"],
    ...customSides(guests.map((g) => g.side)).map((s): [string, string] => [s, s]),
  ];
  const PIPELINE: Array<[string, number, string]> = [
    ["Belum", remaining, "var(--color-terracotta)"],
    ["Terkirim", sentCount, WA.green],
    ["Dibuka", openedCount, "#3Fb6c0"],
    ["Konfirmasi", rsvpCount, "#5Fd08e"],
  ];

  return (
    <DashboardShell active="guests" chrome={data.chrome}>
      <main className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar
          num="§ IV"
          eyebrow="Daftar Tamu · Sebar Undangan"
          title={<>Kirim undangan, <Em className="text-burgundy">satu per satu.</Em></>}
          actions={
            <>
              <Button variant="ghost" onClick={() => router.push("/dashboard/guests")}>
                <span style={{ display: "inline-flex", transform: "scaleX(-1)" }}>
                  <Icon name="chevron-r" size={13} />
                </span>
                Daftar Tamu
              </Button>
              <Button
                disabled={!nextGuest}
                onClick={() => setFocus(true)}
                className="text-white border-transparent disabled:opacity-50"
                style={{
                  background: nextGuest ? WA.green : "var(--color-beige)",
                  boxShadow: nextGuest ? "0 8px 18px -10px rgba(31,168,85,0.8)" : "none",
                }}
              >
                <WAGlyph size={15} /> Mulai Kirim Beruntun
              </Button>
            </>
          }
        />

        <div className="flex-1 overflow-y-auto px-10 pt-6 pb-12">
          {/* Hero: pacing + focus CTA */}
          <div className="grid gap-5 mb-[22px]" style={{ gridTemplateColumns: "1.6fr 1fr" }}>
            {/* progress + pipeline */}
            <div style={{ background: "var(--color-charcoal)", color: "var(--color-cream)", borderRadius: 20, padding: "24px 26px" }}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, marginBottom: 18 }}>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", fontWeight: 600, color: "rgba(245,239,230,0.55)", marginBottom: 8 }}>
                    Progres pengiriman
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 50, color: "var(--color-peach)" }}>{sentCount}</span>
                    <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 18, color: "rgba(245,239,230,0.6)" }}>/ {total} undangan terkirim</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 30, color: "var(--color-cream)" }}>{pct}%</div>
                  <div style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(245,239,230,0.5)", marginTop: 2 }}>tuntas</div>
                </div>
              </div>
              <div style={{ height: 10, borderRadius: 999, background: "rgba(245,239,230,0.14)", overflow: "hidden", marginBottom: 20 }}>
                <div style={{ width: `${pct}%`, height: "100%", borderRadius: 999, background: `linear-gradient(90deg, ${WA.green}, #34C76A)`, transition: "width .4s" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                {PIPELINE.map(([label, val, c]) => (
                  <div key={label} style={{ background: "rgba(245,239,230,0.06)", borderRadius: 12, padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: c }} />
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, color: "var(--color-cream)" }}>{val}</span>
                    </div>
                    <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(245,239,230,0.5)", marginTop: 4 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* focus CTA */}
            <div style={{ background: "var(--color-burgundy)", color: "var(--color-cream)", borderRadius: 20, padding: "22px 24px", display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-peach)", marginBottom: 10 }}>Mode fokus</div>
              <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 25, lineHeight: 1.12 }}>Kirim beruntun,<br />tanpa pusing.</div>
              <div style={{ fontSize: 12.5, color: "rgba(245,239,230,0.75)", marginTop: 10, lineHeight: 1.55, flex: 1 }}>
                Satu tamu tampil di layar dalam satu waktu. Tekan kirim, WhatsApp terbuka, lalu jeda otomatis biar aman dari blokir.
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "14px 0", padding: "10px 12px", borderRadius: 12, background: "rgba(245,239,230,0.1)" }}>
                <span style={{ fontSize: 11, color: "rgba(245,239,230,0.8)", whiteSpace: "nowrap" }}>Jeda aman</span>
                <input type="range" min={5} max={30} step={5} value={cooldownSecs} onChange={(e) => setCooldownSecs(+e.target.value)} style={{ flex: 1, accentColor: WA.green }} />
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, minWidth: 38, textAlign: "right" }}>{cooldownSecs}s</span>
              </div>
              <button
                disabled={!nextGuest}
                onClick={() => setFocus(true)}
                style={{
                  height: 48,
                  borderRadius: 12,
                  cursor: nextGuest ? "pointer" : "default",
                  border: "none",
                  background: nextGuest ? WA.green : "rgba(245,239,230,0.2)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 9,
                }}
              >
                <WAGlyph size={18} /> {nextGuest ? "Mulai sekarang" : "Semua terkirim ✓"}
              </button>
            </div>
          </div>

          {/* Two columns: list + template editor */}
          <div className="grid gap-[22px] items-start" style={{ gridTemplateColumns: "1.55fr 1fr" }}>
            {/* LEFT — list */}
            <div style={{ background: "var(--color-paper)", border: "1px solid var(--color-line)", borderRadius: 18, overflow: "hidden" }}>
              <div style={{ padding: "16px 18px 14px", borderBottom: "1px solid var(--color-line)", display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, background: "var(--color-cream)", border: "1px solid var(--color-beige)", borderRadius: 999, padding: "8px 14px" }}>
                  <Icon name="search" size={14} stroke="var(--color-muted-ink)" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Cari nama atau nomor…"
                    style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontFamily: "var(--font-body)", fontSize: 13 }}
                  />
                </div>
                <div style={{ display: "flex", gap: 4, background: "var(--color-cream)", border: "1px solid var(--color-beige)", borderRadius: 999, padding: 3, width: "fit-content" }}>
                  {STATUS_FILTERS.map(([k, label]) => (
                    <button
                      key={k}
                      onClick={() => setFilter(k)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 999,
                        fontSize: 11,
                        letterSpacing: "0.04em",
                        fontWeight: 600,
                        border: "none",
                        cursor: "pointer",
                        color: filter === k ? "var(--color-cream)" : "var(--color-muted-ink)",
                        background: filter === k ? "var(--color-charcoal)" : "transparent",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, background: "var(--color-cream)", border: "1px solid var(--color-beige)", borderRadius: 20, padding: 3, width: "fit-content" }}>
                  {SIDE_FILTERS.map(([k, label]) => (
                    <button
                      key={k ?? "__all__"}
                      onClick={() => setSideFilter(k)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 999,
                        fontSize: 11,
                        letterSpacing: "0.04em",
                        fontWeight: 600,
                        border: "none",
                        cursor: "pointer",
                        color: sideFilter === k ? "var(--color-cream)" : "var(--color-muted-ink)",
                        background: sideFilter === k ? "var(--color-charcoal)" : "transparent",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                {filtered.length === 0 && (
                  <div style={{ padding: "44px 20px", textAlign: "center", color: "var(--color-muted-ink)", fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 16 }}>
                    Tidak ada tamu pada filter ini.
                  </div>
                )}
                {filtered.map((g, i) => {
                  const st = effStatus(g, sentLocal);
                  const meta = STATUS_META[st];
                  const isNext = nextGuest?.id === g.id;
                  const isSent = st !== "unsent";
                  const bad = !validPhone(g);
                  return (
                    <div
                      key={g.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "13px 18px",
                        borderBottom: i < filtered.length - 1 ? "1px solid var(--color-line)" : "none",
                        borderLeft: isNext ? "3px solid var(--color-burgundy)" : "3px solid transparent",
                        background: isSent ? "rgba(31,168,85,0.035)" : isNext ? "rgba(124,45,45,0.03)" : "transparent",
                      }}
                    >
                      <Avatar tone={TONES[i % 5]}>{initials(g.name)}</Avatar>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 600, fontSize: 13.5, color: "var(--color-charcoal)" }}>{g.name}</span>
                          {isNext && (
                            <span style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, color: "var(--color-burgundy)", background: "var(--color-peach)", padding: "2px 7px", borderRadius: 999 }}>
                              Berikutnya
                            </span>
                          )}
                          {bad && (
                            <span title="Nomor perlu dicek" style={{ fontSize: 10, fontWeight: 600, color: "var(--color-burgundy)", background: "rgba(124,45,45,0.1)", padding: "2px 7px", borderRadius: 999 }}>
                              ⚠ nomor
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 11.5, color: "var(--color-muted-ink)", marginTop: 2 }}>
                          {g.group ?? "—"} · {g.phone ?? "tanpa nomor"}
                        </div>
                      </div>

                      <div style={{ width: 150, flexShrink: 0, textAlign: "right" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, color: meta.color, background: meta.bg, padding: "4px 11px", borderRadius: 999, letterSpacing: "0.02em" }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.dot }} />
                          {meta.label}
                        </span>
                      </div>

                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <button onClick={() => copyOne(g)} title="Salin pesan" style={iconBtn}>
                          <Icon name={copiedId === g.id ? "check" : "copy"} size={14} stroke={copiedId === g.id ? WA.greenDeep : "var(--color-charcoal)"} />
                        </button>
                        {isSent ? (
                          <button onClick={() => sendOne(g)} disabled={bad} title="Kirim ulang" style={{ ...resendBtn, opacity: bad ? 0.4 : 1, cursor: bad ? "not-allowed" : "pointer" }}>
                            <WAGlyph size={13} color={WA.greenDeep} /> Kirim ulang
                          </button>
                        ) : (
                          <button onClick={() => sendOne(g)} disabled={bad} style={{ ...sendBtn, opacity: bad ? 0.4 : 1, cursor: bad ? "not-allowed" : "pointer" }}>
                            <WAGlyph size={14} /> Kirim
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT — template editor */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18, position: "sticky", top: 0 }}>
              <div style={{ background: "var(--color-paper)", border: "1px solid var(--color-line)", borderRadius: 18, overflow: "hidden" }}>
                <div style={{ padding: "16px 20px 14px", borderBottom: "1px solid var(--color-line)" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 18, color: "var(--color-charcoal)" }}>Pesan template</div>
                  <div style={{ fontSize: 10.5, color: "var(--color-muted-ink)", marginTop: 2 }}>Dipakai untuk tombol kirim &amp; mode beruntun</div>
                </div>
                <div style={{ display: "flex", gap: 4, padding: "12px 18px 0", flexWrap: "wrap" }}>
                  {templates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTemplateId(t.id)}
                      style={{
                        padding: "7px 12px",
                        borderRadius: "9px 9px 0 0",
                        cursor: "pointer",
                        border: "1px solid",
                        borderBottom: templateId === t.id ? "1px solid var(--color-paper)" : "1px solid var(--color-beige)",
                        marginBottom: -1,
                        fontSize: 11,
                        fontWeight: 600,
                        borderColor: templateId === t.id ? "var(--color-beige)" : "transparent",
                        background: templateId === t.id ? "var(--color-paper)" : "transparent",
                        color: templateId === t.id ? "var(--color-burgundy)" : "var(--color-muted-ink)",
                      }}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
                <div style={{ padding: "14px 18px 16px", borderTop: "1px solid var(--color-beige)" }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--color-faint)", marginBottom: 8 }}>
                    {templates.find((t) => t.id === templateId)?.phase}
                  </div>
                  <textarea
                    value={template}
                    onChange={(e) => setTplText((p) => ({ ...p, [templateId]: e.target.value }))}
                    onBlur={persist}
                    spellCheck={false}
                    style={{
                      width: "100%",
                      minHeight: 200,
                      resize: "vertical",
                      background: "var(--color-cream)",
                      border: "1px solid var(--color-beige)",
                      borderRadius: 12,
                      padding: "12px 14px",
                      fontFamily: "var(--font-body)",
                      fontSize: 12.5,
                      lineHeight: 1.55,
                      color: "var(--color-charcoal)",
                      outline: "none",
                    }}
                  />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
                    {[["{nama}", "Nama tamu"], ["{link}", "Link undangan personal"], ["{grup}", "Nama grup"]].map(([code, hint]) => (
                      <span key={code} title={hint} style={{ fontFamily: "var(--font-body)", fontSize: 10.5, fontWeight: 600, background: "var(--color-sage-soft)", color: "#2E3325", padding: "4px 9px", borderRadius: 7 }}>
                        {code}
                      </span>
                    ))}
                  </div>
                </div>
                {nextGuest && (
                  <div style={{ borderTop: "1px solid var(--color-line)", background: "var(--color-cream)", padding: "14px 18px" }}>
                    <div style={{ fontSize: 9.5, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-muted-ink)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                      <WAGlyph size={12} color="var(--color-muted-ink)" /> Tampilan di WhatsApp · {nextGuest.name.split(" ")[0]}
                    </div>
                    <WAChat text={fillTemplate(template, nextGuest, slug)} maxHeight={180} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {focus && (
        <WaFocusMode
          guests={filtered}
          sentLocal={sentLocal}
          markSent={markSent}
          slug={slug}
          template={template}
          templates={templates}
          templateId={templateId}
          setTemplateId={setTemplateId}
          cooldownSecs={cooldownSecs}
          onClose={() => setFocus(false)}
        />
      )}
    </DashboardShell>
  );
}

const iconBtn: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 999,
  cursor: "pointer",
  border: "1px solid var(--color-beige)",
  background: "var(--color-cream)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};
const sendBtn: React.CSSProperties = {
  height: 36,
  padding: "0 15px",
  borderRadius: 999,
  border: "none",
  background: WA.green,
  color: "#fff",
  fontFamily: "var(--font-body)",
  fontSize: 11.5,
  fontWeight: 600,
  letterSpacing: "0.04em",
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
};
const resendBtn: React.CSSProperties = {
  height: 36,
  padding: "0 13px",
  borderRadius: 999,
  border: `1px solid ${WA.green}`,
  background: "transparent",
  color: WA.greenDeep,
  fontFamily: "var(--font-body)",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.04em",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
};

// ───────────────────────────────────────────────────────────────────
// Focus mode — guided one-at-a-time sender with safety pacing
// ───────────────────────────────────────────────────────────────────

function WaFocusMode({
  guests,
  sentLocal,
  markSent,
  slug,
  template,
  templates,
  templateId,
  setTemplateId,
  cooldownSecs,
  onClose,
}: {
  guests: Guest[];
  sentLocal: Set<string>;
  markSent: (id: string) => void;
  slug: string;
  template: string;
  templates: Template[];
  templateId: string;
  setTemplateId: (id: string) => void;
  cooldownSecs: number;
  onClose: () => void;
}) {
  const [skipped, setSkipped] = useState<string[]>([]);
  const [phase, setPhase] = useState<"ready" | "cooldown">("ready");
  const [left, setLeft] = useState(0);
  const [sessionSent, setSessionSent] = useState(0);
  const [copied, setCopied] = useState(false);
  const [justSent, setJustSent] = useState<Guest | null>(null);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  const queue = useMemo(() => {
    const unsent = guests.filter((g) => effStatus(g, sentLocal) === "unsent");
    const norm = unsent.filter((g) => !skipped.includes(g.id));
    const back = skipped.map((id) => unsent.find((g) => g.id === id)).filter((g): g is Guest => Boolean(g));
    return [...norm, ...back];
  }, [guests, sentLocal, skipped]);

  const current = phase === "cooldown" ? justSent : queue[0] ?? null;
  const remaining = queue.length;
  const upcoming = queue.slice(phase === "cooldown" ? 0 : 1, phase === "cooldown" ? 3 : 4);
  const behind = phase === "cooldown" ? queue.slice(0, 2) : queue.slice(1, 3);
  const msg = current ? fillTemplate(template, current, slug) : "";

  function startCooldown() {
    setPhase("cooldown");
    setLeft(cooldownSecs);
    if (tick.current) clearInterval(tick.current);
    tick.current = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          if (tick.current) clearInterval(tick.current);
          setPhase("ready");
          setJustSent(null);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }
  function doSend() {
    if (!current) return;
    const intl = normalizePhoneIntl(current.phone);
    if (intl) window.open(waMeLink(intl, msg), "_blank", "noopener");
    markSent(current.id);
    setJustSent(current);
    setSessionSent((n) => n + 1);
    setSkipped((s) => s.filter((id) => id !== current.id));
    startCooldown();
  }
  function skip() {
    if (!current) return;
    setSkipped((s) => [...s.filter((id) => id !== current.id), current.id]);
  }
  function next() {
    if (tick.current) clearInterval(tick.current);
    setPhase("ready");
    setJustSent(null);
    setLeft(0);
  }
  function copy() {
    try {
      navigator.clipboard.writeText(msg);
    } catch {
      /* ignore */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  useEffect(() => () => {
    if (tick.current) clearInterval(tick.current);
  }, []);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") return onClose();
      if (e.key === "Enter") {
        e.preventDefault();
        if (phase === "cooldown") next();
        else doSend();
      }
      if (e.key === "ArrowRight" && phase === "ready") skip();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, current, msg]);

  const doneCount = guests.filter((g) => effStatus(g, sentLocal) !== "unsent").length;
  const posNum = Math.min(guests.length, phase === "cooldown" ? doneCount : doneCount + 1);
  const allDone = queue.length === 0 && phase !== "cooldown";
  const idx = current ? guests.findIndex((g) => g.id === current.id) : 0;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        fontFamily: "var(--font-body)",
        background: "radial-gradient(135% 95% at 50% -12%, #9A4040 0%, var(--color-burgundy) 42%, #5C1F1F 100%)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes waDeal { from { opacity: 0; transform: translateY(22px) scale(.965) rotate(-1deg); } to { opacity: 1; transform: none; } }
        @keyframes waSlide { from { opacity: 0; transform: translateY(-100%); } to { opacity: 1; transform: none; } }
      `}</style>
      <WAFloralBg />

      {/* top bar */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 20, padding: "18px 34px", borderBottom: "1px solid rgba(245,239,230,0.16)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, width: 200 }}>
          <FlowerMark size={16} color="var(--color-peach)" core="var(--color-terracotta-soft)" />
          <span style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-peach)" }}>Kirim Beruntun</span>
        </div>
        <div style={{ flex: 1, maxWidth: 420, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "rgba(245,239,230,0.7)", marginBottom: 6, letterSpacing: "0.06em" }}>
            <span>
              Terkirim sesi ini · <strong style={{ color: "var(--color-cream)" }}>{sessionSent}</strong>
            </span>
            <span>{doneCount} / {guests.length}</span>
          </div>
          <div style={{ height: 6, borderRadius: 999, background: "rgba(245,239,230,0.18)", overflow: "hidden" }}>
            <div style={{ width: `${guests.length ? Math.round((doneCount / guests.length) * 100) : 0}%`, height: "100%", background: `linear-gradient(90deg, ${WA.green}, #34C76A)`, borderRadius: 999, transition: "width .4s" }} />
          </div>
        </div>
        <div style={{ width: 200, display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              height: 36,
              padding: "0 16px",
              borderRadius: 999,
              cursor: "pointer",
              border: "1px solid rgba(245,239,230,0.3)",
              background: "transparent",
              color: "var(--color-cream)",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Selesai <span style={{ opacity: 0.5, textTransform: "none", letterSpacing: 0 }}>Esc</span>
          </button>
        </div>
      </div>

      {/* body */}
      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "26px 24px 22px", overflowY: "auto" }}>
        {allDone ? (
          <div style={{ textAlign: "center", color: "var(--color-cream)" }}>
            <div style={{ display: "inline-flex", width: 66, height: 66, borderRadius: "50%", background: WA.green, alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
              <Icon name="check" size={33} stroke="#fff" strokeWidth={2.4} />
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 36 }}>Semua sudah dikirim 🎉</div>
            <div style={{ color: "rgba(245,239,230,0.72)", marginTop: 8, fontSize: 14 }}>{sessionSent} undangan terkirim di sesi ini. Istirahat dulu yuk.</div>
            <Button onClick={onClose} className="text-white border-transparent mt-6" style={{ background: WA.green }}>
              Kembali ke daftar
            </Button>
          </div>
        ) : (
          current && (
            <div style={{ width: "100%", maxWidth: 540, display: "flex", flexDirection: "column", alignItems: "center" }}>
              {/* template switch */}
              <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "rgba(245,239,230,0.12)", border: "1px solid rgba(245,239,230,0.18)", borderRadius: 999, padding: 4 }}>
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTemplateId(t.id)}
                    style={{
                      padding: "7px 15px",
                      borderRadius: 999,
                      cursor: "pointer",
                      border: "none",
                      fontSize: 11.5,
                      fontWeight: 600,
                      letterSpacing: "0.03em",
                      background: templateId === t.id ? "var(--color-peach)" : "transparent",
                      color: templateId === t.id ? "#5a2a18" : "rgba(245,239,230,0.78)",
                    }}
                  >
                    {t.name}
                  </button>
                ))}
              </div>

              {/* card stack */}
              <div style={{ position: "relative", width: "100%", maxWidth: 480 }}>
                {behind.map((g, bi) => (
                  <div
                    key={g.id}
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      top: 0,
                      height: 120,
                      zIndex: 1,
                      background: "var(--color-paper)",
                      borderRadius: 20,
                      border: "1px solid var(--color-beige)",
                      transform: `translateY(${(bi + 1) * 13}px) scale(${1 - (bi + 1) * 0.045})`,
                      opacity: 0.6 - bi * 0.22,
                      boxShadow: "0 14px 30px -20px rgba(62,20,20,0.4)",
                    }}
                  />
                ))}

                <div
                  key={current.id}
                  style={{
                    position: "relative",
                    zIndex: 2,
                    background: "var(--color-paper)",
                    borderRadius: 20,
                    border: "1px solid var(--color-beige)",
                    boxShadow: "0 36px 80px -34px rgba(62,20,20,0.55)",
                    overflow: "hidden",
                    animation: "waDeal .42s cubic-bezier(.2,.7,.3,1)",
                  }}
                >
                  {phase === "cooldown" && (
                    <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 11, padding: "12px 22px", background: "linear-gradient(100deg, var(--color-burgundy), #9A4040)", color: "var(--color-cream)", overflow: "hidden", animation: "waSlide .4s cubic-bezier(.2,.7,.3,1) both" }}>
                      <span style={{ display: "inline-flex", width: 24, height: 24, borderRadius: "50%", background: "var(--color-peach)", alignItems: "center", justifyContent: "center", flexShrink: 0, zIndex: 1 }}>
                        <Icon name="check" size={14} stroke="var(--color-burgundy)" strokeWidth={2.8} />
                      </span>
                      <span style={{ zIndex: 1, fontSize: 12.5, fontWeight: 600, letterSpacing: "0.02em" }}>
                        Undangan terkirim ke <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 15 }}>{current.name}</span>
                      </span>
                      <span style={{ marginLeft: "auto", zIndex: 1, display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--color-peach)" }}>
                        <WADoubleTick color="var(--color-peach)" /> {fmtNow()}
                      </span>
                    </div>
                  )}

                  {/* addressee */}
                  <div style={{ padding: "22px 26px 18px", borderBottom: "1px dashed var(--color-rule)", position: "relative" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                      <div style={{ fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-burgundy)" }}>Undangan ke-{posNum}</div>
                      {validPhone(current) ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10.5, fontWeight: 600, color: WA.greenDeep, background: WA.greenSoft, padding: "5px 10px", borderRadius: 999 }}>
                          <Icon name="check" size={12} stroke={WA.greenDeep} /> Nomor valid
                        </span>
                      ) : (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10.5, fontWeight: 600, color: "var(--color-burgundy)", background: "rgba(124,45,45,0.1)", padding: "5px 10px", borderRadius: 999 }}>⚠ Cek nomor</span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <Avatar tone={TONES[idx % 5]} size={52} className="text-[18px]">{initials(current.name)}</Avatar>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-faint)", fontWeight: 600, marginBottom: 2 }}>Kepada Yth.</div>
                        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 28, color: "var(--color-charcoal)", lineHeight: 1.05 }}>{current.name}</div>
                        <div style={{ fontSize: 12, color: "var(--color-muted-ink)", marginTop: 5 }}>{current.group ?? "—"} · {current.phone ?? "tanpa nomor"}</div>
                      </div>
                    </div>
                  </div>

                  {/* message preview */}
                  <div style={{ padding: "14px 18px 16px", background: "var(--color-cream)" }}>
                    <div style={{ fontSize: 9.5, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-muted-ink)", marginBottom: 9, display: "flex", alignItems: "center", gap: 6 }}>
                      <WAGlyph size={12} color="var(--color-muted-ink)" /> Tampilan di WhatsApp
                    </div>
                    <WAChat text={msg} maxHeight={188} />
                  </div>

                  {/* actions */}
                  <div style={{ padding: "16px 26px 20px" }}>
                    {phase === "cooldown" ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <Ring secs={cooldownSecs} left={left} color={WA.green} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: "var(--color-charcoal)" }}>Tarik napas sejenak…</div>
                          <div style={{ fontSize: 11.5, color: "var(--color-muted-ink)", marginTop: 3, lineHeight: 1.45 }}>
                            Jeda {left} dtk biar pola kirimmu wajar &amp; aman dari blokir WhatsApp.
                          </div>
                        </div>
                        <button onClick={next} style={{ height: 46, padding: "0 20px", borderRadius: 12, cursor: "pointer", border: "none", background: "var(--color-burgundy)", color: "var(--color-cream)", flexShrink: 0, fontSize: 12.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 8 }}>
                          Lanjut <Icon name="arrow-r" size={15} stroke="var(--color-cream)" />
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button onClick={doSend} style={{ flex: 1, height: 52, borderRadius: 13, cursor: "pointer", border: "none", background: WA.green, color: "#fff", fontSize: 14, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 14px 28px -10px rgba(31,168,85,0.75)" }}>
                          <WAGlyph size={20} /> Buka WhatsApp &amp; kirim
                        </button>
                        <button onClick={copy} title="Salin pesan" style={{ height: 52, width: 52, borderRadius: 13, cursor: "pointer", flexShrink: 0, border: "1px solid var(--color-beige)", background: "var(--color-cream)", color: "var(--color-charcoal)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                          <Icon name={copied ? "check" : "copy"} size={18} stroke={copied ? WA.greenDeep : "var(--color-charcoal)"} />
                        </button>
                        <button onClick={skip} title="Lewati tamu ini" style={{ height: 52, padding: "0 16px", borderRadius: 13, cursor: "pointer", flexShrink: 0, border: "1px solid var(--color-beige)", background: "var(--color-cream)", color: "var(--color-muted-ink)", fontSize: 12, fontWeight: 600, letterSpacing: "0.04em" }}>
                          Lewati
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* next strip + hints */}
              <div style={{ marginTop: behind.length ? 38 : 22, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, color: "rgba(245,239,230,0.6)" }}>Berikutnya</span>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {upcoming.length === 0 && <span style={{ fontSize: 12, color: "rgba(245,239,230,0.55)", fontStyle: "italic", fontFamily: "var(--font-display)" }}>antrean habis</span>}
                    {upcoming.map((g, qi) => (
                      <Avatar key={g.id} tone={TONES[guests.findIndex((x) => x.id === g.id) % 5]} size={30} className="text-[11px]" style={{ marginLeft: qi ? -8 : 0, border: "2px solid var(--color-burgundy)" }}>
                        {initials(g.name)}
                      </Avatar>
                    ))}
                    {remaining > upcoming.length + (phase === "cooldown" ? 0 : 1) && (
                      <span style={{ marginLeft: 8, fontSize: 12, color: "rgba(245,239,230,0.7)", fontWeight: 600 }}>
                        +{remaining - upcoming.length - (phase === "cooldown" ? 0 : 1)} lagi
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 16, fontSize: 11, color: "rgba(245,239,230,0.5)" }}>
                  <span><Kbd>Enter</Kbd> {phase === "cooldown" ? "lanjut" : "kirim"}</span>
                  <span><Kbd>→</Kbd> lewati</span>
                  <span><Kbd>Esc</Kbd> keluar</span>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
