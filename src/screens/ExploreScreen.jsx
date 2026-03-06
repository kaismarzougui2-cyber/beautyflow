import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase.js";
import { T, FONTS } from "../themes.js";
import CityAutocomplete from "../components/CityAutocomplete.jsx";

export default function ExploreScreen() {
  const t = T.beauty;
  const navigate = useNavigate();
  const [city, setCity] = useState("");
  const [pros, setPros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = async () => {
    if (!city) return;
    setLoading(true);
    setSearched(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, name, business_name, city, slug, theme_id, business_type")
      .ilike("city", city)
      .order("business_name");
    setPros(data || []);
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", background: t.bg, minHeight: "100vh", fontFamily: t.fontBody }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;} @keyframes slideUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:none;}}`}</style>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(160deg,#FDE9F4,#FAF5F9)",
        padding: "48px 24px 28px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 140, height: 140, borderRadius: "50%", background: `${t.primary}10`, pointerEvents: "none" }} />
        <div style={{ fontSize: 44, marginBottom: 14 }}>✂️💅</div>
        <div style={{ fontFamily: t.font, fontSize: 30, fontWeight: 700, color: t.text, lineHeight: 1.1 }}>
          Trouvez votre pro
        </div>
        <div style={{ fontSize: 14, color: t.textMuted, marginTop: 6, lineHeight: 1.5 }}>
          Salons de coiffure & barbiers — réservez en ligne, gratuitement.
        </div>
      </div>

      {/* Search bar */}
      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 8, letterSpacing: "0.04em" }}>
            VOTRE VILLE
          </div>
          <CityAutocomplete t={t} value={city} onChange={setCity} placeholder="Ex: Paris, Lyon, Marseille..." />
        </div>
        <button
          onClick={search}
          disabled={!city || loading}
          style={{
            width: "100%", padding: "14px", borderRadius: t.rsm, border: "none",
            background: city && !loading ? t.primary : t.bgMuted,
            color: city && !loading ? t.textInv : t.textMuted,
            fontFamily: t.fontBody, fontWeight: 700, fontSize: 15,
            cursor: city && !loading ? "pointer" : "not-allowed",
            boxShadow: city && !loading ? `0 4px 20px ${t.primaryGlow}` : "none",
            transition: "all 0.2s",
          }}
        >
          {loading ? "Recherche en cours..." : "Rechercher 🔍"}
        </button>
      </div>

      {/* Results */}
      <div style={{ padding: "20px 16px 80px" }}>
        {searched && !loading && pros.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", animation: "slideUp 0.25s ease" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>😔</div>
            <div style={{ fontSize: 15, color: t.text, fontWeight: 600 }}>Aucun professionnel trouvé</div>
            <div style={{ fontSize: 13, color: t.textMuted, marginTop: 4 }}>
              Essayez une ville voisine ou vérifiez l'orthographe.
            </div>
          </div>
        )}

        {pros.length > 0 && (
          <div style={{ animation: "slideUp 0.25s ease" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, letterSpacing: "0.04em", marginBottom: 12 }}>
              {pros.length} PROFESSIONNEL{pros.length > 1 ? "S" : ""} À {city.toUpperCase()}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {pros.map(pro => {
                const pt = T[pro.theme_id] || T.beauty;
                const isBarber = pro.theme_id === "barber";
                return (
                  <div
                    key={pro.id}
                    onClick={() => navigate(`/pro/${pro.slug}`)}
                    style={{
                      background: t.bgCard, borderRadius: t.r,
                      border: `1px solid ${t.border}`, padding: "16px",
                      cursor: "pointer", transition: "all 0.2s",
                      boxShadow: t.shadow,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = t.shadowHover; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = t.shadow; e.currentTarget.style.transform = "none"; }}
                  >
                    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                      <div style={{
                        width: 52, height: 52, borderRadius: t.rsm,
                        background: pt.heroGrad,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 24, flexShrink: 0,
                      }}>
                        {isBarber ? "✂️" : "🌸"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {pro.business_name || pro.name}
                        </div>
                        <div style={{ fontSize: 12, color: t.textMuted, marginTop: 3 }}>
                          📍 {pro.city}
                        </div>
                        <div style={{ marginTop: 6 }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: "2px 8px",
                            borderRadius: t.rpill, letterSpacing: "0.04em",
                            background: isBarber ? "#E8A02015" : `${t.primary}12`,
                            color: isBarber ? "#E8A020" : t.primary,
                          }}>
                            {isBarber ? "✂️ Barbier" : "🌸 Beauté & Coiffure"}
                          </span>
                        </div>
                      </div>
                      <div style={{ color: t.primary, fontSize: 20, fontWeight: 700 }}>›</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!searched && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, letterSpacing: "0.04em", marginBottom: 12 }}>
              COMMENT CA MARCHE
            </div>
            {[
              ["🔍", "Cherchez par ville", "Entrez votre ville pour voir les pros disponibles"],
              ["📅", "Choisissez un créneau", "Parcourez les services et les horaires disponibles"],
              ["✓", "Réservez en 30 secondes", "Créez un compte et confirmez votre RDV instantanément"],
            ].map(([icon, title, sub]) => (
              <div key={title} style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: t.rsm,
                  background: `${t.primary}12`, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 18, flexShrink: 0,
                }}>
                  {icon}
                </div>
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
