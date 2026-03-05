import { useState, useEffect } from "react";
import Btn from "../components/Btn.jsx";
import Card from "../components/Card.jsx";
import Modal from "../components/Modal.jsx";
import Input from "../components/Input.jsx";
import { PrimaryToggle } from "../components/Toggle.jsx";
import { supabase } from "../supabase.js";
import { useAuth } from "../context/AuthContext.jsx";

const ICONS = ["✨", "💇‍♀️", "🎨", "💅", "🌿", "✂️", "💈", "🪒", "👔", "⚡", "🌸", "💆"];

export default function ServicesScreen({ t }) {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editSvc, setEditSvc] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", price: "", duration_min: "", category: "", icon: "✨", deposit_enabled: false, active: true });
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const loadServices = async () => {
    setLoading(true);
    const { data } = await supabase.from("services").select("*").eq("pro_id", user.id).order("created_at");
    setServices(data || []);
    setLoading(false);
  };

  useEffect(() => { if (user) loadServices(); }, [user]);

  const openEdit = (svc) => {
    setEditSvc(svc);
    setForm(svc === "new"
      ? { name: "", price: "", duration_min: "", category: "", icon: "✨", deposit_enabled: false, active: true }
      : { name: svc.name, price: String(svc.price), duration_min: String(svc.duration_min), category: svc.category || "", icon: svc.icon || "✨", deposit_enabled: svc.deposit_enabled || false, active: svc.active !== false }
    );
  };

  const saveSvc = async () => {
    if (!form.name || !form.price || !form.duration_min) return;
    setSaving(true);
    const payload = {
      name: form.name,
      price: parseFloat(form.price) || 0,
      duration_min: parseInt(form.duration_min) || 30,
      category: form.category || "Général",
      icon: form.icon,
      deposit_enabled: form.deposit_enabled,
      active: form.active,
    };
    if (editSvc === "new") {
      await supabase.from("services").insert({ pro_id: user.id, ...payload });
    } else {
      await supabase.from("services").update(payload).eq("id", editSvc.id);
    }
    setSaving(false);
    setEditSvc(null);
    loadServices();
  };

  const deleteSvc = async (id) => {
    await supabase.from("services").delete().eq("id", id);
    setEditSvc(null);
    loadServices();
  };

  const toggleActive = async (svc) => {
    await supabase.from("services").update({ active: !svc.active }).eq("id", svc.id);
    setServices(prev => prev.map(s => s.id === svc.id ? { ...s, active: !s.active } : s));
  };

  return (
    <div style={{ minHeight: "100vh", background: t.bg, paddingBottom: 80 }}>
      <div style={{ background: t.navBg, borderBottom: `1px solid ${t.border}`, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ fontFamily: t.font, fontSize: 22, fontWeight: 700, color: t.text }}>Prestations</div>
        <Btn t={t} size="sm" onClick={() => openEdit("new")}>+ Nouvelle</Btn>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "12px 12px 0" }}>
        {[
          { label: "Actives", value: services.filter(s => s.active).length, grad: t.statsGrad1 },
          { label: "Total", value: services.length, grad: t.statsGrad2 },
        ].map(s => (
          <div key={s.label} style={{ background: s.grad, borderRadius: t.r, padding: "14px 16px" }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", fontFamily: t.fontBody, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontFamily: t.font, fontSize: 30, fontWeight: 700, color: "#fff" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {loading && <div style={{ padding: "48px", textAlign: "center", color: t.textMuted, fontSize: 13 }}>Chargement...</div>}

      {!loading && services.length === 0 && (
        <div style={{ padding: "48px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 42, marginBottom: 10 }}>✨</div>
          <div style={{ fontSize: 14, color: t.textMuted, fontFamily: t.fontBody }}>Aucune prestation</div>
          <div style={{ fontSize: 12, color: t.textSoft, marginTop: 4 }}>Créez votre première prestation</div>
        </div>
      )}

      <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: 10 }}>
        {services.map(sv => (
          <Card key={sv.id} t={t} style={{ padding: "16px 18px", opacity: sv.active ? 1 : 0.6, transition: "opacity 0.2s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 28, flexShrink: 0 }}>{sv.icon || "✨"}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: t.text }}>{sv.name}</div>
                <div style={{ fontSize: 12, color: t.textMuted, fontFamily: t.fontBody, marginTop: 2 }}>
                  {sv.category} · {sv.duration_min}min
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap", alignItems: "center" }}>
                  {sv.deposit_enabled && <span style={{ fontSize: 10, color: t.primary, fontWeight: 600 }}>🔒 Acompte</span>}
                  <span style={{ fontSize: 10, color: sv.active ? "#10B981" : "#94A3B8", fontWeight: 600 }}>{sv.active ? "● Actif" : "○ Inactif"}</span>
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                <div style={{ fontFamily: t.font, fontSize: 22, fontWeight: 700, color: t.primary }}>{sv.price}€</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Btn t={t} size="sm" variant="ghost" onClick={() => openEdit(sv)}>✏️ Éditer</Btn>
                  <PrimaryToggle on={sv.active} onToggle={() => toggleActive(sv)} t={t} />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {editSvc && (
        <Modal t={t} title={editSvc === "new" ? "Nouvelle prestation" : `Modifier : ${form.name}`} onClose={() => setEditSvc(null)}>
          {/* Icon picker */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 8, letterSpacing: "0.04em" }}>ICONE</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {ICONS.map(ic => (
                <button key={ic} onClick={() => setF("icon", ic)} style={{ width: 36, height: 36, borderRadius: t.rsm, border: `2px solid ${form.icon === ic ? t.primary : t.border}`, background: form.icon === ic ? `${t.primary}15` : t.bgMuted, cursor: "pointer", fontSize: 18 }}>
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <Input t={t} label="NOM" placeholder="Ex: Brushing Star" value={form.name} onChange={e => setF("name", e.target.value)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input t={t} label="PRIX (€)" type="number" placeholder="25" value={form.price} onChange={e => setF("price", e.target.value)} />
            <Input t={t} label="DUREE (min)" type="number" placeholder="30" value={form.duration_min} onChange={e => setF("duration_min", e.target.value)} />
          </div>
          <Input t={t} label="CATEGORIE" placeholder="Coiffure / Onglerie / Soin" value={form.category} onChange={e => setF("category", e.target.value)} />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderTop: `1px solid ${t.border}`, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>🔒 Acompte anti no-show</div>
              <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>Encaissé automatiquement via Stripe</div>
            </div>
            <PrimaryToggle on={form.deposit_enabled} onToggle={() => setF("deposit_enabled", !form.deposit_enabled)} t={t} />
          </div>

          <Btn t={t} style={{ width: "100%", padding: "13px" }} onClick={saveSvc} disabled={saving || !form.name || !form.price || !form.duration_min}>
            {saving ? "Enregistrement..." : "Enregistrer ✓"}
          </Btn>
          {editSvc !== "new" && (
            <Btn t={t} variant="danger" style={{ width: "100%", padding: "11px", marginTop: 8 }} onClick={() => deleteSvc(editSvc.id)}>
              Supprimer la prestation
            </Btn>
          )}
        </Modal>
      )}
    </div>
  );
}
