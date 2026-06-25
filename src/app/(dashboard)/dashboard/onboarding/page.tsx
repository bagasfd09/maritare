import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { isRenderableTemplateSlug } from "@/components/invitation/slugs";
import { Onboarding } from "@/components/templates/onboarding";
import { getPublishedTemplates } from "@/server/queries/dashboard";
import { getMyWedding } from "@/server/queries/wedding";

// First-run onboarding: a signed-in user with no wedding lands here (every other
// dashboard page redirects here when there's no wedding). Once they have one,
// this page bounces to the dashboard so it can't create a second.
export default async function Page() {
  const wedding = await getMyWedding();
  if (wedding) {
    redirect("/dashboard");
  }

  const session = await auth();

  // Only renderable templates (folk/scarlet) can actually be used.
  const templates = (await getPublishedTemplates()).filter((t) =>
    isRenderableTemplateSlug(t.slug),
  );

  return <Onboarding templates={templates} userEmail={session?.user?.email ?? null} />;
}
