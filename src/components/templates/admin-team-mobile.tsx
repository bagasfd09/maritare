"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Avatar, initials } from "@/components/atoms/avatar";
import {
  AdminMobileBtnMini,
  AdminMobileCard,
  AdminMobileHead,
  AdminMobileSecLabel,
  AdminMobileSecnum,
} from "@/components/molecules/admin-mobile-primitives";
import { AdminMobileShell } from "@/components/templates/admin-mobile-shell";
import type {
  AdminSubRole,
  AdminTeamRow,
  TeamInviteRow,
} from "@/server/queries/admin";
import { inviteAdmin, revokeInvite, updateAdminRole } from "@/server/actions/team";

const AV = ["peach", "sage", "blush", "burgundy", "dark"] as const;

type RoleRow = {
  label: string;
  desc: string;
  color: string;
};

// Role legend for the right rail. Counts are derived from the real team at
// render time (see `roleCounts`), never hard-coded.
const ROLES: RoleRow[] = [
  { label: "Super Admin", desc: "Akses penuh semua menu", color: "var(--color-burgundy)" },
  { label: "Support", desc: "Tickets & info customer", color: "var(--color-terracotta)" },
  { label: "Finance", desc: "Pesanan, refund, invoice", color: "var(--color-sage)" },
  { label: "Designer", desc: "Template library", color: "var(--color-forest)" },
];

// Sub-role options for the invite + inline-edit selects (value → Bahasa label).
const ROLE_OPTIONS: { value: AdminSubRole; label: string }[] = [
  { value: "super_admin", label: "Super Admin" },
  { value: "support", label: "Support" },
  { value: "finance", label: "Finance" },
  { value: "designer", label: "Designer" },
];

const SELECT_CLASS =
  "bg-cream border border-line rounded-lg px-3 py-2 font-body text-[13px] text-charcoal outline-none w-full";

