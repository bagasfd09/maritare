"use client";

import { useState } from "react";

import { Icon } from "@/components/atoms/icon";
import { ActiveSectionForm } from "@/components/molecules/editor-forms/active-section-form";
import { PhoneFrame } from "@/components/molecules/editor-phone-frame";
import { PublishControl } from "@/components/molecules/publish-control";
import {
  MobileCard,
  MobileChip,
  MobileChipRow,
  MobileEm,
  MobileEyebrow,
} from "@/components/molecules/mobile-primitives";
import { MobileShell } from "@/components/templates/mobile-shell";
import { CHAPTERS, pad2 } from "@/components/templates/editor-chapters";
import { useEditorState } from "@/components/templates/use-editor-state";
import type { EditorSaveStatus } from "@/components/molecules/editor-canvas";
import type { EditorData } from "@/components/templates/editor-types";

// Compact autosave indicator for the mobile form card (mirrors the desktop
// SaveIndicator's three states).
function SaveLine({ status }: { status: EditorSaveStatus }) {
  if (status.state === "saving") {
    return <span className="text-[11px] text-[rgba(245,239,230,0.6)]">Menyimpan…</span>;
  }
  if (status.state === "error") {
    return (
      <span className="text-[11px] text-peach inline-flex items-center gap-[6px]">
        <Icon name="x" size={12} stroke="var(--color-peach)" /> {status.message}
      </span>
    );
  }
  if (status.state === "saved") {
    return (
      <span className="text-[11px] text-sage inline-flex items-center gap-[6px]">
        <Icon name="check" size={12} stroke="var(--color-sage)" /> Tersimpan otomatis · baru saja
      </span>
    );
  }
  return null;
}

// Mobile 02 · Editor Undangan — now feature-complete with the desktop editor.
// Same shared state (useEditorState), same per-section forms (ActiveSectionForm),
// same live template preview (PhoneFrame) — just stacked for a phone screen.
export function EditorMobile({ data }: { data: EditorData | null }) {
  const {
    meta,
    gallery,
    groups,
    sections,
    setSections,
    activeSection,
    setActiveSection,
    status,
    setStatus,
    done,
    previewData,
  } = useEditorState(data);
  const [showPreview, setShowPreview] = useState(true);

  const chapter = CHAPTERS[activeSection];
  const groupIdx = groups.findIndex((g) => g.id === activeSection);
  const eyebrow = `Editor · Bab ${pad2(groupIdx >= 0 ? groupIdx + 1 : 1)} dari ${pad2(groups.length)}`;

  return (
    <MobileShell
      active="editor"
      eyebrow={eyebrow}
      title={
        <>
          {chapter.lead}
          <MobileEm>{chapter.accent}</MobileEm>
        </>
      }
    >
      {/* Section tabs — driven by the template manifest, with completion checks. */}
      <MobileChipRow>
        {groups.map((g) => {
          const isActive = g.id === activeSection;
          return (
            <MobileChip key={g.id} active={isActive} onClick={() => setActiveSection(g.id)}>
              {done[g.id] && (
                <Icon
                  name="check"
                  size={12}
                  stroke={isActive ? "var(--color-cream)" : "var(--color-sage)"}
                />
              )}
              {g.label}
            </MobileChip>
          );
        })}
      </MobileChipRow>

      {/* Live preview — the real selected template, updating as you type. */}
      <MobileCard tone="dark" className="flex flex-col items-center pt-[18px]">
        <div className="self-stretch flex items-center justify-between mb-[14px]">
          <div className="min-w-0">
            <MobileEyebrow className="text-peach">Live preview</MobileEyebrow>
            <div className="text-[11.5px] text-[rgba(245,239,230,0.6)] mt-[3px] truncate">
              maritare.id/{meta.slug}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              className="text-[10.5px] tracking-[0.14em] uppercase font-semibold text-peach bg-transparent border-0 cursor-pointer px-1"
            >
              {showPreview ? "Sembunyikan" : "Lihat"}
            </button>
            <a
              href={`/inv/${meta.slug}?preview=1`}
              target="_blank"
              rel="noopener"
              aria-label="Buka preview di tab baru"
              className="text-peach"
            >
              <Icon name="external" size={16} stroke="var(--color-peach)" />
            </a>
          </div>
        </div>
        {showPreview && <PhoneFrame previewData={previewData} />}
      </MobileCard>

      {/* Active section form — cream-on-dark surface, matching the desktop canvas. */}
      <MobileCard className="bg-[#1a1410] border-transparent text-cream">
        <ActiveSectionForm
          activeSection={activeSection}
          sections={sections}
          setSections={setSections}
          photos={gallery.photos}
          onStatusChange={setStatus}
        />
        <div className="mt-4 min-h-[16px]">
          <SaveLine status={status} />
        </div>
      </MobileCard>

      {/* Paid-gated publish — same control as the desktop topbar. */}
      <MobileCard className="flex flex-wrap items-center justify-end gap-2">
        <PublishControl slug={meta.slug} initialStatus={meta.status} />
      </MobileCard>
    </MobileShell>
  );
}
