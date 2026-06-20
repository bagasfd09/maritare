import { cn } from "@/lib/utils";

// ── Admin mobile primitives, ported 1:1 from the admin mobile design's CSS ──
// Distinct visual system from the customer mobile shell (forest accents,
// 14px card radius, forest-deep active chips), so it gets its own set.

// `.m-card`
export function AdminMobileCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("bg-paper border border-line rounded-[14px]", className)} {...props} />;
}

// `.m-secnum` — editorial section marker with leading hairline
export function AdminMobileSecnum({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-[10px] font-display italic text-burgundy text-[14px] tracking-[0.02em]",
        "before:content-[''] before:w-[18px] before:h-px before:bg-rule before:opacity-70",
        className,
      )}
      {...props}
    />
  );
}

// `.m-link`
export function AdminMobileLink({ className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={cn("text-[11px] text-burgundy font-bold tracking-[0.06em] uppercase no-underline", className)}
      {...props}
    />
  );
}

// `.m-hscroll` — horizontal scroll strip
export function AdminMobileHScroll({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex gap-[9px] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", className)}
      {...props}
    />
  );
}

// `.m-search`
export function AdminMobileSearch({ placeholder, className }: { placeholder: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-[9px] bg-paper border border-line rounded-full px-[15px] py-[10px]", className)}>
      <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="var(--color-faint)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-5-5" />
      </svg>
      <input placeholder={placeholder} className="flex-1 border-none bg-transparent outline-none font-body text-[13px] text-charcoal placeholder:text-faint" />
    </div>
  );
}

// `.m-chip` — active state is forest-deep (admin), not burgundy
export function AdminMobileChip({
  on = false,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { on?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "shrink-0 px-[14px] py-[7px] rounded-full font-body text-[11.5px] font-semibold whitespace-nowrap cursor-pointer",
        on ? "bg-forest-deep text-cream border border-forest-deep" : "bg-paper text-muted-ink border border-line",
        className,
      )}
      {...props}
    />
  );
}

// `.m-tag`
export function AdminMobileTag({
  tone = "peach",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: "peach" | "terra" | "dark" }) {
  return (
    <span
      className={cn(
        "text-[8.5px] px-[7px] py-[3px] rounded font-bold tracking-[0.12em] uppercase",
        tone === "peach" && "bg-peach text-[#5a2a18]",
        tone === "terra" && "bg-terracotta text-white",
        tone === "dark" && "bg-charcoal text-peach",
        className,
      )}
      {...props}
    />
  );
}

// `.m-btn-mini`
export function AdminMobileBtnMini({
  sage = false,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { sage?: boolean }) {
  return (
    <button
      className={cn(
        "px-[14px] py-[7px] rounded-full cursor-pointer font-body text-[11px] font-bold tracking-[0.1em] uppercase whitespace-nowrap",
        sage ? "bg-sage border border-sage text-white" : "bg-transparent border border-beige text-charcoal",
        className,
      )}
      {...props}
    />
  );
}

// `.m-icon-mini`
export function AdminMobileIconMini({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "w-8 h-8 rounded-full shrink-0 border border-beige bg-transparent inline-flex items-center justify-center text-charcoal cursor-pointer",
        className,
      )}
      {...props}
    />
  );
}

// `MHead` — page intro under the app bar (greeting / count line)
export function AdminMobileHead({ eyebrow, title, sub }: { eyebrow?: string; title: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="px-[18px] pt-[18px] pb-[6px]">
      {eyebrow && (
        <div className="text-[10px] text-muted-ink tracking-[0.22em] uppercase font-semibold mb-2">{eyebrow}</div>
      )}
      <h1 className="font-display font-bold text-[27px] leading-[1.05] m-0 tracking-[-0.025em] text-charcoal">{title}</h1>
      {sub && <div className="font-display italic text-[14px] text-muted-ink mt-[6px] leading-[1.4]">{sub}</div>}
    </div>
  );
}

// `SecLabel` — section heading row (secnum left, optional action right)
export function AdminMobileSecLabel({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-[18px] mt-[22px] mb-3">
      <AdminMobileSecnum>{children}</AdminMobileSecnum>
      {action}
    </div>
  );
}
