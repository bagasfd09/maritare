import { notFound } from "next/navigation";

import { PaymentInstructions } from "@/components/templates/payment-instructions";
import { getPaymentOrder } from "@/server/queries/payment";

type PageProps = {
  params: Promise<{ invoiceNo: string }>;
};

// Our own payment screen for VA / QRIS orders. getPaymentOrder scopes the lookup
// to the signed-in member's wedding, so an invoice number from the URL alone
// resolves to nothing.
export default async function Page({ params }: PageProps) {
  const { invoiceNo } = await params;
  const order = await getPaymentOrder(invoiceNo);
  if (!order) {
    notFound();
  }

  return (
    <div className="px-5 py-8 lg:px-10 lg:py-[26px]">
      <PaymentInstructions order={order} />
    </div>
  );
}
