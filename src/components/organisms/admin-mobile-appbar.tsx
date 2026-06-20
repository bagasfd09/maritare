import Link from "next/link";
import type { AdminUser } from "@/server/queries/admin";

// Frosted-glass admin app bar: wordmark + ADMIN badge left, avatar right.
// The search/bell controls are intentionally not rendered here — this shared
// shell takes no interaction handlers, so they would be dead buttons. The real
// search/notifications live in each consuming screen (e.g. AdminOverviewMobile),
// which renders its own 1:1 app-bar copy wired to local state.
// `user` carries the real signed-in admin identity (forwarded from the mobile
// shell); optional so a not-yet-wired caller still renders without a fake name.
export function AdminMobileAppBar({ user }: { user?: AdminUser | null }) {
  return (
    <header className="shrink-0 z-30 bg-[rgba(250,246,241,0.9)] backdrop-blur-[14px] backdrop-saturate-150 border-b border-beige flex items-center justify-between px-4 py-[14px]">
      <div className="inline-flex items-center gap-2">
        <Link
          href="/admin"
          className="font-display font-extrabold text-[21px] [font-variation-settings:'opsz'_40] tracking-[-0.04em] text-charcoal lowercase no-underline inline-flex items-baseline gap-px"
        >
          maritare
          <span className="text-terracotta font-body text-[15px] -translate-y-[3px]">*</span>
        </Link>
        <span className="text-[8px] px-[7px] py-[3px] rounded bg-terracotta text-white font-bold tracking-[0.16em] uppercase">
          Admin
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-[38px] h-[38px] rounded-full bg-terracotta text-white inline-flex items-center justify-center font-display font-bold text-[13px] shrink-0">
          {user?.initials ?? "?"}
        </span>
      </div>
    </header>
  );
}
