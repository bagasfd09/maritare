// Scarlet gallery â€” ported from <section.photo-wrap> in scarlet-body.ts.
// The static 20-cell .photo-grid is replaced by data.photos.map(...) â†’ one
// .photo-cell per photo, keeping the exact cell markup (data-aos="zoom-in").

import type { InvitationPhoto, InvitationView } from "@/server/queries/invitation";

import { InvImage } from "../inv-image";

type Props = { data: InvitationView; mode: "public" | "ownerPreview" | "editorPreview" };

export function ScarletGallery({ data }: Props) {
  // Only curated photos appear in the grid: the owner picks which gallery photos
  // show in the invitation (empty selection = no gallery). The cover/hero and the
  // dedicated closing photo live in their own sections, never the grid.
  // Render in the owner's curated ORDER (the drag order from the editor): walk
  // selectedPhotoIds and resolve each to its photo, skipping cover/closing and any
  // stale/deleted id. Equals the old sortOrder filter until the owner drags.
  const byId = new Map(data.photos.map((p) => [p.id, p]));
  const galleryPhotos = data.sections.galeri.selectedPhotoIds
    .map((id) => byId.get(id))
    .filter((p): p is InvitationPhoto => !!p && !p.isCover && !p.isClosing);
  if (galleryPhotos.length === 0) {
    return null;
  }

  return (
    <section className="photo-wrap">
      <div className="photo-inner">
        <div className="photo-head">
          <p className="photo-title" data-aos="fade-up" data-aos-duration="1000">
            Our Gallery
          </p>
        </div>
        <div className="photo-grid">
          {galleryPhotos.map((photo) => (
            <div key={photo.id} className="photo-cell" data-aos="zoom-in" data-aos-duration="800">
              { }
              <InvImage
                src={photo.url}
                alt={photo.label ?? `${data.groomName} & ${data.brideName}`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
