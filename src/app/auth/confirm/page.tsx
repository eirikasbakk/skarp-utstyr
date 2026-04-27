"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    const code = searchParams.get("code");
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type") as "signup" | "recovery" | null;

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) setError("Ugyldig eller utløpt lenke.");
        else router.push("/");
      });
    } else if (tokenHash && type) {
      supabase.auth.verifyOtp({ token_hash: tokenHash, type }).then(({ error }) => {
        if (error) setError("Ugyldig eller utløpt lenke.");
        else router.push("/");
      });
    } else {
      router.push("/");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center">
        <div className="flex justify-center mb-4">
          <img src="/logo.png" alt="Skarp IF" style={{ width: 120, height: "auto" }} />
        </div>
        {error ? (
          <div className="space-y-3">
            <p className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</p>
            <a href="/login" className="text-sm text-[#F5A31A] hover:underline block">
              Tilbake til innlogging
            </a>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Bekrefter konto...</p>
        )}
      </div>
    </div>
  );
}
