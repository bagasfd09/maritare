// Real-time upload progress bar — a thin track + fill + live percentage. Shown by
// every photo/audio upload site (hero/closing slots, gallery, music) while bytes
// stream to R2, so an upload never feels "stuck". Driven by uploadToR2's
// onProgress (see src/lib/upload.ts).
//
// `variant` adapts the colors to the surface: "dark" for the editor's dark forms
// (cream/peach), "light" for the gallery's paper surface (charcoal/burgundy).

import { cn } from "@/lib/utils";

type UploadProgressProps = {
  /** 0–100. Clamped + rounded for display. */
  percent: number;
  /** Status text shown left of the percentage. */
  label?: string;
  variant?: "dark" | "light";
  className?: string;
};

export function UploadProgress({
  percent,
  label = "Mengunggah…",
  variant = "dark",
  className,
}: UploadProgressProps) {
  const pct = Math.max(0, Math.min(100, Math.round(percent)));
  const dark = variant === "dark";

  return (
    <div className={cn("w-full", className)} role="status" aria-live="polite">
      <div className="flex items-center justify-between mb-[6px]">
        <span
          className={cn(
            "font-display italic text-[13px]",
            dark ? "text-cream" : "text-charcoal",
          )}
        >
          {label}
        </span>
        <span
          className={cn(
            "text-[13px] font-bold tabular-nums",
            dark ? "text-peach" : "text-burgundy",
          )}
        >
          {pct}%
        </span>
      </div>
      <div
        className={cn(
          "h-[6px] w-full rounded-full overflow-hidden",
          dark ? "bg-[rgba(245,239,230,0.15)]" : "bg-rule/60",
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-200 ease-out",
            dark ? "bg-peach" : "bg-burgundy",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
