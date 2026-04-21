"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function KontoPage() {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passordene stemmer ikke overens."); return; }
    if (password.length < 6) { setError("Passordet må være minst 6 tegn."); return; }
    setError("");
    setLoading(true);
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) { setError("Ikke innlogget."); setLoading(false); return; }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: current,
    });
    if (signInError) { setError("Nåværende passord er feil."); setLoading(false); return; }

    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setDone(true);
  };

  return (
    <div className="max-w-sm mx-auto mt-8">
      <h1 className="text-xl font-bold mb-6">Endre passord</h1>
      {done ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center space-y-3">
          <p className="font-medium text-green-800">Passordet er oppdatert!</p>
          <button onClick={() => router.push("/")} className="text-sm text-[#F5A31A] hover:underline">
            Tilbake til forsiden
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="bg-white rounded-lg shadow p-6 space-y-4">
          {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nåværende passord</label>
            <input
              type="password" required value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="••••••••"
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A31A]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nytt passord</label>
            <input
              type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A31A]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bekreft nytt passord</label>
            <input
              type="password" required value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A31A]"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="submit" disabled={loading}
              className="px-5 py-2 bg-black text-white rounded hover:bg-[#F5A31A] hover:text-black text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? "Lagrer..." : "Endre passord"}
            </button>
            <button type="button" onClick={() => router.push("/")}
              className="px-5 py-2 border rounded text-sm hover:bg-gray-50">
              Avbryt
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
