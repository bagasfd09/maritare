/* eslint-disable @next/next/no-img-element -- decorative ornaments + presigned R2 srcs use raw <img> by design */
// Sienna gallery — verbatim Syakira port of <section.photo-wrap data-section-order="gallery_photo">.
// The static lightgallery .photo-box is replaced by curated gallery photos.map(...) → one <a>
// per photo (lightgallery hooks dropped), mirroring ivory-gallery's selection + order.

import type { InvitationPhoto, InvitationView } from "@/server/queries/invitation";

import { InvImage } from "../scarlet/inv-image";

type Props = { data: InvitationView; mode: "public" | "ownerPreview" | "editorPreview" };

export function SiennaGallery({ data }: Props) {
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
      <div className="ornaments-wrapper">
        <div className="orn-1">
          <div className="image-wrap" data-aos="fade-left" data-aos-duration="1200" data-aos-delay="400">
            <img loading="lazy" decoding="async" src="/invitation/sienna/orn-wish-1.png" alt="Orn 1" />
          </div>
        </div>

        <div className="orn-2">
          <div className="image-wrap" data-aos="fade-right" data-aos-duration="1200" data-aos-delay="600">
            <img loading="lazy" decoding="async" src="/invitation/sienna/orn-footer-1.png" alt="Orn 2" />
          </div>
        </div>
      </div>

      <div className="photo-inner">
        <div className="photo-head">
          <h1 className="photo-title" data-aos="fade-up" data-aos-duration="1000">Moment of Us</h1>
          <p className="photo-description" data-aos="fade-up" data-aos-duration="1000">Every picture holds a piece of our story, a collection of moments that brought us closer and led us to forever</p>
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
