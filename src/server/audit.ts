// Append-only admin audit logging. Best-effort: a logging failure must NEVER
// break the action it accompanies, so everything is wrapped in try/catch.
//
// Server-only (imports db + auth). Call from admin Server Actions after a
// successful mutation: await logAudit({ action, targetType, targetId, summary }).

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { auditLog } from "@/lib/db/schema";

export async function logAudit(entry: {
  /** Machine action, e.g. "order.status", "wedding.delete", "team.invite". */
  action: string;
  targetType?: string;
  targetId?: string;
  /** Human one-liner in Bahasa, e.g. "Menandai pesanan MTR-0287 lunas". */
  summary: string;
}): Promise<void> {
  try {
    const session = await auth();
    await db.insert(auditLog).values({
      actorUserId: session?.user?.id ?? null,
      actorEmail: session?.user?.email ?? null,
      action: entry.action,
      targetType: entry.targetType ?? null,
      targetId: entry.targetId ?? null,
      summary: entry.summary,
    });
  } catch (error) {
    console.error("logAudit failed", error);
  }
}
