import { cn } from "@/lib/utils";
import { Icon } from "@/components/atoms/icon";
import { CircleButton } from "@/components/atoms/circle-button";

export type PaymentMethod = {
  name: string;
  number: string;
  holder: string;
  active: boolean;
  color: string;
};

type EnvelopeMethodCardProps = {
  title: string;
  variant: "bank" | "ewallet";
  methods: PaymentMethod[];
};

// Payment-method panel (Rekening Bank / E-Wallet) with brand badge,
// account line, and an on/off toggle per method.
export function EnvelopeMethodCard({ title, variant, methods }: EnvelopeMethodCardProps) {
  return (
    <div className="bg-paper border border-line rounded-[14px] px-[18px] py-4">
      <div className="flex items-center justify-between mb-[14px]">
        <div className="font-display italic text-[17px] text-charcoal">{title}</div>
        <CircleButton size={28}><Icon name="plus" size={12} /></CircleButton>
      </div>
      <div className="flex flex-col gap-[10px]">
        {methods.map((m) => (
          <div
            key={m.name}
            className={cn(
              "px-3 py-[10px] rounded-[10px] border border-line flex items-center gap-3",
              m.active ? "bg-cream" : "bg-transparent opacity-55",
            )}
          >
            {/* Brand color is data-driven, stays inline. */}
            <div
              className={cn(
                "w-[34px] h-[34px] rounded-[6px] text-white flex items-center justify-center font-display font-extrabold tracking-[-0.02em] shrink-0",
                variant === "bank" ? "text-[11px]" : "text-[10px]",
              )}
              style={{ background: m.color }}
            >
              {variant === "ewallet"
                ? m.name.slice(0, m.name === "ShopeePay" ? 4 : 3)
                : m.name.slice(0, 3)}
            </div>
            <div className="flex-1 min-w-0">
              {variant === "bank" ? (
                <>
                  <div className="text-[12px] font-semibold text-charcoal">{m.name} · {m.number}</div>
                  <div className="text-[10px] text-muted-ink tracking-[0.12em] uppercase mt-px">{m.holder}</div>
                </>
              ) : (
                <>
                  <div className="text-[12px] font-semibold text-charcoal">{m.name}</div>
                  <div className="text-[10px] text-muted-ink tracking-[0.04em] mt-px">{m.number}</div>
                </>
              )}
            </div>
            <div
              className={cn(
                "relative w-7 h-4 rounded-full cursor-pointer shrink-0",
                m.active ? "bg-sage" : "bg-beige",
              )}
            >
              <span
                className={cn(
                  "absolute top-[2px] w-3 h-3 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.2)]",
                  m.active ? "left-[14px]" : "left-[2px]",
                )}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
