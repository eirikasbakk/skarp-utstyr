import { createClient } from "@/lib/supabase/server";

export async function getSessionUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export function isAdmin(email: string): boolean {
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.toLowerCase());
}

export async function getTeamIdForUser(email: string): Promise<number | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("teams")
    .select("id")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  return data?.id ?? null;
}
