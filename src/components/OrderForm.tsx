"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Article, Order, OrderItem, Status, Team } from "@/lib/types";
import OrderTable, { newRow, RowData } from "./OrderTable";

interface Props {
  order?: Order & { items: OrderItem[] };
  isAdmin: boolean;
}

export default function OrderForm({ order, isAdmin }: Props) {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [teamId, setTeamId] = useState<number | "">(order?.team_id ?? "");
  const [contact, setContact] = useState(order?.contact_person ?? "");
  const [status, setStatus] = useState<Status>(order?.status ?? "Utkast");
  const [rows, setRows] = useState<RowData[]>(() =>
    order?.items.map((i) => ({
      _id: String(i.id),
      article_id: i.article_id,
      size: i.size,
      print_name: i.print_name,
      print_number: i.print_number,
      quantity: i.quantity,
    })) ?? []
  );
  const [quickArticleId, setQuickArticleId] = useState<number | "">("");
  const [quickQty, setQuickQty] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const locked = status === "Videresendt til butikk";

  useEffect(() => {
    Promise.all([
      fetch("/api/teams").then((r) => r.json()),
      fetch("/api/articles").then((r) => r.json()),
    ]).then(([t, a]: [Team[], Article[]]) => {
      setTeams(t);
      setArticles(a);
      if (!quickArticleId && a.length > 0) setQuickArticleId(a[0].id);
      if (!order && t.length === 1) setTeamId(t[0].id);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const addRows = () => {
    if (!quickArticleId || quickQty < 1) return;
    const newRows = Array.from({ length: quickQty }, () => newRow(quickArticleId as number));
    setRows((prev) => [...prev, ...newRows]);
  };

  const save = async (saveStatus?: Status) => {
    setError("");
    if (!teamId || !contact.trim()) { setError("Lag og kontaktperson er påkrevd."); return; }
    setSaving(true);
    const finalStatus = saveStatus ?? status;
    try {
      let orderId: number;
      if (order) {
        orderId = order.id;
      } else {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ team_id: teamId, contact_person: contact }),
        });
        if (!res.ok) throw new Error((await res.json()).error);
        orderId = (await res.json()).id;
      }

      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact_person: contact, status: finalStatus, items: rows }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      router.push("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Noe gikk galt");
    } finally {
      setSaving(false);
    }
  };

  if (locked && !isAdmin) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <p className="text-green-800 font-medium text-lg mb-1">Bestillingen er videresendt til butikken</p>
        <p className="text-green-600 text-sm">Bestillingen kan ikke lenger endres.</p>
        <button onClick={() => router.push("/")} className="mt-4 px-4 py-2 border rounded text-sm hover:bg-gray-50">
          Tilbake
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</p>}

      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Bestillingsinfo</h2>
        <div className={`grid gap-4 ${isAdmin ? "grid-cols-3" : "grid-cols-2"}`}>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Lag</label>
            <select
              value={teamId}
              onChange={(e) => setTeamId(Number(e.target.value))}
              disabled={!!order || locked}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A31A] disabled:bg-gray-100"
            >
              <option value="">Velg lag...</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Kontaktperson</label>
            <input
              type="text" value={contact} onChange={(e) => setContact(e.target.value)}
              placeholder="Navn"
              disabled={locked}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A31A] disabled:bg-gray-100"
            />
          </div>
          {isAdmin && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select
                value={status} onChange={(e) => setStatus(e.target.value as Status)}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A31A]"
              >
                <option>Utkast</option>
                <option>Sendt</option>
                <option>Videresendt til butikk</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {!locked && (
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Legg til artikler</h2>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Artikkel</label>
              <select
                value={quickArticleId}
                onChange={(e) => setQuickArticleId(Number(e.target.value))}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A31A]"
              >
                {articles.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} ({a.article_number})</option>
                ))}
              </select>
            </div>
            <div className="w-28">
              <label className="block text-xs font-medium text-gray-600 mb-1">Antall rader</label>
              <input
                type="number" min={1} max={100} value={quickQty}
                onChange={(e) => setQuickQty(parseInt(e.target.value) || 1)}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A31A]"
              />
            </div>
            <button
              onClick={addRows}
              disabled={!quickArticleId}
              className="px-4 py-2 bg-[#F5A31A] text-black rounded hover:bg-[#D4880A] text-sm font-medium disabled:opacity-50 whitespace-nowrap"
            >
              + Legg til {quickQty} rad{quickQty !== 1 ? "er" : ""}
            </button>
          </div>
        </div>
      )}

      {rows.length > 0 && (
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">
              Bestillingslinje — {rows.length} rad{rows.length !== 1 ? "er" : ""}
            </h2>
            {!locked && (
              <button
                onClick={() => setRows([])}
                className="text-xs text-red-400 hover:text-red-600 hover:underline"
              >
                Tøm tabell
              </button>
            )}
          </div>
          <OrderTable articles={articles} rows={rows} onChange={locked ? () => {} : setRows} />
        </div>
      )}

      <div className="flex gap-3">
        {isAdmin ? (
          <button
            onClick={() => save()} disabled={saving}
            className="px-5 py-2 bg-[#F5A31A] text-black rounded hover:bg-[#D4880A] text-sm font-medium disabled:opacity-50"
          >
            {saving ? "Lagrer..." : "Lagre bestilling"}
          </button>
        ) : status === "Utkast" ? (
          <>
            <button
              onClick={() => save("Utkast")} disabled={saving}
              className="px-5 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              {saving ? "Lagrer..." : "Lagre utkast"}
            </button>
            <button
              onClick={() => save("Sendt")} disabled={saving}
              className="px-5 py-2 bg-[#F5A31A] text-black rounded hover:bg-[#D4880A] text-sm font-medium disabled:opacity-50"
            >
              {saving ? "Sender..." : "Send bestilling"}
            </button>
          </>
        ) : (
          <button
            onClick={() => save()} disabled={saving}
            className="px-5 py-2 bg-[#F5A31A] text-black rounded hover:bg-[#D4880A] text-sm font-medium disabled:opacity-50"
          >
            {saving ? "Lagrer..." : "Lagre endringer"}
          </button>
        )}
        <button
          onClick={() => router.push("/")}
          className="px-5 py-2 border rounded text-sm hover:bg-gray-50"
        >
          Avbryt
        </button>
      </div>
    </div>
  );
}
