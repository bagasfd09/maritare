/* eslint-disable @next/next/no-img-element -- decorative ornaments + presigned R2 srcs use raw <img> by design */
// Plum gallery — verbatim kinanti port of <section.photo-wrap data-section-order="gallery_photo">.
// The slick carousel + lightgallery scaffolding is stripped: the .photo-nav becomes a plain
// wrapper and we .map over the owner's curated gallery photos (one .photo-item per photo),
// mirroring sienna-gallery's selection + order. The preview-wrap keeps its 369×492 frame
// (the theme CSS gives preview-wrap no dimensions, and photo-img-wrap/photo-img are 100%).

import type { InvitationPhoto, InvitationView } from "@/server/queries/invitation";

import { InvImage } from "../scarlet/inv-image";

type Props = { data: InvitationView; mode: "public" | "ownerPreview" | "editorPreview" };

export function PlumGallery({ data }: Props) {
  // Only curated photos appear in the gallery: the owner picks which gallery photos
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
        <div className="photo-head">
          <h1 className="photo-title" data-aos="fade-up" data-aos-duration="1200">Our Galery</h1>
        </div>

        <div className="photo-body">
          <div className="photo-nav-wrap">
            <div className="photo-nav" data-aos="fade-up" data-aos-duration="1200">
              {galleryPhotos.map((photo) => (
                <div key={photo.id} className="photo-item">
                  <div className="preview-wrap" style={{ width: "369px", height: "492px" }}>
                    <div className="ornaments-wrapper">
                      <div className="orn-gallery--bottom bl-1">
                        <div className="orn-gallery--bottom bl-3">
                          <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="100">
                            <img loading="lazy" decoding="async" src="/invitation/plum/orn-16-min.png" alt="" />
                          </div>
                        </div>
                        <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="200">
                          <img loading="lazy" decoding="async" src="/invitation/plum/orn-5-min.png" alt="" />
                        </div>
                      </div>
                      <div className="orn-gallery--bottom br-1">
                        <div className="orn-gallery--bottom bl-3">
                          <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="100">
                            <img loading="lazy" decoding="async" src="/invitation/plum/orn-16-min.png" alt="" />
                          </div>
                        </div>
                        <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="200">
                          <img loading="lazy" decoding="async" src="/invitation/plum/orn-5-min.png" alt="" />
                        </div>
                      </div>
                    </div>

                    <div className="photo-img-wrap">
                      <InvImage src={photo.thumbUrl} alt={photo.label ?? ""} className="photo-img" />
                    </div>

                    <div className="orn-gallery--bottom bl-2">
                      <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="100">
                        <img loading="lazy" decoding="async" src="/invitation/plum/orn-6-min.png" alt="" />
                      </div>
                    </div>
                    <div className="orn-gallery--bottom br-2">
                      <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="100">
                        <img loading="lazy" decoding="async" src="/invitation/plum/orn-6-min.png" alt="" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
