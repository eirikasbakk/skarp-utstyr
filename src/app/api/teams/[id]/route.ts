import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser, isAdmin } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || !isAdmin(user.email!)) return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });

  const { id } = await params;
  const { name, email } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Navn påkrevd" }, { status: 400 });

  const supabase = await createClient();
  const { error } = await supabase
    .from("teams")
    .update({ name: name.trim(), email: email?.trim().toLowerCase() || null })
    .eq("id", id);

  if (error) return NextResponse.json({ error: "Lagnavn finnes allerede" }, { status: 409 });
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || !isAdmin(user.email!)) return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });

  const { id } = await params;
  const supabase = await createClient();
  await supabase.from("teams").delete().eq("id", id);
  return NextResponse.json({ success: true });
}
