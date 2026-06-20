"use client";

import { Fragment } from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/atoms/icon";
import type { SectionId } from "@/lib/invitation/sections";
import type { FormGroup } from "@/lib/invitation/manifest";

type EditorSectionRailProps = {
  /** Form groups this template exposes (already sorted by order). */
  groups: FormGroup[];
  /** Currently selected section key. */
  active: SectionId;
  /** Completion flags by section key. */
  done: Record<string, boolean>;
  onSelect: (key: SectionId) => void;
};

// Clickable chapter progress rail under the editor topbar, driven by the
// template's manifest. Chips are buttons; the active chip is dark, completed
// chips show a checkmark, the rest show their numeral. The "N / total bagian"
// summary is derived from `done` over the exposed groups.
export function EditorSectionRail({ groups, active, done, onSelect }: EditorSectionRailProps) {
  const doneCount = groups.filter((g) => done[g.id]).length;

  return (
    <div className="px-10 py-[14px] bg-paper border-b border-beige flex items-center gap-2">
      {groups.map((g, i) => {
        const isActive = g.id === active;
        const isDone = Boolean(done[g.id]);
        return (
          <Fragment key={g.id}>
            <button
              type="button"
              onClick={() => onSelect(g.id)}
              className={cn(
                "flex items-center gap-2 px-[13px] py-[7px] rounded-full text-[12px] font-semibold cursor-pointer transition-colors",
                isActive
                  ? "bg-charcoal text-cream"
                  : isDone
                    ? "bg-sage-soft text-[#1c2818] hover:brightness-95"
                    : "bg-transparent text-muted-ink border border-line hover:border-charcoal/40",
              )}
            >
              {isDone && !isActive ? (
                <Icon name="check" size={12} />
              ) : (
                <span
                  className={cn(
                    "font-display italic font-bold",
                    isActive ? "text-peach" : "text-burgundy",
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              )}
              {g.label}
            </button>
            {i < groups.length - 1 && <span className="w-[10px] h-px bg-beige" />}
          </Fragment>
        );
      })}
      <div className="flex-1" />
      <span className="text-[11px] text-muted-ink [font-variant:small-caps] tracking-[0.18em]">
        {doneCount} / {groups.length} bagian
      </span>
    </div>
  );
}
