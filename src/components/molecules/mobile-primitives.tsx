import { cn } from "@/lib/utils";
import { Icon } from "@/components/atoms/icon";

// ── Mobile dashboard primitives, ported 1:1 from the design's mobile.css ──
// Every `m-*` utility class becomes a small component here so all nine mobile
// screens share one source of truth.

type CardTone = "default" | "peach" | "sage" | "cream" | "dark" | "burgundy";

const CARD_TONES: Record<CardTone, string> = {
  default: "bg-paper border-line",
  peach: "bg-peach border-transparent",
  sage: "bg-sage-soft border-transparent",
  cream: "bg-cream border-line",
  dark: "bg-charcoal text-cream border-transparent",
  burgundy: "bg-burgundy text-cream border-transparent",
};

// `.m-card`
export function MobileCard({
  tone = "default",
  flush = false,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { tone?: CardTone; flush?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl border relative",
        flush ? "p-0 overflow-hidden" : "p-4",
        CARD_TONES[tone],
        className,
      )}
      {...props}
    />
  );
}

// `.m-h` — compact display heading; pass <MobileEm> children for the italic accent.
export function MobileHeading({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "font-display font-extrabold [font-variation-settings:'opsz'_60] text-[19px] tracking-[-0.02em] leading-[1.05]",
        className,
      )}
      {...props}
    />
  );
}

// the `em` treatment inside m-h / m-top-title
export function MobileEm({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <em className={cn("italic font-normal text-burgundy", className)} {...props} />;
}

// `.m-seclabel`
export function MobileSecLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("font-display italic text-burgundy text-xs", className)} {...props} />;
}

// `.m-eyebrow`
export function MobileEyebrow({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "font-body text-[9.5px] tracking-[0.24em] uppercase font-semibold text-muted-ink",
        className,
      )}
      {...props}
    />
  );
}

// `.m-link`
export function MobileLink({ className, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={cn(
        "text-[10.5px] tracking-[0.14em] uppercase font-semibold text-charcoal no-underline inline-flex items-center gap-[6px]",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}

// `MCardHead` from the design (section label + heading + optional trailing link)
export function MobileCardHead({
  sec,
  title,
  link,
}: {
  sec?: string;
  title: React.ReactNode;
  link?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-[10px] mb-3">
      <div>
        {sec && <MobileSecLabel>{sec}</MobileSecLabel>}
        <MobileHeading className={sec ? "mt-[3px]" : ""}>{title}</MobileHeading>
      </div>
      {link && (
        <MobileLink href="#">
          {link} <Icon name="arrow-r" size={12} />
        </MobileLink>
      )}
    </div>
  );
}

// `MStat` / `.m-stat`
export function MobileStat({ v, l, tone }: { v: React.ReactNode; l: string; tone?: "cream" | "sage" }) {
  return (
    <div
      className={cn(
        "rounded-[14px] p-[14px] bg-paper border border-line",
        tone === "cream" && "bg-cream border-transparent",
        tone === "sage" && "bg-sage-soft border-transparent",
      )}
    >
      <div className="font-display font-extrabold [font-variation-settings:'opsz'_144] text-[30px] tracking-[-0.03em] leading-[0.95]">
        {v}
      </div>
      <div className="text-[10.5px] text-muted-ink mt-[6px] tracking-[0.02em]">{l}</div>
    </div>
  );
}

// `.m-chiprow` — horizontal scroll strip, full-bleed inside the 16px page padding
export function MobileChipRow({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex gap-2 overflow-x-auto pb-[2px] -mx-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
      {...props}
    />
  );
}

// `.m-chip`
export function MobileChip({
  active = false,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "shrink-0 inline-flex items-center gap-[6px] px-[14px] py-2 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer",
        active
          ? "bg-burgundy text-cream border border-burgundy"
          : "bg-transparent text-muted-ink border border-beige",
        className,
      )}
      {...props}
    />
  );
}

// `.m-btn`
export function MobileButton({
  variant = "primary",
  full = false,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "dark" | "ghost"; full?: boolean }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 h-[46px] px-[18px] rounded-full text-[13px] font-semibold tracking-[0.04em] border border-transparent cursor-pointer",
        variant === "primary" && "bg-burgundy text-cream",
        variant === "dark" && "bg-charcoal text-cream",
        variant === "ghost" && "bg-transparent text-charcoal border-charcoal/20",
        full && "w-full",
        className,
      )}
      {...props}
    />
  );
}

// `.m-row`
export function MobileRow({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center gap-3 py-[13px] border-b border-line last:border-b-0", className)}
      {...props}
    />
  );
}

// `.m-toggle` — static render of the design's switch (no interactivity yet)
export function MobileToggle({ on = false, className }: { on?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "inline-block w-11 h-[26px] rounded-full relative shrink-0 transition-colors",
        on ? "bg-sage" : "bg-charcoal/[0.18]",
        className,
      )}
    >
      <span
        className={cn(
          "absolute top-[3px] left-[3px] w-5 h-5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.25)] transition-transform",
          on && "translate-x-[18px]",
        )}
      />
    </span>
  );
}

// `.m-input`
export function MobileInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full bg-cream border border-beige rounded-[12px] px-[14px] py-3 font-body text-sm text-charcoal outline-none focus:border-burgundy placeholder:text-faint",
        className,
      )}
      {...props}
    />
  );
}

// `.m-search`
export function MobileSearch({ placeholder, className }: { placeholder: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-[10px] bg-cream border border-beige rounded-[12px] px-[14px] py-[11px] text-faint",
        className,
      )}
    >
      <Icon name="search" size={15} />
      <input
        placeholder={placeholder}
        className="border-0 bg-transparent outline-none font-body text-sm text-charcoal flex-1"
      />
    </div>
  );
}

// `.m-prog`
export function MobileProgress({ value, className, fillClassName }: { value: number; className?: string; fillClassName?: string }) {
  return (
    <div className={cn("h-[6px] rounded-full bg-charcoal/10 overflow-hidden", className)}>
      <i className={cn("block h-full bg-burgundy rounded-full not-italic", fillClassName)} style={{ width: `${value}%` }} />
    </div>
  );
}
