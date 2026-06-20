import { Icon, type IconName } from "@/components/atoms/icon";
import { Display, Em } from "@/components/atoms/typography";
import { SectionNumber } from "@/components/atoms/section-number";
import type { ActivityItem, ActivityKind } from "@/server/queries/dashboard";

type ActivityFeedProps = {
  items: ActivityItem[];
};

// Badge palette + glyph + copy builder per activity kind. Colors reuse the
// existing design palette so the visual styling stays identical.
const KIND_STYLE: Record<ActivityKind, { icon: IconName; bg: string; fg: string }> = {
  rsvp_yes: { icon: "check", bg: "bg-sage-soft", fg: "text-[#2E3325]" },
  rsvp_no: { icon: "x", bg: "bg-peach", fg: "text-[#5a2a18]" },
  wish: { icon: "heart", bg: "bg-blush", fg: "text-burgundy-dark" },
  photo: { icon: "image", bg: "bg-cream", fg: "text-charcoal" },
};

// Map an activity item to its "<bold> <muted rest>" copy parts.
function copyFor(item: ActivityItem): { strong: string; rest: string } {
  switch (item.kind) {
    case "rsvp_yes":
      return { strong: item.name, rest: " konfirmasi hadir" };
    case "rsvp_no":
      return { strong: item.name, rest: " tidak bisa hadir" };
    case "wish":
      return { strong: item.name, rest: " menulis ucapan" };
    case "photo":
      return { strong: "Foto baru", rest: " ditambahkan" };
  }
}

// Recent activity timeline for the overview.
export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <div className="bg-cream border border-line rounded-[18px] overflow-hidden">
      <div className="px-[22px] py-[18px] border-b border-beige">
        <SectionNumber className="text-[12px]">§ III · Aktivitas</SectionNumber>
        <Display as="div" className="text-[22px] mt-1">
          Aktivitas <Em className="text-burgundy">terbaru.</Em>
        </Display>
      </div>
      <ul className="list-none py-[6px] m-0">
        {items.length === 0 ? (
          <li className={cnRow(false)}>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-muted-ink leading-[1.45]">Belum ada aktivitas</div>
            </div>
          </li>
        ) : (
          items.map((item, i) => {
            const style = KIND_STYLE[item.kind];
            const { strong, rest } = copyFor(item);
            return (
              <li key={item.id} className={cnRow(i < items.length - 1)}>
                <span className={`w-[30px] h-[30px] rounded-full inline-flex items-center justify-center shrink-0 mt-px ${style.bg} ${style.fg}`}>
                  <Icon name={style.icon} size={14} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-charcoal leading-[1.45]">
                    <span className="font-semibold">{strong}</span>
                    <span className="text-muted-ink">{rest}</span>
                  </div>
                  <div className="text-[10.5px] text-faint [font-variant:small-caps] tracking-[0.1em] mt-[3px]">
                    {item.timeLabel}
                  </div>
                </div>
              </li>
            );
          })
        )}
      </ul>
      <a
        href="#"
        className="flex items-center justify-center gap-2 px-[22px] py-[13px] border-t border-beige text-[11px] tracking-[0.18em] uppercase font-semibold text-charcoal"
      >
        Lihat semua aktivitas <Icon name="arrow-r" size={12} />
      </a>
    </div>
  );
}

function cnRow(hasBorder: boolean) {
  return `flex gap-3 px-[22px] py-3 items-start ${hasBorder ? "border-b border-line" : ""}`;
}
