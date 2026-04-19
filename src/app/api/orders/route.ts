import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser, isAdmin, getTeamIdForUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });

  const supabase = await createClient();

  if (isAdmin(user.email!)) {
    const { data, error } = await supabase
      .from("orders")
      .select("*, teams(name)")
      .order("updated_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const orders = data.map((o) => ({ ...o, team_name: (o.teams as { name: string }).name }));
    return NextResponse.json(orders);
  }

  const teamId = await getTeamIdForUser(user.email!);
  if (!teamId) return NextResponse.json({ error: "Ingen tilknyttet lag" }, { status: 403 });

  const { data, error } = await supabase
    .from("orders")
    .select("*, teams(name)")
    .eq("team_id", teamId)
    .order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const orders = data.map((o) => ({ ...o, team_name: (o.teams as { name: string }).name }));
  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });

  const { team_id, contact_person } = await req.json();
  if (!team_id || !contact_person?.trim()) {
    return NextResponse.json({ error: "Lag og kontaktperson påkrevd" }, { status: 400 });
  }

  if (!isAdmin(user.email!)) {
    const teamId = await getTeamIdForUser(user.email!);
    if (teamId !== team_id) return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .insert({ team_id, contact_person: contact_person.trim() })
    .select("*, teams(name)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ...data, team_name: (data.teams as { name: string }).name }, { status: 201 });
}
