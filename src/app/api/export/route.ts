import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser, isAdmin } from "@/lib/auth";
import * as XLSX from "xlsx";

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user || !isAdmin(user.email!)) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  const url = new URL(req.url);
  const orderIds = url.searchParams.get("orders");

  const supabase = await createClient();
  let query = supabase
    .from("order_items")
    .select("quantity, size, print_name, print_number, orders(contact_person, status, teams(name)), articles(name, article_number, price)");

  if (orderIds) {
    const ids = orderIds.split(",").map(Number).filter(Boolean);
    query = query.in("order_id", ids);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []).map((item) => {
    const order = item.orders as unknown as { contact_person: string; status: string; teams: { name: string } };
    const article = item.articles as unknown as { name: string; article_number: string; price: number };
    const qty = item.quantity as number;
    const price = article.price;
    return {
      Lag: order.teams.name,
      Kontaktperson: order.contact_person,
      Status: order.status,
      Artikkel: article.name,
      Artikkelnummer: article.article_number,
      Størrelse: item.size,
      "Trykk navn": item.print_name || "",
      "Trykk nummer": item.print_number || "",
      Antall: qty,
      Enhetspris: price,
      Totalpris: qty * price,
    };
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch: 18 }, { wch: 20 }, { wch: 12 }, { wch: 30 },
    { wch: 16 }, { wch: 10 }, { wch: 18 }, { wch: 14 },
    { wch: 8 }, { wch: 12 }, { wch: 12 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, "Bestillinger");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="skarp-bestillinger.xlsx"`,
    },
  });
}
