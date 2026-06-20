"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { AdminShell } from "@/components/templates/admin-shell";
import { AdminTopBar } from "@/components/organisms/admin-topbar";
import { AdminStatus } from "@/components/molecules/admin-badges";
import { Button } from "@/components/atoms/button";
import { Avatar, initials } from "@/components/atoms/avatar";
import { SectionNumber } from "@/components/atoms/section-number";
import { setTicketStatus } from "@/server/actions/support";
import type { SupportTicketsData, SupportTicketRow } from "@/server/queries/support";

const AVATAR_TONES = ["burgundy", "peach", "sage", "blush", "dark"] as const;

// One ticket card. The toggle flips open↔closed via the admin action, then
// refreshes the route so the server re-fetches the list + open count.
function TicketCard({
  ticket,
  tone,
}: {
  ticket: SupportTicketRow;
  tone: (typeof AVATAR_TONES)[number];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const next = ticket.status === "open" ? "closed" : "open";

  function handleToggle() {
    setError(null);
    startTransition(async () => {
      const result = await setTicketStatus({ id: ticket.id, status: next });
      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="bg-paper border border-line rounded-[14px] px-[22px] py-[18px] flex gap-[18px] items-start">
      <Avatar tone={tone} size={40} className="text-[14px] mt-[2px]">
        {initials(ticket.fromName)}
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-[10px] flex-wrap">
          <span className="text-[14px] font-semibold text-charcoal">{ticket.fromName}</span>
          <span className="text-[12px] text-muted-ink truncate">{ticket.fromEmail}</span>
          <AdminStatus status={ticket.status === "open" ? "pending" : "refunded"} />
          <span className="text-[11px] text-muted-ink italic font-display ml-auto">{ticket.time}</span>
        </div>
        <div className="text-[14px] font-semibold text-charcoal mt-[10px]">{ticket.subject}</div>
        <p className="text-[13px] text-muted-ink leading-[1.55] mt-[6px] whitespace-pre-wrap break-words">
          {ticket.body}
        </p>
        <div className="flex items-center gap-3 mt-[14px]">
          <Button
            size="sm"
            variant={ticket.status === "open" ? "primary" : "ghost"}
            onClick={handleToggle}
            disabled={isPending}
          >
            {isPending
              ? "Menyimpan…"
              : ticket.status === "open"
                ? "Tandai selesai"
                : "Buka lagi"}
          </Button>
          {error && <span className="text-[12px] text-burgundy">{error}</span>}
        </div>
      </div>
    </div>
  );
}

// Admin screen · Support (customer tickets). Mirrors the other admin screens'
// shell + top bar + section-number rhythm.
export function AdminSupport({ data }: { data: SupportTicketsData }) {
  const { tickets, openCount } = data;

  return (
    <AdminShell active="support">
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <AdminTopBar
          crumbs={["Admin", "Support"]}
          title="Support"
          eyebrow={`${openCount} tiket terbuka`}
        />

        <div className="flex-1 overflow-y-auto px-9 py-6 flex flex-col gap-4">
          <SectionNumber className="text-[12px]">i. Tiket masuk</SectionNumber>

          {tickets.length === 0 ? (
            <div className="bg-paper border border-line rounded-[14px] px-[22px] py-12 text-center text-[13px] text-muted-ink italic font-display">
              Belum ada tiket masuk.
            </div>
          ) : (
            <div className="flex flex-col gap-[14px]">
              {tickets.map((t, i) => (
                <TicketCard
                  key={t.id}
                  ticket={t}
                  tone={AVATAR_TONES[i % AVATAR_TONES.length]}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </AdminShell>
  );
}
