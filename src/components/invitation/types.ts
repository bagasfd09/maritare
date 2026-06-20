import type { InvitationView } from "@/server/queries/invitation";

/**
 * Props every renderable invitation template accepts.
 *
 * - `public`        — a live invitation viewed by a guest (forms active).
 * - `ownerPreview`  — a non-live invitation viewed by its owner (forms disabled).
 * - `editorPreview` — rendered inside the editor's phone frame, fed by client
 *                     state (no audio autoplay, cover skippable, forms disabled).
 */
export type InvitationTemplateProps = {
  data: InvitationView;
  /** Sanitized guest display name from ?to= (cover personalization). */
  guestName?: string;
  /**
   * Guest resolved from the personalized invite link's short code (?g=<code>).
   * Drives the in-invitation check-in QR (Folk Garden). Null/undefined when
   * there's no guest context (owner preview, generic link) — templates that
   * show a QR section fall back to a sample.
   */
  checkin?: { guestId: string; guestName: string; responded: boolean } | null;
  mode: "public" | "ownerPreview" | "editorPreview";
};
