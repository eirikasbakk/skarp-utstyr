async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return;
  await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      to: [{ email: to }],
      sender: { email: process.env.BREVO_FROM_EMAIL ?? "noreply@skarp-utstyr.vercel.app", name: "Skarp Utstyr" },
      subject,
      htmlContent: html,
    }),
  });
}

export async function sendVideresendt(toEmail: string, teamName: string, orderId: number) {
  await sendEmail(
    toEmail,
    "Bestillingen din er videresendt til butikken",
    `<p>Hei!</p><p>Bestilling #${orderId} for ${teamName} er nå videresendt til butikken. Du kan ikke lenger gjøre endringer.</p><p>Hilsen Utstyrsansvarlig</p>`
  );
}

export async function sendTilAdmin(adminEmails: string[], teamName: string, orderId: number) {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "https://skarp-utstyr.vercel.app";
  for (const email of adminEmails) {
    await sendEmail(
      email,
      `Ny bestilling fra ${teamName}`,
      `<p>Hei!</p><p>${teamName} har sendt inn bestilling #${orderId} til gjennomgang.</p><p><a href="${base}/orders/${orderId}">Åpne bestillingen</a></p><p>Hilsen Skarp Utstyr</p>`
    );
  }
}
