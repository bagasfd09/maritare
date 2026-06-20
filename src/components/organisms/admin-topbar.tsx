import { Fragment } from "react";
import { cn } from "@/lib/utils";

type AdminTopBarProps = {
  crumbs?: string[];
  title: React.ReactNode;
  eyebrow?: React.ReactNode;
  actions?: React.ReactNode;
};

// Admin page header: breadcrumb trail + display title (+ italic subline) left, actions right.
export function AdminTopBar({ crumbs = ["Admin"], title, eyebrow, actions }: AdminTopBarProps) {
  return (
    <div className="px-9 pt-[22px] pb-5 border-b border-beige bg-ivory flex items-end justify-between gap-6 shrink-0">
      <div>
        <div className="text-[11px] text-muted-ink tracking-[0.18em] uppercase font-semibold mb-2 inline-flex items-center gap-[6px]">
          {crumbs.map((c, i) => (
            <Fragment key={c}>
              {i > 0 && <span className="opacity-40">/</span>}
              <span className={cn(i === crumbs.length - 1 ? "text-charcoal" : "text-muted-ink")}>{c}</span>
            </Fragment>
          ))}
        </div>
        <h1 className="font-display font-bold text-[28px] m-0 tracking-[-0.025em] text-charcoal">{title}</h1>
        {eyebrow && <div className="font-display italic text-[15px] text-muted-ink mt-1">{eyebrow}</div>}
      </div>
      {actions && <div className="flex items-center gap-[10px]">{actions}</div>}
    </div>
  );
}
