import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser, isAdmin } from "@/lib/auth";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("articles").select("*").order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || !isAdmin(user.email!)) return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });

  const { name, article_number, price, sizes } = await req.json();
  if (!name?.trim() || !article_number?.trim()) {
    return NextResponse.json({ error: "Navn og artikkelnummer påkrevd" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .insert({ name: name.trim(), article_number: article_number.trim(), price: price ?? 0, sizes: sizes ?? [] })
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Artikkelnummer finnes allerede" }, { status: 409 });
  return NextResponse.json(data, { status: 201 });
}
