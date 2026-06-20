"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { AdminShell } from "@/components/templates/admin-shell";
import { AdminTopBar } from "@/components/organisms/admin-topbar";
import { AdminStatus } from "@/components/molecules/admin-badges";
import { Button } from "@/components/atoms/button";
import { CircleButton } from "@/components/atoms/circle-button";
import { Icon } from "@/components/atoms/icon";
import { Avatar, initials } from "@/components/atoms/avatar";
import { SectionNumber } from "@/components/atoms/section-number";
import type {
  AdminSubRole,
  AdminTeamRow,
  TeamInviteRow,
} from "@/server/queries/admin";
import { inviteAdmin, revokeInvite, updateAdminRole } from "@/server/actions/team";
import { cn } from "@/lib/utils";

// Role & permission summary for the right rail. Colors map the design's
// CSS vars (burgundy / terracotta / sage / forest) onto theme tokens. Counts
// (`n`) are derived from the real team at render time, never hard-coded.
type Role = {
  id: string;
  label: string;
  desc: string;
  dotClass: string;
  numClass: string;
};

const ROLES: Role[] = [
  { id: "super", label: "Super Admin", desc: "Akses penuh ke semua menu admin", dotClass: "bg-burgundy", numClass: "text-burgundy" },
  { id: "support", label: "Support", desc: "Akses ke tickets & customer info", dotClass: "bg-terracotta", numClass: "text-terracotta" },
  { id: "finance", label: "Finance", desc: "Akses ke pesanan, refund, invoice", dotClass: "bg-sage", numClass: "text-sage" },
  { id: "designer", label: "Designer", desc: "Akses ke template library", dotClass: "bg-forest", numClass: "text-forest" },
];

// Sub-role options for the invite + inline-edit selects (value → Bahasa label).
const ROLE_OPTIONS: { value: AdminSubRole; label: string }[] = [
  { value: "super_admin", label: "Super Admin" },
  { value: "support", label: "Support" },
  { value: "finance", label: "Finance" },
  { value: "designer", label: "Designer" },
];

const AVATAR_TONES = ["burgundy", "peach", "sage", "blush", "dark"] as const;

// Local row shape: real team member + the avatar tone pinned to the original
// array position, so filtering never reshuffles avatar colors.
type TeamRow = AdminTeamRow & { tone: (typeof AVATAR_TONES)[number] };

// `.d-tbl` cells.
const TH = "font-body text-[10px] font-semibold tracking-[0.18em] uppercase text-muted-ink text-left px-[14px] py-3 border-b border-beige";
const TD = "p-[14px] border-b border-line align-middle";

// Quote a CSV cell only when it contains a delimiter, quote, or newline.
function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

// Uppercase role pill in the members table. Super Admin gets the solid
// burgundy treatment; everyone else the bordered cream one.
function RolePill({ role, surface = "cream" }: { role: string; surface?: "cream" | "paper" }) {
  const isSuper = role === "Super Admin";
  return (
    <span
      className={cn(
        "inline-block text-[10px] px-[10px] py-[3px] rounded font-bold tracking-[0.14em] uppercase",
        isSuper
          ? "bg-burgundy text-cream"
          : cn("text-charcoal border border-line", surface === "paper" ? "bg-paper" : "bg-cream"),
      )}
    >
      {role}
    </span>
  );
}

