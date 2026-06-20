import { cn } from "@/lib/utils";

type CircleButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "solid";
  size?: number;
};

// Round icon button. Ports `.d-circ`.
export function CircleButton({ variant = "default", size = 36, className, style, ...props }: CircleButtonProps) {
  return (
    <button
      style={{ width: size, height: size, ...style }}
      className={cn(
        "rounded-full inline-flex items-center justify-center shrink-0 cursor-pointer transition-colors text-sm",
        variant === "solid"
          ? "bg-burgundy text-cream border border-burgundy"
          : "bg-transparent text-charcoal border border-charcoal/20 hover:bg-charcoal hover:text-cream hover:border-charcoal",
        className,
      )}
      {...props}
    />
  );
}
