"use client";

import { getInvitationTemplate } from "@/components/invitation/registry";
import type { InvitationView } from "@/server/queries/invitation";

// The bare device frame + scaled live template render, shared by the desktop
// side-rail preview (EditorPhonePreview) and the mobile editor preview card.
// A true-size iPhone 12 (390×844) canvas scaled by 0.692 into the 270×584 inner
// viewport (→ 290×604 outer frame).
export function PhoneFrame({ previewData }: { previewData: InvitationView }) {
  const Template = getInvitationTemplate(previewData.templateSlug);

  return (
    <div className="w-[290px] h-[604px] bg-black rounded-[38px] p-[10px] relative overflow-hidden shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8),0_0_0_2px_rgba(245,239,230,0.06)]">
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[86px] h-5 bg-black rounded-full z-[5]" />
      <div className="w-full h-full rounded-[28px] overflow-hidden bg-[#F0EAD8] relative">
        <div className="w-[270px] h-[584px] overflow-hidden rounded-[28px]">
          <div className="w-[390px] h-[844px] origin-top-left scale-[0.692] overflow-y-auto">
            {/* eslint-disable-next-line react-hooks/static-components -- registry returns a module-level component, never a new one */}
            <Template data={previewData} mode="editorPreview" />
          </div>
        </div>
      </div>
    </div>
  );
}
