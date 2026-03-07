import { useState, useEffect } from "react";
import Av from "../components/Av.jsx";
import Btn from "../components/Btn.jsx";
import Modal from "../components/Modal.jsx";
import SBadge from "../components/SBadge.jsx";
import { supabase } from "../supabase.js";
import { useAuth } from "../context/AuthContext.jsx";
import { WDAYS, HOURS } from "../data.js";

const toDateStr = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const initials = (name) => (name || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
const fmtTime = (s) => (s || "").slice(0, 5);

export default function AgendaScreen({ t }) {
  const { user } = useAuth();
  const now = new Date();
  const [selDay, setSelDay] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ clientName: "", serviceId: "", customClient: "", date: toDateStr(new Date()), time: "09:00" });
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(now.getDate() + i);
    return d;
  });

  const loadApts = async (date) => {
    setLoading(true);
    const { data } = await supabase
      .from("appointments")
      .select("*")
      .eq("pro_id", user.id)
      .eq("date", toDateStr(date))
      .order("time");
    setAppointments(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    loadApts(selDay);
    supabase.from("services").select("id,name,price,duration_min").eq("pro_id", user.id).eq("active", true)
      .then(({ data }) => setServices(data || []));
    supabase.from("clients").select("id,name").eq("pro_id", user.id).order("name")
      .then(({ data }) => setClients(data || []));
  }, [user]);

  useEffect(() => { if (user) loadApts(selDay); }, [selDay]);

  const selSvc = services.find(s => s.id === form.serviceId);
  const clientName = form.clientName === "__custom__" ? form.customClient : form.clientName;

  const addApt = async () => {
    if (!clientName || !form.date || !form.time) return;
    setSaving(true);
    await supabase.from("appointments").insert({
      pro_id: user.id,
      client_name: clientName,
      service_name: selSvc?.name || "",
      service_id: form.serviceId || null,
      date: form.date,
      time: form.time + ":00",
      duration_min: selSvc?.duration_min || 30,
      price: selSvc?.price || 0,
      status: "confirmed",
    });
    setSaving(false);
    setShowModal(false);
    setForm({ clientName: "", serviceId: "", customClient: "", date: toDateStr(new Date()), time: "09:00" });
    loadApts(selDay);
  };

  const fmtDay = d => d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  const nowHour = String(now.getHours()).padStart(2, "0");
  const nowMin = now.getMinutes();
  const totalRev = appointments.reduce((a, b) => a + (b.price || 0), 0);

  const inpStyle = {
    width: "100%", padding: "12px 14px", borderRadius: t.rsm,
    border: `1.5px solid ${t.border}`, background: t.bgInput,
    color: t.text, fontFamily: t.fontBody, fontSize: 14,
    outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex", flexDirection: "column", paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ background: t.navBg, borderBottom: `1px solid ${t.border}`, padding: "14px 16px 0", backdropFilter: "blur(20px)", flexShrink: 0, position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ fontFamily: t.font, fontSize: 22, fontWeight: 700, color: t.text, marginBottom: 12 }}>Agenda</div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, msOverflowStyle: "none", scrollbarWidth: "none" }}>
          {days.map((d, i) => {
            const isSel = d.toDateString() === selDay.toDateString();
            const isToday = d.toDateString() === now.toDateString();
            return (
              <div key={i} onClick={() => setSelDay(new Date(d))} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer", flexShrink: 0, padding: "8px 12px", borderRadius: t.r, background: isSel ? t.primary : t.bgCard, border: `1.5px solid ${isSel ? t.primary : isToday ? t.borderFocus : t.border}`, transition: "all 0.2s", minWidth: 52 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: isSel ? "rgba(255,255,255,0.65)" : t.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{WDAYS[(d.getDay() + 6) % 7]}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: isSel ? t.textInv : isToday ? t.primary : t.text }}>{d.getDate()}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      <div style={{ flex: 1, padding: "0 0 16px" }}>
        <div style={{ padding: "10px 16px 6px", fontSize: 12, color: t.textMuted, fontFamily: t.fontBody, display: "flex", justifyContent: "space-between" }}>
          <span>{fmtDay(selDay)}</span>
          <span style={{ color: t.primary, fontWeight: 600 }}>{appointments.length} RDV · {totalRev}€</span>
        </div>

        {loading && <div style={{ padding: "48px", textAlign: "center", color: t.textMuted, fontSize: 13 }}>Chargement...</div>}

        {!loading && appointments.length === 0 && (
          <div style={{ padding: "48px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 42, marginBottom: 10 }}>📅</div>
            <div style={{ fontSize: 14, color: t.textMuted, fontFamily: t.fontBody }}>Aucun RDV ce jour</div>
          </div>
        )}

        {!loading && (
          <div style={{ position: "relative", paddingLeft: 60, paddingRight: 12 }}>
            {HOURS.map((h) => {
              const apt = appointments.find(a => fmtTime(a.time).startsWith(h));
              const isNowRow = h === nowHour;
              return (
                <div key={h} style={{ display: "flex", position: "relative", minHeight: 64 }}>
                  <div style={{ position: "absolute", left: -60, width: 56, textAlign: "right", fontSize: 10, color: t.textSoft, paddingTop: 8, fontFamily: t.fontBody }}>{h}:00</div>
                  <div style={{ flex: 1, borderTop: `1px solid ${t.border}`, position: "relative", minHeight: 64 }}>
                    {isNowRow && (
                      <div style={{ position: "absolute", left: 0, right: 0, top: `${(nowMin / 60) * 64}px`, display: "flex", alignItems: "center", zIndex: 3, pointerEvents: "none" }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.primary, flexShrink: 0 }} />
                        <div style={{ flex: 1, height: 2, background: t.primary, opacity: 0.7 }} />
                      </div>
                    )}
                    {apt && (
                      <div style={{ position: "absolute", left: 4, right: 4, top: 6, background: t.bgCard, border: `1.5px solid ${t.primary}`, borderLeft: `5px solid ${t.primary}`, borderRadius: t.rsm, padding: "8px 12px", zIndex: 2, boxShadow: `0 2px 12px ${t.primaryGlow}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Av init={initials(apt.client_name)} size={28} t={t} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{apt.client_name}</div>
                            <div style={{ fontSize: 11, color: t.textMuted }}>{apt.service_name || "—"} · {apt.duration_min}min · {apt.price}€</div>
                            {apt.client_phone && <div style={{ fontSize: 11, color: t.textMuted }}>📞 {apt.client_phone}</div>}
                          </div>
                          <SBadge status={apt.status} t={t} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FAB */}
      <button onClick={() => { setForm({ clientName: "", serviceId: "", customClient: "", date: toDateStr(selDay), time: "09:00" }); setShowModal(true); }}
        style={{ position: "fixed", bottom: 80, right: 20, width: 52, height: 52, borderRadius: "50%", border: "none", cursor: "pointer", background: t.heroGrad, color: t.textInv, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 20px ${t.primaryGlow}`, zIndex: 50 }}>
        +
      </button>

      {showModal && (
        <Modal t={t} title="Nouveau RDV" onClose={() => setShowModal(false)}>
          {/* Client */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 6, letterSpacing: "0.04em" }}>CLIENT</label>
            {clients.length > 0 && (
              <select value={form.clientName} onChange={e => setF("clientName", e.target.value)} style={{ ...inpStyle, marginBottom: form.clientName === "__custom__" ? 8 : 0, cursor: "pointer" }}
                onFocus={e => e.target.style.borderColor = t.primary}
                onBlur={e => e.target.style.borderColor = t.border}>
                <option value="">-- Sélectionner --</option>
                {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                <option value="__custom__">+ Nouveau client</option>
              </select>
            )}
            {(clients.length === 0 || form.clientName === "__custom__") && (
              <input value={form.customClient} onChange={e => setF("customClient", e.target.value)}
                placeholder="Nom du client" style={inpStyle}
                onFocus={e => e.target.style.borderColor = t.primary}
                onBlur={e => e.target.style.borderColor = t.border} />
            )}
          </div>

          {/* Service */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 6, letterSpacing: "0.04em" }}>PRESTATION</label>
            <select value={form.serviceId} onChange={e => setF("serviceId", e.target.value)} style={{ ...inpStyle, cursor: "pointer" }}
              onFocus={e => e.target.style.borderColor = t.primary}
              onBlur={e => e.target.style.borderColor = t.border}>
              <option value="">-- Choisir une prestation --</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name} · {s.price}€ · {s.duration_min}min</option>)}
            </select>
            {selSvc && (
              <div style={{ marginTop: 6, padding: "8px 12px", borderRadius: t.rsm, background: `${t.primary}10`, fontSize: 12, color: t.primary }}>
                Durée : {selSvc.duration_min}min · Prix : {selSvc.price}€
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 6, letterSpacing: "0.04em" }}>DATE</label>
              <input type="date" value={form.date} onChange={e => setF("date", e.target.value)} style={inpStyle}
                onFocus={e => e.target.style.borderColor = t.primary}
                onBlur={e => e.target.style.borderColor = t.border} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 6, letterSpacing: "0.04em" }}>HEURE</label>
              <input type="time" value={form.time} onChange={e => setF("time", e.target.value)} style={inpStyle}
                onFocus={e => e.target.style.borderColor = t.primary}
                onBlur={e => e.target.style.borderColor = t.border} />
            </div>
          </div>

          <Btn t={t} style={{ width: "100%", padding: "13px" }} onClick={addApt}
            disabled={saving || !clientName}>
            {saving ? "Enregistrement..." : "Ajouter le RDV ✓"}
          </Btn>
        </Modal>
      )}
    </div>
  );
}
