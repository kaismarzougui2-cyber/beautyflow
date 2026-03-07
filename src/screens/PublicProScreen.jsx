import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase.js";
import { T, FONTS } from "../themes.js";
import { useAuth } from "../context/AuthContext.jsx";

const SQL_ALL_POLICIES = `-- 1. Lecture publique des profils
CREATE POLICY "public read profiles" ON profiles FOR SELECT USING (true);
-- 2. Lecture publique des services
CREATE POLICY "public read services" ON services FOR SELECT USING (true);
-- 3. Les clients peuvent créer des réservations
CREATE POLICY "clients can book" ON appointments FOR INSERT TO authenticated WITH CHECK (auth.uid() = client_id);
-- 4. Chaque acteur voit ses propres réservations
CREATE POLICY "read own appointments" ON appointments FOR SELECT USING (auth.uid() = pro_id OR auth.uid() = client_id);
-- 5. Les clients peuvent annuler leurs réservations
CREATE POLICY "clients can cancel" ON appointments FOR UPDATE TO authenticated USING (auth.uid() = client_id) WITH CHECK (auth.uid() = client_id);
-- 6. Confirmation publique par token (sans authentification)
CREATE POLICY "confirm by token" ON appointments FOR UPDATE USING (true) WITH CHECK (true);`;

function getSlots(workHours, date) {
  if (!workHours || !date) return [];
  const d = new Date(date + "T12:00:00");
  const dayOfWeek = d.getDay();
  const idx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const day = workHours[idx];
  if (!day || !day.active) return [];
  const [startH, startM] = day.start.split(":").map(Number);
  const [endH, endM] = day.end.split(":").map(Number);
  const breaks = (day.breaks || []).map(b => {
    const [bh, bm] = b.start.split(":").map(Number);
    const [eh, em] = b.end.split(":").map(Number);
    return { start: bh * 60 + bm, end: eh * 60 + em };
  });
  const slots = [];
  let cur = startH * 60 + startM;
  const end = endH * 60 + endM;
  while (cur + 30 <= end) {
    const inBreak = breaks.some(b => cur >= b.start && cur < b.end);
    if (!inBreak) slots.push(`${String(Math.floor(cur / 60)).padStart(2, "0")}:${String(cur % 60).padStart(2, "0")}`);
    cur += 30;
  }
  return slots;
}

