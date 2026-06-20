import { MobileShell } from "@/components/templates/mobile-shell";
import {
  MobileCard,
  MobileChip,
  MobileChipRow,
  MobileEm,
} from "@/components/molecules/mobile-primitives";
import { Avatar, initials } from "@/components/atoms/avatar";
import { WishModerationActionsMobile } from "@/components/molecules/wish-moderation";
import { relativeTimeId } from "@/lib/datetime";
import type { DashboardChrome, WishesData } from "@/server/queries/dashboard";

type WishRow = WishesData["wishes"][number];
type AvatarTone = "burgundy" | "peach" | "blush";

const AVATAR_TONES = ["burgundy", "peach", "blush"] as const;

const FILTER_TABS = ["Menunggu", "Semua", "Disetujui"] as const;
const ACTIVE_TAB: (typeof FILTER_TABS)[number] = "Menunggu";

type WishesMobileProps = {
  data: WishesData;
  // `chrome` is part of the page's data contract (mirrors the desktop call) but
  // the mobile shell has no chrome region, so it is intentionally not consumed.
  chrome: DashboardChrome | null;
};

// Mobile screen 05 · Buku Ucapan (wishes moderation).
export function WishesMobile({ data }: WishesMobileProps) {
  const rows = data.wishes;
  const counts = data.counts;

  return (
    <MobileShell
      active="ucapan"
      eyebrow="Buku Ucapan"
      title={
        <>
          Ucapan <MobileEm>tamu.</MobileEm>
        </>
      }
    >
      <MobileChipRow>
        {FILTER_TABS.map((t) => (
          <MobileChip key={t} active={t === ACTIVE_TAB}>
            {t}
            {t === "Menunggu" && (
              <span
                className={
                  "ml-[2px] text-white text-[9px] px-[6px] py-px rounded-full " +
                  (t === ACTIVE_TAB ? "bg-[rgba(255,255,255,0.25)]" : "bg-terracotta")
                }
              >
                {counts.pending}
              </span>
            )}
          </MobileChip>
        ))}
      </MobileChipRow>
      <div className="text-xs text-muted-ink px-[2px]">
        {counts.total} ucapan masuk · {counts.pending} menunggu moderasi
      </div>

      {rows.length === 0 ? (
        <MobileCard>
          <div className="text-[13.5px] text-muted-ink text-center py-2">
            Belum ada ucapan.
          </div>
        </MobileCard>
      ) : (
        rows.map((wish: WishRow, i) => {
          const av: AvatarTone = AVATAR_TONES[i % AVATAR_TONES.length];
          return (
            <MobileCard key={wish.id}>
              <div className="flex gap-3">
                <Avatar tone={av} size={38}>
                  {initials(wish.fromName)}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between">
                    <span className="font-display italic text-base">{wish.fromName}</span>
                    <span className="text-[10px] text-faint [font-variant:small-caps] tracking-[0.08em]">
                      {relativeTimeId(wish.createdAt)}
                    </span>
                  </div>
                  <div className="mt-[3px]">
                    {wish.attending ? (
                      <span className="text-[9.5px] text-[#1c5a36] tracking-[0.14em] uppercase font-bold">
                        ✓ Hadir
                      </span>
                    ) : (
                      <span className="text-[9.5px] text-muted-ink tracking-[0.14em] uppercase font-bold">
                        Tidak hadir
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-[13.5px] leading-[1.55] text-charcoal mt-3">
                &quot;{wish.body}&quot;
              </div>
              <div className="flex gap-2 mt-[14px]">
                {wish.status === "pending" ? (
                  <WishModerationActionsMobile wishId={wish.id} />
                ) : (
                  <a
                    href="#"
                    className="inline-flex items-center justify-center gap-2 h-[38px] px-[18px] rounded-full text-xs font-semibold tracking-[0.04em] bg-transparent text-charcoal border border-charcoal/20 no-underline"
                  >
                    Balas ucapan
                  </a>
                )}
              </div>
            </MobileCard>
          );
        })
      )}
    </MobileShell>
  );
}