// Admin screen 06 · Tim admin (team management).
export function AdminTeam({
  team,
  invites,
}: {
  team: AdminTeamRow[];
  invites: TeamInviteRow[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Search box filters the member rows.
  const [query, setQuery] = useState("");
  // Email of the row whose "more" dropdown is open, or null.
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  // userId currently being edited inline (role <select> shown), or null.
  const [editing, setEditing] = useState<string | null>(null);
  // Invite panel open + form state.
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AdminSubRole>("support");
  const [inviteError, setInviteError] = useState<string | null>(null);
  // The freshly-created invite link to show + copy.
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  // Transient action error (role change / revoke).
  const [actionError, setActionError] = useState<string | null>(null);
  // Email of the row that just had its link copied (for "Tersalin" feedback).
  const [copied, setCopied] = useState<string | null>(null);

  // Pin an avatar tone to each member by index so filtering never reshuffles
  // colors. Sourced from the real team prop.
  const members: TeamRow[] = useMemo(
    () => team.map((m, i) => ({ ...m, tone: AVATAR_TONES[i % AVATAR_TONES.length] })),
    [team],
  );

  const q = query.trim().toLowerCase();

  const visibleMembers = useMemo(
    () => members.filter((m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)),
    [members, q],
  );

  // Per-role counts derived from the real team (no hard-coded totals).
  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of members) {
      counts[m.role] = (counts[m.role] ?? 0) + 1;
    }
    return counts;
  }, [members]);

  // CSV export of the real team via a temporary object URL.
  function handleExport() {
    const rows: string[][] = [
      ["Nama", "Email", "Role", "Terakhir aktif"],
      ...members.map((m) => [m.name, m.email, m.role, m.lastActive]),
    ];
    const csv = rows.map((r) => r.map(csvCell).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "maritare-tim.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function copyEmail(email: string) {
    // Fire-and-forget: clipboard write needs no follow-up UI here.
    void navigator.clipboard.writeText(email);
    setOpenMenu(null);
  }

  function copyLink(key: string, url: string) {
    void navigator.clipboard.writeText(url);
    setCopied(key);
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1800);
  }

  // Submit the invite form → inviteAdmin. On success show the copyable link.
  function submitInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteError(null);
    setCreatedUrl(null);
    startTransition(async () => {
      const res = await inviteAdmin({ email: inviteEmail, adminRole: inviteRole });
      if (!res.ok) {
        setInviteError(res.error);
        return;
      }
      setCreatedUrl(res.inviteUrl);
      setInviteEmail("");
      router.refresh();
    });
  }

  // Change a member's sub-role inline.
  function changeRole(userId: string, adminRole: AdminSubRole) {
    setActionError(null);
    setEditing(null);
    startTransition(async () => {
      const res = await updateAdminRole({ userId, adminRole });
      if (!res.ok) {
        setActionError(res.error);
        return;
      }
      router.refresh();
    });
  }

  // Revoke a pending invite.
  function handleRevoke(id: string) {
    setActionError(null);
    startTransition(async () => {
      const res = await revokeInvite({ id });
      if (!res.ok) {
        setActionError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <AdminShell active="team">
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <AdminTopBar
          crumbs={["Admin", "Tim"]}
          title="Tim admin Maritare"
          eyebrow={`${members.length} anggota aktif`}
          actions={
            <>
              <Button variant="ghost" size="sm" onClick={handleExport}><Icon name="download" size={12} />Export</Button>
              <Button
                size="sm"
                className="bg-forest-deep text-cream hover:bg-forest-deep"
                onClick={() => {
                  setInviteOpen((v) => !v);
                  setCreatedUrl(null);
                  setInviteError(null);
                }}
              >
                <Icon name="plus" size={12} />Undang anggota
              </Button>
            </>
          }
        />

        {/* Click-away layer for the row dropdown. Renders nothing at rest. */}
        {openMenu !== null && (
          <div className="fixed inset-0 z-10" aria-hidden="true" onClick={() => setOpenMenu(null)} />
        )}

        <div className="flex-1 overflow-y-auto px-9 py-6 grid grid-cols-[1fr_280px] gap-[22px] items-start">
          {/* Members table */}
          <div className="flex flex-col gap-4 min-w-0">
            {/* Invite panel */}
            {inviteOpen && (
              <div className="bg-paper border border-line rounded-[14px] p-[18px]">
                <div className="flex items-center justify-between mb-3">
                  <SectionNumber className="text-[12px]">Undang anggota baru</SectionNumber>
                  <CircleButton size={26} title="Tutup" onClick={() => setInviteOpen(false)}>
                    <Icon name="x" size={11} />
                  </CircleButton>
                </div>
                <form onSubmit={submitInvite} className="flex items-end gap-3 flex-wrap">
                  <label className="flex flex-col gap-1 flex-1 min-w-[220px]">
                    <span className="text-[10px] tracking-[0.16em] uppercase font-semibold text-muted-ink">Email</span>
                    <input
                      type="email"
                      required
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="bg-cream border border-line rounded-lg px-3 py-2 font-body text-[13px] outline-none focus:border-charcoal"
                    />
                  </label>
                  <label className="flex flex-col gap-1 min-w-[160px]">
                    <span className="text-[10px] tracking-[0.16em] uppercase font-semibold text-muted-ink">Peran</span>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as AdminSubRole)}
                      className="bg-cream border border-line rounded-lg px-3 py-2 font-body text-[13px] outline-none focus:border-charcoal"
                    >
                      {ROLE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </label>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isPending}
                    className="bg-forest-deep text-cream hover:bg-forest-deep h-[38px]"
                  >
                    {isPending ? "Mengirim…" : "Kirim undangan"}
                  </Button>
                </form>

                {inviteError && (
                  <p role="alert" className="text-[12px] text-burgundy mt-3">{inviteError}</p>
                )}

                {createdUrl && (
                  <div className="mt-3 bg-cream border border-line rounded-lg p-3">
                    <div className="text-[11px] text-muted-ink mb-2">
                      Undangan dibuat. Bagikan tautan ini (email mungkin belum dikonfigurasi):
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        readOnly
                        value={createdUrl}
                        className="flex-1 bg-paper border border-line rounded px-2 py-[6px] font-body text-[11px] text-charcoal outline-none"
                        onFocus={(e) => e.currentTarget.select()}
                      />
                      <Button size="sm" variant="ghost" onClick={() => copyLink("created", createdUrl)}>
                        <Icon name="copy" size={11} />
                        {copied === "created" ? "Tersalin" : "Salin"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-[10px]">
              <SectionNumber className="text-[12px]">i. Anggota tim</SectionNumber>
              <div className="flex-1" />
              <div className="flex items-center gap-2 bg-paper border border-line rounded-full px-[14px] py-[6px]">
                <Icon name="search" size={13} stroke="var(--color-muted-ink)" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari nama atau email…"
                  className="border-none bg-transparent outline-none font-body text-[12px] w-[200px]"
                />
              </div>
            </div>

            {actionError && (
              <p role="alert" className="text-[12px] text-burgundy">{actionError}</p>
            )}

            <div className="bg-paper border border-line rounded-[14px] overflow-hidden">
              <table className="w-full border-separate border-spacing-0 text-[13px] [&_tbody_tr:last-child_td]:border-b-0 [&_tbody_tr:hover_td]:bg-[rgba(124,45,45,0.03)]">
                <thead>
                  <tr className="bg-cream">
                    <th className={cn(TH, "pl-[22px]")}>Nama</th>
                    <th className={TH}>Email</th>
                    <th className={TH}>Role</th>
                    <th className={TH}>Status</th>
                    <th className={TH}>Last active</th>
                    <th className={cn(TH, "w-20")} />
                  </tr>
                </thead>
                <tbody>
                  {visibleMembers.map((m, i) => {
                    // Open the dropdown upward on bottom-half rows so the
                    // table's overflow-hidden never clips it.
                    const dropUp =
                      visibleMembers.length === 1 || i >= Math.ceil(visibleMembers.length / 2);
                    const isEditing = editing === m.userId;
                    return (
                      <tr key={m.email}>
                        <td className={cn(TD, "pl-[22px]")}>
                          <div className="flex items-center gap-3">
                            <Avatar tone={m.tone} size={32} className="text-[12px]">
                              {initials(m.name)}
                            </Avatar>
                            <div>
                              <div className="font-semibold text-[13px]">
                                {m.name}
                                {m.you && (
                                  <span className="text-[9px] px-[6px] py-[2px] rounded bg-cream text-muted-ink ml-2 font-bold tracking-[0.16em] uppercase border border-line">
                                    Kamu
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className={cn(TD, "text-[12px] text-charcoal")}>{m.email}</td>
                        <td className={TD}>
                          {isEditing ? (
                            <select
                              autoFocus
                              defaultValue={m.adminRole}
                              disabled={isPending}
                              onChange={(e) => changeRole(m.userId, e.target.value as AdminSubRole)}
                              onBlur={() => setEditing(null)}
                              className="bg-cream border border-line rounded px-2 py-[5px] font-body text-[12px] outline-none focus:border-charcoal"
                            >
                              {ROLE_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                              ))}
                            </select>
                          ) : (
                            <RolePill role={m.role} />
                          )}
                        </td>
                        <td className={TD}><AdminStatus status="active" /></td>
                        <td
                          className={cn(TD, "text-[11px] text-muted-ink italic font-display")}
                          title="Aktivitas tidak dilacak"
                        >
                          {m.lastActive}
                        </td>
                        <td className={TD}>
                          <div className="flex gap-1">
                            <CircleButton
                              size={26}
                              title="Edit role"
                              onClick={() => setEditing((prev) => (prev === m.userId ? null : m.userId))}
                            >
                              <Icon name="edit" size={11} />
                            </CircleButton>
                            <div className="relative">
                              <CircleButton
                                size={26}
                                aria-haspopup="menu"
                                aria-expanded={openMenu === m.email}
                                onClick={() => setOpenMenu((prev) => (prev === m.email ? null : m.email))}
                              >
                                <Icon name="more" size={11} />
                              </CircleButton>
                              {openMenu === m.email && (
                                <div
                                  role="menu"
                                  className={cn(
                                    "absolute right-0 z-20 w-[160px] bg-paper border border-line rounded-[10px] shadow-[0_8px_24px_rgba(43,40,38,0.12)] py-1",
                                    dropUp ? "bottom-[30px]" : "top-[30px]",
                                  )}
                                >
                                  <button
                                    role="menuitem"
                                    onClick={() => copyEmail(m.email)}
                                    className="block w-full text-left px-3 py-2 text-[12px] text-charcoal bg-transparent border-none cursor-pointer hover:bg-cream"
                                  >
                                    Salin email
                                  </button>
                                  <button
                                    role="menuitem"
                                    onClick={() => {
                                      setEditing(m.userId);
                                      setOpenMenu(null);
                                    }}
                                    className="block w-full text-left px-3 py-2 text-[12px] text-charcoal bg-transparent border-none cursor-pointer hover:bg-cream"
                                  >
                                    Ubah peran
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {visibleMembers.length === 0 && (
                    <tr>
                      <td colSpan={6} className={cn(TD, "text-center text-[12px] text-muted-ink italic font-display py-6")}>
                        {members.length === 0
                          ? "Belum ada admin."
                          : "Tidak ada anggota yang cocok dengan pencarianmu."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pending invites */}
            <div className="flex items-center gap-[10px] mt-2">
              <SectionNumber className="text-[12px]">ii. Undangan tertunda</SectionNumber>
            </div>
            <div className="bg-paper border border-line rounded-[14px] overflow-hidden">
              {invites.length === 0 ? (
                <div className="px-[18px] py-5 text-center text-[12px] text-muted-ink italic font-display">
                  Tidak ada undangan tertunda.
                </div>
              ) : (
                <table className="w-full border-separate border-spacing-0 text-[13px] [&_tbody_tr:last-child_td]:border-b-0">
                  <thead>
                    <tr className="bg-cream">
                      <th className={cn(TH, "pl-[22px]")}>Email</th>
                      <th className={TH}>Peran</th>
                      <th className={TH}>Kedaluwarsa</th>
                      <th className={cn(TH, "w-40")} />
                    </tr>
                  </thead>
                  <tbody>
                    {invites.map((inv) => (
                      <tr key={inv.id}>
                        <td className={cn(TD, "pl-[22px] text-[12px] text-charcoal")}>{inv.email}</td>
                        <td className={TD}><RolePill role={inv.roleLabel} /></td>
                        <td className={cn(TD, "text-[12px] text-muted-ink")}>{inv.expiresAt}</td>
                        <td className={TD}>
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="ghost" onClick={() => copyLink(inv.id, inv.inviteUrl)}>
                              <Icon name="link" size={11} />
                              {copied === inv.id ? "Tersalin" : "Salin link"}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={isPending}
                              className="text-burgundy border-burgundy/30 hover:border-burgundy"
                              onClick={() => handleRevoke(inv.id)}
                            >
                              Batalkan
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Roles & permissions sidebar */}
          <aside className="flex flex-col gap-[14px] self-stretch">
            <SectionNumber className="text-[12px]">iii. Role &amp; izin</SectionNumber>
            <div className="bg-paper border border-line rounded-[14px] py-2 flex-1">
              {ROLES.map((r, i) => (
                <div
                  key={r.id}
                  className={cn(
                    "px-[18px] py-[14px] flex items-start gap-3",
                    i < ROLES.length - 1 && "border-b border-line",
                  )}
                >
                  <div className={cn("w-[6px] h-[6px] rounded-full mt-[7px] shrink-0", r.dotClass)} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-[13px] font-semibold text-charcoal">{r.label}</div>
                      <span className={cn("font-display font-extrabold text-[16px]", r.numClass)}>
                        {roleCounts[r.label] ?? 0}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-ink leading-[1.45] mt-1">{r.desc}</div>
                  </div>
                </div>
              ))}
              <div className="px-[18px] py-3 border-t border-line">
                <span
                  className="text-[11px] text-muted-ink leading-[1.45] inline-flex items-center gap-[6px]"
                  title="Tidak ada matriks izin granular di MVP"
                >
                  <Icon name="check" size={12} stroke="var(--color-sage)" />
                  Akses ditentukan oleh peran
                </span>
              </div>
            </div>

            <div className="bg-forest-deep text-cream rounded-[14px] px-[18px] py-4">
              <SectionNumber className="text-[11px] text-peach mb-2">iv. Audit log</SectionNumber>
              <div className="text-[12px] text-[rgba(245,239,230,0.85)] leading-[1.5]">
                Lihat siapa melakukan apa, kapan. Berguna untuk troubleshooting refund, perubahan data, akses sensitif.
              </div>
              <Link href="/admin/audit">
                <Button size="sm" className="bg-[rgba(245,239,230,0.1)] text-cream mt-3 hover:bg-[rgba(245,239,230,0.18)]">
                  Buka audit log →
                </Button>
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </AdminShell>
  );
}
