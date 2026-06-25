import { redirect } from "next/navigation";

import { Editor } from "@/components/templates/editor";
import { EditorMobile } from "@/components/templates/editor-mobile";
import { parseSectionData } from "@/lib/invitation/sections";
import { getViewUrl } from "@/lib/r2";
import { getDashboardChrome } from "@/server/queries/dashboard";
import { getMyGallery } from "@/server/queries/photos";
import { getMyWedding, getWeddingTemplateMeta } from "@/server/queries/wedding";
import type { EditorData } from "@/components/templates/editor-types";

export default async function Page() {
  const wedding = await getMyWedding();

  // No wedding → send the user through onboarding first (they pick a template
  // and create the wedding there, then return to the editor).
  if (!wedding) {
    redirect("/dashboard/onboarding");
  }

  let editorData: EditorData | null = null;
  const chrome = await getDashboardChrome();

  {
    const [gallery, templateMeta] = await Promise.all([
      getMyGallery(),
      getWeddingTemplateMeta(wedding.templateId),
    ]);
    const raw = wedding.sections ?? {};
    const cerita = raw.cerita ?? {};

    // Presign the uploaded background-music audio so the editor's waveform
    // trimmer can fetch + decode it (mirrors how gallery photos are presigned).
    const musikData = parseSectionData("musik", raw.musik?.data);
    if (musikData.source === "upload" && musikData.audioKey) {
      musikData.audioUrl = await getViewUrl(musikData.audioKey);
    }

    // Presign the folk hero cover asset (image/video) so the editor preview +
    // upload slot can show it (same pattern as the music audio above).
    const heroData = parseSectionData("hero", raw.hero?.data);
    if (heroData.imageKey) heroData.imageUrl = await getViewUrl(heroData.imageKey);
    if (heroData.videoKey) heroData.videoUrl = await getViewUrl(heroData.videoKey);
    if (heroData.closingVideoKey)
      heroData.closingVideoUrl = await getViewUrl(heroData.closingVideoKey);

    // Presign the "Bagikan" (link-preview) image so the editor slot can show it.
    const bagikanData = parseSectionData("bagikan", raw.bagikan?.data);
    if (bagikanData.imageKey) bagikanData.imageUrl = await getViewUrl(bagikanData.imageKey);

    // Presign the folk "Momen" illustration so the editor slot + preview show it.
    const momenData = parseSectionData("momen", raw.momen?.data);
    if (momenData.imageKey) momenData.imageUrl = await getViewUrl(momenData.imageKey);

    editorData = {
      meta: {
        slug: wedding.slug,
        groomName: wedding.groomName,
        brideName: wedding.brideName,
        eventDate: wedding.eventDate,
        venue: wedding.venue,
        city: wedding.city,
        status: wedding.status,
        templateSlug: templateMeta.slug,
      },
      sections: {
        pasangan: {
          done: Boolean(raw.pasangan?.done),
          data: parseSectionData("pasangan", raw.pasangan?.data),
        },
        momen: {
          done: Boolean(raw.momen?.done),
          data: momenData,
        },
        acara: {
          done: Boolean(raw.acara?.done),
          data: parseSectionData("acara", raw.acara?.data),
        },
        cerita: {
          done: Boolean(cerita.done),
          title: cerita.title ?? "",
          body: cerita.body ?? "",
        },
        galeri: {
          done: Boolean(raw.galeri?.done),
          data: parseSectionData("galeri", raw.galeri?.data),
        },
        amplop: {
          done: Boolean(raw.amplop?.done),
          data: parseSectionData("amplop", raw.amplop?.data),
        },
        musik: {
          done: Boolean(raw.musik?.done),
          data: musikData,
        },
        rsvp: {
          done: Boolean(raw.rsvp?.done),
          data: parseSectionData("rsvp", raw.rsvp?.data),
        },
        hero: {
          done: Boolean(raw.hero?.done),
          data: heroData,
        },
        bagikan: {
          done: Boolean(raw.bagikan?.done),
          data: bagikanData,
        },
      },
      gallery: {
        photos: gallery.photos.map((p) => ({
          id: p.id,
          url: p.viewUrl,
          label: p.label,
          isCover: p.isCover,
          isClosing: p.isClosing,
        })),
        used: gallery.used,
        limit: gallery.limit,
        packageName: gallery.packageName,
      },
      manifest: templateMeta.manifest,
    };
  }

  return (
    <>
      <div className="hidden lg:contents">
        <Editor data={editorData} chrome={chrome} />
      </div>
      <EditorMobile data={editorData} />
    </>
  );
}