// Admin mobile · Tim — ports `M_Team` from the design's mobile-admin-screens.jsx.
export function AdminTeamMobile({
  team,
  invites,
}: {
  team: AdminTeamRow[];
  invites: TeamInviteRow[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Tapped member (keyed by email) → inline detail panel under that card.
  const [selected, setSelected] = useState<string | null>(null);
  // Invite form open + state.
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AdminSubRole>("support");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Per-role counts derived from the real team (no hard-coded totals).
  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of team) {
      counts[m.role] = (counts[m.role] ?? 0) + 1;
    }
    return counts;
  }, [team]);

  function copyLink(key: string, url: string) {
    void navigator.clipboard.writeText(url);
    setCopied(key);
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1800);
  }

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

  function changeRole(userId: string, adminRole: AdminSubRole) {
    setActionError(null);
    startTransition(async () => {
      const res = await updateAdminRole({ userId, adminRole });
      if (!res.ok) {
        setActionError(res.error);
        return;
      }
      router.refresh();
    });
  }

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
    <AdminMobileShell active="team">
      <AdminMobileHead
        eyebrow="Tim admin"
        title="Tim Maritare"
        sub={`${team.length} anggota aktif`}
      />

      <AdminMobileSecLabel
        action={
          <button
            type="button"
            onClick={() => {
              setInviteOpen((v) => !v);
              setCreatedUrl(null);
              setInviteError(null);
            }}
            className="text-[11px] text-burgundy font-bold tracking-[0.06em] uppercase no-underline"
          >
            {inviteOpen ? "Tutup" : "+ Undang"}
          </button>
        }
      >
        i. Anggota tim
      </AdminMobileSecLabel>

      {inviteOpen && (
        <div className="px-[18px] pb-2">
          <AdminMobileCard className="px-[14px] py-[14px]">
            <form onSubmit={submitInvite} className="flex flex-col gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-[9px] tracking-[0.18em] uppercase font-semibold text-muted-ink">Email</span>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className={SELECT_CLASS}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[9px] tracking-[0.18em] uppercase font-semibold text-muted-ink">Peran</span>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as AdminSubRole)}
                  className={SELECT_CLASS}
                >
                  {ROLE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </label>
              <AdminMobileBtnMini
                type="submit"
                sage
                disabled={isPending}
                className="self-start"
              >
                {isPending ? "Mengirim…" : "Kirim undangan"}
              </AdminMobileBtnMini>
            </form>

            {inviteError && (
              <p role="alert" className="text-[12px] text-burgundy mt-2">{inviteError}</p>
            )}

            {createdUrl && (
              <div className="mt-3 bg-cream border border-line rounded-lg p-3">
                <div className="text-[10.5px] text-muted-ink mb-2">
                  Undangan dibuat. Bagikan tautan ini:
                </div>
                <input
                  readOnly
                  value={createdUrl}
                  onFocus={(e) => e.currentTarget.select()}
                  className="w-full bg-paper border border-line rounded px-2 py-[6px] font-body text-[10.5px] text-charcoal outline-none mb-2"
                />
                <AdminMobileBtnMini onClick={() => copyLink("created", createdUrl)}>
                  {copied === "created" ? "Tersalin" : "Salin tautan"}
                </AdminMobileBtnMini>
              </div>
            )}
          </AdminMobileCard>
        </div>
      )}

      {actionError && (
        <div className="px-[18px] pb-1">
          <p role="alert" className="text-[12px] text-burgundy">{actionError}</p>
        </div>
      )}

      <div className="px-[18px] flex flex-col gap-2">
        {team.map((m, i) => {
          const open = selected === m.email;
          return (
            <AdminMobileCard
              key={m.email}
              role="button"
              tabIndex={0}
              aria-expanded={open}
              onClick={() => setSelected(open ? null : m.email)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelected(open ? null : m.email);
                }
              }}
              className="px-[14px] py-[13px] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Avatar tone={AV[i % 5]} size={40} className="text-[13px]">
                  {initials(m.name)}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[14px] text-charcoal">
                    {m.name}
                    {m.you && (
                      <span className="text-[8.5px] px-[6px] py-[2px] rounded bg-cream text-muted-ink ml-[7px] font-bold tracking-[0.14em] uppercase border border-line">
                        Kamu
                      </span>
                    )}
                  </div>
                  <div className="text-[10.5px] text-muted-ink mt-[2px]">{m.email}</div>
                </div>
                <div className="text-right">
                  <span
                    className={
                      m.role === "Super Admin"
                        ? "text-[8.5px] px-2 py-[3px] rounded font-bold tracking-[0.12em] uppercase bg-burgundy text-cream"
                        : "text-[8.5px] px-2 py-[3px] rounded font-bold tracking-[0.12em] uppercase bg-cream text-charcoal border border-line"
                    }
                  >
                    {m.role}
                  </span>
                  <div
                    className="text-[9.5px] text-faint italic font-display mt-[5px]"
                    title="Aktivitas tidak dilacak"
                  >
                    {m.lastActive}
                  </div>
                </div>
              </div>
              {open && (
                <div
                  className="mt-3 pt-3 border-t border-line flex flex-col gap-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div>
                    <div className="text-[9px] text-muted-ink tracking-[0.18em] uppercase font-semibold mb-1">
                      Ubah peran
                    </div>
                    <select
                      defaultValue={m.adminRole}
                      disabled={isPending}
                      onChange={(e) => changeRole(m.userId, e.target.value as AdminSubRole)}
                      className={SELECT_CLASS}
                    >
                      {ROLE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </AdminMobileCard>
          );
        })}
        {team.length === 0 && (
          <AdminMobileCard className="px-[14px] py-[18px] text-center text-[12px] text-muted-ink italic font-display">
            Belum ada admin.
          </AdminMobileCard>
        )}
      </div>

      <AdminMobileSecLabel>ii. Undangan tertunda</AdminMobileSecLabel>
      <div className="px-[18px] flex flex-col gap-2">
        {invites.length === 0 ? (
          <AdminMobileCard className="px-[14px] py-[16px] text-center text-[12px] text-muted-ink italic font-display">
            Tidak ada undangan tertunda.
          </AdminMobileCard>
        ) : (
          invites.map((inv) => (
            <AdminMobileCard key={inv.id} className="px-[14px] py-[13px]">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-charcoal truncate">{inv.email}</div>
                  <div className="text-[10px] text-muted-ink mt-[2px]">
                    {inv.roleLabel} · berlaku s/d {inv.expiresAt}
                  </div>
                </div>
                <span className="text-[8.5px] px-2 py-[3px] rounded font-bold tracking-[0.12em] uppercase bg-peach text-[#5a2a18] shrink-0">
                  Tertunda
                </span>
              </div>
              <div className="flex gap-2 mt-3">
                <AdminMobileBtnMini onClick={() => copyLink(inv.id, inv.inviteUrl)}>
                  {copied === inv.id ? "Tersalin" : "Salin link"}
                </AdminMobileBtnMini>
                <AdminMobileBtnMini
                  disabled={isPending}
                  className="border-burgundy/40 text-burgundy"
                  onClick={() => handleRevoke(inv.id)}
                >
                  Batalkan
                </AdminMobileBtnMini>
              </div>
            </AdminMobileCard>
          ))
        )}
      </div>

      <AdminMobileSecLabel>iii. Role &amp; izin</AdminMobileSecLabel>
      <div className="px-[18px]">
        <AdminMobileCard className="px-[14px] py-1">
          {ROLES.map((r, i) => (
            <div
              key={r.label}
              className={
                i < ROLES.length - 1
                  ? "flex items-start gap-[11px] py-[13px] border-b border-line"
                  : "flex items-start gap-[11px] py-[13px]"
              }
            >
              <span className="w-[6px] h-[6px] rounded-full mt-[6px] shrink-0" style={{ background: r.color }} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="text-[13px] font-semibold text-charcoal">{r.label}</div>
                  <span className="font-display font-extrabold text-[15px]" style={{ color: r.color }}>
                    {roleCounts[r.label] ?? 0}
                  </span>
                </div>
                <div className="text-[11px] text-muted-ink mt-[3px]">{r.desc}</div>
              </div>
            </div>
          ))}
          <div className="py-[12px] border-t border-line text-[11px] text-muted-ink">
            Akses ditentukan oleh peran.
          </div>
        </AdminMobileCard>
      </div>

      <div className="px-[18px] pt-[14px]">
        <div className="bg-forest-deep text-cream rounded-[14px] px-[18px] py-4">
          <AdminMobileSecnum className="text-peach mb-2">iv. Audit log</AdminMobileSecnum>
          <div className="text-[12px] text-[rgba(245,239,230,0.85)] leading-[1.5]">
            Lihat siapa melakukan apa, kapan — berguna untuk troubleshooting refund &amp; akses sensitif.
          </div>
          <Link href="/admin/audit">
            <AdminMobileBtnMini className="bg-[rgba(245,239,230,0.12)] text-cream mt-3">
              Buka audit log →
            </AdminMobileBtnMini>
          </Link>
        </div>
      </div>
    </AdminMobileShell>
  );
}
