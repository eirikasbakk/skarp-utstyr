import OrderForm from "@/components/OrderForm";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { notFound } from "next/navigation";

async function getOrder(id: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/orders/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function EditOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [order, user] = await Promise.all([getOrder(id), getSessionUser()]);
  if (!order) notFound();
  const admin = isAdmin(user?.email ?? "");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Rediger bestilling</h1>
      <OrderForm order={order} isAdmin={admin} />
    </div>
  );
}
