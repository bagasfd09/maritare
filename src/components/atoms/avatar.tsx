import { cn } from "@/lib/utils";

type Tone = "sage" | "peach" | "blush" | "burgundy" | "dark";

const TONES: Record<Tone, string> = {
  sage: "bg-sage-soft text-[#2E3325]",
  peach: "bg-peach text-[#5a2a18]",
  blush: "bg-blush text-burgundy-dark",
  burgundy: "bg-burgundy text-cream",
  dark: "bg-charcoal text-peach",
};

type AvatarProps = {
  children: React.ReactNode;
  tone?: Tone;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
};

// Initials avatar. Ports `.d-av`.
export function Avatar({ children, tone = "sage", size = 32, className, style }: AvatarProps) {
  return (
    <span
      style={{ width: size, height: size, ...style }}
      className={cn(
        "rounded-full inline-flex items-center justify-center shrink-0",
        "font-display font-bold text-[13px]",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

// "Sari Wijaya" -> "SW"
export function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}
