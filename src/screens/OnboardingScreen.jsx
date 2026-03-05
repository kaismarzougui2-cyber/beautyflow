import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { T } from "../themes.js";

export default function OnboardingScreen() {
  const { saveProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", businessType: "beauty", businessName: "", city: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const t = T[form.businessType];

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const finish = async () => {
    setLoading(true);
    const slug = form.businessName
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "pro";
    await saveProfile({
      name: form.name,
      business_name: form.businessName,
      business_type: form.businessType,
      city: form.city,
      phone: form.phone,
      slug,
      theme_id: form.businessType,
    });
    setLoading(false);
  };

  const inpStyle = {
    width: "100%", padding: "13px 16px", borderRadius: t.rsm,
    border: `1.5px solid ${t.border}`, background: t.bgInput,
    color: t.text, fontFamily: t.fontBody, fontSize: 14,
    outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{
      maxWidth: 430, margin: "0 auto", background: t.bg,
      minHeight: "100vh", padding: "40px 24px", fontFamily: t.fontBody,
      transition: "background 0.3s",
    }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}`}</style>

      {/* Progress bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 36 }}>
        {[1, 2].map(s => (
          <div key={s} style={{ flex: 1, height: 4, borderRadius: 4, background: s <= step ? t.primary : t.border, transition: "background 0.3s" }} />
        ))}
      </div>

      {step === 1 && (
        <>
          <div style={{ fontFamily: t.font, fontSize: 28, fontWeight: 700, color: t.text, marginBottom: 6 }}>Bienvenue !</div>
          <div style={{ fontSize: 14, color: t.textMuted, marginBottom: 28, lineHeight: 1.5 }}>
            Configurons votre espace professionnel en 2 minutes.
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 8, letterSpacing: "0.04em" }}>VOTRE PRENOM & NOM</div>
            <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Marie Dupont" style={inpStyle}
              onFocus={e => e.target.style.borderColor = t.primary}
              onBlur={e => e.target.style.borderColor = t.border} />
          </div>

          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 10, letterSpacing: "0.04em" }}>VOTRE METIER</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[["beauty", "🌸", "Coiffure & Beauté"], ["barber", "✂️", "Barbier"]].map(([id, ic, lbl]) => (
                <div key={id} onClick={() => set("businessType", id)} style={{ padding: "20px 14px", borderRadius: t.r, cursor: "pointer", border: `2px solid ${form.businessType === id ? T[id].primary : t.border}`, background: form.businessType === id ? `${T[id].primary}15` : t.bgCard, textAlign: "center", transition: "all 0.2s" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{ic}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{lbl}</div>
                  {form.businessType === id && <div style={{ fontSize: 11, color: T[id].primary, fontWeight: 700, marginTop: 6 }}>✓ Sélectionné</div>}
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => form.name && setStep(2)} disabled={!form.name}
            style={{ width: "100%", padding: "14px", borderRadius: t.rsm, border: "none", cursor: form.name ? "pointer" : "not-allowed", background: form.name ? t.primary : t.bgMuted, color: form.name ? t.textInv : t.textMuted, fontFamily: t.fontBody, fontWeight: 700, fontSize: 15, transition: "all 0.2s" }}>
            Continuer →
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <div style={{ fontFamily: t.font, fontSize: 28, fontWeight: 700, color: t.text, marginBottom: 6 }}>Votre établissement</div>
          <div style={{ fontSize: 14, color: t.textMuted, marginBottom: 28, lineHeight: 1.5 }}>
            Ces infos apparaîtront sur votre page de réservation publique.
          </div>

          {[["NOM DE L'ETABLISSEMENT", "businessName", "Salon de Coiffure Marie"], ["VILLE", "city", "Paris"], ["TELEPHONE", "phone", "06 xx xx xx xx"]].map(([label, key, ph]) => (
            <div key={key} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 8, letterSpacing: "0.04em" }}>{label}</div>
              <input value={form[key]} onChange={e => set(key, e.target.value)} placeholder={ph} style={inpStyle}
                onFocus={e => e.target.style.borderColor = t.primary}
                onBlur={e => e.target.style.borderColor = t.border} />
            </div>
          ))}

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button onClick={() => setStep(1)}
              style={{ flex: 1, padding: "14px", borderRadius: t.rsm, border: `1.5px solid ${t.border}`, cursor: "pointer", background: "transparent", color: t.text, fontFamily: t.fontBody, fontWeight: 600, fontSize: 14 }}>
              ← Retour
            </button>
            <button onClick={finish} disabled={loading || !form.businessName || !form.city}
              style={{ flex: 2, padding: "14px", borderRadius: t.rsm, border: "none", cursor: (loading || !form.businessName || !form.city) ? "not-allowed" : "pointer", background: (loading || !form.businessName || !form.city) ? t.bgMuted : t.primary, color: (loading || !form.businessName || !form.city) ? t.textMuted : t.textInv, fontFamily: t.fontBody, fontWeight: 700, fontSize: 15, transition: "all 0.2s" }}>
              {loading ? "Création..." : "Démarrer l'app"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
