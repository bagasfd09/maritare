import { Icon } from "@/components/atoms/icon";
import { MiniInvite } from "@/components/molecules/mini-invite";
import {
  MobileButton,
  MobileCard,
  MobileChip,
  MobileChipRow,
  MobileEm,
  MobileEyebrow,
  MobileInput,
  MobileSecLabel,
} from "@/components/molecules/mobile-primitives";
import { MobileShell } from "@/components/templates/mobile-shell";

// Mobile 02 · Editor Undangan — ported 1:1 from the design's `MB_Editor`.
// Stateless render of the default state: active section tab = "Cerita".

const SECTIONS: { l: string; done: boolean }[] = [
  { l: "Pasangan", done: true },
  { l: "Acara", done: true },
  { l: "Cerita", done: false },
  { l: "Galeri", done: false },
  { l: "Amplop", done: false },
  { l: "Musik", done: false },
];

const ACTIVE_TAB = "Cerita";

// `.m-input-lbl` has no rule in the design's mobile.css; it inherits the
// intent of `.d-input-lbl` (the only matching rule in the design system).
function InputLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-[14px] mb-2 block font-body text-[11px] font-semibold tracking-[0.16em] uppercase text-muted-ink">
      {children}
    </div>
  );
}

export function EditorMobile() {
  return (
    <MobileShell
      active="editor"
      eyebrow="Editor · Bab 03 dari 07"
      title={
        <>
          Cerita <MobileEm>kami.</MobileEm>
        </>
      }
    >
      <MobileChipRow>
        {SECTIONS.map((s) => (
          <MobileChip key={s.l} active={ACTIVE_TAB === s.l}>
            {s.done && (
              <Icon
                name="check"
                size={12}
                stroke={ACTIVE_TAB === s.l ? "var(--color-cream)" : "var(--color-sage)"}
              />
            )}
            {s.l}
          </MobileChip>
        ))}
      </MobileChipRow>

      {/* Live preview */}
      <MobileCard tone="dark" className="flex flex-col items-center pt-[18px]">
        <div className="self-stretch flex items-center justify-between mb-[14px]">
          <div>
            <MobileEyebrow className="text-peach">Live preview</MobileEyebrow>
            <div className="text-[11.5px] text-[rgba(245,239,230,0.6)] mt-[3px]">
              maritare.id/andi-putri
            </div>
          </div>
          <Icon name="external" size={16} stroke="var(--color-peach)" />
        </div>
        <MiniInvite width={170} palette="garden" scale={0.95} />
      </MobileCard>

      {/* Form for active section */}
      <MobileCard>
        <MobileSecLabel>§ {ACTIVE_TAB}</MobileSecLabel>
        <InputLabel>Judul section</InputLabel>
        <MobileInput defaultValue="Bagaimana kami bertemu" />
        <InputLabel>Cerita kalian</InputLabel>
        <textarea
          rows={5}
          className="w-full bg-cream border border-beige rounded-[12px] px-[14px] py-3 font-body text-sm text-charcoal outline-none focus:border-burgundy placeholder:text-faint resize-none leading-[1.5]"
          defaultValue={
            "Kami bertemu di sebuah sore di kafe kecil dekat kampus. Dari obrolan ringan tentang buku, tumbuh cerita yang akhirnya membawa kami ke hari ini."
          }
        />
        <div className="flex items-center gap-[7px] mt-3 text-[11px] text-muted-ink">
          <Icon name="check" size={13} stroke="var(--color-sage)" /> Tersimpan otomatis · 12 detik
          lalu
        </div>
      </MobileCard>

      <MobileButton variant="primary" full type="button">
        <Icon name="eye" size={15} /> Pratinjau undangan
      </MobileButton>
    </MobileShell>
  );
}
