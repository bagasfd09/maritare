"use client";

import { Icon } from "@/components/atoms/icon";
import { PhoneFrame } from "@/components/molecules/editor-phone-frame";
import type { InvitationView } from "@/server/queries/invitation";

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
  return (
    <div className="border-l border-[rgba(245,239,230,0.08)] bg-[#0d0a07] px-[30px] py-7 flex flex-col items-center overflow-y-auto">
      {/* Header */}
      <div className="w-full mb-5">
        <div className="text-[10px] text-peach tracking-[0.28em] uppercase font-semibold">
          Live preview
        </div>
        <div className="text-[11px] text-[rgba(245,239,230,0.5)] font-body mt-[3px]">
          maritare.id/<span className="text-peach">{slug}</span>
        </div>
      </div>

      {/* Phone frame */}
      <PhoneFrame previewData={previewData} />

      <div className="mt-4 flex items-center gap-2 text-[11px] text-[rgba(245,239,230,0.55)] font-display italic">
        <Icon name="sparkle" size={12} stroke="var(--color-peach)" />
        Preview otomatis ter-update saat kamu mengetik
      </div>
    </div>
  );
}
