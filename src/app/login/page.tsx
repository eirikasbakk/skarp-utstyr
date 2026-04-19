"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">⚽</div>
          <h1 className="text-xl font-bold text-gray-900">Skarp Utstyr</h1>
          <p className="text-sm text-gray-500 mt-1">Logg inn for å se bestillinger</p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="text-4xl mb-3">📧</div>
            <p className="font-medium text-gray-800">Sjekk e-posten din</p>
            <p className="text-sm text-gray-500 mt-2">
              Vi har sendt en innloggingslenke til <strong>{email}</strong>
            </p>
            <button
              onClick={() => setSent(false)}
              className="mt-4 text-sm text-blue-600 hover:underline"
            >
              Prøv en annen e-postadresse
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</p>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-postadresse</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="din@epost.no"
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
            >
              {loading ? "Sender..." : "Send innloggingslenke"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
