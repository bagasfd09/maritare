// Miniature invitation preview used by Templates (and any screen that needs a
// thumbnail of the live invitation). Palette colors are data-driven, so they
// stay inline styles; layout/typography are utilities.
const PALETTES = {
  garden: { bg: "#F0EAD8", text: "#2E3A29", accent: "#6B2737", ornBg: "#FAF6F1" },
  oxblood: { bg: "#F0EAD8", text: "#6B2737", accent: "#1B1F18", ornBg: "#FAF6F1" },
  blush: { bg: "#E4C7BD", text: "#7C2D2D", accent: "#3E1414", ornBg: "#FAF6F1" },
  moss: { bg: "#5C6B41", text: "#F5EFE6", accent: "#EAD3C2", ornBg: "#7C8F5C" },
  ivory: { bg: "#FAF6F1", text: "#1A1A1A", accent: "#7C7E5E", ornBg: "#F5EFE6" },
  midnight: { bg: "#1A1410", text: "#EAD3C2", accent: "#B66B4D", ornBg: "#2A2520" },
  terracotta: { bg: "#B66B4D", text: "#FAF6F1", accent: "#3E1414", ornBg: "#D4906F" },
  sage: { bg: "#7C7E5E", text: "#FAF6F1", accent: "#C8CAB0", ornBg: "#8E906F" },
} as const;

export type MiniInvitePalette = keyof typeof PALETTES;

type MiniInviteProps = {
  width?: number;
  palette?: MiniInvitePalette;
  scale?: number;
};

export function MiniInvite({ width = 240, palette = "garden", scale = 1 }: MiniInviteProps) {
  // Guard against unknown slugs from the DB (templates can outgrow this set).
  const p = PALETTES[palette] ?? PALETTES.garden;
  const height = Math.round(width * 1.35);
  return (
    <div
      style={{
        width,
        height,
        background: p.bg,
        color: p.text,
        border: `1px solid ${p.accent}33`,
        boxShadow: "0 12px 28px -14px rgba(46,58,41,0.25)",
      }}
      className="p-5 relative flex flex-col items-center justify-center text-center"
    >
      <div style={{ border: `1px solid ${p.accent}33` }} className="absolute inset-[6px] pointer-events-none" />
      <div style={{ color: p.accent, fontSize: 14 * scale }} className="font-display italic tracking-[0.3em] mb-[10px]">
        ❦
      </div>
      <div style={{ fontSize: 8 * scale }} className="font-body tracking-[0.3em] uppercase opacity-70 mb-[10px]">
        The Wedding Of
      </div>
      <div style={{ fontSize: 28 * scale }} className="font-display italic leading-[0.95] tracking-[-0.02em]">
        Rama
      </div>
      <div style={{ color: p.accent, fontSize: 18 * scale }} className="font-display italic leading-none mb-[2px]">
        &amp;
      </div>
      <div style={{ fontSize: 28 * scale }} className="font-display italic leading-[0.95] tracking-[-0.02em]">
        Sinta
      </div>
      <div style={{ background: p.accent, margin: `${12 * scale}px auto` }} className="w-[30px] h-px" />
      <div style={{ fontSize: 8 * scale }} className="font-body tracking-[0.3em] uppercase font-semibold">
        Tanggal Pernikahan
      </div>
      <div style={{ fontSize: 10 * scale }} className="font-display italic opacity-70 mt-1">
        Nama Tempat, Kota
      </div>
      <div style={{ color: p.accent, fontSize: 14 * scale }} className="font-display italic tracking-[0.3em] mt-3">
        ❦
      </div>
    </div>
  );
}
