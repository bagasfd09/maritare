import { Icon } from "@/components/atoms/icon";
import { Avatar } from "@/components/atoms/avatar";
import { CircleButton } from "@/components/atoms/circle-button";

// `.m-top` — mobile app bar. Title accepts <MobileEm> for the italic accent.
export function MobileTopBar({
  eyebrow,
  title,
  right,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <header className="shrink-0 flex items-center justify-between gap-3 px-[18px] pt-4 pb-[14px] bg-ivory border-b border-beige z-[4]">
      <div className="min-w-0">
        {eyebrow && (
          <div className="font-body text-[9.5px] tracking-[0.26em] uppercase font-semibold text-muted-ink">
            {eyebrow}
          </div>
        )}
        <div className="font-display font-extrabold [font-variation-settings:'opsz'_60] text-2xl tracking-[-0.025em] leading-none mt-1">
          {title}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">{right ?? <MobileTopActions />}</div>
    </header>
  );
}

// Default top-bar actions: notification bell (with unread dot) + avatar.
export function MobileTopActions({ unread = true }: { unread?: boolean }) {
  return (
    <>
      <CircleButton size={38} className="relative">
        <Icon name="bell" size={16} />
        {unread && (
          <span className="absolute top-2 right-[9px] w-[7px] h-[7px] rounded-full bg-terracotta border-[1.5px] border-ivory" />
        )}
      </CircleButton>
      <Avatar tone="burgundy" size={38} className="text-sm">
        AP
      </Avatar>
    </>
  );
}
