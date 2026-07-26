// SNAP QRIS MPM payment notification.
//
// Like the VA route (src/app/v1.1/transfer-va/payment/route.ts), the path is
// fixed by the SNAP spec — DOKU posts QRIS settlements to
// <merchant-domain>/v1.0/qr/qr-mpm-notify — so it sits outside /api. The shared
// handler already parses the QRIS payload shape (originalPartnerReferenceNo,
// latestTransactionStatus).

export { handleSnapNotification as POST } from "@/server/doku-snap-notification";
