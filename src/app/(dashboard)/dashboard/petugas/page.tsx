import { redirect } from "next/navigation";

import { PetugasResepsi } from "@/components/templates/petugas-resepsi";
import { PetugasMobile } from "@/components/templates/petugas-mobile";
import { getPetugasData } from "@/server/queries/petugas";

export default async function Page() {
  const data = await getPetugasData();
  if (!data) {
    redirect("/dashboard/onboarding");
  }
  return (
    <>
      <div className="hidden lg:contents">
        <PetugasResepsi data={data} />
      </div>
      <PetugasMobile data={data} />
    </>
  );
}
