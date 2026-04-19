import { NextResponse } from "next/server";
import { getSessionUser, isAdmin, getTeamIdForUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });

  const admin = isAdmin(user.email!);
  const teamId = admin ? null : await getTeamIdForUser(user.email!);

  return NextResponse.json({ isAdmin: admin, teamId, email: user.email });
}
