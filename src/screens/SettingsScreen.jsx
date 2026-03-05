import { useState } from "react";
import Av from "../components/Av.jsx";
import Btn from "../components/Btn.jsx";
import Modal from "../components/Modal.jsx";
import Input from "../components/Input.jsx";
import { Toggle } from "../components/Toggle.jsx";
import { T } from "../themes.js";
import { useAuth } from "../context/AuthContext.jsx";

const initials = (name) => (name || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

export default function SettingsScreen({ t, proType, currentTheme }) {
  const { profile, saveProfile, signOut } = useAuth();
  const [notif, setNotif] = useState({ sms: true, email: true, push: false });
  const [hours, setHours] = useState({ 0: true, 1: true, 2: true, 3: true, 4: true, 5: true, 6: false });
  const [copied, setCopied] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ name: profile?.name || "", business_name: profile?.business_name || "", city: profile?.city || "", phone: profile?.phone || "" });
  const setEF = (k, v) => setEditForm(f => ({ ...f, [k]: v }));

  const slug = profile?.slug || "mon-salon";
  const proName = profile?.name || "";

  const handleCopy = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(`beautyflow.app/${slug}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    await saveProfile(editForm);
    setSaving(false);
    setShowEditProfile(false);
  };

  const handleThemeChange = async (theme) => {
    await saveProfile({ theme_id: theme });
    window.location.reload(); // reload so App picks up new theme
  };

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, fontFamily: t.fontBody, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 4px 10px" }}>{title}</div>
      <div style={{ background: t.bgCard, borderRadius: t.r, border: `1px solid ${t.border}`, overflow: "hidden" }}>{children}</div>
    </div>
  );

  const Row = ({ icon, label, sub, right, onClick, noBorder = false }) => (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: noBorder ? "none" : `1px solid ${t.border}`, cursor: onClick ? "pointer" : "default" }}>
      <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: t.text, fontFamily: t.fontBody }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: t.textMuted, fontFamily: t.fontBody, marginTop: 2 }}>{sub}</div>}
      </div>
      {right && <div style={{ flexShrink: 0 }}>{right}</div>}
    </div>
  );

  const DAY_NAMES = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

  return (
    <div style={{ minHeight: "100vh", background: t.bg, fontFamily: t.fontBody, paddingBottom: 100 }}>
      <div style={{ background: t.navBg, borderBottom: `1px solid ${t.border}`, padding: "14px 16px", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ fontFamily: t.font, fontSize: 22, fontWeight: 700, color: t.text }}>Paramètres</div>
      </div>
      <div style={{ padding: "16px 12px 0" }}>

        {/* Profile */}
        <Section title="Mon profil">
          <div style={{ padding: "16px", display: "flex", alignItems: "center", gap: 14, borderBottom: `1px solid ${t.border}` }}>
            <Av init={initials(proName)} size={58} t={t} style={{ border: `3px solid ${t.bgCard}` }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: t.font, fontSize: 20, fontWeight: 700, color: t.text }}>{proName || "Mon profil"}</div>
              <div style={{ fontSize: 12, color: t.primary, fontFamily: t.fontBody, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>beautyflow.app/{slug}</div>
              {proType && <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>{proType}</div>}
            </div>
          </div>
          <Row icon="✏️" label="Modifier le profil" sub="Nom, établissement, ville" right={<span style={{ color: t.textSoft }}>›</span>}
            onClick={() => { setEditForm({ name: profile?.name || "", business_name: profile?.business_name || "", city: profile?.city || "", phone: profile?.phone || "" }); setShowEditProfile(true); }} />
          <Row icon="🔗" label="Lien de réservation" sub={`beautyflow.app/${slug}`} right={<Btn t={t} size="sm" variant="soft" onClick={handleCopy}>{copied ? "✓ Copié !" : "Copier"}</Btn>} noBorder />
        </Section>

        {/* Theme */}
        <Section title="Thème interface">
          <div style={{ padding: "14px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {["beauty", "barber"].map(th => (
                <div key={th} onClick={() => handleThemeChange(th)} style={{ padding: "14px", borderRadius: t.r, cursor: "pointer", border: `2px solid ${currentTheme === th ? t.primary : t.border}`, background: T[th].bg, transition: "all 0.2s", boxShadow: currentTheme === th ? `0 4px 16px ${t.primaryGlow}` : "none" }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{th === "beauty" ? "🌸" : "✂️"}</div>
                  <div style={{ fontFamily: T[th].font, fontSize: 14, fontWeight: 700, color: T[th].text }}>{th === "beauty" ? "Beauty" : "Barber"}</div>
                  <div style={{ fontSize: 10, color: T[th].textMuted, marginTop: 2 }}>{th === "beauty" ? "Coiffure & Beauté" : "Barbier"}</div>
                  <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                    {[T[th].primary, T[th].text, T[th].bgCard].map((c, i) => (
                      <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: c, border: "1px solid rgba(0,0,0,0.15)" }} />
                    ))}
                  </div>
                  {currentTheme === th && <div style={{ marginTop: 8, fontSize: 10, color: t.primary, fontWeight: 700 }}>✓ Actif</div>}
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Horaires */}
        <Section title="Horaires de travail">
          {DAY_NAMES.map((day, i) => (
            <Row key={day} icon={hours[i] ? "🟢" : "⭕"} label={day}
              sub={hours[i] ? (i < 5 ? "09:00 – 18:00" : "10:00 – 16:00") : "Fermé"}
              right={<Toggle on={hours[i]} onToggle={() => setHours(h => ({ ...h, [i]: !h[i] }))} />}
              noBorder={i === 6} />
          ))}
        </Section>

        {/* Stripe */}
        <Section title="Paiements & No-shows">
          <div style={{ padding: "16px", borderBottom: `1px solid ${t.border}` }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 26 }}>💳</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>Stripe Connect</div>
                <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>Acomptes automatiques · Paiement sécurisé</div>
              </div>
            </div>
            <div style={{ padding: "10px 12px", borderRadius: t.rsm, background: "#F59E0B08", border: "1px solid #F59E0B30", fontSize: 12, color: "#D97706", marginBottom: 12, fontFamily: t.fontBody }}>
              ⚠️ Non connecté — vos créneaux ne sont pas protégés
            </div>
            <Btn t={t} style={{ width: "100%", padding: "12px" }}>Connecter Stripe →</Btn>
          </div>
          <Row icon="💸" label="Taux d'acompte" sub="Appliqué sur les prestations avec dépôt" right={<span style={{ fontSize: 14, fontWeight: 700, color: t.primary }}>1%</span>} noBorder />
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          <Row icon="📱" label="SMS de rappel" sub="24h et 2h avant le RDV" right={<Toggle on={notif.sms} onToggle={() => setNotif(n => ({ ...n, sms: !n.sms }))} />} />
          <Row icon="✉️" label="Email" sub="Confirmations et rappels" right={<Toggle on={notif.email} onToggle={() => setNotif(n => ({ ...n, email: !n.email }))} />} />
          <Row icon="🔔" label="Push (app)" sub="Nouvelles réservations en temps réel" right={<Toggle on={notif.push} onToggle={() => setNotif(n => ({ ...n, push: !n.push }))} />} noBorder />
        </Section>

        {/* Account */}
        <Section title="Compte">
          <Row icon="📤" label="Exporter mes données" sub="CSV clients + revenus" right={<span style={{ color: t.textSoft }}>›</span>} onClick={() => {}} />
          <Row icon="🚪" label="Déconnexion" right={<span style={{ color: "#EF4444", fontSize: 14, fontWeight: 700 }}>→</span>} onClick={signOut} noBorder />
        </Section>
      </div>

      {showEditProfile && (
        <Modal t={t} title="Modifier le profil" onClose={() => setShowEditProfile(false)}>
          <Input t={t} label="NOM COMPLET" value={editForm.name} onChange={e => setEF("name", e.target.value)} placeholder="Marie Dupont" />
          <Input t={t} label="NOM DE L'ETABLISSEMENT" value={editForm.business_name} onChange={e => setEF("business_name", e.target.value)} placeholder="Salon de Coiffure Marie" />
          <Input t={t} label="VILLE" value={editForm.city} onChange={e => setEF("city", e.target.value)} placeholder="Paris" />
          <Input t={t} label="TELEPHONE" value={editForm.phone} onChange={e => setEF("phone", e.target.value)} placeholder="06 xx xx xx xx" />
          <Btn t={t} style={{ width: "100%", padding: "13px", marginTop: 4 }} onClick={handleSaveProfile} disabled={saving}>
            {saving ? "Enregistrement..." : "Enregistrer ✓"}
          </Btn>
        </Modal>
      )}
    </div>
  );
}
