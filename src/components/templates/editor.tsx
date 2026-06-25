"use client";

import { DashboardShell } from "@/components/templates/dashboard-shell";
import { DashboardTopBar } from "@/components/organisms/dashboard-topbar";
import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";
import { Em } from "@/components/atoms/typography";
import { EditorSectionRail } from "@/components/molecules/editor-section-rail";
import { EditorCanvas, type EditorSaveStatus } from "@/components/molecules/editor-canvas";
import { EditorPhonePreview } from "@/components/molecules/editor-phone-preview";
import { PublishControl } from "@/components/molecules/publish-control";
import { ActiveSectionForm } from "@/components/molecules/editor-forms/active-section-form";
import { CHAPTERS, pad2 } from "@/components/templates/editor-chapters";
import { useEditorState } from "@/components/templates/use-editor-state";
import type { EditorData } from "@/components/templates/editor-types";
import type { DashboardChrome } from "@/server/queries/dashboard";

export type EditorProps = {
  /** Assembled editor payload, or null when the user has no wedding yet. */
  data: EditorData | null;
  /** Real sidebar chrome (couple/owner identity). */
  chrome?: DashboardChrome | null;
};

// Topbar autosave indicator. Renders "Tersimpan otomatis · baru saja" at rest,
// "Menyimpan…" while a save is in flight, and a Bahasa error line on failure.
function SaveIndicator({ status }: { status: EditorSaveStatus }) {
  if (status.state === "saving") {
    return (
      <span className="text-[11px] text-muted-ink tracking-[0.18em] uppercase font-semibold inline-flex items-center gap-[6px]">
        Menyimpan…
      </span>
    );
  }

  if (status.state === "error") {
    return (
      <span className="text-[11px] text-burgundy tracking-[0.18em] uppercase font-semibold inline-flex items-center gap-[6px]">
        <Icon name="x" size={12} stroke="var(--color-burgundy)" /> {status.message}
      </span>
    );
  }

  const label =
    status.state === "saved"
      ? "Tersimpan otomatis · baru saja"
      : "Tersimpan otomatis · 12 detik lalu";
  return (
    <span className="text-[11px] text-sage tracking-[0.18em] uppercase font-semibold inline-flex items-center gap-[6px]">
      <Icon name="check" size={12} stroke="var(--color-sage)" /> {label}
    </span>
  );
}

// Screen 02 · Editor Undangan — desktop orchestrator. State + live preview come
// from useEditorState (shared with the mobile layout).
export function Editor({ data, chrome }: EditorProps) {
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

  const chapter = CHAPTERS[activeSection];
  // Chapter count + position come from the manifest (templates expose a subset).
  const groupIdx = groups.findIndex((g) => g.id === activeSection);
  const eyebrow = `Editor · Bab ${pad2(groupIdx >= 0 ? groupIdx + 1 : 1)} dari ${pad2(groups.length)}`;

  return (
    <DashboardShell active="editor" chrome={chrome}>
      <main className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar
          num=""
          eyebrow={eyebrow}
          title={
            <>
              {chapter.lead}
              <Em className="text-burgundy">{chapter.accent}</Em>
            </>
          }
          actions={
            <>
              <SaveIndicator status={status} />
              <a
                href={`/inv/${meta.slug}?preview=1`}
                target="_blank"
                rel="noopener"
              >
                <Button variant="ghost" type="button">
                  <Icon name="eye" size={14} />
                  Preview
                </Button>
              </a>
              {/* Paid-gated publish: flips status → live (see publishWedding). */}
              <PublishControl slug={meta.slug} initialStatus={meta.status} />
            </>
          }
        />

        <EditorSectionRail
          groups={groups}
          active={activeSection}
          done={done}
          onSelect={setActiveSection}
        />

        {/* Canvas: dark editing surface + live phone preview */}
        <div className="flex-1 grid grid-cols-[1fr_460px] overflow-hidden">
          <EditorCanvas>
            <ActiveSectionForm
              activeSection={activeSection}
              sections={sections}
              setSections={setSections}
              photos={gallery.photos}
              onStatusChange={setStatus}
            />
          </EditorCanvas>

          <EditorPhonePreview slug={meta.slug} previewData={previewData} />
        </div>
      </main>
    </DashboardShell>
  );
}
