"use client";

import { Icon } from "@/components/atoms/icon";
import type { ChannelOption } from "@/lib/payment/channels";
import { cn } from "@/lib/utils";

// One selectable payment method row — shared by the desktop and mobile
// checkout screens so the option markup can never drift between them.
// Shows the brand logo when the option has one; falls back to the colored
// initials chip until the asset lands in /public/brand/payments/.
export function PaymentChannelRow({
  option,
  active,
  onSelect,
}: {
  option: ChannelOption;
  active: boolean;
  onSelect: (id: ChannelOption["id"]) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.id)}
      className={cn(
        "text-left font-body flex items-center gap-3 rounded-xl px-[13px] py-[11px] border cursor-pointer w-full",
        active ? "border-[1.5px] border-burgundy bg-[rgba(122,31,43,0.05)]" : "border-line bg-paper",
      )}
    >
      {option.logo ? (
        <span className="w-11 h-[30px] rounded-md bg-white border border-line flex items-center justify-center shrink-0 px-[5px]">
          {/* eslint-disable-next-line @next/next/no-img-element -- tiny local asset; matches dashboard templates */}
          <img src={option.logo} alt={option.label} className="max-h-[20px] w-auto object-contain" loading="lazy" />
        </span>
      ) : (
        <span
          // min-w + nowrap, not a fixed w-11: the VA banks without a logo asset
          // put their full name in here ("Danamon", "Maybank"), and a fixed width
          // would wrap or clip them.
          className="min-w-11 px-[3px] h-[30px] rounded-md text-white flex items-center justify-center text-[8.5px] font-extrabold tracking-[0.04em] shrink-0 uppercase whitespace-nowrap"
          style={{ background: option.color }}
        >
          {option.badge}
        </span>
      )}
      <span className="flex-1 min-w-0">
        <span className="flex items-center gap-[6px]">
          <span className="text-[12.5px] font-semibold text-charcoal">{option.label}</span>
          {option.recommended && (
            <span className="text-[8px] px-[6px] py-[1.5px] rounded-full bg-sage-soft text-[#1c2818] font-bold tracking-[0.12em] uppercase">
              Populer
            </span>
          )}
        </span>
        <span className="block text-[10.5px] text-muted-ink mt-px">{option.desc}</span>
      </span>
      <span
        className={cn(
          "w-4 h-4 rounded-full shrink-0 inline-flex items-center justify-center",
          active ? "bg-burgundy" : "border-[1.5px] border-beige",
        )}
      >
        {active && <Icon name="check" size={10} stroke="#f5efe6" />}
      </span>
    </button>
  );
}
