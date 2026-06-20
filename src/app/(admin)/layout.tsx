import type { Metadata } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

// Variable fonts — full axis (weight unset) so `font-variation-settings` works.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Admin · Maritare",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Authoritative gate: require a valid session, then enforce the admin role.
  // Non-admins are sent back to their own dashboard rather than the login page.
  // NOTE: on config errors Auth.js returns a truthy error object instead of a
  // session, so the check must require session.user — never just truthiness.
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return <div className={`${fraunces.variable} ${instrumentSans.variable}`}>{children}</div>;
}
