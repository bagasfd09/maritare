import { DashboardShell } from "@/components/templates/dashboard-shell";
import { DashboardTopBar } from "@/components/organisms/dashboard-topbar";
import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";
import { Em, Num } from "@/components/atoms/typography";
import { SectionNumber } from "@/components/atoms/section-number";
import { FlowerMark } from "@/components/atoms/flower-mark";
import { WishesBoard } from "@/components/molecules/wishes-board";
import { cn } from "@/lib/utils";
import type { DashboardChrome, WishesData } from "@/server/queries/dashboard";

type ModerationSetting = { label: string; desc: string; on: boolean };

const MODERATION_SETTINGS: ModerationSetting[] = [
  { label: "Auto-publish ucapan", desc: "Langsung tampil tanpa moderasi", on: false },
  { label: "Tampilkan di undangan", desc: "Section ucapan terlihat tamu", on: true },
  { label: "Filter kata kasar", desc: "Otomatis flag konten tidak pantas", on: true },
];

type WishesProps = {
  data: WishesData;
  chrome: DashboardChrome | null;
};

// Screen 05 · Buku Ucapan (Wishes moderation).
export function Wishes({ data, chrome }: WishesProps) {
  const rows = data.wishes;
  const counts = data.counts;
  const attendingCount = rows.filter((w) => w.attending === true).length;
  const noRsvpCount = rows.filter((w) => w.attending === null).length;

  return (
    <DashboardShell active="wishes" chrome={chrome}>
      <main className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar
          num="§ V"
          eyebrow="Buku Ucapan"
          title={<>{counts.total} ucapan <Em className="text-burgundy">untuk kalian.</Em></>}
          actions={
            <>
              {counts.pending > 0 && (
                <span className="text-[11px] text-terracotta tracking-[0.18em] uppercase font-semibold inline-flex items-center gap-[6px]">
                  <span className="w-[6px] h-[6px] rounded-full bg-terracotta" />
                  {counts.pending} menunggu moderasi
                </span>
              )}
              <Button variant="ghost"><Icon name="download" size={14} />Export ke PDF</Button>
            </>
          }
        />

        <div className="flex-1 min-h-0 px-10 py-7 overflow-hidden grid grid-cols-[1fr_320px] grid-rows-[minmax(0,1fr)] gap-6">
          {/* LEFT: filterable, scrollable list */}
          <WishesBoard wishes={rows} />

          {/* RIGHT: insights */}
          <aside className="flex flex-col gap-[14px] overflow-y-auto min-h-0">
            <div className="bg-charcoal text-cream rounded-[14px] px-5 py-[18px] relative overflow-hidden">
              <div className="absolute -top-5 -right-[25px] w-[110px] h-[110px] opacity-[0.08]">
                <FlowerMark size={110} color="var(--color-peach)" core="var(--color-peach)" stamen="var(--color-terracotta)" />
              </div>
              <div className="relative z-[2]">
                <SectionNumber className="text-peach text-[11px]">i. Ringkasan</SectionNumber>
                <Num className="text-peach text-[52px] mt-[6px]">{counts.total}</Num>
                <div className="font-display italic text-[16px] text-cream mt-[2px]">ucapan masuk</div>
                <div className="grid grid-cols-2 gap-3 mt-[18px] pt-[14px] border-t border-[rgba(245,239,230,0.14)]">
                  <div>
                    <div className="font-display font-bold text-[22px] text-cream">{attendingCount}</div>
                    <div className="text-[9px] text-[rgba(245,239,230,0.55)] tracking-[0.18em] uppercase font-semibold mt-[2px]">
                      Hadir
                    </div>
                  </div>
                  <div>
                    <div className="font-display font-bold text-[22px] text-cream">{noRsvpCount}</div>
                    <div className="text-[9px] text-[rgba(245,239,230,0.55)] tracking-[0.18em] uppercase font-semibold mt-[2px]">
                      Tanpa RSVP
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-paper border border-line rounded-[14px] px-[18px] py-4">
              <SectionNumber className="text-[11px] mb-[10px]">ii. Pengaturan</SectionNumber>
              <div className="flex flex-col gap-3">
                {MODERATION_SETTINGS.map((s) => (
                  <div key={s.label} className="flex items-center gap-[10px]">
                    <div className="flex-1">
                      <div className="text-[12px] font-semibold text-charcoal">{s.label}</div>
                      <div className="text-[11px] text-muted-ink mt-px">{s.desc}</div>
                    </div>
                    <div
                      className={cn(
                        "w-[34px] h-5 rounded-full relative cursor-pointer shrink-0",
                        s.on ? "bg-sage" : "bg-beige",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-[2px] w-4 h-4 rounded-full bg-white transition-[left] duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.18)]",
                          s.on ? "left-4" : "left-[2px]",
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-peach rounded-[14px] px-5 py-[18px]">
              <SectionNumber className="text-[11px] mb-[10px] text-terracotta">iii. Tip</SectionNumber>
              <div className="font-display italic text-[17px] text-burgundy-dark leading-[1.35]">
                Sematkan ucapan dari keluarga atau sahabat dekat — akan tampil di paling atas section ucapan.
              </div>
            </div>
          </aside>
        </div>
      </main>
    </DashboardShell>
  );
}
