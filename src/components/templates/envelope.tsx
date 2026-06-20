import { DashboardShell } from "@/components/templates/dashboard-shell";
import { DashboardTopBar } from "@/components/organisms/dashboard-topbar";
import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";
import { Em } from "@/components/atoms/typography";
import { StatusPill } from "@/components/atoms/status-pill";
import { SectionNumber } from "@/components/atoms/section-number";
import { FlowerMark } from "@/components/atoms/flower-mark";
import { EnvelopeMethodCard, type PaymentMethod } from "@/components/molecules/envelope-method-card";
import { rupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { EnvelopeData } from "@/server/queries/dashboard";

type EnvelopeSetting = {
  label: string;
  desc: string;
  on: boolean;
};

// Cosmetic-only UI toggles (not persisted). Left as-is per scope.
const SETTINGS: EnvelopeSetting[] = [
  { label: "Tampilkan jumlah hadiah", desc: "Tamu lihat total terkumpul", on: false },
  { label: "Notifikasi WA otomatis", desc: "Saat ada hadiah masuk", on: true },
];

// Configured payment destinations have no per-method brand color or active flag
// in the data, so render every card as active with a neutral house color.
function toBankMethods(accounts: EnvelopeData["accounts"]): PaymentMethod[] {
  return accounts.map((a) => ({
    name: a.bank,
    number: a.number,
    holder: a.holder,
    active: true,
    color: "var(--color-burgundy)",
  }));
}

function toEwalletMethods(ewallets: EnvelopeData["ewallets"]): PaymentMethod[] {
  return ewallets.map((w) => ({
    name: w.provider,
    number: w.number,
    holder: w.holder,
    active: true,
    color: "var(--color-burgundy)",
  }));
}

// Screen 07 · Amplop Digital.
export function Envelope({ data }: { data: EnvelopeData }) {
  const banks = toBankMethods(data.accounts);
  const ewallets = toEwalletMethods(data.ewallets);
  const hasMethods = banks.length > 0 || ewallets.length > 0;

  return (
    <DashboardShell active="envelope" chrome={data.chrome}>
      <main className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar
          num="§ VII"
          eyebrow="Amplop Digital"
          title={<>Hadiah <Em className="text-burgundy">dari tamu.</Em></>}
          actions={
            <>
              <StatusPill tone="live" className="mr-1">Amplop aktif</StatusPill>
              <Button variant="ghost"><Icon name="download" size={14} />Export riwayat</Button>
              <Button variant="primary"><Icon name="plus" size={14} />Tambah rekening</Button>
            </>
          }
        />

        <div className="flex-1 px-10 py-7 overflow-y-auto grid grid-cols-[1fr_360px] gap-[22px]">
          {/* LEFT */}
          <div className="flex flex-col overflow-hidden">
            {/* Hero stats — empty state (no gifts-received tracking yet) */}
            <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-[14px] mb-[22px]">
              <div className="bg-burgundy text-cream rounded-[16px] px-[26px] py-[22px] relative overflow-hidden">
                <div className="absolute -top-5 -right-[30px] w-[130px] h-[130px] opacity-10">
                  <FlowerMark size={130} color="var(--color-peach)" core="var(--color-peach)" stamen="var(--color-cream)" />
                </div>
                <div className="relative z-[2]">
                  <SectionNumber className="text-[11px] text-peach">i. Total masuk</SectionNumber>
                  <div className="font-display font-extrabold text-[48px] leading-none tracking-[-0.03em] text-peach mt-[10px]">
                    {rupiah(data.totals.total)}
                  </div>
                  <div className="font-display italic text-[14px] text-cream mt-1">
                    Belum ada amplop masuk
                  </div>
                </div>
              </div>
              <div className="bg-paper border border-line rounded-[16px] px-[22px] py-[22px]">
                <SectionNumber className="text-[11px]">ii. Hadiah terbesar</SectionNumber>
                <div className="font-display font-extrabold text-[32px] leading-none tracking-[-0.02em] text-charcoal mt-[10px]">
                  {rupiah(data.totals.largest)}
                </div>
                <div className="font-display italic text-[14px] text-muted-ink mt-1">{data.totals.count} tamu</div>
              </div>
              <div className="bg-paper border border-line rounded-[16px] px-[22px] py-[22px]">
                <SectionNumber className="text-[11px]">iii. Rata-rata</SectionNumber>
                <div className="font-display font-extrabold text-[32px] leading-none tracking-[-0.02em] text-charcoal mt-[10px]">
                  {rupiah(data.totals.average)}
                </div>
                <div className="font-display italic text-[14px] text-muted-ink mt-1">per amplop</div>
              </div>
            </div>

            {/* Rekening & E-wallet */}
            <SectionNumber className="text-[12px] mb-3">iv. Metode pembayaran</SectionNumber>
            {hasMethods ? (
              <div className="grid grid-cols-2 gap-[14px] mb-[18px]">
                <EnvelopeMethodCard title="Rekening Bank" variant="bank" methods={banks} />
                <EnvelopeMethodCard title="E-Wallet" variant="ewallet" methods={ewallets} />
              </div>
            ) : (
              <div className="bg-paper border border-line rounded-[14px] px-[18px] py-7 mb-[18px] text-center">
                <div className="font-display italic text-[16px] text-charcoal mb-1">Belum ada rekening</div>
                <div className="text-[12px] text-muted-ink">Tambah di editor bab Amplop.</div>
              </div>
            )}

            {/* Recent gifts — empty state */}
            <SectionNumber className="text-[12px] mb-3">v. Riwayat hadiah</SectionNumber>
            <div className="bg-paper border border-line rounded-[14px] px-[18px] py-10 text-center">
              <div className="font-display italic text-[16px] text-charcoal mb-1">Belum ada amplop masuk</div>
              <div className="text-[12px] text-muted-ink">Hadiah dari tamu akan muncul di sini.</div>
            </div>
          </div>

          {/* RIGHT */}
          <aside className="flex flex-col gap-[14px] overflow-hidden">
            {/* Preview of envelope on invitation */}
            <div className="bg-charcoal text-cream rounded-[14px] px-5 py-[18px]">
              <SectionNumber className="text-[11px] text-peach mb-3">i. Preview di undangan</SectionNumber>
              <div className="bg-[#F0EAD8] rounded-[10px] px-4 py-5 text-[#2E3A29] text-center">
                <div className="font-display italic text-[#6B2737] text-[14px] tracking-[0.3em] mb-2">❦</div>
                <div className="text-[8px] tracking-[0.3em] uppercase font-semibold opacity-70 mb-[10px]">Wedding Gift</div>
                <div className="font-display italic text-[22px] leading-none text-[#2E3A29] mb-[6px]">Kirim hadiah</div>
                <div className="font-[Lora,Georgia,serif] italic text-[11px] text-[#5C6552] mb-[14px] leading-[1.55]">
                  Doa restu kalian adalah hadiah terbaik. Tapi bila ingin mengirim tanda kasih…
                </div>
                {data.accounts.length > 0 ? (
                  <div className="flex flex-col gap-[6px]">
                    {data.accounts.map((a) => (
                      <div
                        key={`${a.bank}-${a.number}`}
                        className="px-[10px] py-2 border border-[#6B273733] rounded-[6px] text-[10px] text-[#2E3A29] text-left"
                      >
                        <strong className="font-display italic text-[12px]">{a.bank}</strong> · {a.number} · {a.holder}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[10px] italic text-[#5C6552]">Belum ada rekening.</div>
                )}
              </div>
            </div>

            {/* Gift address (only when set) */}
            {data.giftAddress && (
              <div className="bg-paper border border-line rounded-[14px] px-[18px] py-4">
                <SectionNumber className="text-[11px] mb-2">ii. Alamat kirim hadiah</SectionNumber>
                <div className="text-[12px] text-charcoal leading-[1.5] whitespace-pre-line">{data.giftAddress}</div>
              </div>
            )}

            {/* Tip */}
            <div className="bg-peach rounded-[14px] px-5 py-[18px]">
              <SectionNumber className="text-[11px] text-terracotta mb-2">ii. Tip</SectionNumber>
              <div className="font-display italic text-[16px] text-burgundy-dark leading-[1.4]">
                Tamu bisa unggah bukti transfer setelah kirim. Otomatis tercatat di riwayat, kamu bisa kirim ucapan terima kasih per orang.
              </div>
            </div>

            {/* Settings */}
            <div className="bg-paper border border-line rounded-[14px] px-[18px] py-4">
              <SectionNumber className="text-[11px] mb-3">iii. Pengaturan</SectionNumber>
              <div className="flex flex-col gap-3">
                {SETTINGS.map((s) => (
                  <div key={s.label} className="flex items-center gap-[10px]">
                    <div className="flex-1">
                      <div className="text-[12px] font-semibold">{s.label}</div>
                      <div className="text-[10px] text-muted-ink mt-px">{s.desc}</div>
                    </div>
                    <div
                      className={cn(
                        "relative w-[34px] h-5 rounded-full cursor-pointer shrink-0",
                        s.on ? "bg-sage" : "bg-beige",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-[2px] w-4 h-4 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.18)]",
                          s.on ? "left-4" : "left-[2px]",
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </DashboardShell>
  );
}
