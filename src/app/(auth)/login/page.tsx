import { AuthScreen } from "@/components/auth/auth-screen";

// /login renders the auth screen. ?mode=signup opens the Daftar tab first
// (used by the landing's "start creating" CTAs); anything else opens Masuk.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;
  return <AuthScreen initialMode={mode === "signup" ? "signup" : "signin"} />;
}
