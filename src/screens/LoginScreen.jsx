import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { T, FONTS } from "../themes.js";

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const t = T.beauty;

  const inpStyle = {
    width: "100%", padding: "13px 16px", borderRadius: t.rsm,
    border: `1.5px solid ${t.border}`, background: t.bgInput,
    color: t.text, fontFamily: t.fontBody, fontSize: 15,
    outline: "none", boxSizing: "border-box",
  };

  const handle = async () => {
    setError(""); setSuccess("");
    if (!email || !password) return;
    setLoading(true);
    if (tab === "login") {
      const { error: err } = await signIn(email, password);
      if (err) setError(err.message);
    } else {
      const { error: err } = await signUp(email, password);
      if (err) setError(err.message);
      else setSuccess("Compte créé ! Vérifiez votre email pour confirmer.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      maxWidth: 430, margin: "0 auto", background: t.bg, minHeight: "100vh",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "32px 28px", fontFamily: t.fontBody,
    }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}`}</style>

      <div style={{ fontSize: 48, marginBottom: 14 }}>✂️💅</div>
      <div style={{ fontFamily: t.font, fontSize: 30, fontWeight: 700, color: t.text, marginBottom: 4, textAlign: "center" }}>
        BeautyFlow Pro
      </div>
      <div style={{ fontSize: 14, color: t.textMuted, marginBottom: 36, textAlign: "center" }}>
        L'agenda intelligent pour les professionnels
      </div>

      <div style={{ width: "100%", maxWidth: 340 }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, background: t.bgCard, padding: 4, borderRadius: t.r, border: `1px solid ${t.border}` }}>
          {[["login", "Connexion"], ["register", "Inscription"]].map(([id, lbl]) => (
            <button key={id} onClick={() => { setTab(id); setError(""); setSuccess(""); }}
              style={{ flex: 1, padding: "10px", border: "none", cursor: "pointer", borderRadius: t.rsm, background: tab === id ? t.primary : "transparent", color: tab === id ? t.textInv : t.textMuted, fontFamily: t.fontBody, fontWeight: 700, fontSize: 13, transition: "all 0.2s" }}>
              {lbl}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 6, letterSpacing: "0.04em" }}>EMAIL</div>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="pro@exemple.com" style={inpStyle}
              onFocus={e => e.target.style.borderColor = t.primary}
              onBlur={e => e.target.style.borderColor = t.border} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 6, letterSpacing: "0.04em" }}>MOT DE PASSE</div>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" style={inpStyle}
              onFocus={e => e.target.style.borderColor = t.primary}
              onBlur={e => e.target.style.borderColor = t.border}
              onKeyDown={e => e.key === "Enter" && handle()} />
          </div>

          {error && (
            <div style={{ fontSize: 13, color: "#EF4444", padding: "10px 14px", background: "#EF444408", borderRadius: t.rsm, border: "1px solid #EF444430" }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ fontSize: 13, color: "#10B981", padding: "10px 14px", background: "#10B98108", borderRadius: t.rsm, border: "1px solid #10B98130" }}>
              {success}
            </div>
          )}

          <button onClick={handle} disabled={loading || !email || !password}
            style={{ padding: "14px", borderRadius: t.rsm, border: "none", cursor: (!email || !password || loading) ? "not-allowed" : "pointer", background: (!email || !password || loading) ? t.bgMuted : t.primary, color: (!email || !password || loading) ? t.textMuted : t.textInv, fontFamily: t.fontBody, fontWeight: 700, fontSize: 15, transition: "all 0.2s", marginTop: 4 }}>
            {loading ? "..." : tab === "login" ? "Se connecter →" : "Créer mon compte →"}
          </button>
        </div>
      </div>
    </div>
  );
}
