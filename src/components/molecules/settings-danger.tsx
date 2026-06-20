import { cn } from "@/lib/utils";
import { Button } from "@/components/atoms/button";
import { SectionNumber } from "@/components/atoms/section-number";

type DangerRow = {
  label: string;
  desc: string;
  btn: string;
  critical?: boolean;
};

const ROWS: DangerRow[] = [
  { label: "Reset undangan", desc: "Kosongkan semua data kecuali akun. Mulai dari nol.", btn: "Reset" },
  { label: "Unpublish undangan", desc: "Sembunyikan dari publik. Bisa di-publish ulang kapan saja.", btn: "Unpublish" },
  { label: "Hapus akun permanen", desc: "Hapus akun, undangan, foto, semua data. Tidak bisa dibatalkan.", btn: "Hapus akun", critical: true },
];

// Settings · section iv: destructive account/invitation actions.
export function SettingsDanger() {
  return (
    <section id="danger" className="scroll-mt-6">
      <SectionNumber className="text-[12px] mb-1 text-burgundy">v. Zona berbahaya</SectionNumber>
      <div className="bg-paper border-[1.5px] border-burgundy rounded-[14px] overflow-hidden">
        {ROWS.map((d, i) => (
          <div
            key={d.label}
            className={cn(
              "px-[22px] py-4 flex items-center gap-[18px]",
              i < ROWS.length - 1 && "border-b border-line",
            )}
          >
            <div className="flex-1">
              <div className="text-[14px] font-semibold text-charcoal">{d.label}</div>
              <div className="text-[12px] text-muted-ink mt-[2px]">{d.desc}</div>
            </div>
            <Button
              size="sm"
              variant={d.critical ? "primary" : "ghost"}
              className={d.critical ? undefined : "text-burgundy border-burgundy hover:border-burgundy"}
            >
              {d.btn}
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
