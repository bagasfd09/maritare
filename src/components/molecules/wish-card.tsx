import { Icon } from "@/components/atoms/icon";
import { CircleButton } from "@/components/atoms/circle-button";
import { Avatar, initials } from "@/components/atoms/avatar";
import { WishModerationActions } from "@/components/molecules/wish-moderation";
import { cn } from "@/lib/utils";

export type Wish = {
  id: string;
  from: string;
  text: string;
  time: string;
  attending: boolean | null;
  status: "pending" | "approved";
  pinned?: boolean;
};

type AvatarTone = "sage" | "peach" | "blush" | "burgundy" | "dark";

type WishCardProps = {
  wish: Wish;
  tone: AvatarTone;
};

// Single wish entry in the moderation list (Buku Ucapan).
export function WishCard({ wish, tone }: WishCardProps) {
  return (
    <div
      className={cn(
        "bg-paper rounded-[14px] px-[18px] py-4 grid grid-cols-[auto_1fr_auto] gap-[14px] items-start relative",
        wish.status === "pending" ? "border-[1.5px] border-terracotta" : "border border-line",
      )}
    >
      {wish.pinned && (
        <div className="absolute -top-2 left-[18px] bg-burgundy text-peach pl-2 pr-[10px] py-[3px] rounded-full text-[9px] font-bold tracking-[0.18em] uppercase inline-flex items-center gap-1">
          <Icon name="pin" size={10} />
          Disematkan
        </div>
      )}

      <Avatar tone={tone} size={40} className="text-[14px]">
        {initials(wish.from)}
      </Avatar>

      <div className="min-w-0">
        <div className="flex items-baseline gap-[10px] mb-1">
          <div className="font-display italic text-[17px] text-charcoal">{wish.from}</div>
          {wish.status === "pending" && (
            <span className="text-[9px] px-[7px] py-[2px] rounded-full bg-peach text-[#5a2a18] font-bold tracking-[0.14em] uppercase">
              Menunggu
            </span>
          )}
          <span className="text-[11px] text-faint tracking-[0.08em] ml-auto">{wish.time}</span>
        </div>
        <div className="font-display italic text-[15px] text-charcoal leading-[1.55]">
          &quot;{wish.text}&quot;
        </div>
        <div className="flex items-center gap-4 mt-3">
          {wish.attending === true && (
            <span className="text-[10px] text-[#1c5a36] tracking-[0.16em] uppercase font-semibold inline-flex items-center gap-[5px]">
              <Icon name="check" size={11} stroke="#1c5a36" />
              Hadir
            </span>
          )}
          {wish.attending === false && (
            <span className="text-[10px] text-muted-ink tracking-[0.16em] uppercase font-semibold">
              Tidak hadir
            </span>
          )}
          {wish.attending === null && (
            <span className="text-[10px] text-faint tracking-[0.16em] uppercase font-semibold">
              Tidak RSVP
            </span>
          )}
          <a href="#" className="text-[11px] text-burgundy no-underline font-semibold tracking-[0.08em]">
            Balas →
          </a>
        </div>
      </div>

      <div className="flex flex-col gap-[6px]">
        {wish.status === "pending" ? (
          <WishModerationActions wishId={wish.id} />
        ) : (
          <>
            <CircleButton size={28} title="Sematkan">
              <Icon name="pin" size={12} />
            </CircleButton>
            <CircleButton size={28} title="Sembunyikan">
              <Icon name="eye" size={12} />
            </CircleButton>
            <CircleButton size={28}>
              <Icon name="more" size={12} />
            </CircleButton>
          </>
        )}
      </div>
    </div>
  );
}
