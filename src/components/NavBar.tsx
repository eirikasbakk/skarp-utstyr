"use client";
import Image from "next/image";
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
    <nav className="bg-black text-white shadow">
      <div className="max-w-5xl mx-auto px-4 py-2 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image src="/logo.png" alt="Skarp IF" width={48} height={48} className="invert" />
          <span className="font-bold text-lg tracking-tight">Skarp Utstyr</span>
        </Link>
        <Link href="/" className="text-gray-400 hover:text-[#F5A31A] text-sm transition-colors">Bestillinger</Link>
        <Link href="/orders/new" className="text-gray-400 hover:text-[#F5A31A] text-sm transition-colors">Ny bestilling</Link>
        {isAdmin && (
          <Link href="/admin" className="text-gray-400 hover:text-[#F5A31A] text-sm transition-colors">Admin</Link>
        )}
        <div className="ml-auto flex items-center gap-4">
          <span className="text-gray-500 text-xs">{email}</span>
          <button onClick={logout} className="text-gray-400 hover:text-[#F5A31A] text-sm transition-colors">Logg ut</button>
        </div>
      </div>
    </nav>
  );
}
