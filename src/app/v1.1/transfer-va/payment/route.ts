// SNAP Virtual Account payment notification.
//
// The path is fixed by the SNAP spec — DOKU posts VA settlements to
// <merchant-domain>/v1.1/transfer-va/payment — so this route deliberately sits
// outside /api unlike the non-SNAP webhook. Logic lives in the shared handler
// so a second spec path (QRIS) is a two-line file.

export { handleSnapNotification as POST } from "@/server/doku-snap-notification";
