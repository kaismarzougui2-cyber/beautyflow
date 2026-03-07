import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { T } from "../themes.js";

function ThemeSlider({ themeId, onChange }) {
  const isBarber = themeId === "barber";
  const track = isBarber ? "#E8A020" : "#C2185B";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
      <span style={{ fontSize: 14, opacity: isBarber ? 0.45 : 1, transition: "opacity 0.3s" }}>🌸</span>
      <button
        onClick={() => onChange(isBarber ? "beauty" : "barber")}
        style={{
          position: "relative", width: 52, height: 28, borderRadius: 14,
          background: track, border: "none", cursor: "pointer",
          transition: "background 0.35s", flexShrink: 0, padding: 0,
          boxShadow: `0 2px 8px ${isBarber ? "rgba(232,160,32,0.35)" : "rgba(194,24,91,0.25)"}`,
        }}
        aria-label="Changer le thème"
      >
        <span style={{
          position: "absolute", top: 4, left: isBarber ? 24 : 4,
          width: 20, height: 20, borderRadius: "50%",
          background: "#fff", transition: "left 0.3s cubic-bezier(.4,0,.2,1)",
          boxShadow: "0 1px 5px rgba(0,0,0,0.2)", display: "flex",
          alignItems: "center", justifyContent: "center", fontSize: 10,
        }}>
          {isBarber ? "✂️" : "🌸"}
        </span>
      </button>
      <span style={{ fontSize: 14, opacity: isBarber ? 1 : 0.45, transition: "opacity 0.3s" }}>✂️</span>
      <span style={{ fontSize: 11, color: isBarber ? "#94A3B8" : "#9C4068", fontWeight: 600, letterSpacing: "0.04em", transition: "color 0.3s" }}>
        {isBarber ? "BARBIER" : "BEAUTÉ"}
      </span>
    </div>
  );
}

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [themeId, setThemeId] = useState("beauty");
  const [mode, setMode] = useState("pro");
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isClient = mode === "client";
  const t = T[themeId];

  const reset = () => { setEmail(""); setPassword(""); setError(""); setSuccess(""); };
  const switchMode = (m) => { setMode(m); reset(); setTab("login"); };

  const handle = async () => {
    setError(""); setSuccess("");
    if (!email || !password) return;
    setLoading(true);

    if (tab === "login") {
      const { error: err } = await signIn(email, password);
      if (err) { setError(err.message); setLoading(false); return; }
      if (isClient) {
        const pendingKey = Object.keys(sessionStorage).find(k => k.startsWith("bf_pending_"));
        if (pendingKey) {
          const slug = pendingKey.replace("bf_pending_", "");
          navigate(`/pro/${slug}`);
        } else {
          navigate("/explore");
        }
      }
    } else {
      const { error: err } = await signUp(email, password);
      if (err) { setError(err.message); setLoading(false); return; }
      if (isClient) {
        setSuccess("Compte créé ! Vérifiez votre email puis reconnectez-vous.");
      } else {
        setSuccess("Compte créé ! Vérifiez votre email pour confirmer.");
      }
    }
    setLoading(false);
  };

  const inpStyle = {
    width: "100%", padding: "13px 16px", borderRadius: t.rsm,
    border: `1.5px solid ${t.border}`, background: t.bgInput,
    color: t.text, fontFamily: t.fontBody, fontSize: 15,
    outline: "none", boxSizing: "border-box",
  };

  const canSubmit = email && password && !loading;

  return (
    <div style={{
      maxWidth: 430, margin: "0 auto", background: t.bg, minHeight: "100vh",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "32px 28px", fontFamily: t.fontBody,
      transition: "background 0.4s",
    }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes slideUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:none;}}
        @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
      `}</style>

      <ThemeSlider themeId={themeId} onChange={setThemeId} />

      <div style={{ fontSize: 48, marginBottom: 14, animation: "pop 0.3s ease" }} key={themeId}>
        {themeId === "barber" ? "✂️🪒" : "✂️💅"}
      </div>
      <div style={{ fontFamily: t.font, fontSize: 30, fontWeight: 700, color: t.text, marginBottom: 4, textAlign: "center", transition: "color 0.4s" }}>
        BeautyFlow
      </div>
      <div style={{ fontSize: 14, color: t.textMuted, marginBottom: 28, textAlign: "center", transition: "color 0.4s" }}>
        {isClient ? "Réservez chez votre pro préféré" : "L'agenda intelligent pour les professionnels"}
      </div>

      {/* Mode selector */}
      <div style={{ display: "flex", gap: 0, marginBottom: 28, background: t.bgCard, padding: 4, borderRadius: t.r, border: `1px solid ${t.border}`, width: "100%", maxWidth: 340, transition: "background 0.4s, border-color 0.4s" }}>
        {[["pro", "✂️  Je suis un pro"], ["client", "💅  Je suis un client"]].map(([id, lbl]) => (
          <button
            key={id}
            onClick={() => switchMode(id)}
            style={{
              flex: 1, padding: "11px 8px", border: "none", cursor: "pointer",
              borderRadius: t.rsm,
              background: mode === id ? t.primary : "transparent",
              color: mode === id ? t.textInv : t.textMuted,
              fontFamily: t.fontBody, fontWeight: 700, fontSize: 12,
              transition: "all 0.2s", letterSpacing: "0.02em",
            }}
          >
            {lbl}
          </button>
        ))}
      </div>

      <div style={{ width: "100%", maxWidth: 340, animation: "slideUp 0.2s ease" }} key={mode}>
        {isClient && (
          <div style={{
            background: `${t.primary}10`, border: `1px solid ${t.primary}25`,
            borderRadius: t.rsm, padding: "10px 14px", marginBottom: 20,
            fontSize: 13, color: t.textMuted, lineHeight: 1.5,
            display: "flex", gap: 10, alignItems: "flex-start",
          }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>ℹ️</span>
            <span>
              Votre compte client vous permet de gérer vos réservations.<br />
              <strong style={{ color: t.primary }}>Pas de compte ?</strong> Vous pouvez aussi réserver directement depuis la page d'un pro.
            </span>
          </div>
        )}

        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: t.bgCard, padding: 4, borderRadius: t.r, border: `1px solid ${t.border}` }}>
          {[["login", "Connexion"], ["register", "Inscription"]].map(([id, lbl]) => (
            <button
              key={id}
              onClick={() => { setTab(id); setError(""); setSuccess(""); }}
              style={{
                flex: 1, padding: "10px", border: "none", cursor: "pointer",
                borderRadius: t.rsm,
                background: tab === id ? t.primary : "transparent",
                color: tab === id ? t.textInv : t.textMuted,
                fontFamily: t.fontBody, fontWeight: 700, fontSize: 13, transition: "all 0.2s",
              }}
            >
              {lbl}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 6, letterSpacing: "0.04em" }}>EMAIL</div>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder={isClient ? "vous@exemple.com" : "pro@exemple.com"}
              style={inpStyle}
              onFocus={e => e.target.style.borderColor = t.primary}
              onBlur={e => e.target.style.borderColor = t.border}
            />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 6, letterSpacing: "0.04em" }}>MOT DE PASSE</div>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" style={inpStyle}
              onFocus={e => e.target.style.borderColor = t.primary}
              onBlur={e => e.target.style.borderColor = t.border}
              onKeyDown={e => e.key === "Enter" && handle()}
            />
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

          <button
            onClick={handle}
            disabled={!canSubmit}
            style={{
              padding: "14px", borderRadius: t.rsm, border: "none",
              cursor: canSubmit ? "pointer" : "not-allowed",
              background: canSubmit ? t.primary : t.bgMuted,
              color: canSubmit ? t.textInv : t.textMuted,
              fontFamily: t.fontBody, fontWeight: 700, fontSize: 15,
              transition: "all 0.2s", marginTop: 4,
              boxShadow: canSubmit ? `0 4px 20px ${t.primaryGlow}` : "none",
            }}
          >
            {loading ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                Connexion...
              </span>
            ) : tab === "login"
              ? (isClient ? "Accéder à mes réservations →" : "Se connecter →")
              : (isClient ? "Créer mon compte client →" : "Créer mon compte →")
            }
          </button>

          {isClient && (
            <button
              onClick={() => navigate("/explore")}
              style={{
                padding: "12px", borderRadius: t.rsm, border: `1.5px solid ${t.border}`,
                cursor: "pointer", background: "transparent",
                color: t.textMuted, fontFamily: t.fontBody, fontWeight: 600, fontSize: 13,
                transition: "all 0.2s",
              }}
            >
              Parcourir sans compte →
            </button>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}} @keyframes pop{from{transform:scale(0.8);opacity:0;}to{transform:scale(1);opacity:1;}}`}</style>
    </div>
  );
}
