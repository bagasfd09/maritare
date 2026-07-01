/* eslint-disable @next/next/no-img-element -- decorative ornaments + presigned R2 srcs use raw <img> by design */
// Ivory gallery — verbatim Aulia port of <section.photo-wrap data-section-order="gallery_photo">.
// The static lightgallery .photo-box is replaced by data.photos.map(...) → one <a> per
// curated gallery photo (lightgallery hooks dropped), mirroring scarlet-gallery's selection.

import type { InvitationPhoto, InvitationView } from "@/server/queries/invitation";

import { InvImage } from "../scarlet/inv-image";

type Props = { data: InvitationView; mode: "public" | "ownerPreview" | "editorPreview" };

export function IvoryGallery({ data }: Props) {
  // Only curated photos appear in the grid: the owner picks which gallery photos
  // show in the invitation (empty selection = no gallery). Render in the owner's
  // curated ORDER: walk selectedPhotoIds and resolve each to its photo, skipping
  // cover/closing and any stale/deleted id.
  const byId = new Map(data.photos.map((p) => [p.id, p]));
  const galleryPhotos = data.sections.galeri.selectedPhotoIds
    .map((id) => byId.get(id))
    .filter((p): p is InvitationPhoto => !!p && !p.isCover && !p.isClosing);
  if (galleryPhotos.length === 0) {
    return null;
  }

  return (
    <section className="photo-wrap" data-section-order="gallery_photo">
      <div className="photo-inner">
        <div className="ornaments-wrapper">
          <div className="orn-ph-1 left">
            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="800">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-46.png" alt="orn-gift" />
            </div>
          </div>
          <div className="orn-ph-1 right">
            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="800">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-46.png" alt="orn-gift" />
            </div>
          </div>
          <div className="orn-ph-2 left">
            <div className="image-wrap" data-aos="zoom-in-up" data-aos-duration="1200" data-aos-delay="800">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-48.png" alt="orn-gift" />
            </div>
          </div>
          <div className="orn-ph-2 right">
            <div className="image-wrap" data-aos="zoom-in-up" data-aos-duration="1200" data-aos-delay="800">
              <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-48.png" alt="orn-gift" />
            </div>
          </div>
        </div>

        <div className="photo-head">
          <h1 className="photo-title" data-aos="fade-up" data-aos-duration="1000">Portraits of Us</h1>
          <p className="photo-description" data-aos="fade-up" data-aos-duration="1000">their love was never black & white - it has always been vibrant and varied, encompassing moments of passion and tenderness, joy and sorrow, certainty and doubt… ♡</p>
        </div>

        <div className="photo-body">
          <div className="photo-box">
            {galleryPhotos.map((photo) => (
              <a key={photo.id} data-aos="zoom-in" data-aos-duration="1000" href={photo.url} target="_blank" rel="noreferrer">
                <InvImage src={photo.thumbUrl} alt={photo.label ?? ""} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
