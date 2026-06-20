import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "dark";
type Size = "default" | "sm" | "lg";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const VARIANTS: Record<Variant, string> = {
  primary: "bg-burgundy text-cream hover:bg-burgundy-deep",
  ghost: "bg-transparent text-charcoal border-charcoal/20 hover:border-charcoal",
  dark: "bg-charcoal text-cream",
};

const SIZES: Record<Size, string> = {
  default: "h-9 px-4 text-xs",
  sm: "h-[30px] px-3 text-[11px]",
  lg: "h-[46px] px-[22px] text-[13px]",
};

// Pill button — uppercase, letter-spaced, editorial. Ports `.d-btn`.
export function Button({ variant = "primary", size = "default", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-transparent",
        "font-body font-medium tracking-[0.08em] uppercase whitespace-nowrap",
        "cursor-pointer transition-colors",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
}
