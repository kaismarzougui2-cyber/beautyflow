import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase.js";
import { T } from "../themes.js";
import { useAuth } from "../context/AuthContext.jsx";
import CityAutocomplete from "../components/CityAutocomplete.jsx";

const CATS = [
  { id: "all",    label: "Tous",             icon: "🔍" },
  { id: "beauty", label: "Coiffure & Beauté", icon: "🌸" },
  { id: "barber", label: "Barbier",           icon: "✂️" },
];

const STATUS_LABEL = {
  confirmed: "Confirmé", pending: "En attente", pending_confirmation: "En attente d'email",
  cancelled: "Annulé", done: "Terminé", no_show: "No-show",
};
const STATUS_COLOR = {
  confirmed:            { bg: "#E8F5E9", color: "#2E7D32" },
  pending:              { bg: "#FFF8E1", color: "#F57F17" },
  pending_confirmation: { bg: "#FFF8E1", color: "#B45309" },
  cancelled:            { bg: "#FFEBEE", color: "#C62828" },
  done:                 { bg: "#E3F2FD", color: "#1565C0" },
  no_show:              { bg: "#FCE4EC", color: "#AD1457" },
};

function ProSkeleton({ t }) {
  const pulse = {
    background: `linear-gradient(90deg, ${t.bgCard} 25%, ${t.bgMuted} 50%, ${t.bgCard} 75%)`,
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s ease-in-out infinite",
    borderRadius: t.rsm,
  };
  return (
    <div style={{ background: t.bgCard, borderRadius: t.r, border: `1px solid ${t.border}`, padding: "16px", display: "flex", gap: 14, alignItems: "center" }}>
      <div style={{ width: 52, height: 52, borderRadius: t.rsm, flexShrink: 0, ...pulse }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ height: 14, width: "60%", ...pulse }} />
        <div style={{ height: 11, width: "40%", ...pulse }} />
        <div style={{ height: 18, width: 80, borderRadius: t.rpill, ...pulse }} />
      </div>
    </div>
  );
}

