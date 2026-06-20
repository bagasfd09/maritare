"use client";

// Dark editing surface SHELL. Keeps the editor's visual identity (the
// #1a1410 cream-on-dark canvas + scroller chrome) and renders the active
// section form passed in as children. Cerita-specific inputs moved into
// `editor-forms/cerita-form.tsx`; every section now renders its own form here.
//
// `EditorSaveStatus` still lives here (its original home) so the forms and the
// topbar indicator keep importing the type from a stable path.

// Save lifecycle surfaced to the topbar indicator. `savedAt` is an ISO string.
export type EditorSaveStatus =
  | { state: "idle"; savedAt?: string }
  | { state: "saving" }
  | { state: "saved"; savedAt: string }
  | { state: "error"; message: string };

type EditorCanvasProps = {
  /** The active section's form. */
  children: React.ReactNode;
};

export function EditorCanvas({ children }: EditorCanvasProps) {
  return (
    <div className="px-[60px] py-11 overflow-y-auto bg-[#1a1410] text-cream">{children}</div>
  );
}
