"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [resetSent, setResetSent] = useState(false);

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError("Feil e-post eller passord"); return; }
    window.location.href = "/";
  };

  const submitForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/reset`,
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setResetSent(true);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="Skarp IF" style={{ width: 120, height: "auto" }} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Skarp Utstyr</h1>
          <p className="text-sm text-gray-500 mt-1">
            {mode === "login" ? "Logg inn for å se bestillinger" : "Tilbakestill passord"}
          </p>
        </div>

        {mode === "login" ? (
          <form onSubmit={submitLogin} className="space-y-4">
            {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</p>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-postadresse</label>
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="din@epost.no"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A31A]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Passord</label>
              <input
                type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A31A]"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full py-2.5 bg-black text-white rounded-lg hover:bg-[#F5A31A] hover:text-black text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? "Logger inn..." : "Logg inn"}
            </button>
            <p className="text-center">
              <button type="button" onClick={() => { setMode("forgot"); setError(""); }}
                className="text-sm text-gray-500 hover:text-[#F5A31A] hover:underline">
                Glemt passord?
              </button>
            </p>
          </form>
        ) : resetSent ? (
          <div className="text-center space-y-3">
            <p className="font-medium text-gray-800">Sjekk e-posten din</p>
            <p className="text-sm text-gray-500">Vi har sendt en lenke til <strong>{email}</strong> for å tilbakestille passordet.</p>
            <button onClick={() => { setMode("login"); setResetSent(false); }}
              className="text-sm text-[#F5A31A] hover:underline">
              Tilbake til innlogging
            </button>
          </div>
        ) : (
          <form onSubmit={submitForgot} className="space-y-4">
            {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</p>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-postadresse</label>
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="din@epost.no"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A31A]"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full py-2.5 bg-black text-white rounded-lg hover:bg-[#F5A31A] hover:text-black text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? "Sender..." : "Send tilbakestillingslenke"}
            </button>
            <p className="text-center">
              <button type="button" onClick={() => { setMode("login"); setError(""); }}
                className="text-sm text-gray-500 hover:text-[#F5A31A] hover:underline">
                Tilbake til innlogging
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