// Week appointments section for logged-in clients
function ClientAppointments({ t, user }) {
  const navigate = useNavigate();
  const [apts, setApts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  const getWeekRange = () => {
    const today = new Date();
    const end = new Date(today);
    end.setDate(today.getDate() + 7);
    return {
      start: today.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    };
  };

  useEffect(() => { if (user) loadApts(); }, [user]);

  const loadApts = async () => {
    setLoading(true);
    const { start, end } = getWeekRange();
    const { data } = await supabase
      .from("appointments")
      .select("id, service_name, date, time, duration_min, price, status, pro_id, confirmation_token")
      .eq("client_id", user.id)
      .gte("date", start)
      .lte("date", end)
      .neq("status", "cancelled")
      .order("date")
      .order("time");
    // Fetch pro names
    const proIds = [...new Set((data || []).map(a => a.pro_id))];
    let proMap = {};
    if (proIds.length > 0) {
      const { data: pros } = await supabase.from("profiles").select("id, business_name, slug").in("id", proIds);
      (pros || []).forEach(p => { proMap[p.id] = p; });
    }
    setApts((data || []).map(a => ({ ...a, pro: proMap[a.pro_id] || null })));
    setLoading(false);
  };

  const cancel = async (id) => {
    setCancelling(id);
    await supabase.from("appointments").update({ status: "cancelled" }).eq("id", id);
    setApts(prev => prev.filter(a => a.id !== id));
    setCancelling(null);
  };

  const fmtDate = (d) => {
    if (!d) return "";
    const [y, m, day] = d.split("-");
    const DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const MONTHS = ["jan.", "fév.", "mar.", "avr.", "mai", "juin", "juil.", "août", "sep.", "oct.", "nov.", "déc."];
    const date = new Date(d + "T12:00:00");
    return `${DAYS[date.getDay()]} ${parseInt(day)} ${MONTHS[parseInt(m) - 1]}`;
  };

  if (loading) return null;
  if (apts.length === 0) return null;

  return (
    <div style={{ padding: "0 16px 8px", animation: "slideUp 0.25s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: t.textMuted, letterSpacing: "0.04em" }}>MES RDV CETTE SEMAINE</div>
        <div style={{ width: 20, height: 20, borderRadius: t.rpill, background: t.primary, color: t.textInv, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{apts.length}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {apts.map(apt => {
          const sc = STATUS_COLOR[apt.status] || STATUS_COLOR.pending;
          const isPending = apt.status === "pending_confirmation";
          return (
            <div key={apt.id} style={{ background: t.bgCard, borderRadius: t.r, border: `1px solid ${t.border}`, padding: "14px 16px", boxShadow: t.shadow }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: t.text, marginBottom: 3 }}>
                    {apt.service_name || "RDV"}
                  </div>
                  <div style={{ fontSize: 12, color: t.textMuted }}>
                    {apt.pro?.business_name && (
                      <span
                        onClick={() => apt.pro?.slug && navigate(`/pro/${apt.pro.slug}`)}
                        style={{ cursor: apt.pro?.slug ? "pointer" : "default", color: t.primary, fontWeight: 600 }}
                      >
                        {apt.pro.business_name}
                      </span>
                    )}
                    {apt.pro?.business_name && " · "}
                    📅 {fmtDate(apt.date)} à {apt.time?.slice(0,5)}
                  </div>
                  <div style={{ fontSize: 12, color: t.textMuted, marginTop: 1 }}>
                    {apt.duration_min} min · {apt.price}€
                  </div>
                  {isPending && (
                    <div style={{ fontSize: 11, color: "#B45309", marginTop: 5, background: "#FFF8E1", padding: "4px 8px", borderRadius: t.rsm, display: "inline-block" }}>
                      ⚠️ Confirmez par email pour valider ce RDV
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                  <span style={{ padding: "3px 10px", borderRadius: t.rpill, background: sc.bg, color: sc.color, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>
                    {isPending ? "⏳ " : ""}{STATUS_LABEL[apt.status] || apt.status}
                  </span>
                  <button
                    onClick={() => cancel(apt.id)}
                    disabled={cancelling === apt.id}
                    style={{ fontSize: 11, color: "#EF4444", background: "none", border: "1px solid #EF444430", borderRadius: t.rsm, padding: "4px 10px", cursor: "pointer", fontFamily: t.fontBody, fontWeight: 600, transition: "all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#EF444410"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
                  >
                    {cancelling === apt.id ? "..." : "Annuler"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ExploreScreen() {
  const t = T.beauty;
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [city, setCity] = useState("");
  const [cat, setCat] = useState("all");
  const [pros, setPros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  // Show appointments only for clients (logged in but no pro profile)
  const isClient = user && !profile;

  const search = async (overrideCity, overrideCat) => {
    const searchCity = overrideCity !== undefined ? overrideCity : city;
    const searchCat  = overrideCat  !== undefined ? overrideCat  : cat;
    if (!searchCity) return;
    setLoading(true);
    setSearched(true);
    setError("");

    let query = supabase
      .from("profiles")
      .select("id, name, business_name, city, slug, theme_id, business_type")
      .ilike("city", searchCity);

    if (searchCat !== "all") query = query.eq("theme_id", searchCat);

    const { data, error: supaErr } = await query.order("business_name");

    if (supaErr) {
      setError("rls");
      setPros([]);
    } else {
      setPros((data || []).filter(p => p.slug && p.slug !== "null" && p.slug !== "undefined"));
    }
    setLoading(false);
  };

  const handleCatChange = (newCat) => {
    setCat(newCat);
    if (searched && city) search(city, newCat);
  };

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", background: t.bg, minHeight: "100vh", fontFamily: t.fontBody }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes slideUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:none;}}
        @keyframes shimmer{0%{background-position:200% 0;}100%{background-position:-200% 0;}}
        @keyframes spin{to{transform:rotate(360deg);}}
      `}</style>

      {/* Hero */}
      <div style={{ background: "linear-gradient(160deg,#FDE9F4,#FAF5F9)", padding: "48px 24px 28px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 140, height: 140, borderRadius: "50%", background: `${t.primary}10`, pointerEvents: "none" }} />

        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          style={{ position: "absolute", top: 16, left: 16, display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", border: `1px solid ${t.border}`, borderRadius: t.rpill, padding: "6px 14px 6px 10px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: t.text, fontFamily: t.fontBody, boxShadow: t.shadow, transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = t.shadowHover; e.currentTarget.style.transform = "translateX(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = t.shadow; e.currentTarget.style.transform = "none"; }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>←</span>
          <span>Retour</span>
        </button>

        <div style={{ fontSize: 44, marginBottom: 14, marginTop: 8 }}>✂️💅</div>
        <div style={{ fontFamily: t.font, fontSize: 30, fontWeight: 700, color: t.text, lineHeight: 1.1 }}>Trouvez votre pro</div>
        <div style={{ fontSize: 14, color: t.textMuted, marginTop: 6, lineHeight: 1.5 }}>Salons & barbiers — réservez en ligne, gratuitement.</div>
      </div>

      {/* Client appointments */}
      {isClient && (
        <div style={{ paddingTop: 16 }}>
          <ClientAppointments t={t} user={user} />
        </div>
      )}

      {/* Search + filters */}
      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 8, letterSpacing: "0.04em" }}>VOTRE VILLE</div>
          <CityAutocomplete t={t} value={city} onChange={setCity} placeholder="Ex: Paris, Lyon, Marseille..." />
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 12, overflowX: "auto", paddingBottom: 2 }}>
          {CATS.map(c => {
            const active = cat === c.id;
            return (
              <button key={c.id} onClick={() => handleCatChange(c.id)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", border: `1.5px solid ${active ? t.primary : t.border}`, borderRadius: t.rpill, cursor: "pointer", whiteSpace: "nowrap", background: active ? t.primary : t.bgCard, color: active ? t.textInv : t.textMuted, fontFamily: t.fontBody, fontSize: 12, fontWeight: 700, transition: "all 0.2s" }}>
                <span>{c.icon}</span><span>{c.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => search()}
          disabled={!city || loading}
          style={{ width: "100%", padding: "14px", borderRadius: t.rsm, border: "none", background: city && !loading ? t.primary : t.bgMuted, color: city && !loading ? t.textInv : t.textMuted, fontFamily: t.fontBody, fontWeight: 700, fontSize: 15, cursor: city && !loading ? "pointer" : "not-allowed", boxShadow: city && !loading ? `0 4px 20px ${t.primaryGlow}` : "none", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          {loading ? (
            <><span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />Recherche en cours...</>
          ) : "Rechercher 🔍"}
        </button>
      </div>

      {/* Results */}
      <div style={{ padding: "20px 16px 80px" }}>

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "slideUp 0.2s ease" }}>
            {[1, 2, 3].map(i => <ProSkeleton key={i} t={t} />)}
          </div>
        )}

        {!loading && error === "rls" && (
          <div style={{ background: "#FFF8E1", border: "1px solid #F59E0B40", borderRadius: t.r, padding: "16px", animation: "slideUp 0.25s ease" }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#B45309", marginBottom: 6 }}>⚙️ Accès public non configuré</div>
            <div style={{ fontSize: 13, color: "#92400E", lineHeight: 1.6, marginBottom: 12 }}>La table <code style={{ background: "#FEF3C7", padding: "1px 5px", borderRadius: 4 }}>profiles</code> n'autorise pas encore les lectures publiques.</div>
            <div style={{ background: "#1E1E1E", borderRadius: 8, padding: "12px 14px", fontSize: 12, color: "#A5D6A7", fontFamily: "monospace", lineHeight: 1.6, overflowX: "auto" }}>{`CREATE POLICY "public read profiles"\nON profiles FOR SELECT\nUSING (true);`}</div>
            <button onClick={() => navigator.clipboard?.writeText(`CREATE POLICY "public read profiles"\nON profiles FOR SELECT\nUSING (true);`)} style={{ marginTop: 10, fontSize: 12, color: t.primary, background: "none", border: `1px solid ${t.border}`, padding: "6px 12px", borderRadius: t.rsm, cursor: "pointer", fontFamily: t.fontBody }}>Copier le SQL</button>
          </div>
        )}

        {!loading && searched && error === "" && pros.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", animation: "slideUp 0.25s ease" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>😔</div>
            <div style={{ fontSize: 15, color: t.text, fontWeight: 600 }}>Aucun professionnel trouvé</div>
            <div style={{ fontSize: 13, color: t.textMuted, marginTop: 4 }}>Essayez une ville voisine ou une autre catégorie.</div>
            {cat !== "all" && (
              <button onClick={() => handleCatChange("all")} style={{ marginTop: 12, color: t.primary, background: "none", border: "none", cursor: "pointer", fontSize: 13, fontFamily: t.fontBody }}>Voir toutes les catégories</button>
            )}
          </div>
        )}

        {!loading && pros.length > 0 && (
          <div style={{ animation: "slideUp 0.25s ease" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, letterSpacing: "0.04em", marginBottom: 12 }}>
              {pros.length} PROFESSIONNEL{pros.length > 1 ? "S" : ""} À {city.toUpperCase()}
              {cat !== "all" && ` · ${CATS.find(c => c.id === cat)?.label.toUpperCase()}`}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {pros.map(pro => {
                const pt = T[pro.theme_id] || T.beauty;
                const isBarber = pro.theme_id === "barber";
                return (
                  <div key={pro.id} onClick={() => navigate(`/pro/${pro.slug}`)} style={{ background: t.bgCard, borderRadius: t.r, border: `1px solid ${t.border}`, padding: "16px", cursor: "pointer", transition: "all 0.2s", boxShadow: t.shadow }} onMouseEnter={e => { e.currentTarget.style.boxShadow = t.shadowHover; e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseLeave={e => { e.currentTarget.style.boxShadow = t.shadow; e.currentTarget.style.transform = "none"; }}>
                    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                      <div style={{ width: 52, height: 52, borderRadius: t.rsm, background: pt.heroGrad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{isBarber ? "✂️" : "🌸"}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pro.business_name || pro.name}</div>
                        <div style={{ fontSize: 12, color: t.textMuted, marginTop: 3 }}>📍 {pro.city}</div>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: t.rpill, letterSpacing: "0.04em", background: isBarber ? "#E8A02015" : `${t.primary}12`, color: isBarber ? "#E8A020" : t.primary, display: "inline-block", marginTop: 5 }}>
                          {isBarber ? "✂️ Barbier" : "🌸 Beauté & Coiffure"}
                        </span>
                      </div>
                      <div style={{ color: t.primary, fontSize: 20, fontWeight: 700 }}>›</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!loading && !searched && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, letterSpacing: "0.04em", marginBottom: 12 }}>COMMENT CA MARCHE</div>
            {[
              ["🔍", "Cherchez par ville", "Entrez votre ville pour voir les pros disponibles"],
              ["🌸✂️", "Filtrez par catégorie", "Beauté & coiffure ou barbier — au choix"],
              ["📅", "Choisissez un créneau", "Parcourez les services et horaires disponibles"],
              ["✓",  "Réservez en 30 secondes", "Créez un compte et confirmez votre RDV instantanément"],
            ].map(([icon, title, sub]) => (
              <div key={title} style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: t.rsm, background: `${t.primary}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{icon}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{title}</div>
                  <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
