import { useState, useEffect } from "react";
import { Routes, Route, useParams, useNavigate, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { T, FONTS } from "./themes.js";
import DashboardScreen from "./screens/DashboardScreen.jsx";
import AgendaScreen from "./screens/AgendaScreen.jsx";
import ClientsScreen from "./screens/ClientsScreen.jsx";
import ServicesScreen from "./screens/ServicesScreen.jsx";
import SettingsScreen from "./screens/SettingsScreen.jsx";
import LoginScreen from "./screens/LoginScreen.jsx";
import OnboardingScreen from "./screens/OnboardingScreen.jsx";
import ExploreScreen from "./screens/ExploreScreen.jsx";
import PublicProScreen from "./screens/PublicProScreen.jsx";
import PublicPageScreen from "./screens/PublicPageScreen.jsx";
import ConfirmBookingScreen from "./screens/ConfirmBookingScreen.jsx";

const NAV = [
  { id: "dashboard", icon: "📊", label: "Dashboard" },
  { id: "agenda",    icon: "📅", label: "Agenda" },
  { id: "page",      icon: "🌐", label: "Ma Page" },
  { id: "services",  icon: "✨", label: "Services" },
  { id: "settings",  icon: "⚙️", label: "Réglages" },
];

// Shared loading screen
function LoadingScreen() {
  const tb = T.beauty;
  return (
    <div style={{ maxWidth: 430, margin: "0 auto", background: tb.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, fontFamily: tb.fontBody }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.4;}} @keyframes spin{to{transform:rotate(360deg);}}`}</style>
      <div style={{ position: "relative", width: 72, height: 72 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `3px solid ${tb.primary}20` }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid transparent", borderTopColor: tb.primary, animation: "spin 0.9s linear infinite" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>✂️</div>
      </div>
      <div style={{ fontSize: 13, color: tb.textMuted, animation: "pulse 1.5s ease-in-out infinite", letterSpacing: "0.06em", fontWeight: 600 }}>
        BEAUTYFLOW
      </div>
    </div>
  );
}

// Pro dashboard — only reachable if role='pro' AND has a profile
function AppShell() {
  const { profile } = useAuth();
  const [screen, setScreen] = useState("dashboard");

  const themeId = profile?.theme_id || "beauty";
  const t = T[themeId];
  const proName = profile?.name || "";
  const proType = profile
    ? `${profile.business_name || ""}${profile.city ? " · " + profile.city : ""}`
    : "";

  useEffect(() => {
    const id = `bf-font-${themeId}`;
    if (!document.getElementById(id)) {
      const l = document.createElement("link");
      l.id = id; l.rel = "stylesheet"; l.href = FONTS[themeId];
      document.head.appendChild(l);
    }
  }, [themeId]);

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", background: t.bg, minHeight: "100vh", position: "relative", overflowX: "hidden", fontFamily: t.fontBody }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;height:3px;}
        ::-webkit-scrollbar-thumb{background:${t.border};border-radius:2px;}
        input[type=date]::-webkit-calendar-picker-indicator{filter:${t.id === "barber" ? "invert(1)" : "none"};}
        input::placeholder{color:${t.textSoft};opacity:0.7;}
        select{appearance:none;}
        @keyframes slideUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:none;}}
        @keyframes pop{from{transform:scale(0.8);opacity:0;}to{transform:scale(1);opacity:1;}}
      `}</style>

      <div key={screen} style={{ animation: "slideUp 0.25s ease" }}>
        {screen === "dashboard" && <DashboardScreen t={t} proName={proName} proType={proType} onGoToPage={() => setScreen("page")} />}
        {screen === "agenda"    && <AgendaScreen t={t} />}
        {screen === "clients"   && <ClientsScreen t={t} />}
        {screen === "page"      && <PublicPageScreen t={t} onGoToServices={() => setScreen("services")} onGoToSettings={() => setScreen("settings")} />}
        {screen === "services"  && <ServicesScreen t={t} />}
        {screen === "settings"  && <SettingsScreen t={t} proType={proType} currentTheme={themeId} onScreenChange={setScreen} />}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: t.navBg, borderTop: `1px solid ${t.border}`, padding: "6px 0 16px", display: "flex", backdropFilter: "blur(24px)", zIndex: 100, boxShadow: `0 -4px 20px ${t.primaryGlow}` }}>
        {NAV.map(item => {
          const active = screen === item.id;
          return (
            <button key={item.id} onClick={() => setScreen(item.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer", padding: "4px 0", flex: 1, transition: "all 0.18s" }}>
              <div style={{ fontSize: 20, transition: "all 0.2s", filter: active ? "none" : "grayscale(70%) opacity(0.5)", transform: active ? "scale(1.12)" : "scale(1)" }}>{item.icon}</div>
              <div style={{ fontSize: 9, fontFamily: t.fontBody, fontWeight: 700, color: active ? t.primary : t.textSoft, transition: "color 0.2s", letterSpacing: "0.04em", textTransform: "uppercase" }}>{item.label}</div>
              {active && <div style={{ width: 16, height: 3, borderRadius: t.rpill, background: t.primary, animation: "pop 0.2s ease" }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Central routing guard — handles the catch-all "*" route.
 *
 * role = user_metadata.role  (set at signup)
 *   'client' → always go to /explore (client interface)
 *   'pro'    → pro interface or onboarding if no profile yet
 *   undefined (legacy) → infer from profile presence
 */
function AppRouter() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const t = T.beauty;

  // Still loading auth state
  if (user === undefined) return <LoadingScreen />;

  // Not authenticated → login
  if (!user) return <LoginScreen />;

  const role = user.user_metadata?.role;

  // ── CLIENT account ──────────────────────────────────────────────────────
  // Client accounts are never allowed into the pro interface.
  if (role === "client") {
    return <Navigate to="/explore" replace />;
  }

  // ── PRO account (role='pro' or legacy without role but has profile) ─────
  // No profile yet → onboarding
  if (!profile) {
    // Legacy accounts with no role: give them a choice
    if (!role) {
      return (
        <div style={{ maxWidth: 430, margin: "0 auto", background: t.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px", fontFamily: t.fontBody, gap: 16 }}>
          <style>{`*{box-sizing:border-box;margin:0;padding:0;}`}</style>
          <div style={{ fontSize: 52 }}>✂️💅</div>
          <div style={{ fontFamily: t.font, fontSize: 22, fontWeight: 700, color: t.text, textAlign: "center" }}>Quel type de compte ?</div>
          <div style={{ fontSize: 14, color: t.textMuted, textAlign: "center", lineHeight: 1.6 }}>
            Votre compte a été créé avant la séparation client/pro.<br />Choisissez votre espace :
          </div>
          <button onClick={() => navigate("/explore")} style={{ width: "100%", maxWidth: 300, padding: "14px", borderRadius: t.rsm, border: "none", background: t.primary, color: t.textInv, fontFamily: t.fontBody, fontWeight: 700, fontSize: 15, cursor: "pointer", boxShadow: `0 4px 20px ${t.primaryGlow}` }}>
            💅 Accéder à l'espace client
          </button>
          <button onClick={() => navigate("/onboarding")} style={{ width: "100%", maxWidth: 300, padding: "13px", borderRadius: t.rsm, border: `1.5px solid ${t.border}`, background: "transparent", color: t.text, fontFamily: t.fontBody, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
            ✂️ Configurer mon compte professionnel
          </button>
          <button onClick={signOut} style={{ fontSize: 13, color: t.textMuted, background: "none", border: "none", cursor: "pointer", fontFamily: t.fontBody, marginTop: 4 }}>
            Se déconnecter
          </button>
        </div>
      );
    }
    // role='pro', no profile → onboarding
    return <OnboardingScreen />;
  }

  // ── PRO with profile → dashboard ────────────────────────────────────────
  return <AppShell />;
}

// Wrapper to extract slug param from URL
function PublicProRoute() {
  const { slug } = useParams();
  return <PublicProScreen slug={slug} />;
}

export default function BeautyFlowPro() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/explore"          element={<ExploreScreen />} />
        <Route path="/pro/:slug"        element={<PublicProRoute />} />
        <Route path="/confirm/:token"   element={<ConfirmBookingScreen />} />
        <Route path="/onboarding"       element={<OnboardingScreen />} />
        <Route path="*"                 element={<AppRouter />} />
      </Routes>
    </AuthProvider>
  );
}
