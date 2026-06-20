import { AdminShell } from "@/components/templates/admin-shell";
import { AdminTopBar } from "@/components/organisms/admin-topbar";
import { SectionNumber } from "@/components/atoms/section-number";
import type { AuditEntry } from "@/server/queries/audit";
import { cn } from "@/lib/utils";

// `.d-tbl` cells — same tokens as admin-team.tsx so the audit table matches the
// rest of the admin surface 1:1.
const TH =
  "font-body text-[10px] font-semibold tracking-[0.18em] uppercase text-muted-ink text-left px-[14px] py-3 border-b border-beige";
const TD = "p-[14px] border-b border-line align-middle";

// Machine action label rendered as a bordered cream chip, e.g. "order.status".
// Monospace-ish lowercase tracking keeps it readable as a code-like token.
function ActionChip({ action }: { action: string }) {
  return (
    <span className="inline-block text-[10px] px-[9px] py-[3px] rounded font-bold tracking-[0.08em] lowercase text-charcoal bg-cream border border-line">
      {action}
    </span>
  );
}

// Admin screen · Audit log — read-only feed of who did what, when.
export function AdminAudit({ entries }: { entries: AuditEntry[] }) {
  return (
    <AdminShell active="team">
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <AdminTopBar
          crumbs={["Admin", "Audit log"]}
          title="Audit log"
          eyebrow={
            entries.length > 0
              ? `${entries.length} aktivitas terakhir`
              : "Belum ada aktivitas"
          }
        />

        <div className="flex-1 overflow-y-auto px-9 py-6 flex flex-col gap-4 min-w-0">
          <div className="flex items-center gap-[10px]">
            <SectionNumber className="text-[12px]">i. Aktivitas admin</SectionNumber>
          </div>

          <div className="bg-paper border border-line rounded-[14px] overflow-hidden">
            <table className="w-full border-separate border-spacing-0 text-[13px] [&_tbody_tr:last-child_td]:border-b-0 [&_tbody_tr:hover_td]:bg-[rgba(124,45,45,0.03)]">
              <thead>
                <tr className="bg-cream">
                  <th className={cn(TH, "pl-[22px]")}>Aktor</th>
                  <th className={TH}>Aktivitas</th>
                  <th className={TH}>Action</th>
                  <th className={TH}>Target</th>
                  <th className={cn(TH, "text-right pr-[22px]")}>Waktu</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id}>
                    <td className={cn(TD, "pl-[22px] text-[12px] text-charcoal")}>
                      {e.actorEmail ?? "—"}
                    </td>
                    <td className={cn(TD, "text-[13px] text-charcoal")}>{e.summary}</td>
                    <td className={TD}>
                      <ActionChip action={e.action} />
                    </td>
                    <td className={cn(TD, "text-[11px] text-muted-ink")}>
                      {e.targetType ? (
                        <span className="inline-flex flex-col leading-[1.35]">
                          <span className="font-semibold text-charcoal">{e.targetType}</span>
                          {e.targetId && (
                            <span
                              className="font-mono text-[10px] text-muted-ink truncate max-w-[200px]"
                              title={e.targetId}
                            >
                              {e.targetId}
                            </span>
                          )}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td
                      className={cn(
                        TD,
                        "text-right pr-[22px] text-[11px] text-muted-ink italic font-display whitespace-nowrap",
                      )}
                    >
                      {e.time}
                    </td>
                  </tr>
                ))}
                {entries.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className={cn(
                        TD,
                        "text-center text-[12px] text-muted-ink italic font-display py-6",
                      )}
                    >
                      Belum ada aktivitas tercatat.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </AdminShell>
  );
}
