"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Order, Status } from "@/lib/types";

const STATUS_COLORS: Record<Status, string> = {
  Utkast: "bg-yellow-100 text-yellow-800",
  Sendt: "bg-blue-100 text-blue-800",
  "Videresendt til butikk": "bg-green-100 text-green-800",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const load = async () => {
    const [ordersRes, meRes] = await Promise.all([
      fetch("/api/orders"),
      fetch("/api/me"),
    ]);
    setOrders(await ordersRes.json());
    const me = await meRes.json();
    setIsAdmin(me.isAdmin);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const exportExcel = (ids?: number[]) => {
    const params = ids ? `?orders=${ids.join(",")}` : "";
    window.location.href = `/api/export${params}`;
  };

  const deleteOrder = async (id: number) => {
    if (!confirm("Slette bestillingen?")) return;
    await fetch(`/api/orders/${id}`, { method: "DELETE" });
    load();
  };

  const markerVideresendt = async (id: number) => {
    if (!confirm("Marker som videresendt til butikk? Laget får e-postbeskjed og kan ikke lenger endre bestillingen.")) return;
    await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Videresendt til butikk" }),
    });
    load();
  };

  if (loading) return <p className="text-gray-500">Laster...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Bestillinger</h1>
        <div className="flex gap-2">
          {isAdmin && selected.size > 0 && (
            <button
              onClick={() => exportExcel([...selected])}
              className="px-4 py-2 bg-[#F5A31A] text-black rounded hover:bg-[#D4880A] text-sm font-medium"
            >
              Eksporter valgte ({selected.size})
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => exportExcel()}
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 text-sm"
            >
              Eksporter alle
            </button>
          )}
          <Link
            href="/orders/new"
            className="px-4 py-2 bg-[#F5A31A] text-black rounded hover:bg-[#D4880A] text-sm font-medium"
          >
            + Ny bestilling
          </Link>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">Ingen bestillinger ennå.</p>
          <Link href="/orders/new" className="text-blue-600 hover:underline mt-2 block">
            Opprett den første
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                {isAdmin && (
                  <th className="px-4 py-3 text-left w-8">
                    <input
                      type="checkbox"
                      checked={selected.size === orders.length && orders.length > 0}
                      onChange={() =>
                        setSelected(
                          selected.size === orders.length
                            ? new Set()
                            : new Set(orders.map((o) => o.id))
                        )
                      }
                    />
                  </th>
                )}
                <th className="px-4 py-3 text-left">Lag</th>
                <th className="px-4 py-3 text-left">Kontaktperson</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Oppdatert</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(order.id)}
                        onChange={() => toggleSelect(order.id)}
                      />
                    </td>
                  )}
                  <td className="px-4 py-3 font-medium">{order.team_name}</td>
                  <td className="px-4 py-3 text-gray-600">{order.contact_person}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(order.updated_at).toLocaleDateString("no-NO")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-3 justify-end">
                      {order.status !== "Videresendt til butikk" && (
                        <Link href={`/orders/${order.id}`} className="text-blue-600 hover:underline">
                          Rediger
                        </Link>
                      )}
                      {isAdmin && order.status === "Sendt" && (
                        <button
                          onClick={() => markerVideresendt(order.id)}
                          className="text-[#F5A31A] hover:underline font-medium"
                        >
                          Videresendt
                        </button>
                      )}
                      {isAdmin && (
                        <button onClick={() => deleteOrder(order.id)} className="text-red-500 hover:underline">
                          Slett
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
