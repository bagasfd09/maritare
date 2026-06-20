import { FlowerMark } from "@/components/atoms/flower-mark";
import { StatusPill } from "@/components/atoms/status-pill";
import { ProgressBar } from "@/components/atoms/progress-bar";
import { Display, Em } from "@/components/atoms/typography";

type PublishCardProps = {
  progress: number; // 0–100
};

// Publish-readiness card — peach surface, draft pill, progress to launch.
export function PublishCard({ progress }: PublishCardProps) {
  return (
    <div className="bg-peach rounded-[22px] px-7 py-[26px] flex flex-col justify-between min-h-[240px]">
      <div>
        <div className="flex items-center justify-between">
          <StatusPill tone="draft" className="bg-white/40">Draft</StatusPill>
          <FlowerMark size={20} />
        </div>
        <Display as="div" className="text-[26px] mt-4 leading-[1.05] text-burgundy-dark">
          Undangan kamu <Em className="text-burgundy">hampir siap.</Em>
        </Display>
        <div className="text-[13px] text-[#5a2a18] mt-2 leading-[1.5]">
          Lengkapi detail undangan, lalu publish untuk dapat link yang bisa kamu bagi ke tamu.
        </div>
      </div>
      <div className="flex items-center gap-[10px] mt-5">
        <ProgressBar value={progress} trackClassName="bg-burgundy/15" height={6} />
        <span className="font-display font-extrabold text-[14px] text-burgundy-dark">{progress}%</span>
      </div>
    </div>
  );
}
