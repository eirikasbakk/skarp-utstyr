export async function sendVideresendt(toEmail: string, teamName: string, orderId: number) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Skarp Utstyr <noreply@skarp-utstyr.vercel.app>",
      to: toEmail,
      subject: "Bestillingen din er videresendt til butikken",
      html: `<p>Hei!</p><p>Bestilling #${orderId} for ${teamName} er nå videresendt til butikken. Du kan ikke lenger gjøre endringer.</p><p>Hilsen Utstyrsansvarlig</p>`,
    }),
  });
}
