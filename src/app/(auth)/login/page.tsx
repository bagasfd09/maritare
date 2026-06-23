import { AuthScreen } from "@/components/auth/auth-screen";

// /login renders the auth screen. ?mode=signup opens the Daftar tab first;
// anything else (incl. the landing CTAs' ?mode=signin) opens the Masuk tab.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;
  return <AuthScreen initialMode={mode === "signup" ? "signup" : "signin"} />;
}
