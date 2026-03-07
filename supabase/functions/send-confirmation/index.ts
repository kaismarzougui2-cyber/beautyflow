import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "noreply@beautyflow.fr";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, content-type",
      },
    });
  }

  try {
    const {
      token, clientName, clientEmail, clientPhone,
      proName, proCity, serviceName, date, time, price, confirmUrl,
    } = await req.json();

    if (!clientEmail || !token) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:'Jost',Arial,sans-serif;background:#FAF5F9;margin:0;padding:0;">
  <div style="max-width:520px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:42px;margin-bottom:12px;">✂️💅</div>
      <div style="font-size:28px;font-weight:700;color:#1A0A12;">BeautyFlow</div>
    </div>
    <div style="background:#fff;border-radius:18px;border:1px solid #F0C0D8;padding:32px;margin-bottom:20px;">
      <div style="font-size:20px;font-weight:700;color:#1A0A12;margin-bottom:8px;">
        Bonjour ${clientName || ""},
      </div>
      <div style="font-size:15px;color:#9C4068;margin-bottom:24px;line-height:1.6;">
        Votre demande de rendez-vous chez <strong style="color:#1A0A12;">${proName}</strong> a bien été reçue.
        <br>Confirmez-le en cliquant sur le bouton ci-dessous.
      </div>

      <div style="background:#FAF5F9;border-radius:12px;border:1px solid #F0C0D8;padding:18px 20px;margin-bottom:24px;">
        <div style="font-size:13px;font-weight:700;color:#9C4068;letter-spacing:0.06em;margin-bottom:10px;">RÉCAPITULATIF</div>
        <div style="font-size:16px;font-weight:700;color:#1A0A12;">${serviceName}</div>
        <div style="font-size:14px;color:#9C4068;margin-top:4px;">📅 ${date} à ${time}</div>
        <div style="font-size:14px;color:#9C4068;margin-top:2px;">📍 ${proName}${proCity ? ` · ${proCity}` : ""}</div>
        ${clientPhone ? `<div style="font-size:14px;color:#9C4068;margin-top:2px;">📞 ${clientPhone}</div>` : ""}
        <div style="font-size:22px;font-weight:700;color:#C2185B;margin-top:10px;">${price}€</div>
      </div>

      <a href="${confirmUrl}" style="display:block;text-align:center;background:#C2185B;color:#fff;text-decoration:none;padding:16px 24px;border-radius:12px;font-weight:700;font-size:16px;box-shadow:0 4px 20px rgba(194,24,91,0.25);">
        ✓ Confirmer mon rendez-vous
      </a>

      <div style="text-align:center;margin-top:12px;font-size:12px;color:#9C4068;">
        Ou copiez ce lien : <a href="${confirmUrl}" style="color:#C2185B;">${confirmUrl}</a>
      </div>
    </div>

    <div style="text-align:center;font-size:12px;color:#C06080;line-height:1.6;">
      Si vous n'êtes pas à l'origine de cette réservation, ignorez cet email.<br>
      Le rendez-vous sera visible sur l'agenda du pro uniquement après confirmation.
    </div>
  </div>
</body>
</html>`;

    if (!RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not set — email not sent");
      return new Response(JSON.stringify({ ok: true, warning: "No email provider configured" }), { status: 200 });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [clientEmail],
        subject: `Confirmez votre RDV chez ${proName} — ${date} à ${time}`,
        html,
      }),
    });

    const data = await res.json();
    return new Response(JSON.stringify({ ok: true, data }), {
      status: res.ok ? 200 : 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
