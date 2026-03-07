import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabase.js";
import { T } from "../themes.js";

export default function ConfirmBookingScreen() {
  const { token } = useParams();
  const navigate = useNavigate();
  const t = T.beauty;
  const [status, setStatus] = useState("loading"); // loading | success | already | notfound | error
  const [apt, setApt] = useState(null);

  useEffect(() => {
    if (token) confirm();
  }, [token]);

  const confirm = async () => {
    // Find appointment by token
    const { data, error } = await supabase
      .from("appointments")
      .select("id, status, service_name, date, time, price, duration_min, pro_id")
      .eq("confirmation_token", token)
      .maybeSingle();

    if (error || !data) { setStatus("notfound"); return; }

    if (data.status === "confirmed") { setApt(data); setStatus("already"); return; }
    if (data.status === "cancelled") { setApt(data); setStatus("cancelled"); return; }

    // Update to confirmed
    const { error: updErr } = await supabase
      .from("appointments")
      .update({ status: "confirmed" })
      .eq("confirmation_token", token);

    if (updErr) { setStatus("error"); return; }

    // Fetch pro name
    const { data: pro } = await supabase.from("profiles").select("business_name, slug").eq("id", data.pro_id).maybeSingle();
    setApt({ ...data, proName: pro?.business_name, proSlug: pro?.slug });
    setStatus("success");
  };

  const pulse = { background: `linear-gradient(90deg,${t.bgCard} 25%,${t.bgMuted} 50%,${t.bgCard} 75%)`, backgroundSize: "200% 100%", animation: "shimmer 1.4s ease-in-out infinite", borderRadius: t.rsm };

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", background: t.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px", fontFamily: t.fontBody }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;} @keyframes pop{from{transform:scale(0.8);opacity:0;}to{transform:scale(1);opacity:1;}} @keyframes shimmer{0%{background-position:200% 0;}100%{background-position:-200% 0;}}`}</style>

      {status === "loading" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ position: "relative", width: 64, height: 64 }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `3px solid ${t.primary}20` }} />
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid transparent", borderTopColor: t.primary, animation: "spin 0.9s linear infinite" }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>✉️</div>
          </div>
          <div style={{ fontSize: 14, color: t.textMuted, letterSpacing: "0.04em" }}>Validation en cours...</div>
        </div>
      )}

      {status === "success" && (
        <>
          <div style={{ fontSize: 64, animation: "pop 0.4s ease", marginBottom: 16 }}>✅</div>
          <div style={{ fontFamily: t.font, fontSize: 26, fontWeight: 700, color: t.text, textAlign: "center", marginBottom: 8 }}>
            Rendez-vous confirmé !
          </div>
          <div style={{ fontSize: 14, color: t.textMuted, textAlign: "center", lineHeight: 1.7, marginBottom: 24, maxWidth: 300 }}>
            Votre RDV est maintenant visible sur l'agenda de <strong style={{ color: t.text }}>{apt?.proName}</strong>.
          </div>
          {apt && (
            <div style={{ background: `${t.primary}10`, border: `1px solid ${t.primary}25`, borderRadius: t.r, padding: "18px 24px", width: "100%", textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontFamily: t.font, fontSize: 22, fontWeight: 700, color: t.primary }}>{apt.date} · {apt.time?.slice(0,5)}</div>
              <div style={{ fontSize: 13, color: t.textMuted, marginTop: 4 }}>{apt.service_name} · {apt.duration_min} min · {apt.price}€</div>
              <div style={{ fontSize: 12, marginTop: 8, padding: "4px 12px", background: t.sCfm?.bg || "#E8F5E9", color: t.sCfm?.color || "#2E7D32", borderRadius: t.rpill, display: "inline-block", fontWeight: 700 }}>✓ Confirmé</div>
            </div>
          )}
          <button onClick={() => navigate("/explore")} style={{ color: t.primary, background: "none", border: "none", cursor: "pointer", fontSize: 14, fontFamily: t.fontBody }}>← Trouver d'autres pros</button>
        </>
      )}

      {status === "already" && (
        <>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📅</div>
          <div style={{ fontFamily: t.font, fontSize: 22, fontWeight: 700, color: t.text, textAlign: "center", marginBottom: 8 }}>Déjà confirmé</div>
          <div style={{ fontSize: 14, color: t.textMuted, textAlign: "center", lineHeight: 1.6 }}>Ce rendez-vous a déjà été confirmé.</div>
          <button onClick={() => navigate("/explore")} style={{ marginTop: 20, color: t.primary, background: "none", border: "none", cursor: "pointer", fontSize: 14, fontFamily: t.fontBody }}>← Explorer</button>
        </>
      )}

      {(status === "notfound" || status === "cancelled") && (
        <>
          <div style={{ fontSize: 64, marginBottom: 16 }}>❌</div>
          <div style={{ fontFamily: t.font, fontSize: 22, fontWeight: 700, color: t.text, textAlign: "center", marginBottom: 8 }}>
            {status === "cancelled" ? "RDV annulé" : "Lien invalide"}
          </div>
          <div style={{ fontSize: 14, color: t.textMuted, textAlign: "center", lineHeight: 1.6 }}>
            {status === "cancelled" ? "Ce rendez-vous a été annulé." : "Ce lien de confirmation est invalide ou a expiré."}
          </div>
          <button onClick={() => navigate("/explore")} style={{ marginTop: 20, color: t.primary, background: "none", border: "none", cursor: "pointer", fontSize: 14, fontFamily: t.fontBody }}>← Retour à la recherche</button>
        </>
      )}

      {status === "error" && (
        <>
          <div style={{ fontSize: 64, marginBottom: 16 }}>⚠️</div>
          <div style={{ fontFamily: t.font, fontSize: 22, fontWeight: 700, color: t.text, textAlign: "center", marginBottom: 8 }}>Erreur technique</div>
          <div style={{ fontSize: 14, color: t.textMuted, textAlign: "center", lineHeight: 1.6 }}>Impossible de confirmer le RDV pour le moment. Réessayez plus tard.</div>
          <button onClick={() => window.location.reload()} style={{ marginTop: 20, color: t.primary, background: "none", border: "none", cursor: "pointer", fontSize: 14, fontFamily: t.fontBody }}>Réessayer</button>
        </>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}
