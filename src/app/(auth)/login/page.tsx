import { redirect } from "next/navigation";

import { AuthScreen } from "@/components/auth/auth-screen";
import { auth } from "@/lib/auth";

// /login renders the auth screen. ?mode=signup opens the Daftar tab first;
// anything else (incl. the landing CTAs' ?mode=signin) opens the Masuk tab.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  // Already signed in? Bounce to the dashboard. Otherwise clicking "Sign in with
  // Google" here runs the OAuth flow *with an active session*, which Auth.js
  // treats as "link this Google account to my current user" — and throws
  // OAuthAccountNotLinked if that Google account belongs to a different user.
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  const { mode } = await searchParams;
  return <AuthScreen initialMode={mode === "signup" ? "signup" : "signin"} />;
}
