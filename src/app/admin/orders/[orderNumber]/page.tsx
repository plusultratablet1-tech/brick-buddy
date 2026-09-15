import { AdminOrderDetail } from "@/components/admin-order-detail";

export default async function AdminOrderPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  return <AdminOrderDetail orderNumber={orderNumber} />;
}
