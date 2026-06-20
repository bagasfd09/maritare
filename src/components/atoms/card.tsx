import { cn } from "@/lib/utils";

type Tone = "default" | "ivory" | "cream" | "peach" | "sage" | "dark" | "burgundy";

const TONES: Record<Tone, string> = {
  default: "bg-paper border-line",
  ivory: "bg-ivory border-line",
  cream: "bg-cream border-line",
  peach: "bg-peach border-transparent",
  sage: "bg-sage-soft border-transparent",
  dark: "bg-charcoal text-cream border-transparent",
  burgundy: "bg-burgundy text-cream border-transparent",
};

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: Tone;
};

// Surface card. Ports `.d-card`. Padding defaults to 24px; override via className.
export function Card({ tone = "default", className, ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-[18px] border p-6 relative", TONES[tone], className)}
      {...props}
    />
  );
}
