import { MobileTopBar } from "@/components/organisms/mobile-topbar";
import { MobileBottomNav, type MobileNavKey } from "@/components/organisms/mobile-bottom-nav";

type MobileShellProps = {
  active: MobileNavKey;
  eyebrow?: string;
  title: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
};

// Mobile app shell — self-gated to < lg (desktop templates render ≥ lg).
// Phone-like centered column on tablet widths, full-bleed on real phones.
export function MobileShell({ active, eyebrow, title, right, children }: MobileShellProps) {
  return (
    <div className="lg:hidden min-h-dvh bg-[#e3ddd1] flex justify-center font-body text-charcoal">
      <div className="w-full max-w-[430px] h-dvh bg-ivory flex flex-col relative overflow-hidden shadow-[0_0_70px_-24px_rgba(62,20,20,0.4)]">
        <MobileTopBar eyebrow={eyebrow} title={title} right={right} />
        <main className="flex-1 overflow-y-auto px-4 pt-4 pb-[30px] flex flex-col gap-[14px] [&>*]:shrink-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {children}
        </main>
        <MobileBottomNav active={active} />
      </div>
    </div>
  );
}
