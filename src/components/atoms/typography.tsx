import { cn } from "@/lib/utils";

type DisplayProps = React.HTMLAttributes<HTMLHeadingElement> & {
  as?: "h1" | "h2" | "h3" | "div";
};

// Editorial display heading — Fraunces at large optical size (opsz 96).
export function Display({ as: Tag = "h1", className, ...props }: DisplayProps) {
  return (
    <Tag
      className={cn(
        "font-display font-extrabold tracking-[-0.025em] leading-none text-charcoal [font-variation-settings:'opsz'_96]",
        className,
      )}
      {...props}
    />
  );
}

// Italic accent — the romantic Fraunces italic used inside headings.
export function Em({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <em
      className={cn("font-display italic font-normal tracking-[-0.005em]", className)}
      {...props}
    />
  );
}

// Big editorial numeral — Fraunces at display optical size (opsz 144).
export function Num({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "font-display font-extrabold tracking-[-0.04em] leading-[0.9] text-charcoal [font-variation-settings:'opsz'_144]",
        className,
      )}
      {...props}
    />
  );
}

// All-caps spaced eyebrow label.
export function Eyebrow({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "font-body text-[10px] tracking-[0.28em] uppercase font-semibold text-muted-ink",
        className,
      )}
      {...props}
    />
  );
}

// Smaller small-caps label (slightly tighter tracking than Eyebrow).
export function LabelSc({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "font-body text-[10px] tracking-[0.22em] uppercase font-medium text-muted-ink",
        className,
      )}
      {...props}
    />
  );
}
