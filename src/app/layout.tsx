import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Skarp Utstyrsansvar",
  description: "Utstyrsstyring for FK Skarp",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="no">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        {user && <NavBar email={user.email!} isAdmin={isAdmin(user.email!)} />}
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
