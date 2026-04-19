"use client";
import { useEffect, useState } from "react";
import { Article, Team } from "@/lib/types";

export default function AdminPage() {
  const [tab, setTab] = useState<"articles" | "teams">("articles");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin</h1>
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("articles")}
          className={`px-4 py-2 rounded text-sm font-medium ${tab === "articles" ? "bg-blue-600 text-white" : "bg-white border hover:bg-gray-50"}`}
        >
          Artikler
        </button>
        <button
          onClick={() => setTab("teams")}
          className={`px-4 py-2 rounded text-sm font-medium ${tab === "teams" ? "bg-blue-600 text-white" : "bg-white border hover:bg-gray-50"}`}
        >
          Lag
        </button>
      </div>
      {tab === "articles" ? <ArticlesPanel /> : <TeamsPanel />}
    </div>
  );
}

function TeamsPanel() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [form, setForm] = useState({ name: "", email: "" });
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [error, setError] = useState("");

  const load = async () => setTeams(await fetch("/api/teams").then((r) => r.json()));
  useEffect(() => { load(); }, []);

  const add = async () => {
    setError("");
    if (!form.name.trim()) return;
    const res = await fetch("/api/teams", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) { setError((await res.json()).error); return; }
    setForm({ name: "", email: "" }); load();
  };

  const save = async (id: number) => {
    setError("");
    const res = await fetch(`/api/teams/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (!res.ok) { setError((await res.json()).error); return; }
    setEditId(null); load();
  };

  const remove = async (id: number) => {
    if (!confirm("Slette laget? Alle tilknyttede bestillinger slettes også.")) return;
    await fetch(`/api/teams/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="max-w-xl">
      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      <div className="bg-white rounded-lg shadow p-4 mb-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Nytt lag</h2>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Lagnavn (f.eks. G14)"
            className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Lagleders e-post (valgfritt)"
            className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button onClick={add} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
          Legg til lag
        </button>
      </div>

      <div className="bg-white rounded-lg shadow divide-y text-sm">
        {teams.length === 0 && <p className="p-4 text-gray-400">Ingen lag ennå.</p>}
        {teams.map((t) => (
          <div key={t.id} className="px-4 py-3">
            {editId === t.id ? (
              <div className="grid grid-cols-2 gap-2">
                <input autoFocus value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="e-post" className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <div className="col-span-2 flex gap-2">
                  <button onClick={() => save(t.id)} className="text-blue-600 text-sm hover:underline">Lagre</button>
                  <button onClick={() => setEditId(null)} className="text-gray-400 text-sm hover:underline">Avbryt</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <span className="font-medium">{t.name}</span>
                  {t.email && <span className="text-gray-400 ml-2 text-xs">{t.email}</span>}
                </div>
                <button onClick={() => { setEditId(t.id); setEditForm({ name: t.name, email: t.email ?? "" }); }}
                  className="text-blue-500 hover:underline">Rediger</button>
                <button onClick={() => remove(t.id)} className="text-red-500 hover:underline">Slett</button>
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-3">
        Lagleders e-post brukes til innlogging — de ser kun sitt eget lag.
      </p>
    </div>
  );
}

function ArticlesPanel() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [form, setForm] = useState({ name: "", article_number: "", price: "", sizes: "" });
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: "", article_number: "", price: "", sizes: "" });
  const [error, setError] = useState("");

  const load = async () => setArticles(await fetch("/api/articles").then((r) => r.json()));
  useEffect(() => { load(); }, []);

  const parseSizes = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

  const add = async () => {
    setError("");
    if (!form.name.trim() || !form.article_number.trim()) { setError("Navn og artikkelnummer er påkrevd."); return; }
    const res = await fetch("/api/articles", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, price: parseFloat(form.price) || 0, sizes: parseSizes(form.sizes) }),
    });
    if (!res.ok) { setError((await res.json()).error); return; }
    setForm({ name: "", article_number: "", price: "", sizes: "" }); load();
  };

  const saveEdit = async (id: number) => {
    setError("");
    const res = await fetch(`/api/articles/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editForm, price: parseFloat(editForm.price) || 0, sizes: parseSizes(editForm.sizes) }),
    });
    if (!res.ok) { setError((await res.json()).error); return; }
    setEditId(null); load();
  };

  const remove = async (id: number) => {
    if (!confirm("Slette artikkelen?")) return;
    await fetch(`/api/articles/${id}`, { method: "DELETE" }); load();
  };

  return (
    <div>
      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Ny artikkel</h2>
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Navn" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input placeholder="Artikkelnummer" value={form.article_number} onChange={(e) => setForm({ ...form, article_number: e.target.value })}
            className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input placeholder="Pris (kr)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input placeholder="Størrelser (S, M, L, XL)" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })}
            className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button onClick={add} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
          Legg til artikkel
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Navn</th>
              <th className="px-4 py-3 text-left">Art.nr</th>
              <th className="px-4 py-3 text-left">Pris</th>
              <th className="px-4 py-3 text-left">Størrelser</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {articles.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-gray-400 text-center">Ingen artikler ennå.</td></tr>
            )}
            {articles.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                {editId === a.id ? (
                  <>
                    <td className="px-4 py-2"><input autoFocus value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full border rounded px-2 py-1 text-sm" /></td>
                    <td className="px-4 py-2"><input value={editForm.article_number} onChange={(e) => setEditForm({ ...editForm, article_number: e.target.value })} className="w-full border rounded px-2 py-1 text-sm" /></td>
                    <td className="px-4 py-2"><input type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} className="w-full border rounded px-2 py-1 text-sm" /></td>
                    <td className="px-4 py-2"><input value={editForm.sizes} onChange={(e) => setEditForm({ ...editForm, sizes: e.target.value })} placeholder="S, M, L" className="w-full border rounded px-2 py-1 text-sm" /></td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => saveEdit(a.id)} className="text-blue-600 text-sm hover:underline">Lagre</button>
                        <button onClick={() => setEditId(null)} className="text-gray-400 text-sm hover:underline">Avbryt</button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 font-medium">{a.name}</td>
                    <td className="px-4 py-3 text-gray-500">{a.article_number}</td>
                    <td className="px-4 py-3">{a.price > 0 ? `${a.price.toFixed(2)} kr` : "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{a.sizes.length > 0 ? a.sizes.join(", ") : "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-3 justify-end">
                        <button onClick={() => { setEditId(a.id); setEditForm({ name: a.name, article_number: a.article_number, price: String(a.price), sizes: a.sizes.join(", ") }); }}
                          className="text-blue-500 text-sm hover:underline">Rediger</button>
                        <button onClick={() => remove(a.id)} className="text-red-500 text-sm hover:underline">Slett</button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
