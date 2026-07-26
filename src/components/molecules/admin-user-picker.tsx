"use client";

import { useEffect, useRef, useState } from "react";

import { Icon } from "@/components/atoms/icon";
import { searchCustomers, type CustomerHit } from "@/server/actions/promo";
import { cn } from "@/lib/utils";

const FIELD =
  "w-full rounded-[9px] border border-line bg-cream px-3 py-2 font-body text-[12.5px] text-charcoal outline-none placeholder:text-faint focus:border-charcoal";

// Controlled multi-user picker for admin targeting features (exclusive promos,
// exclusive templates): selected users as removable chips + a debounced live
// search over existing customers. Chips scale — the search box never grows,
// so the surrounding form stays tidy no matter how many users exist.
export function AdminUserPicker({
  value,
  onChange,
  placeholder = "Cari nama / email user…",
}: {
  value: CustomerHit[];
  onChange: (next: CustomerHit[]) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<CustomerHit[]>([]);
  const [searching, setSearching] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current !== null) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  function onQueryChange(q: string) {
    setQuery(q);
    if (timer.current !== null) {
      clearTimeout(timer.current);
    }
    if (q.trim().length < 2) {
      setHits([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    timer.current = setTimeout(async () => {
      const result = await searchCustomers({ query: q });
      setSearching(false);
      setHits(result.ok ? result.customers : []);
    }, 300);
  }

  function add(hit: CustomerHit) {
    if (!value.some((u) => u.id === hit.id)) {
      onChange([...value, hit]);
    }
    setQuery("");
    setHits([]);
  }

  return (
    <div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-[6px] mb-2">
          {value.map((u) => (
            <span
              key={u.id}
              className="inline-flex items-center gap-[6px] rounded-full bg-cream border border-line pl-3 pr-[6px] py-[4px] text-[11.5px] text-charcoal"
            >
              {u.name || u.email}
              <button
                type="button"
                aria-label={`Hapus ${u.email}`}
                onClick={() => onChange(value.filter((x) => x.id !== u.id))}
                className="w-[18px] h-[18px] rounded-full bg-paper border border-line inline-flex items-center justify-center cursor-pointer hover:bg-peach"
              >
                <Icon name="x" size={9} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="relative">
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={placeholder}
          className={FIELD}
        />
        {query.trim().length >= 2 && (hits.length > 0 || searching) && (
          <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-paper border border-line rounded-[10px] shadow-[0_14px_30px_rgba(26,26,26,0.14)] overflow-hidden">
            {searching ? (
              <div className="px-3 py-2 text-[11.5px] text-muted-ink">Mencari…</div>
            ) : (
              hits.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => add(h)}
                  className={cn(
                    "block w-full text-left px-3 py-2 text-[12px] text-charcoal cursor-pointer hover:bg-cream",
                    value.some((u) => u.id === h.id) && "opacity-50",
                  )}
                >
                  <span className="font-semibold">{h.name || "—"}</span>{" "}
                  <span className="text-muted-ink">{h.email}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
