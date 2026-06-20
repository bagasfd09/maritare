import { redirect } from "next/navigation";

import { PetugasResepsi } from "@/components/templates/petugas-resepsi";
import { getPetugasData } from "@/server/queries/petugas";

export default async function Page() {
  const data = await getPetugasData();
  if (!data) {
    redirect("/dashboard/onboarding");
  }
  return <PetugasResepsi data={data} />;
}
