import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser, isAdmin } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || !isAdmin(user.email!)) return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });

  const { id } = await params;
  const { name, article_number, price, sizes } = await req.json();
  if (!name?.trim() || !article_number?.trim()) {
    return NextResponse.json({ error: "Navn og artikkelnummer påkrevd" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("articles")
    .update({ name: name.trim(), article_number: article_number.trim(), price: price ?? 0, sizes: sizes ?? [] })
    .eq("id", id);

  if (error) return NextResponse.json({ error: "Artikkelnummer finnes allerede" }, { status: 409 });
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || !isAdmin(user.email!)) return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });

  const { id } = await params;
  const supabase = await createClient();
  await supabase.from("articles").delete().eq("id", id);
  return NextResponse.json({ success: true });
}
