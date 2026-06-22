"use client";

import { cn } from "@/lib/utils";
import { Icon, type IconName } from "@/components/atoms/icon";
import { getInvitationTemplate } from "@/components/invitation/registry";
import type { InvitationView } from "@/server/queries/invitation";

const DEVICE_TABS: { ic: IconName; on: boolean }[] = [
  { ic: "card", on: true },
  { ic: "image", on: false },
  { ic: "globe", on: false },
];

type EditorPhonePreviewProps = {
  /** Public slug shown in the address line. */
  slug: string;
  /** Full invitation view assembled client-side from the orchestrator state. */
  previewData: InvitationView;
};

// Live phone preview pane on the right of the editor. Renders the REAL selected
// template (props contract only) inside the device frame, scaled to fit. The
// inner viewport is a true 390×844 (iPhone 12) mobile canvas scaled by 0.692
// into the frame (→ 270×584 inner viewport, 290×604 outer frame).
export function EditorPhonePreview({ slug, previewData }: EditorPhonePreviewProps) {
  // Render whichever template the wedding has selected (not a hardcoded one).
  const Template = getInvitationTemplate(previewData.templateSlug);

  return (
    <div className="border-l border-[rgba(245,239,230,0.08)] bg-[#0d0a07] px-[30px] py-7 flex flex-col items-center overflow-y-auto">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-5">
        <div>
          <div className="text-[10px] text-peach tracking-[0.28em] uppercase font-semibold">
            Live preview
          </div>
          <div className="text-[11px] text-[rgba(245,239,230,0.5)] font-body mt-[3px]">
            maritare.id/<span className="text-peach">{slug}</span>
          </div>
        </div>
        <div className="flex gap-1">
          {DEVICE_TABS.map((d) => (
            <button
              key={d.ic}
              type="button"
              className={cn(
                "w-7 h-7 rounded-[7px] border-none cursor-pointer",
                d.on
                  ? "bg-[rgba(245,239,230,0.12)] text-cream"
                  : "bg-transparent text-[rgba(245,239,230,0.5)]",
              )}
            >
              <Icon name={d.ic} size={13} />
            </button>
          ))}
        </div>
      </div>

      {/* Phone frame */}
      <div className="w-[290px] h-[604px] bg-black rounded-[38px] p-[10px] relative overflow-hidden shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8),0_0_0_2px_rgba(245,239,230,0.06)]">
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[86px] h-5 bg-black rounded-full z-[5]" />
        <div className="w-full h-full rounded-[28px] overflow-hidden bg-[#F0EAD8] relative">
          {/* True-size iPhone 12 (390×844) canvas scaled to fit the 270×584 inner viewport. */}
          <div className="w-[270px] h-[584px] overflow-hidden rounded-[28px]">
            <div className="w-[390px] h-[844px] origin-top-left scale-[0.692] overflow-y-auto">
              {/* eslint-disable-next-line react-hooks/static-components -- registry returns a module-level component, never a new one */}
              <Template data={previewData} mode="editorPreview" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-[11px] text-[rgba(245,239,230,0.55)] font-display italic">
        <Icon name="sparkle" size={12} stroke="var(--color-peach)" />
        Preview otomatis ter-update saat kamu mengetik
      </div>
    </div>
  );
}
