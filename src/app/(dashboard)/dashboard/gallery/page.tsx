import { redirect } from "next/navigation";

import { getDashboardChrome } from "@/server/queries/dashboard";
import { getMyGallery } from "@/server/queries/photos";
import { getMyWedding } from "@/server/queries/wedding";
import { Gallery } from "@/components/templates/gallery";
import { GalleryMobile } from "@/components/templates/gallery-mobile";

// Screen 06 · Galeri Foto. Both the desktop and mobile templates are data-driven
// (real photos + quota from the DB / R2).
export default async function Page() {
  const wedding = await getMyWedding();
  if (!wedding) {
    redirect("/dashboard/onboarding");
  }
  const [gallery, chrome] = await Promise.all([getMyGallery(), getDashboardChrome()]);
  return (
    <>
      <div className="hidden lg:contents"><Gallery gallery={gallery} chrome={chrome} /></div>
      <GalleryMobile gallery={gallery} />
    </>
  );
}
