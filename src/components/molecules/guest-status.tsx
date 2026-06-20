import { cn } from "@/lib/utils";

export type GuestRsvpStatus = "confirmed" | "pending" | "declined";

const STATUS: Record<GuestRsvpStatus, { surface: string; dot: string; label: string }> = {
  confirmed: { surface: "bg-[rgba(77,216,145,0.18)] text-[#1c5a36]", dot: "bg-[#4DD891]", label: "Hadir" },
  pending: { surface: "bg-peach text-[#5a2a18]", dot: "bg-terracotta", label: "Belum" },
  declined: { surface: "bg-[rgba(124,45,45,0.12)] text-burgundy", dot: "bg-burgundy", label: "Tidak" },
};

type GuestStatusProps = {
  status: GuestRsvpStatus;
  className?: string;
};

// RSVP status badge for guest rows. Ports `GuestStatus` from the design.
export function GuestStatus({ status, className }: GuestStatusProps) {
  const s = STATUS[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[6px] rounded-full px-[10px] py-1",
        "font-body text-[11px] font-semibold tracking-[0.06em]",
        s.surface,
        className,
      )}
    >
      <span className={cn("w-[6px] h-[6px] rounded-full shrink-0", s.dot)} />
      {s.label}
    </span>
  );
}
