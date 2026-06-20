import { Display } from "@/components/atoms/typography";
import { SectionNumber } from "@/components/atoms/section-number";

type TopBarProps = {
  num?: string;
  eyebrow: string;
  title: React.ReactNode;
  actions?: React.ReactNode;
};

// Page header band: section marker + display title on the left, actions right.
export function DashboardTopBar({ num = "§ I", eyebrow, title, actions }: TopBarProps) {
  return (
    <div className="px-10 pt-[26px] pb-[22px] border-b border-beige bg-ivory flex items-end justify-between gap-6">
      <div>
        <SectionNumber className="mb-[10px]">
          {num ? (
            <>
              {num} &nbsp;·&nbsp; {eyebrow}
            </>
          ) : (
            eyebrow
          )}
        </SectionNumber>
        <Display className="text-[38px] m-0">{title}</Display>
      </div>
      {actions && <div className="flex items-center gap-[10px]">{actions}</div>}
    </div>
  );
}
