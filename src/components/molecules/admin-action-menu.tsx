"use client";

import { useState } from "react";

import { CircleButton } from "@/components/atoms/circle-button";
import { Icon } from "@/components/atoms/icon";
import { cn } from "@/lib/utils";

export type ActionMenuItem = {
  label: string;
  danger?: boolean;
  disabled?: boolean;
  onSelect: () => void;
};

// Popover menu anchored to a "more" CircleButton — extracted from the admin
// packages screen so the promos screen shares it. Fixed positioning so it
// escapes `overflow-hidden` containers (table card, package cards); flips
// upward near the viewport bottom. A full-screen click-away layer closes it.
export function ActionMenu({
  items,
  size,
  title,
  iconSize,
  triggerClassName,
  disabled,
}: {
  items: ActionMenuItem[];
  size: number;
  title?: string;
  iconSize: number;
  triggerClassName?: string;
  disabled?: boolean;
}) {
  const [pos, setPos] = useState<{ top: number; left: number; up: boolean } | null>(null);

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (pos) {
      setPos(null);
      return;
    }
    const r = e.currentTarget.getBoundingClientRect();
    const up = r.bottom + 140 > window.innerHeight;
    setPos({ top: up ? r.top - 6 : r.bottom + 6, left: r.right, up });
  };

  return (
    <>
      <CircleButton size={size} title={title} disabled={disabled} className={triggerClassName} onClick={toggle}>
        <Icon name="more" size={iconSize} />
      </CircleButton>
      {pos && (
        <>
          {/* Click-away layer — closes the menu without triggering anything else. */}
          <div aria-hidden className="fixed inset-0 z-40" onClick={() => setPos(null)} />
          <div
            role="menu"
            className="fixed z-50 min-w-[180px] py-1 bg-paper border border-line rounded-[10px] shadow-[0_14px_30px_rgba(26,26,26,0.16)]"
            style={{
              top: pos.top,
              left: pos.left,
              transform: pos.up ? "translate(-100%, -100%)" : "translateX(-100%)",
            }}
          >
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  setPos(null);
                  item.onSelect();
                }}
                className={cn(
                  "block w-full text-left font-body text-xs px-[14px] py-2 cursor-pointer",
                  item.danger ? "text-burgundy hover:bg-[rgba(124,45,45,0.06)]" : "text-charcoal hover:bg-cream",
                  item.disabled && "opacity-40 cursor-not-allowed hover:bg-transparent",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}
