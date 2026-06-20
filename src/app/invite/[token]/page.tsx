import Link from "next/link";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { teamInvites } from "@/lib/db/schema";
import { Card } from "@/components/atoms/card";
import { Display, Em } from "@/components/atoms/typography";
import { Logo } from "@/components/atoms/logo";
import { AcceptForm } from "./accept-form";

const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super Admin",
  support: "Support",
  finance: "Finance",
  designer: "Designer",
};

// Module-scope helper so `Date.now()` is never called directly in the component
// render body (react-hooks/purity). This is a Server Component, so the value is
// resolved once per request.
function isExpired(at: Date): boolean {
  return at.getTime() < Date.now();
}

// Centered wrapper for both the form and the error states.
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-cream flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[440px]">
        <div className="flex justify-center mb-6">
          <Logo size={26} />
        </div>
        <Card tone="default" className="p-8">
          {children}
        </Card>
        <div className="text-center text-[11px] text-muted-ink mt-5">
          © 2026 Maritare · Panel admin
        </div>
      </div>
    </div>
  );
}

// Friendly Bahasa state for missing / expired / already-used invites.
function InvalidState({ title, body }: { title: string; body: string }) {
  return (
    <div className="text-center">
      <Display as="h1" className="text-[26px] mb-3">{title}</Display>
      <p className="text-[13px] text-muted-ink leading-[1.6] mb-6">{body}</p>
      <Link
        href="/login"
        className="inline-flex items-center justify-center rounded-full border border-charcoal/20 text-charcoal font-body font-medium tracking-[0.08em] uppercase text-[12px] h-[42px] px-6 no-underline hover:border-charcoal transition-colors"
      >
        Ke halaman masuk
      </Link>
    </div>
  );
}

export default async function InviteAcceptPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const invite = await db.query.teamInvites.findFirst({
    where: eq(teamInvites.token, token),
  });

  if (!invite) {
    return (
      <Shell>
        <InvalidState
          title="Undangan tidak ditemukan"
          body="Tautan undangan ini tidak valid. Minta admin untuk mengirim undangan baru ya."
        />
      </Shell>
    );
  }

  if (invite.status === "revoked") {
    return (
      <Shell>
        <InvalidState
          title="Undangan dibatalkan"
          body="Undangan ini sudah dibatalkan oleh admin. Hubungi tim Maritare jika kamu merasa ini keliru."
        />
      </Shell>
    );
  }

  if (invite.status === "accepted") {
    return (
      <Shell>
        <InvalidState
          title="Undangan sudah dipakai"
          body="Undangan ini sudah diterima sebelumnya. Silakan masuk dengan akunmu."
        />
      </Shell>
    );
  }

  if (isExpired(invite.expiresAt)) {
    return (
      <Shell>
        <InvalidState
          title="Undangan kedaluwarsa"
          body="Tautan undangan ini sudah lewat masa berlakunya (7 hari). Minta admin untuk mengirim undangan baru."
        />
      </Shell>
    );
  }

  const roleLabel = ROLE_LABEL[invite.adminRole] ?? "Admin";

  return (
    <Shell>
      <div className="mb-6 text-center">
        <div className="text-[10px] tracking-[0.22em] uppercase font-semibold text-muted-ink mb-2">
          Undangan tim
        </div>
        <Display as="h1" className="text-[28px] leading-[1.05]">
          Bergabung sebagai<br />
          <Em>{roleLabel}</Em>
        </Display>
        <p className="text-[13px] text-muted-ink leading-[1.6] mt-3">
          Kamu diundang ke panel admin Maritare. Lengkapi datamu di bawah untuk
          membuat akun dan menerima undangan.
        </p>
      </div>

      <AcceptForm token={invite.token} email={invite.email} />
    </Shell>
  );
}
