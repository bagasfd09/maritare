import { Icon } from "@/components/atoms/icon";
import { Avatar, initials } from "@/components/atoms/avatar";
import { CircleButton } from "@/components/atoms/circle-button";

export type Gift = {
  from: string;
  amount: number;
  method: string;
  time: string;
};

const AVATAR_TONES = ["burgundy", "peach", "sage", "blush", "dark"] as const;

const TD = "p-[14px] border-b border-line align-middle group-last:border-b-0 group-hover:bg-[rgba(124,45,45,0.03)]";
const TH = "font-body text-[10px] font-semibold tracking-[0.18em] uppercase text-muted-ink text-left px-[14px] py-3 border-b border-beige";

type EnvelopeGiftsTableProps = {
  gifts: Gift[];
  rupiah: (n: number) => string;
};

// Cash-gift history table (Riwayat hadiah). Ports the `.d-tbl` styling.
export function EnvelopeGiftsTable({ gifts, rupiah }: EnvelopeGiftsTableProps) {
  return (
    <div className="bg-paper border border-line rounded-[14px] overflow-hidden">
      <table className="w-full border-separate border-spacing-0 text-[13px]">
        <thead>
          <tr className="bg-cream">
            <th className={`${TH} pl-[18px]`}>Dari</th>
            <th className={TH}>Metode</th>
            <th className={`${TH} text-right`}>Jumlah</th>
            <th className={TH}>Waktu</th>
            <th className={`${TH} w-[50px]`}></th>
          </tr>
        </thead>
        <tbody>
          {gifts.map((g, i) => (
            <tr key={i} className="group">
              <td className={`${TD} pl-[18px]`}>
                <div className="flex items-center gap-3">
                  <Avatar tone={AVATAR_TONES[i % 5]} size={28} className="text-[11px]">
                    {initials(g.from)}
                  </Avatar>
                  <div className="font-semibold text-[13px]">{g.from}</div>
                </div>
              </td>
              <td className={TD}>
                <span className="text-[11px] px-2 py-[3px] rounded-full bg-cream border border-line font-semibold tracking-[0.08em] text-charcoal">
                  {g.method}
                </span>
              </td>
              <td className={`${TD} text-right font-display font-bold text-[15px] tracking-[-0.01em]`}>
                {rupiah(g.amount)}
              </td>
              <td className={`${TD} text-[11px] text-muted-ink italic font-display`}>{g.time}</td>
              <td className={TD}>
                <CircleButton size={26}><Icon name="more" size={11} /></CircleButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
