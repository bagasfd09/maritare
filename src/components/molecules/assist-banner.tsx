// "Bantu edit" marker — shown to an ADMIN while they are editing a customer's
// invitation (see resolveAssistWeddingId). Without it an admin can mistake the
// customer's data for their own, so this is not decoration: it names the
// wedding being edited and offers the way out.
//
// Server component: reads the slug itself and posts straight to the action.

import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { weddings } from "@/lib/db/schema";
import { adminStopAssist } from "@/server/actions/admin-wedding";

export async function AssistBanner({ weddingId }: { weddingId: string }) {
  const wedding = await db.query.weddings.findFirst({
    columns: { slug: true, groomName: true, brideName: true },
    where: and(eq(weddings.id, weddingId), isNull(weddings.deletedAt)),
  });
  if (!wedding) {
    return null;
  }
  const couple = [wedding.groomName, wedding.brideName].filter(Boolean).join(" & ");

  return (
    <div className="fixed bottom-3 left-3 z-[100] flex items-center gap-3 rounded-full bg-burgundy px-4 py-2 text-cream shadow-[0_10px_30px_rgba(27,31,24,0.35)]">
      <span className="text-[11px] leading-tight">
        <span className="font-bold tracking-[0.1em] uppercase">Mode bantu edit</span>
        <span className="mx-2 opacity-50">·</span>
        {couple || wedding.slug}
      </span>
      <form action={adminStopAssist}>
        <button
          type="submit"
          className="rounded-full bg-cream px-3 py-[5px] text-[10px] font-bold tracking-[0.08em] uppercase text-burgundy cursor-pointer hover:opacity-90"
        >
          Selesai
        </button>
      </form>
    </div>
  );
}
