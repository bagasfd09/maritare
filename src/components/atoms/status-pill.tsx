import { cn } from "@/lib/utils";

type Tone = "default" | "draft" | "live";

const TONES: Record<Tone, { pill: string; dot: string }> = {
  default: { pill: "bg-sage-soft text-[#2E3325]", dot: "bg-sage" },
  draft: { pill: "bg-peach text-[#5a2a18]", dot: "bg-terracotta" },
  live: { pill: "bg-[rgba(77,216,145,0.18)] text-[#1c5a36]", dot: "bg-[#4DD891] animate-dot-pulse" },
};

type StatusPillProps = {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
};

// Publish-state pill with a leading status dot. Ports `.d-status`.
export function StatusPill({ children, tone = "default", className }: StatusPillProps) {
  const t = TONES[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full pl-2 pr-3 py-[5px]",
        "font-body text-[11px] font-semibold",
        t.pill,
        className,
      )}
    >
      <span className={cn("w-2 h-2 rounded-full", t.dot)} />
      {children}
    </span>
  );
}
