import { cn } from "@/lib/utils";
import { Icon, type IconName } from "@/components/atoms/icon";
import { Num } from "@/components/atoms/typography";

type Tone = "default" | "cream" | "peach" | "sage" | "dark" | "burgundy";

const SURFACE: Record<Tone, string> = {
  default: "bg-paper text-charcoal border-line",
  cream: "bg-cream text-charcoal border-transparent",
  peach: "bg-peach text-burgundy-dark border-transparent",
  sage: "bg-sage-soft text-[#1c2818] border-transparent",
  dark: "bg-charcoal text-cream border-transparent",
  burgundy: "bg-burgundy text-cream border-transparent",
};

const ACCENT: Record<Tone, string> = {
  default: "text-burgundy",
  cream: "text-burgundy",
  peach: "text-terracotta",
  sage: "text-sage",
  dark: "text-peach",
  burgundy: "text-peach",
};

type StatCardProps = {
  label: string;
  value: string;
  sub?: string;
  tone?: Tone;
  icon?: IconName;
};

// Big-number stat tile. Ports `StatBig`.
export function StatCard({ label, value, sub, tone = "default", icon }: StatCardProps) {
  return (
    <div className={cn("rounded-[18px] border px-[22px] pt-[22px] pb-5 relative overflow-hidden", SURFACE[tone])}>
      <div className="font-body text-[10px] tracking-[0.22em] uppercase font-semibold opacity-70 mb-[18px] flex items-center gap-2">
        {icon && <Icon name={icon} size={13} />}
        {label}
      </div>
      <Num className={cn("text-[56px]", ACCENT[tone])}>{value}</Num>
      {sub && <div className="mt-[10px] font-display italic text-[13px] opacity-75">{sub}</div>}
    </div>
  );
}