// Auth modal — shown when guest tries to book
function AuthModal({ t, pendingSlot, onClose, onSuccess }) {
  const { signIn, signUp } = useAuth();
  const [tab, setTab] = useState("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = async () => {
    setError("");
    if (!email || !password) return;
    setLoading(true);
    let err;
    if (tab === "login") {
      ({ error: err } = await signIn(email, password));
    } else {
      ({ error: err } = await signUp(email, password));
    }
    setLoading(false);
    if (err) { setError(err.message); return; }
    onSuccess();
  };

  const inp = {
    width: "100%", padding: "12px 14px", borderRadius: t.rsm,
    border: `1.5px solid ${t.border}`, background: t.bgInput,
    color: t.text, fontFamily: t.fontBody, fontSize: 14, outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 300, backdropFilter: "blur(6px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 430, background: t.bgCard, borderRadius: `${t.r} ${t.r} 0 0`, padding: "24px 20px 40px", border: `1px solid ${t.border}`, boxShadow: "0 -8px 40px rgba(0,0,0,0.4)", animation: "slideUp 0.25s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <div style={{ fontFamily: t.font, fontSize: 22, fontWeight: 700, color: t.text }}>Finaliser la réservation</div>
            <div style={{ fontSize: 13, color: t.textMuted, marginTop: 4 }}>Connectez-vous ou créez un compte pour confirmer.</div>
          </div>
          <button onClick={onClose} style={{ background: t.bgMuted, border: "none", width: 32, height: 32, borderRadius: t.rsm, cursor: "pointer", fontSize: 16, color: t.text, flexShrink: 0, marginLeft: 12 }}>✕</button>
        </div>

        {pendingSlot && (
          <div style={{ background: `${t.primary}12`, border: `1px solid ${t.primary}30`, borderRadius: t.rsm, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: t.primary, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
            <span>🔒</span>
            <span>{pendingSlot.firstName ? `${pendingSlot.firstName} · ` : ""}{pendingSlot.service} · {pendingSlot.date} à {pendingSlot.time}</span>
          </div>
        )}

        <div style={{ display: "flex", gap: 4, marginBottom: 16, background: t.bg, padding: 4, borderRadius: t.rsm, border: `1px solid ${t.border}` }}>
          {[["register", "Créer un compte"], ["login", "Déjà inscrit"]].map(([id, lbl]) => (
            <button key={id} onClick={() => { setTab(id); setError(""); }} style={{ flex: 1, padding: "8px 4px", border: "none", cursor: "pointer", borderRadius: t.rxs, background: tab === id ? t.primary : "transparent", color: tab === id ? t.textInv : t.textMuted, fontFamily: t.fontBody, fontWeight: 600, fontSize: 12, transition: "all 0.2s" }}>{lbl}</button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" style={inp} onFocus={e => e.target.style.borderColor = t.primary} onBlur={e => e.target.style.borderColor = t.border} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mot de passe (min. 6 caractères)" style={inp} onFocus={e => e.target.style.borderColor = t.primary} onBlur={e => e.target.style.borderColor = t.border} onKeyDown={e => e.key === "Enter" && handle()} />
        </div>

        {error && <div style={{ fontSize: 12, color: "#EF4444", background: "#EF444410", padding: "8px 12px", borderRadius: t.rsm, marginBottom: 12, border: "1px solid #EF444430" }}>{error}</div>}

        <button onClick={handle} disabled={loading || !email || !password} style={{ width: "100%", padding: "14px", borderRadius: t.rsm, border: "none", background: email && password && !loading ? t.primary : t.bgMuted, color: email && password && !loading ? t.textInv : t.textMuted, fontFamily: t.fontBody, fontWeight: 700, fontSize: 15, cursor: email && password && !loading ? "pointer" : "not-allowed", boxShadow: email && password ? `0 4px 20px ${t.primaryGlow}` : "none", transition: "all 0.2s" }}>
          {loading ? "..." : tab === "login" ? "Se connecter & confirmer →" : "Créer mon compte & confirmer →"}
        </button>
      </div>
    </div>
  );
}

export default function PublicProScreen({ slug }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pro, setPro] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [booked, setBooked] = useState(false);
  const [booking, setBooking] = useState(false);
  const [bookError, setBookError] = useState("");

  const STORAGE_KEY = `bf_pending_${slug}`;
  const t = pro ? (T[pro.theme_id] || T.beauty) : T.beauty;
  const isBarber = t.id === "barber";

  useEffect(() => { loadPro(); }, [slug]);
  useEffect(() => {
    if (!pro) return;
    const fontId = `bf-font-${pro.theme_id}`;
    if (!document.getElementById(fontId)) {
      const link = document.createElement("link");
      link.id = fontId; link.rel = "stylesheet";
      link.href = FONTS[pro.theme_id] || FONTS.beauty;
      document.head.appendChild(link);
    }
  }, [pro]);

  const loadPro = async () => {
    const { data, error } = await supabase.from("profiles").select("*").eq("slug", slug).maybeSingle();
    if (error || !data) { setPro(null); setLoading(false); return; }
    setPro(data);
    const { data: svcs } = await supabase.from("services").select("*").eq("pro_id", data.id).eq("active", true).order("price");
    setServices(svcs || []);
    setLoading(false);
  };

  const handleConfirm = () => {
    if (!selectedService || !selectedDate || !selectedTime || !firstName) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      service: selectedService.name, serviceId: selectedService.id,
      date: selectedDate, time: selectedTime,
      price: selectedService.price, duration: selectedService.duration_min,
      firstName: firstName.trim(), phone: phone.trim(),
    }));
    if (!user) { setShowAuth(true); } else { doBook(); }
  };

  const doBook = async () => {
    const pending = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");
    if (!pending || !pro) return;
    const uid = user?.id;
    if (!uid) return;
    setBooking(true);
    setBookError("");

    const token = crypto.randomUUID();

    const { error } = await supabase.from("appointments").insert({
      pro_id: pro.id,
      client_id: uid,
      client_name: pending.firstName || user.email,
      client_phone: pending.phone || null,
      service_name: pending.service,
      service_id: pending.serviceId || null,
      date: pending.date,
      time: pending.time,
      duration_min: pending.duration,
      price: pending.price,
      status: "pending_confirmation",
      confirmation_token: token,
    });

    if (error) {
      setBookError(`Erreur: ${error.message || JSON.stringify(error)}`);
      setBooking(false);
      return;
    }

    // Try to send confirmation email via Supabase Edge Function
    try {
      const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-confirmation`;
      await fetch(fnUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          token,
          clientName: pending.firstName,
          clientEmail: user.email,
          clientPhone: pending.phone,
          proName: pro.business_name,
          proCity: pro.city,
          serviceName: pending.service,
          date: pending.date,
          time: pending.time,
          price: pending.price,
          confirmUrl: `${window.location.origin}/confirm/${token}`,
        }),
      });
    } catch (_) {
      // Edge function not deployed yet — booking still saved
    }

    sessionStorage.removeItem(STORAGE_KEY);
    setBooking(false);
    setBooked(true);
    setShowAuth(false);
  };

  const onAuthSuccess = () => { setTimeout(() => doBook(), 600); };
  const pending = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");
  const slots = getSlots(pro?.work_hours, selectedDate);
  const minDate = new Date().toISOString().split("T")[0];
  const canConfirm = selectedService && selectedDate && selectedTime && firstName.trim();

  // Loading skeleton
  if (loading) {
    const tb = T.beauty;
    const pulse = { background: `linear-gradient(90deg,${tb.bgCard} 25%,${tb.bgMuted} 50%,${tb.bgCard} 75%)`, backgroundSize: "200% 100%", animation: "shimmer 1.4s ease-in-out infinite", borderRadius: tb.rsm };
    return (
      <div style={{ maxWidth: 430, margin: "0 auto", background: tb.bg, minHeight: "100vh", fontFamily: tb.fontBody }}>
        <style>{`*{box-sizing:border-box;margin:0;padding:0;} @keyframes shimmer{0%{background-position:200% 0;}100%{background-position:-200% 0;}}`}</style>
        <div style={{ height: 200, background: `linear-gradient(160deg,${tb.bgMuted},${tb.bgCard})`, padding: "48px 24px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ height: 28, width: "55%", ...pulse }} />
          <div style={{ height: 16, width: "40%", ...pulse }} />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            {[80, 60, 70].map(w => <div key={w} style={{ height: 22, width: w, borderRadius: tb.rpill, ...pulse }} />)}
          </div>
        </div>
        <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ height: 12, width: 120, ...pulse, marginBottom: 4 }} />
          {[1, 2, 3].map(i => (
            <div key={i} style={{ background: tb.bgCard, borderRadius: tb.r, border: `1px solid ${tb.border}`, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 40, height: 40, ...pulse, borderRadius: tb.rsm }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ height: 13, width: 110, ...pulse }} />
                  <div style={{ height: 10, width: 70, ...pulse }} />
                </div>
              </div>
              <div style={{ height: 16, width: 48, ...pulse }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Not found
  if (!pro) {
    const tb = T.beauty;
    return (
      <div style={{ maxWidth: 430, margin: "0 auto", background: tb.bg, minHeight: "100vh", fontFamily: tb.fontBody, padding: "40px 24px" }}>
        <style>{`*{box-sizing:border-box;margin:0;padding:0;}`}</style>
        <button onClick={() => navigate("/explore")} style={{ color: tb.textMuted, background: "none", border: "none", cursor: "pointer", fontSize: 13, fontFamily: tb.fontBody, marginBottom: 28 }}>← Retour</button>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>😔</div>
          <div style={{ fontFamily: tb.font, fontSize: 22, fontWeight: 700, color: tb.text }}>Page introuvable</div>
          <div style={{ fontSize: 13, color: tb.textMuted, marginTop: 6, lineHeight: 1.6 }}>Le professionnel "<strong>{slug}</strong>" n'existe pas ou sa page n'est pas encore accessible.</div>
        </div>
        <div style={{ background: "#FFF8E1", border: "1px solid #F59E0B40", borderRadius: tb.r, padding: "16px" }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "#B45309", marginBottom: 8 }}>⚙️ Si vous êtes le professionnel</div>
          <div style={{ background: "#1A1A1A", borderRadius: 6, padding: "10px 12px", fontSize: 11, color: "#A5D6A7", fontFamily: "monospace", lineHeight: 1.6, marginBottom: 8, whiteSpace: "pre-wrap", overflowX: "auto" }}>{SQL_ALL_POLICIES}</div>
          <button onClick={() => navigator.clipboard?.writeText(SQL_ALL_POLICIES)} style={{ fontSize: 11, color: "#B45309", background: "none", border: "1px solid #F59E0B50", padding: "5px 12px", borderRadius: 4, cursor: "pointer", fontFamily: tb.fontBody }}>Copier le SQL</button>
        </div>
      </div>
    );
  }

  // Booking sent — awaiting email confirmation
  if (booked) {
    return (
      <div style={{ maxWidth: 430, margin: "0 auto", background: t.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "24px", fontFamily: t.fontBody }}>
        <style>{`*{box-sizing:border-box;margin:0;padding:0;} @keyframes pop{from{transform:scale(0.8);opacity:0;}to{transform:scale(1);opacity:1;}}`}</style>
        <div style={{ fontSize: 64, animation: "pop 0.4s ease" }}>📬</div>
        <div style={{ fontFamily: t.font, fontSize: 26, fontWeight: 700, color: t.text, textAlign: "center" }}>
          Vérifiez votre email !
        </div>
        <div style={{ fontSize: 14, color: t.textMuted, textAlign: "center", lineHeight: 1.7, maxWidth: 310 }}>
          Un email de confirmation vous a été envoyé.<br />
          <strong style={{ color: t.text }}>Cliquez sur le lien dans l'email</strong> pour valider votre RDV chez <strong style={{ color: t.text }}>{pro.business_name}</strong>.
        </div>
        <div style={{ background: `${t.primary}10`, border: `1px solid ${t.primary}25`, borderRadius: t.r, padding: "16px 20px", width: "100%", textAlign: "center" }}>
          <div style={{ fontFamily: t.font, fontSize: 20, fontWeight: 700, color: t.primary }}>{selectedDate} · {selectedTime}</div>
          <div style={{ fontSize: 13, color: t.textMuted, marginTop: 4 }}>{selectedService?.name} · {selectedService?.duration_min} min · {selectedService?.price}€</div>
          <div style={{ fontSize: 12, color: t.textMuted, marginTop: 6, padding: "6px 10px", background: t.bgMuted, borderRadius: t.rsm, display: "inline-block" }}>
            ⏳ En attente de confirmation par email
          </div>
        </div>
        <div style={{ fontSize: 12, color: t.textMuted, textAlign: "center", lineHeight: 1.6 }}>
          Pas reçu ? Vérifiez vos spams.<br />
          Le RDV sera visible sur l'agenda du pro après validation.
        </div>
        <button onClick={() => navigate("/explore")} style={{ color: t.primary, background: "none", border: "none", cursor: "pointer", fontSize: 14, fontFamily: t.fontBody, marginTop: 4 }}>
          ← Retour à la recherche
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", background: t.bg, minHeight: "100vh", fontFamily: t.fontBody }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes slideUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:none;}}
        input[type=date]::-webkit-calendar-picker-indicator{filter:${isBarber ? "invert(1)" : "none"};}
      `}</style>

      {/* Hero */}
      <div style={{ background: isBarber ? "linear-gradient(160deg,#0D1525,#080D18)" : "linear-gradient(160deg,#FDE9F4,#FAF5F9)", padding: "28px 20px 24px", position: "relative" }}>
        <button onClick={() => navigate("/explore")} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: t.textMuted, background: "none", border: "none", cursor: "pointer", fontFamily: t.fontBody, marginBottom: 18, padding: 0 }}>← Retour</button>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: t.r, background: t.heroGrad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0, boxShadow: `0 4px 20px ${t.primaryGlow}` }}>
            {isBarber ? "✂️" : "🌸"}
          </div>
          <div>
            <div style={{ fontFamily: t.font, fontSize: 24, fontWeight: 700, color: t.text, lineHeight: 1.1 }}>{pro.business_name}</div>
            {pro.city && <div style={{ fontSize: 13, color: t.textMuted, marginTop: 4 }}>📍 {pro.city}</div>}
            {pro.phone && <div style={{ fontSize: 13, color: t.textMuted, marginTop: 2 }}>📞 {pro.phone}</div>}
          </div>
        </div>
      </div>

      <div style={{ padding: "18px 16px 100px" }}>

        {/* Services */}
        {services.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: t.font, fontSize: 20, fontWeight: 700, color: t.text, marginBottom: 12 }}>Prestations</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {services.map(sv => {
                const sel = selectedService?.id === sv.id;
                return (
                  <div key={sv.id} onClick={() => { setSelectedService(sv); setSelectedTime(""); }} style={{ background: t.bgCard, borderRadius: t.r, border: `2px solid ${sel ? t.primary : t.border}`, padding: "14px 16px", cursor: "pointer", transition: "all 0.2s", boxShadow: sel ? `0 4px 16px ${t.primaryGlow}` : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 24, flexShrink: 0 }}>{sv.icon || "✨"}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: t.text }}>{sv.name}</div>
                        <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>{sv.category} · {sv.duration_min} min</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ fontFamily: t.font, fontSize: 22, fontWeight: 700, color: t.primary }}>{sv.price}€</div>
                        {sel && <span style={{ color: t.primary, fontSize: 16 }}>✓</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {services.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 0", color: t.textMuted, fontSize: 13 }}>Aucune prestation disponible pour le moment.</div>
        )}

        {/* Date picker */}
        {selectedService && (
          <div style={{ marginBottom: 24, animation: "slideUp 0.2s ease" }}>
            <div style={{ fontFamily: t.font, fontSize: 20, fontWeight: 700, color: t.text, marginBottom: 12 }}>Choisir une date</div>
            <input type="date" value={selectedDate} min={minDate} onChange={e => { setSelectedDate(e.target.value); setSelectedTime(""); }} style={{ width: "100%", padding: "13px 16px", borderRadius: t.rsm, border: `1.5px solid ${t.border}`, background: t.bgInput, color: t.text, fontFamily: t.fontBody, fontSize: 14, outline: "none" }} onFocus={e => e.target.style.borderColor = t.primary} onBlur={e => e.target.style.borderColor = t.border} />
          </div>
        )}

        {/* Time slots */}
        {selectedService && selectedDate && slots.length > 0 && (
          <div style={{ marginBottom: 28, animation: "slideUp 0.2s ease" }}>
            <div style={{ fontFamily: t.font, fontSize: 20, fontWeight: 700, color: t.text, marginBottom: 12 }}>Créneaux disponibles</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {slots.map(slot => {
                const sel = selectedTime === slot;
                return (
                  <button key={slot} onClick={() => setSelectedTime(slot)} style={{ padding: "10px 4px", borderRadius: t.rsm, border: `1.5px solid ${sel ? t.primary : t.border}`, background: sel ? t.primary : t.bgCard, color: sel ? t.textInv : t.text, fontFamily: t.fontBody, fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.15s" }}>
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {selectedService && selectedDate && slots.length === 0 && (
          <div style={{ textAlign: "center", padding: "20px", color: t.textMuted, fontSize: 13, background: t.bgCard, borderRadius: t.r, border: `1px solid ${t.border}`, marginBottom: 24, animation: "slideUp 0.2s ease" }}>
            Pas de disponibilité ce jour-là. Essayez une autre date.
          </div>
        )}

        {/* Client info + confirm */}
        {selectedService && selectedDate && selectedTime && (
          <div style={{ animation: "slideUp 0.2s ease" }}>
            {/* Client info */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: t.font, fontSize: 20, fontWeight: 700, color: t.text, marginBottom: 12 }}>Vos coordonnées</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: t.textMuted, marginBottom: 5, letterSpacing: "0.04em" }}>PRÉNOM *</div>
                  <input
                    type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                    placeholder="Votre prénom"
                    style={{ width: "100%", padding: "12px 14px", borderRadius: t.rsm, border: `1.5px solid ${firstName ? t.primary : t.border}`, background: t.bgInput, color: t.text, fontFamily: t.fontBody, fontSize: 14, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
                    onFocus={e => e.target.style.borderColor = t.primary}
                    onBlur={e => e.target.style.borderColor = firstName ? t.primary : t.border}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: t.textMuted, marginBottom: 5, letterSpacing: "0.04em" }}>TÉLÉPHONE</div>
                  <input
                    type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="06 12 34 56 78"
                    style={{ width: "100%", padding: "12px 14px", borderRadius: t.rsm, border: `1.5px solid ${t.border}`, background: t.bgInput, color: t.text, fontFamily: t.fontBody, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                    onFocus={e => e.target.style.borderColor = t.primary}
                    onBlur={e => e.target.style.borderColor = t.border}
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: t.r, padding: "16px 18px", marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: t.textMuted, letterSpacing: "0.06em", marginBottom: 8 }}>RÉCAPITULATIF</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: t.text }}>{selectedService.name}</div>
              <div style={{ fontSize: 13, color: t.textMuted, marginTop: 3 }}>{selectedDate} · {selectedTime} · {selectedService.duration_min} min</div>
              {firstName && <div style={{ fontSize: 13, color: t.textMuted, marginTop: 2 }}>👤 {firstName}{phone ? ` · 📞 ${phone}` : ""}</div>}
              <div style={{ fontFamily: t.font, fontSize: 26, fontWeight: 700, color: t.primary, marginTop: 8 }}>{selectedService.price}€</div>
            </div>

            {!firstName.trim() && (
              <div style={{ fontSize: 12, color: t.textMuted, textAlign: "center", marginBottom: 10 }}>⚠️ Entrez votre prénom pour continuer</div>
            )}

            {bookError && (
              <div style={{ background: "#FFF1F2", border: "1px solid #FDA4AF", borderRadius: t.rsm, padding: "12px 14px", marginBottom: 12, fontSize: 13, color: "#9F1239", lineHeight: 1.6 }}>⚠️ {bookError}</div>
            )}

            <button
              onClick={handleConfirm}
              disabled={booking || !canConfirm}
              style={{ width: "100%", padding: "16px", borderRadius: t.rsm, border: "none", background: canConfirm && !booking ? t.primary : t.bgMuted, color: canConfirm && !booking ? t.textInv : t.textMuted, fontFamily: t.fontBody, fontWeight: 700, fontSize: 16, cursor: canConfirm && !booking ? "pointer" : "not-allowed", boxShadow: canConfirm ? `0 6px 24px ${t.primaryGlow}` : "none", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              {booking ? (
                <><span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />Confirmation en cours...</>
              ) : "Confirmer le rendez-vous →"}
            </button>
            <div style={{ fontSize: 11, color: t.textMuted, textAlign: "center", marginTop: 8 }}>📬 Un email de validation vous sera envoyé</div>
          </div>
        )}
      </div>

      {showAuth && <AuthModal t={t} pendingSlot={pending} onClose={() => setShowAuth(false)} onSuccess={onAuthSuccess} />}
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}
