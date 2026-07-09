import { FlowerMark } from "@/components/atoms/flower-mark";

// Both /kirim pages are dynamically rendered (cookie session), so without a
// loading boundary Link prefetching is skipped entirely and tab switches block
// on a full server round-trip with zero feedback. This restores partial
// prefetching + an instant branded pending state.
export default function Loading() {
  return (
    <div className="min-h-screen w-full bg-cream flex flex-col items-center justify-center gap-3">
      <div className="animate-pulse">
        <FlowerMark size={36} />
      </div>
      <span className="text-[10px] tracking-[0.28em] uppercase font-semibold text-muted-ink">
        Memuat…
      </span>
    </div>
  );
}
