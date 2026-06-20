import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { getInvitationTemplate } from "@/components/invitation/registry";
import { isRenderableTemplateSlug } from "@/components/invitation/slugs";
import { getInvitationCheckinByCode } from "@/server/queries/guest-qr";
import { getInvitationBySlug, incrementVisitCount } from "@/server/queries/invitation";

// Always render fresh: presigned photo URLs are short-lived and public views
// bump the visit counter per request.
export const dynamic = "force-dynamic";

// Dedupe the lookup between generateMetadata and the page render (one DB pass
// + one presigning round per request).
const getInvitation = cache(getInvitationBySlug);

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

/** Display-only sanitation for ?to= — trim, strip control chars, cap at 80. */
function sanitizeGuestName(raw: string | string[] | undefined): string | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return undefined;
  const cleaned = Array.from(value)
    .filter((ch) => {
      const code = ch.charCodeAt(0);
      return code >= 0x20 && code !== 0x7f; // drop ASCII control characters
    })
    .join("")
    .trim()
    .slice(0, 80);
  return cleaned.length > 0 ? cleaned : undefined;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const lookup = await getInvitation(slug);
  if (lookup.kind === "notFound") {
    return { title: "Undangan tidak ditemukan · Maritare" };
  }
  const { groomName, brideName, ogImageUrl } = lookup.data;
  const title = `The Wedding of ${groomName} & ${brideName}`;
  const description = `Dengan penuh sukacita, kami mengundangmu hadir di hari bahagia ${groomName} & ${brideName}.`;

  // Link-preview (WhatsApp/social): when an image is available, ship a
  // large-image card; otherwise a plain text card. The image is the editable
  // "Bagikan" image, falling back to the cover photo (resolved in the query).
  // No declared width/height: the source isn't cropped to a fixed ratio (CDN
  // preserves aspect; the presigned fallback is the untouched original), so we
  // let the crawler read the real dimensions from the bytes instead of lying.
  const images = ogImageUrl ? [{ url: ogImageUrl, alt: title }] : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      ...(images ? { images } : {}),
    },
    twitter: {
      card: ogImageUrl ? "summary_large_image" : "summary",
      title,
      description,
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
  };
}

export default async function InvitationPage({ params, searchParams }: PageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);

  const lookup = await getInvitation(slug);
  if (lookup.kind === "notFound") {
    notFound();
  }

  const guestName = sanitizeGuestName(query.to);

  // ?g=<code> → resolve the short per-guest code to the guest behind the
  // in-invitation check-in QR (scoped to this wedding). Absent/invalid → null,
  // and the template shows a sample QR instead.
  const codeRaw = Array.isArray(query.g) ? query.g[0] : query.g;
  const checkin = codeRaw ? await getInvitationCheckinByCode(slug, codeRaw) : null;

  // ?tpl= lets the OWNER preview any renderable template on their own data.
  // Never honored on public views — guests always see the chosen template.
  let templateSlug = lookup.data.templateSlug;
  const tpl = Array.isArray(query.tpl) ? query.tpl[0] : query.tpl;
  if (lookup.kind === "ownerPreview" && tpl && isRenderableTemplateSlug(tpl)) {
    templateSlug = tpl;
  }

  if (lookup.kind === "public") {
    // Fire-and-forget — never block render on the counter write.
    void incrementVisitCount(slug);
  }

  const Template = getInvitationTemplate(templateSlug);

  return (
    <>
      {lookup.kind === "ownerPreview" && (
        <div className="fixed inset-x-0 top-0 z-[60] bg-burgundy px-4 py-2 text-center font-body text-[11px] tracking-[0.08em] text-ivory shadow-md">
          Mode pratinjau — undangan ini belum dipublikasikan. Hanya kamu yang bisa melihatnya.
        </div>
      )}
      {/* eslint-disable-next-line react-hooks/static-components -- registry lookup returns a module-level component, never a new one */}
      <Template data={lookup.data} guestName={guestName} checkin={checkin} mode={lookup.kind} />
    </>
  );
}
