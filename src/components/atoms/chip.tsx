import { cn } from "@/lib/utils";

type Tone = "default" | "peach" | "blush" | "cream" | "dark" | "burgundy" | "outline";

const TONES: Record<Tone, string> = {
  default: "bg-sage-pill text-[#2E3325]",
  peach: "bg-peach text-[#5a2a18]",
  blush: "bg-blush text-burgundy-dark",
  cream: "bg-cream text-charcoal",
  dark: "bg-charcoal text-cream",
  burgundy: "bg-burgundy text-cream",
  outline: "bg-transparent text-muted-ink border border-beige",
};

type ChipProps = {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
};

// Small uppercase tag. Ports `.d-chip`.
export function Chip({ children, tone = "default", className }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[6px] rounded-full px-3 py-[5px]",
        "font-body text-[10px] tracking-[0.2em] uppercase font-semibold",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
