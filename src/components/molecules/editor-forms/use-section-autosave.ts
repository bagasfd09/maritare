"use client";

import { useCallback, useEffect, useRef, useTransition } from "react";

import {
  saveWeddingSection,
  type SaveWeddingSectionInput,
} from "@/server/actions/wedding";
import type { SectionId } from "@/lib/invitation/sections";
import type { EditorSaveStatus } from "@/components/molecules/editor-canvas";

// Idle delay before an autosave fires after the user stops typing.
const AUTOSAVE_DELAY_MS = 1500;

// The mutable slice a form contributes to a save. `data` is the COMPLETE
// section payload (the action replaces it wholesale); title/body/done are the
// jsonb meta fields. All optional — a form sends only what it owns.
export type SectionPayload = {
  title?: string;
  body?: string;
  done?: boolean;
  data?: Record<string, unknown>;
};

type UseSectionAutosaveArgs = {
  sectionId: SectionId;
  /** Snapshot the form's current values into the save payload. */
  buildPayload: () => SectionPayload;
  onStatusChange?: (status: EditorSaveStatus) => void;
};

export type SectionAutosave = {
  /** Schedule a debounced save (call on every change). */
  scheduleSave: () => void;
  /** Flush a pending save immediately (call on blur). No-op if none pending. */
  flush: () => void;
  /**
   * Save immediately, bypassing the debounce — for discrete actions (toggles,
   * file upload done, link saved) that should persist right away rather than
   * after an idle delay. Unlike `flush`, it does not require a pending timer.
   * Pass the fresh payload when calling synchronously after a state change (the
   * internal snapshot only refreshes on the next render).
   */
  saveNow: (payload?: SectionPayload) => void;
};

/**
 * Debounced autosave for a single editor section.
 *
 * Extracted from the original EditorCanvas: 1.5s debounce, flush-on-blur,
 * status callbacks driving the topbar indicator. `buildPayload` is read fresh
 * at fire time, so the latest form state is always saved.
 *
 * Lint notes (this repo is strict):
 *  - `buildPayload`/`onStatusChange` are mirrored into refs inside an effect
 *    (never written during render → react-hooks/refs is satisfied).
 *  - no setState happens inside an effect here → react-hooks/set-state-in-effect
 *    is not triggered (status updates fire from event-driven callbacks).
 */
export function useSectionAutosave({
  sectionId,
  buildPayload,
  onStatusChange,
}: UseSectionAutosaveArgs): SectionAutosave {
  const [, startTransition] = useTransition();

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Mirror the latest callbacks so the timer always fires against fresh values
  // without re-creating the scheduler. Written only in an effect (not render).
  const buildPayloadRef = useRef(buildPayload);
  const onStatusChangeRef = useRef(onStatusChange);

  useEffect(() => {
    buildPayloadRef.current = buildPayload;
    onStatusChangeRef.current = onStatusChange;
  }, [buildPayload, onStatusChange]);

  // Clear any pending timer on unmount. Touches only the timer ref — no state.
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const runSave = useCallback((override?: SectionPayload) => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    // `override` carries fresh values for synchronous saveNow() calls (the ref is
    // only updated after the next render); debounced/blur saves read the ref.
    const payload = override ?? buildPayloadRef.current();
    const input: SaveWeddingSectionInput = { sectionId, ...payload };
    onStatusChangeRef.current?.({ state: "saving" });
    startTransition(async () => {
      const result = await saveWeddingSection(input);
      if (result.ok) {
        onStatusChangeRef.current?.({ state: "saved", savedAt: result.savedAt });
      } else {
        onStatusChangeRef.current?.({ state: "error", message: result.error });
      }
    });
  }, [sectionId, startTransition]);

  const scheduleSave = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(runSave, AUTOSAVE_DELAY_MS);
  }, [runSave]);

  const flush = useCallback(() => {
    if (timerRef.current !== null) {
      runSave();
    }
  }, [runSave]);

  return { scheduleSave, flush, saveNow: runSave };
}
