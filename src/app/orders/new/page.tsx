import OrderForm from "@/components/OrderForm";
import { getSessionUser, isAdmin } from "@/lib/auth";

export default async function NewOrderPage() {
  const user = await getSessionUser();
  const admin = isAdmin(user?.email ?? "");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Ny bestilling</h1>
      <OrderForm isAdmin={admin} />
    </div>
  );
}
