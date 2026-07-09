import { redirect } from "next/navigation";
import { z } from "zod";

import { Guests } from "@/components/templates/guests";
import { GuestsMobile } from "@/components/templates/guests-mobile";
import { getGuestsData } from "@/server/queries/dashboard";

// searchParams values can be string | string[] | undefined — every field
// falls back to its default on anything unexpected (e.g. a duplicated ?q=).
const searchParamsSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  q: z.string().trim().max(120).catch(""),
  status: z.enum(["pending", "confirmed", "declined"]).nullable().catch(null),
  side: z.string().trim().max(40).nullable().catch(null),
});

// Server-paged: filters + page live in the URL so search, filter pills and
// pagination all round-trip through the database instead of shipping every
// guest to the client.
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = searchParamsSchema.parse(await searchParams);

  const data = await getGuestsData({
    page: sp.page,
    q: sp.q,
    status: sp.status,
    side: sp.side || null,
  });
  if (!data) {
    redirect("/dashboard/onboarding");
  }
  return (
    <>
      <div className="hidden lg:contents">
        <Guests data={data} chrome={data.chrome} />
      </div>
      <GuestsMobile data={data} chrome={data.chrome} />
    </>
  );
}
