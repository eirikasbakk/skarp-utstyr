import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser, isAdmin, getTeamIdForUser } from "@/lib/auth";
import { sendVideresendt } from "@/lib/email";
import { Status } from "@/lib/types";

async function canAccessOrder(userEmail: string, orderId: string): Promise<boolean> {
  if (isAdmin(userEmail)) return true;
  const supabase = await createClient();
  const { data } = await supabase.from("orders").select("team_id").eq("id", orderId).single();
  if (!data) return false;
  const teamId = await getTeamIdForUser(userEmail);
  return teamId === data.team_id;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });

  const { id } = await params;
  if (!(await canAccessOrder(user.email!, id))) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*, teams(name, email)")
    .eq("id", id)
    .single();
  if (!order) return NextResponse.json({ error: "Ikke funnet" }, { status: 404 });

  const { data: items } = await supabase
    .from("order_items")
    .select("*, articles(name, article_number, price)")
    .eq("order_id", id);

  const mappedItems = (items ?? []).map((i) => ({
    ...i,
    article_name: (i.articles as { name: string; article_number: string; price: number }).name,
    article_number: (i.articles as { name: string; article_number: string; price: number }).article_number,
    price: (i.articles as { name: string; article_number: string; price: number }).price,
  }));

  return NextResponse.json({
    ...order,
    team_name: (order.teams as { name: string }).name,
    items: mappedItems,
  });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });

  const { id } = await params;
  if (!(await canAccessOrder(user.email!, id))) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("orders")
    .select("status, team_id, teams(name, email)")
    .eq("id", id)
    .single();

  if (!existing) return NextResponse.json({ error: "Ikke funnet" }, { status: 404 });

  if (!isAdmin(user.email!) && existing.status === "Videresendt til butikk") {
    return NextResponse.json({ error: "Bestillingen er låst og kan ikke endres" }, { status: 403 });
  }

  const { contact_person, status, items } = await req.json();
  const adminStatuses: Status[] = ["Utkast", "Sendt", "Videresendt til butikk"];
  const lagStatuses: Status[] = ["Utkast", "Sendt"];
  const allowed = isAdmin(user.email!) ? adminStatuses : lagStatuses;

  if (status && !allowed.includes(status)) {
    return NextResponse.json({ error: "Ugyldig status" }, { status: 400 });
  }

  const { error } = await supabase
    .from("orders")
    .update({ contact_person, status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (items !== undefined) {
    await supabase.from("order_items").delete().eq("order_id", id);
    const validItems = items.filter((i: { quantity: number }) => i.quantity > 0);
    if (validItems.length > 0) {
      await supabase.from("order_items").insert(
        validItems.map((i: { article_id: number; size: string; quantity: number; print_name?: string; print_number?: string }) => ({
          order_id: Number(id),
          article_id: i.article_id,
          size: i.size ?? "",
          quantity: i.quantity,
          print_name: i.print_name ?? "",
          print_number: i.print_number ?? "",
        }))
      );
    }
  }

  if (status === "Videresendt til butikk" && existing.status !== "Videresendt til butikk") {
    const team = (existing.teams as unknown) as { name: string; email: string | null };
    if (team.email) {
      await sendVideresendt(team.email, team.name, Number(id));
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });

  const { id } = await params;
  if (!(await canAccessOrder(user.email!, id))) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  const supabase = await createClient();
  await supabase.from("orders").delete().eq("id", id);
  return NextResponse.json({ success: true });
}
