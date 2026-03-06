import { useState, useEffect } from "react";
import { supabase } from "../supabase.js";
import { useAuth } from "../context/AuthContext.jsx";
import Card from "../components/Card.jsx";
import Btn from "../components/Btn.jsx";

const SQL_PROFILES = `CREATE POLICY "public read profiles"
ON profiles FOR SELECT
USING (true);`;

const SQL_SERVICES = `CREATE POLICY "public read services"
ON services FOR SELECT
USING (true);`;

function CopyBox({ t, text, label }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, background: t.bgInput, borderRadius: t.rsm, padding: "9px 12px", fontSize: 12, color: t.textMuted, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", border: `1px solid ${t.border}` }}>
        {text}
      </div>
      <button
        onClick={copy}
        style={{ flexShrink: 0, padding: "8px 14px", borderRadius: t.rsm, border: "none", background: copied ? `${t.primary}20` : `${t.primary}15`, color: t.primary, fontFamily: t.fontBody, fontWeight: 700, fontSize: 12, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}
      >
        {copied ? "✓ Copié" : "Copier"}
      </button>
    </div>
  );
}

export default function PublicPageScreen({ t, onGoToServices, onGoToSettings }) {
  const { user, profile } = useAuth();
  const [services, setServices] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [sqlCopied, setSqlCopied] = useState(null);
  const [rlsOk, setRlsOk] = useState(null); // null=checking, true=ok, false=blocked

  const slug = profile?.slug || "mon-salon";
  const publicUrl = `beautyflow.app/${slug}`;

  useEffect(() => {
    if (!user) return;
    loadData();
    checkRls();
  }, [user]);

  const loadData = async () => {
    const [{ data: svcs }, { data: bookings }] = await Promise.all([
      supabase.from("services").select("id, name, price, duration_min, active, icon").eq("pro_id", user.id),
      supabase.from("appointments").select("id, client_name, service_name, date, time, status").eq("pro_id", user.id).eq("status", "pending").order("date").limit(5),
    ]);
    setServices(svcs || []);
    setPendingBookings(bookings || []);
  };

  // Test public read on profiles (unauthenticated-style check)
  const checkRls = async () => {
    const { error } = await supabase.from("profiles").select("id").eq("slug", profile?.slug || "").limit(1);
    setRlsOk(!error);
  };

  const copySql = (which) => {
    const sql = which === "profiles" ? SQL_PROFILES : SQL_SERVICES;
    navigator.clipboard?.writeText(sql).catch(() => {});
    setSqlCopied(which);
    setTimeout(() => setSqlCopied(null), 2500);
  };

  const activeServices = services.filter(s => s.active !== false);
  const inactiveServices = services.filter(s => s.active === false);

  const hasWorkHours = profile?.work_hours && Object.values(profile.work_hours).some(d => d?.active);

  return (
    <div style={{ minHeight: "100vh", background: t.bg, paddingBottom: 100 }}>

      {/* Header */}
      <div style={{ background: t.navBg, borderBottom: `1px solid ${t.border}`, padding: "14px 16px", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ fontFamily: t.font, fontSize: 22, fontWeight: 700, color: t.text }}>
          Ma Page Publique
        </div>
        <div style={{ fontSize: 12, color: t.textMuted, fontFamily: t.fontBody, marginTop: 2 }}>
          Gérez votre page de réservation en ligne
        </div>
      </div>

      <div style={{ padding: "16px" }}>

        {/* Public URL card */}
        <Card t={t} style={{ padding: "18px", marginBottom: 14, border: `2px solid ${t.primary}30`, background: `${t.primary}06` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: t.rsm, background: t.heroGrad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
              🌐
            </div>
            <div>
              <div style={{ fontFamily: t.font, fontSize: 17, fontWeight: 700, color: t.text }}>
                {profile?.business_name || "Mon Salon"}
              </div>
              <div style={{ fontSize: 11, color: t.textMuted }}>Votre lien de réservation unique</div>
            </div>
          </div>

          <CopyBox t={t} text={publicUrl} label="Lien public" />

          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <a
              href={`/pro/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ flex: 1, padding: "9px", borderRadius: t.rsm, border: `1.5px solid ${t.border}`, background: t.bgCard, color: t.text, fontFamily: t.fontBody, fontWeight: 600, fontSize: 12, cursor: "pointer", textAlign: "center", textDecoration: "none", display: "block" }}
            >
              👁️ Prévisualiser
            </a>
            <button
              onClick={() => {
                const text = `Réservez en ligne chez ${profile?.business_name || "notre salon"} !\n👉 https://${publicUrl}`;
                navigator.clipboard?.writeText(text).catch(() => {});
              }}
              style={{ flex: 1, padding: "9px", borderRadius: t.rsm, border: `1.5px solid ${t.border}`, background: t.bgCard, color: t.text, fontFamily: t.fontBody, fontWeight: 600, fontSize: 12, cursor: "pointer" }}
            >
              📤 Partager
            </button>
          </div>
        </Card>

        {/* RLS status + fix */}
        {rlsOk === false && (
          <div style={{ background: "#FFF8E1", border: "1px solid #F59E0B50", borderRadius: t.r, padding: "14px 16px", marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#B45309", marginBottom: 6 }}>
              ⚙️ Action requise — Activer l'accès public
            </div>
            <div style={{ fontSize: 12, color: "#92400E", lineHeight: 1.6, marginBottom: 10 }}>
              Vos clients ne peuvent pas encore voir votre page sans être connectés. Ajoutez ces 2 policies dans <strong>Supabase → SQL Editor</strong> :
            </div>
            {[["profiles", SQL_PROFILES], ["services", SQL_SERVICES]].map(([key, sql]) => (
              <div key={key} style={{ marginBottom: 10 }}>
                <div style={{ background: "#1A1A1A", borderRadius: 6, padding: "10px 12px", fontSize: 11, color: "#A5D6A7", fontFamily: "monospace", lineHeight: 1.6, marginBottom: 4, overflowX: "auto" }}>
                  {sql.split("\n").map((l, i) => <div key={i}>{l}</div>)}
                </div>
                <button
                  onClick={() => copySql(key)}
                  style={{ fontSize: 11, color: "#B45309", background: "none", border: "1px solid #F59E0B50", padding: "4px 10px", borderRadius: 4, cursor: "pointer", fontFamily: t.fontBody }}
                >
                  {sqlCopied === key ? "✓ Copié !" : `Copier (table ${key})`}
                </button>
              </div>
            ))}
          </div>
        )}

        {rlsOk === true && (
          <div style={{ background: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: t.rsm, padding: "10px 14px", marginBottom: 14, display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 16 }}>✅</span>
            <span style={{ fontSize: 13, color: "#166534", fontFamily: t.fontBody }}>Accès public actif — vos clients peuvent voir votre page sans compte.</span>
          </div>
        )}

        {/* Pending bookings */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontFamily: t.font, fontSize: 18, fontWeight: 700, color: t.text }}>
              Demandes en attente
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: t.primary, background: `${t.primary}15`, padding: "3px 10px", borderRadius: t.rpill }}>
              {pendingBookings.length}
            </span>
          </div>

          {pendingBookings.length === 0 ? (
            <Card t={t} style={{ padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: 13, color: t.textMuted }}>Aucune demande en attente</div>
              <div style={{ fontSize: 12, color: t.textSoft, marginTop: 4 }}>Les réservations de vos clients apparaîtront ici</div>
            </Card>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {pendingBookings.map(b => (
                <Card key={b.id} t={t} style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: t.text }}>{b.client_name}</div>
                      <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>{b.service_name}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: t.primary }}>{b.date}</div>
                      <div style={{ fontSize: 11, color: t.textMuted }}>{b.time?.slice(0, 5)}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Services on public page */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontFamily: t.font, fontSize: 18, fontWeight: 700, color: t.text }}>
              Prestations visibles
            </div>
            <Btn t={t} size="sm" variant="ghost" onClick={onGoToServices}>
              Gérer
            </Btn>
          </div>

          {services.length === 0 ? (
            <Card t={t} style={{ padding: "18px", textAlign: "center" }}>
              <div style={{ fontSize: 13, color: t.textMuted, marginBottom: 10 }}>Aucune prestation ajoutée</div>
              <Btn t={t} size="sm" onClick={onGoToServices}>+ Ajouter des prestations</Btn>
            </Card>
          ) : (
            <div>
              {activeServices.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: t.textMuted, letterSpacing: "0.06em", marginBottom: 6 }}>
                    VISIBLES ({activeServices.length})
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {activeServices.map(s => (
                      <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, background: t.bgCard, borderRadius: t.rsm, padding: "10px 14px", border: `1px solid ${t.border}` }}>
                        <span style={{ fontSize: 18 }}>{s.icon || "✨"}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{s.name}</div>
                          <div style={{ fontSize: 11, color: t.textMuted }}>{s.duration_min} min · {s.price}€</div>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#10B981", background: "#10B98115", padding: "2px 8px", borderRadius: t.rpill }}>✓ Actif</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {inactiveServices.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: t.textMuted, letterSpacing: "0.06em", marginBottom: 6 }}>
                    MASQUÉES ({inactiveServices.length})
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {inactiveServices.map(s => (
                      <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, background: t.bgCard, borderRadius: t.rsm, padding: "10px 14px", border: `1px solid ${t.border}`, opacity: 0.5 }}>
                        <span style={{ fontSize: 18 }}>{s.icon || "✨"}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{s.name}</div>
                          <div style={{ fontSize: 11, color: t.textMuted }}>{s.duration_min} min · {s.price}€</div>
                        </div>
                        <span style={{ fontSize: 10, color: t.textMuted }}>Masqué</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Work hours summary */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontFamily: t.font, fontSize: 18, fontWeight: 700, color: t.text }}>
              Horaires & créneaux
            </div>
            <Btn t={t} size="sm" variant="ghost" onClick={onGoToSettings}>
              Modifier
            </Btn>
          </div>

          {!hasWorkHours ? (
            <Card t={t} style={{ padding: "16px 18px", border: "1px solid #F59E0B40", background: "#F59E0B06" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 20 }}>⚠️</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>Aucun horaire configuré</div>
                  <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>
                    Sans horaires, vos clients ne verront aucun créneau disponible.
                  </div>
                </div>
              </div>
              <Btn t={t} size="sm" style={{ marginTop: 10 }} onClick={onGoToSettings}>
                Configurer mes horaires →
              </Btn>
            </Card>
          ) : (
            <Card t={t} style={{ padding: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
                {["L", "M", "M", "J", "V", "S", "D"].map((day, i) => {
                  const wh = profile.work_hours?.[i];
                  const active = wh?.active;
                  return (
                    <div key={i} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: active ? t.primary : t.textSoft, fontFamily: t.fontBody }}>{day}</div>
                      <div style={{
                        marginTop: 4, height: 28, borderRadius: t.rsm, fontSize: 9,
                        background: active ? `${t.primary}20` : t.bgMuted,
                        color: active ? t.primary : t.textSoft,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: t.fontBody, fontWeight: 700, lineHeight: 1.1,
                      }}>
                        {active ? `${wh.start?.slice(0, 5) || "?"}\n${wh.end?.slice(0, 5) || "?"}` : "—"}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize: 11, color: t.textMuted, marginTop: 10, textAlign: "center" }}>
                Les créneaux sont générés automatiquement · <button onClick={onGoToSettings} style={{ color: t.primary, background: "none", border: "none", cursor: "pointer", fontSize: 11, fontFamily: t.fontBody, fontWeight: 600 }}>Modifier</button>
              </div>
            </Card>
          )}
        </div>

        {/* QR / share tips */}
        <Card t={t} style={{ padding: "16px 18px", background: `${t.primary}06`, border: `1px solid ${t.primary}20` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 8 }}>
            💡 Conseils pour partager votre lien
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              ["Instagram", "Ajoutez le lien dans votre bio Instagram"],
              ["WhatsApp", "Envoyez le lien dans vos groupes clients"],
              ["Google My Business", "Ajoutez-le en lien de prise de RDV"],
            ].map(([platform, tip]) => (
              <div key={platform} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: t.primary, flexShrink: 0 }} />
                <div style={{ fontSize: 12, color: t.textMuted }}>
                  <strong style={{ color: t.text }}>{platform}</strong> — {tip}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
