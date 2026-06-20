// Server-only data access for the admin support screen.
//
// Admin-gated (defense-in-depth) like the other admin getters: the (admin)
// layout is the authoritative role gate, and this getter additionally resolves
// the session and returns `null` when the caller is not an admin. Must only be
// imported from Server Components / Server Actions (imports db + auth).

import { desc } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { supportTickets } from "@/lib/db/schema";
import { relativeTimeId } from "@/lib/datetime";

/** Resolve the signed-in admin from the session, or null when not an admin. */
async function requireAdmin(): Promise<{ id: string } | null> {
  const session = await auth();
  const user = session?.user;
  if (!user?.id || user.role !== "admin") {
    return null;
  }
  return { id: user.id };
}

export type SupportTicketRow = {
  id: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  body: string;
  status: "open" | "closed";
  /** Relative Indonesian label, e.g. "3 jam lalu". */
  time: string;
};

export type SupportTicketsData = {
  tickets: SupportTicketRow[];
  openCount: number;
};

/**
 * All support tickets, newest first, plus the count of open ones. Returns
 * `null` when the caller is not an admin.
 */
export async function getSupportTickets(): Promise<SupportTicketsData | null> {
  const admin = await requireAdmin();
  if (!admin) {
    return null;
  }

  const rows = await db
    .select({
      id: supportTickets.id,
      fromName: supportTickets.fromName,
      fromEmail: supportTickets.fromEmail,
      subject: supportTickets.subject,
      body: supportTickets.body,
      status: supportTickets.status,
      createdAt: supportTickets.createdAt,
    })
    .from(supportTickets)
    .orderBy(desc(supportTickets.createdAt));

  const tickets: SupportTicketRow[] = rows.map((r) => ({
    id: r.id,
    fromName: r.fromName,
    fromEmail: r.fromEmail,
    subject: r.subject,
    body: r.body,
    status: r.status,
    time: relativeTimeId(r.createdAt),
  }));

  const openCount = tickets.reduce((n, t) => (t.status === "open" ? n + 1 : n), 0);

  return { tickets, openCount };
}
