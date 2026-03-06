import { useState, useEffect } from "react";
import { Routes, Route, useParams } from "react-router-dom";
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

const NAV = [
  { id: "dashboard", icon: "📊", label: "Dashboard" },
  { id: "agenda",    icon: "📅", label: "Agenda" },
  { id: "clients",   icon: "👥", label: "Clients" },
  { id: "services",  icon: "✨", label: "Services" },
  { id: "settings",  icon: "⚙️", label: "Réglages" },
];

function AppShell() {
  const { user, profile } = useAuth();
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

  // Loading
  if (user === undefined) {
    return (
      <div style={{ maxWidth: 430, margin: "0 auto", background: T.beauty.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 36 }}>✂️</div>
      </div>
    );
  }

  // Not logged in
  if (!user) return <LoginScreen />;

  // Logged in but no profile yet
  if (!profile) return <OnboardingScreen />;

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
        {screen === "dashboard" && <DashboardScreen t={t} proName={proName} proType={proType} />}
        {screen === "agenda"    && <AgendaScreen t={t} />}
        {screen === "clients"   && <ClientsScreen t={t} />}
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

// Wrapper to extract slug param from URL
function PublicProRoute() {
  const { slug } = useParams();
  return <PublicProScreen slug={slug} />;
}

export default function BeautyFlowPro() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/explore" element={<ExploreScreen />} />
        <Route path="/pro/:slug" element={<PublicProRoute />} />
        <Route path="*" element={<AppShell />} />
      </Routes>
    </AuthProvider>
  );
}
