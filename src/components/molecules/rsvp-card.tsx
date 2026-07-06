import { Icon } from "@/components/atoms/icon";
import { Display, Em, Num, LabelSc } from "@/components/atoms/typography";
import { SectionNumber } from "@/components/atoms/section-number";
import { ProgressBar } from "@/components/atoms/progress-bar";
import type { RsvpGroup } from "@/server/queries/dashboard";

type RsvpCardProps = {
  confirmed: number;
  declined: number;
  pending: number;
  invited: number;
  respondedPct: number;
  groups: RsvpGroup[];
  bySide: RsvpGroup[];
};

// RSVP / attendance breakdown for the overview — all values wired from real data.
export function RsvpCard({
  confirmed,
  declined,
  pending,
  invited,
  respondedPct,
  groups,
  bySide,
}: RsvpCardProps) {
  const legend = [
    { c: "bg-sage", n: confirmed, l: "Hadir" },
    { c: "bg-terracotta", n: declined, l: "Tidak hadir" },
    { c: "bg-sage-soft", n: pending, l: "Belum respons" },
  ];
  const responded = confirmed + declined;
  return (
    <div className="bg-paper border border-line rounded-[18px] overflow-hidden">
      <div className="px-[22px] py-[18px] border-b border-line flex items-center justify-between">
        <div>
          <SectionNumber className="text-[12px]">§ II · RSVP</SectionNumber>
          <Display as="div" className="text-[22px] mt-1">
            Kehadiran <Em className="text-burgundy">tamu.</Em>
          </Display>
        </div>
        <a
          href="#"
          className="text-[11px] text-charcoal tracking-[0.18em] uppercase font-semibold inline-flex items-center gap-2"
        >
          Kelola tamu <Icon name="arrow-r" size={12} />
        </a>
      </div>

      <div className="px-[22px] pt-5 pb-[22px]">
        {/* response rate */}
        <div className="flex items-baseline gap-3 mb-4">
          <Num className="text-[40px] tracking-[-0.03em] leading-none">
            {respondedPct}<span className="text-[22px]">%</span>
          </Num>
          <div className="text-[12px] text-muted-ink leading-[1.4]">
            tamu sudah merespons
            <br />
            <span className="text-faint">{responded} dari {invited} diundang</span>
          </div>
        </div>

        {/* stacked bar */}
        <div className="flex h-3 rounded-full overflow-hidden gap-[2px] mb-[14px]">
          <div className="bg-sage" style={{ flexGrow: confirmed }} />
          <div className="bg-terracotta" style={{ flexGrow: declined }} />
          <div className="bg-sage-soft" style={{ flexGrow: pending }} />
        </div>

        {/* legend */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {legend.map((x) => (
            <div key={x.l}>
              <div className="flex items-center gap-[6px] mb-[3px]">
                <span className={`w-[9px] h-[9px] rounded-full shrink-0 ${x.c}`} />
                <span className="font-display font-extrabold text-[17px] text-charcoal">{x.n}</span>
              </div>
              <div className="text-[10.5px] text-muted-ink tracking-[0.04em]">{x.l}</div>
            </div>
          ))}
        </div>

        {/* per side (bride / groom) */}
        {bySide.length > 0 && (
          <div className="mb-5">
            <LabelSc className="mb-3">Respons per pihak</LabelSc>
            <div className="flex flex-col gap-3">
              {/* key by index: labels are free text now (custom sides) and the
                  list is a server snapshot with no reordering/per-row state. */}
              {bySide.map((r, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-[88px] text-[12px] font-medium text-charcoal shrink-0 truncate" title={r.label}>{r.label}</span>
                  <ProgressBar value={r.pct} height={6} />
                  <span className="w-[56px] text-right text-[11px] text-muted-ink shrink-0 [font-variant:small-caps] tracking-[0.06em]">
                    {r.confirmed} / {r.total}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* per group */}
        {groups.length > 0 && (
          <>
            <LabelSc className="mb-3">Tingkat respons per kelompok</LabelSc>
            <div className="flex flex-col gap-3">
              {groups.map((r) => (
                <div key={r.label} className="flex items-center gap-3">
                  <span className="w-[88px] text-[12px] font-medium text-charcoal shrink-0">{r.label}</span>
                  <ProgressBar value={r.pct} height={6} />
                  <span className="w-[56px] text-right text-[11px] text-muted-ink shrink-0 [font-variant:small-caps] tracking-[0.06em]">
                    {r.confirmed} / {r.total}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
