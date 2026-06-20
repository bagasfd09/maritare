import { cn } from "@/lib/utils";

// Editorial section marker, e.g. "§ II · RSVP", with a leading hairline rule.
// Ports `.d-secnum` (the `::before` rule becomes a Tailwind before: utility).
export function SectionNumber({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 font-display italic text-burgundy text-[13px] tracking-[0.04em]",
        "before:content-[''] before:w-[22px] before:h-px before:bg-rule before:opacity-70",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
