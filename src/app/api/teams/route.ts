import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser, isAdmin } from "@/lib/auth";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("teams").select("*").order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || !isAdmin(user.email!)) return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });

  const { name, email } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Navn påkrevd" }, { status: 400 });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teams")
    .insert({ name: name.trim(), email: email?.trim().toLowerCase() || null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Lagnavn finnes allerede" }, { status: 409 });
  return NextResponse.json(data, { status: 201 });
}
