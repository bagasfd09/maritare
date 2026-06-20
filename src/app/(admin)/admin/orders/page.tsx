import { AdminOrders } from "@/components/templates/admin-orders";
import { AdminOrdersMobile } from "@/components/templates/admin-orders-mobile";
import { getAdminOrders } from "@/server/queries/admin";

export default async function Page() {
  const orders = await getAdminOrders();
  return (
    <>
      <div className="hidden lg:contents"><AdminOrders orders={orders} /></div>
      <AdminOrdersMobile orders={orders} />
    </>
  );
}
