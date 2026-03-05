import { useState, useEffect } from "react";
import Av from "../components/Av.jsx";
import Btn from "../components/Btn.jsx";
import Card from "../components/Card.jsx";
import Modal from "../components/Modal.jsx";
import SBadge from "../components/SBadge.jsx";
import { supabase } from "../supabase.js";
import { useAuth } from "../context/AuthContext.jsx";

const initials = (name) => (name || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

export default function ClientsScreen({ t }) {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name");
  const [selectedId, setSelectedId] = useState(null);
  const [clientApts, setClientApts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const loadClients = async () => {
    setLoading(true);
    const { data } = await supabase.from("clients").select("*").eq("pro_id", user.id).order("name");
    setClients(data || []);
    setLoading(false);
  };

  useEffect(() => { if (user) loadClients(); }, [user]);

  const filtered = clients
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "noshow") return (b.no_show_count || 0) - (a.no_show_count || 0);
      return 0;
    });

  const addClient = async () => {
    if (!form.name) return;
    setSaving(true);
    await supabase.from("clients").insert({ pro_id: user.id, name: form.name, phone: form.phone, email: form.email || null });
    setSaving(false);
    setShowAdd(false);
    setForm({ name: "", phone: "", email: "" });
    loadClients();
  };

  const inpStyle = {
    width: "100%", padding: "12px 14px", borderRadius: t.rsm,
    border: `1.5px solid ${t.border}`, background: t.bgInput,
    color: t.text, fontFamily: t.fontBody, fontSize: 14,
    outline: "none", boxSizing: "border-box",
  };

  // Detail view
  if (selectedId !== null) {
    const c = clients.find(cl => cl.id === selectedId);
    if (!c) { setSelectedId(null); return null; }
    return (
      <div style={{ minHeight: "100vh", background: t.bg, paddingBottom: 80 }}>
        <div style={{ background: t.navBg, borderBottom: `1px solid ${t.border}`, padding: "14px 16px", display: "flex", gap: 12, alignItems: "center", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 20 }}>
          <button onClick={() => setSelectedId(null)} style={{ background: t.bgMuted, border: "none", width: 36, height: 36, borderRadius: t.rsm, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", color: t.text }}>←</button>
          <div style={{ fontFamily: t.font, fontSize: 18, fontWeight: 700, color: t.text }}>Fiche client</div>
        </div>
        <div style={{ padding: "20px 16px" }}>
          <Card t={t} style={{ padding: "20px", marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 16 }}>
              <Av init={initials(c.name)} size={60} t={t} style={{ border: `3px solid ${t.bgCard}`, boxShadow: `0 4px 16px ${t.primaryGlow}` }} />
              <div>
                <div style={{ fontFamily: t.font, fontSize: 22, fontWeight: 700, color: t.text }}>{c.name}</div>
                {c.phone && <div style={{ fontSize: 13, color: t.textMuted, fontFamily: t.fontBody, marginTop: 2 }}>📱 {c.phone}</div>}
                {c.email && <div style={{ fontSize: 12, color: t.textMuted, fontFamily: t.fontBody, marginTop: 2 }}>✉️ {c.email}</div>}
                {(c.no_show_count || 0) > 0 && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4, fontWeight: 600 }}>⚠️ {c.no_show_count} no-show(s)</div>}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[["No-shows", c.no_show_count || 0, "⚠️"], ["Client depuis", new Date(c.created_at).toLocaleDateString("fr-FR", { month: "short", year: "numeric" }), "📅"]].map(([l, v, ic]) => (
                <div key={l} style={{ textAlign: "center", background: t.bgMuted, borderRadius: t.rsm, padding: "12px 6px" }}>
                  <div style={{ fontSize: 18 }}>{ic}</div>
                  <div style={{ fontFamily: t.font, fontSize: 18, fontWeight: 700, color: t.primary, marginTop: 4 }}>{v}</div>
                  <div style={{ fontSize: 10, color: t.textMuted, fontFamily: t.fontBody }}>{l}</div>
                </div>
              ))}
            </div>
          </Card>
          {c.notes && (
            <Card t={t} style={{ padding: "14px 16px", marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 4 }}>Notes</div>
              <div style={{ fontSize: 13, color: t.text, fontFamily: t.fontBody }}>{c.notes}</div>
            </Card>
          )}
          {(c.no_show_count || 0) > 0 && (
            <Card t={t} style={{ padding: "14px 16px", background: "#EF444408", border: "1px solid #EF444430" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#EF4444", marginBottom: 6 }}>⚠️ Client à risque no-show</div>
              <div style={{ fontSize: 12, color: t.textMuted, fontFamily: t.fontBody, lineHeight: 1.6 }}>
                {c.no_show_count} absence(s). Activez un acompte obligatoire pour ce client.
              </div>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: t.bg, paddingBottom: 80 }}>
      <div style={{ background: t.navBg, borderBottom: `1px solid ${t.border}`, padding: "14px 16px", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontFamily: t.font, fontSize: 22, fontWeight: 700, color: t.text }}>
            Clients <span style={{ fontSize: 14, color: t.textMuted, fontFamily: t.fontBody }}>({filtered.length})</span>
          </div>
          <Btn t={t} size="sm" onClick={() => setShowAdd(true)}>+ Ajouter</Btn>
        </div>
        <div style={{ position: "relative", marginBottom: 10 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, pointerEvents: "none" }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Chercher un client..."
            style={{ width: "100%", padding: "10px 14px 10px 36px", borderRadius: t.rsm, border: `1.5px solid ${t.border}`, background: t.bgInput, color: t.text, fontFamily: t.fontBody, fontSize: 13, outline: "none", boxSizing: "border-box" }}
            onFocus={e => e.target.style.borderColor = t.primary}
            onBlur={e => e.target.style.borderColor = t.border} />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[["name", "🔤 Nom"], ["noshow", "⚠️ No-shows"]].map(([s, l]) => (
            <button key={s} onClick={() => setSort(s)} style={{ padding: "5px 12px", border: "none", cursor: "pointer", borderRadius: t.rpill, background: sort === s ? t.primary : t.bgMuted, color: sort === s ? t.textInv : t.textMuted, fontFamily: t.fontBody, fontSize: 11, fontWeight: 600, transition: "all 0.2s" }}>{l}</button>
          ))}
        </div>
      </div>

      {loading && <div style={{ padding: "48px", textAlign: "center", color: t.textMuted, fontSize: 13 }}>Chargement...</div>}

      {!loading && filtered.length === 0 && (
        <div style={{ padding: "48px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 42, marginBottom: 10 }}>👥</div>
          <div style={{ fontSize: 14, color: t.textMuted, fontFamily: t.fontBody }}>Aucun client pour l'instant</div>
          <div style={{ fontSize: 12, color: t.textSoft, marginTop: 4 }}>Ajoutez votre premier client</div>
        </div>
      )}

      <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: 9 }}>
        {filtered.map(c => (
          <Card key={c.id} t={t} hover onClick={() => setSelectedId(c.id)} style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ position: "relative" }}>
                <Av init={initials(c.name)} size={44} t={t} />
                {(c.no_show_count || 0) > 0 && (
                  <div style={{ position: "absolute", top: -2, right: -2, width: 16, height: 16, borderRadius: "50%", background: "#EF4444", border: `2px solid ${t.bgCard}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", fontWeight: 700 }}>
                    {c.no_show_count}
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: t.text }}>{c.name}</div>
                {c.phone && <div style={{ fontSize: 11, color: t.textMuted, fontFamily: t.fontBody }}>📱 {c.phone}</div>}
                <div style={{ fontSize: 10, color: t.textSoft, fontFamily: t.fontBody }}>
                  Ajouté le {new Date(c.created_at).toLocaleDateString("fr-FR")}
                </div>
              </div>
              <span style={{ color: t.textSoft }}>›</span>
            </div>
          </Card>
        ))}
      </div>

      {showAdd && (
        <Modal t={t} title="Nouveau client" onClose={() => setShowAdd(false)}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 6, letterSpacing: "0.04em" }}>NOM COMPLET *</label>
            <input value={form.name} onChange={e => setF("name", e.target.value)} placeholder="Marie Dupont" style={inpStyle}
              onFocus={e => e.target.style.borderColor = t.primary}
              onBlur={e => e.target.style.borderColor = t.border} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 6, letterSpacing: "0.04em" }}>TELEPHONE</label>
            <input value={form.phone} onChange={e => setF("phone", e.target.value)} placeholder="06 xx xx xx xx" style={inpStyle}
              onFocus={e => e.target.style.borderColor = t.primary}
              onBlur={e => e.target.style.borderColor = t.border} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 6, letterSpacing: "0.04em" }}>EMAIL</label>
            <input type="email" value={form.email} onChange={e => setF("email", e.target.value)} placeholder="client@exemple.com" style={inpStyle}
              onFocus={e => e.target.style.borderColor = t.primary}
              onBlur={e => e.target.style.borderColor = t.border} />
          </div>
          <Btn t={t} style={{ width: "100%", padding: "13px", marginTop: 4 }} onClick={addClient} disabled={saving || !form.name}>
            {saving ? "Enregistrement..." : "Ajouter le client ✓"}
          </Btn>
        </Modal>
      )}
    </div>
  );
}
