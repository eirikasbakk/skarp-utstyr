"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Props {
  email: string;
  isAdmin: boolean;
}

export default function NavBar({ email, isAdmin }: Props) {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <nav className="bg-blue-700 text-white shadow">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-6">
        <Link href="/" className="font-bold text-lg tracking-tight">⚽ Skarp Utstyr</Link>
        <Link href="/" className="text-blue-100 hover:text-white text-sm">Bestillinger</Link>
        <Link href="/orders/new" className="text-blue-100 hover:text-white text-sm">Ny bestilling</Link>
        {isAdmin && (
          <Link href="/admin" className="text-blue-100 hover:text-white text-sm">Admin</Link>
        )}
        <div className="ml-auto flex items-center gap-4">
          <span className="text-blue-200 text-xs">{email}</span>
          <button onClick={logout} className="text-blue-100 hover:text-white text-sm">Logg ut</button>
        </div>
      </div>
    </nav>
  );
}
