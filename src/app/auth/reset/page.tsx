"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) { setError("Ugyldig eller utløpt lenke."); return; }
    const supabase = createClient();
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) setError("Ugyldig eller utløpt lenke.");
      else setReady(true);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passordene stemmer ikke overens."); return; }
    if (password.length < 6) { setError("Passordet må være minst 6 tegn."); return; }
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setDone(true);
    setTimeout(() => router.push("/"), 2000);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="Skarp IF" style={{ width: 120, height: "auto" }} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Nytt passord</h1>
          <p className="text-sm text-gray-500 mt-1">Velg et nytt passord for kontoen din</p>
        </div>

        {done ? (
          <div className="text-center space-y-2">
            <p className="font-medium text-green-700">Passordet er oppdatert!</p>
            <p className="text-sm text-gray-500">Du sendes videre...</p>
          </div>
        ) : error && !ready ? (
          <div className="text-center space-y-3">
            <p className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</p>
            <button onClick={() => router.push("/login")}
              className="text-sm text-[#F5A31A] hover:underline">
              Tilbake til innlogging
            </button>
          </div>
        ) : ready ? (
          <form onSubmit={submit} className="space-y-4">
            {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</p>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nytt passord</label>
              <input
                type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A31A]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bekreft passord</label>
              <input
                type="password" required value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A31A]"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full py-2.5 bg-black text-white rounded-lg hover:bg-[#F5A31A] hover:text-black text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? "Lagrer..." : "Sett nytt passord"}
            </button>
          </form>
        ) : (
          <p className="text-center text-sm text-gray-500">Verifiserer lenke...</p>
        )}
      </div>
    </div>
  );
}
