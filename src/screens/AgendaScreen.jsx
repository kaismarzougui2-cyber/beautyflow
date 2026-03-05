import { useState } from "react";
import Av from "../components/Av.jsx";
import Btn from "../components/Btn.jsx";
import Modal from "../components/Modal.jsx";
import Input from "../components/Input.jsx";
import SBadge from "../components/SBadge.jsx";
import { APPTS_INIT, WDAYS, HOURS } from "../data.js";

export default function AgendaScreen({ t }) {
  const now = new Date();
  const [selDay, setSelDay] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [view, setView] = useState("day");

  const days = Array.from({ length:14 }, (_, i) => {
    const d = new Date();
    d.setDate(now.getDate() + i);
    return d;
  });

  const getDayApts = (d) => APPTS_INIT.filter((_, i) => (i + d.getDate()) % 2 === 0);
  const dayApts = getDayApts(selDay);
  const fmtDay  = d => d.toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long" });

  const nowHour = String(now.getHours()).padStart(2, "0");
  const nowMin  = now.getMinutes();

  return (
    <div style={{ minHeight:"100vh",background:t.bg,display:"flex",flexDirection:"column",paddingBottom:80 }}>
      {/* Top nav */}
      <div style={{ background:t.navBg,borderBottom:`1px solid ${t.border}`,padding:"14px 16px 0",backdropFilter:"blur(20px)",flexShrink:0,position:"sticky",top:0,zIndex:20 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
          <div style={{ fontFamily:t.font,fontSize:22,fontWeight:700,color:t.text }}>Agenda</div>
          <div style={{ display:"flex",gap:6 }}>
            {["day","week"].map(v => (
              <button key={v} onClick={() => setView(v)} style={{ padding:"6px 14px",border:"none",cursor:"pointer",borderRadius:t.rsm,background:view===v?t.primary:t.bgMuted,color:view===v?t.textInv:t.textMuted,fontFamily:t.fontBody,fontSize:12,fontWeight:600,transition:"all 0.2s" }}>
                {v === "day" ? "Jour" : "Semaine"}
              </button>
            ))}
          </div>
        </div>
        {/* Day scroller */}
        <div style={{ display:"flex",gap:8,overflowX:"auto",paddingBottom:12,msOverflowStyle:"none",scrollbarWidth:"none" }}>
          {days.map((d, i) => {
            const isSel   = d.toDateString() === selDay.toDateString();
            const isToday = d.toDateString() === now.toDateString();
            const hasDot  = getDayApts(d).length > 0;
            return (
              <div key={i} onClick={() => setSelDay(new Date(d))} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",flexShrink:0,padding:"8px 12px",borderRadius:t.r,background:isSel?t.primary:t.bgCard,border:`1.5px solid ${isSel?t.primary:isToday?t.borderFocus:t.border}`,transition:"all 0.2s",minWidth:52 }}>
                <div style={{ fontSize:9,fontWeight:700,color:isSel?"rgba(255,255,255,0.65)":t.textMuted,textTransform:"uppercase",letterSpacing:"0.08em" }}>{WDAYS[(d.getDay()+6)%7]}</div>
                <div style={{ fontSize:18,fontWeight:700,color:isSel?t.textInv:isToday?t.primary:t.text }}>{d.getDate()}</div>
                <div style={{ width:5,height:5,borderRadius:"50%",background:isSel?"rgba(255,255,255,0.5)":hasDot?t.primary:"transparent" }}/>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      <div style={{ flex:1,padding:"0 0 16px" }}>
        <div style={{ padding:"10px 16px 6px",fontSize:12,color:t.textMuted,fontFamily:t.fontBody,display:"flex",justifyContent:"space-between" }}>
          <span>{fmtDay(selDay)}</span>
          <span style={{ color:t.primary,fontWeight:600 }}>{dayApts.length} RDV · {dayApts.reduce((a, b) => a + b.price, 0)}€</span>
        </div>
        <div style={{ position:"relative",paddingLeft:60,paddingRight:12 }}>
          {HOURS.map((h) => {
            const apt = dayApts.find(a => a.time.startsWith(h));
            const isNowRow = h === nowHour;
            return (
              <div key={h} style={{ display:"flex",position:"relative",minHeight:64 }}>
                <div style={{ position:"absolute",left:-60,width:56,textAlign:"right",fontSize:10,color:t.textSoft,paddingTop:8,fontFamily:t.fontBody,letterSpacing:"0.03em" }}>{h}:00</div>
                <div style={{ flex:1,borderTop:`1px solid ${t.border}`,position:"relative",minHeight:64 }}>
                  {isNowRow && (
                    <div style={{ position:"absolute",left:0,right:0,top:`${(nowMin/60)*64}px`,display:"flex",alignItems:"center",zIndex:3,pointerEvents:"none" }}>
                      <div style={{ width:8,height:8,borderRadius:"50%",background:t.primary,flexShrink:0 }}/>
                      <div style={{ flex:1,height:2,background:t.primary,opacity:0.7 }}/>
                    </div>
                  )}
                  {apt && (
                    <div style={{ position:"absolute",left:4,right:4,top:6,background:t.bgCard,border:`1.5px solid ${t.primary}`,borderLeft:`5px solid ${t.primary}`,borderRadius:t.rsm,padding:"8px 12px",zIndex:2,boxShadow:`0 2px 12px ${t.primaryGlow}`,cursor:"pointer" }}>
                      <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                        <Av init={apt.avatar} size={28} t={t}/>
                        <div style={{ flex:1,minWidth:0 }}>
                          <div style={{ fontSize:13,fontWeight:700,color:t.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{apt.client}</div>
                          <div style={{ fontSize:11,color:t.textMuted }}>{apt.service} · {apt.duration}min · {apt.price}€</div>
                        </div>
                        <SBadge status={apt.status} t={t}/>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => setShowModal(true)}
        style={{ position:"fixed",bottom:80,right:20,width:52,height:52,borderRadius:"50%",border:"none",cursor:"pointer",background:t.heroGrad,color:t.textInv,fontSize:26,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 20px ${t.primaryGlow}`,zIndex:50,transition:"transform 0.2s, box-shadow 0.2s" }}
        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.12)"; e.currentTarget.style.boxShadow = `0 6px 28px ${t.primaryGlow}`; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = `0 4px 20px ${t.primaryGlow}`; }}>
        +
      </button>

      {showModal && (
        <Modal t={t} title="Nouveau RDV" onClose={() => setShowModal(false)}>
          <Input t={t} label="Client" placeholder="Nom du client"/>
          <Input t={t} label="Prestation" placeholder="Ex: Brushing Star"/>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            <Input t={t} label="Date" type="date"/>
            <Input t={t} label="Heure" type="time"/>
          </div>
          <Btn t={t} style={{ width:"100%",padding:"13px",marginTop:4 }} onClick={() => setShowModal(false)}>
            Ajouter le RDV ✓
          </Btn>
        </Modal>
      )}
    </div>
  );
}
