import { useState } from "react";
import Btn from "../components/Btn.jsx";
import Card from "../components/Card.jsx";
import Modal from "../components/Modal.jsx";
import Input from "../components/Input.jsx";
import { PrimaryToggle } from "../components/Toggle.jsx";
import { SVCS_INIT } from "../data.js";

export default function ServicesScreen({ t }) {
  const [services, setServices] = useState(SVCS_INIT);
  const [editSvc, setEditSvc]   = useState(null);

  const toggleActive = (id) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, active:!s.active } : s));
  };
  const toggleDeposit = (id) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, deposit:!s.deposit } : s));
  };

  const svc = editSvc && editSvc !== "new" ? services.find(s => s.id === editSvc.id) : null;

  return (
    <div style={{ minHeight:"100vh",background:t.bg,paddingBottom:80 }}>
      <div style={{ background:t.navBg,borderBottom:`1px solid ${t.border}`,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",backdropFilter:"blur(20px)",position:"sticky",top:0,zIndex:20 }}>
        <div style={{ fontFamily:t.font,fontSize:22,fontWeight:700,color:t.text }}>Prestations</div>
        <Btn t={t} size="sm" onClick={() => setEditSvc("new")}>+ Nouvelle</Btn>
      </div>

      {/* Summary pills */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,padding:"12px 12px 0" }}>
        {[
          { label:"Actives",           value:services.filter(s => s.active).length,         grad:t.statsGrad1 },
          { label:"Réservations/mois", value:services.reduce((a, b) => a + b.bookings, 0),  grad:t.statsGrad2 },
        ].map(s => (
          <div key={s.label} style={{ background:s.grad,borderRadius:t.r,padding:"14px 16px" }}>
            <div style={{ fontSize:10,color:"rgba(255,255,255,0.65)",fontFamily:t.fontBody,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4 }}>{s.label}</div>
            <div style={{ fontFamily:t.font,fontSize:30,fontWeight:700,color:"#fff" }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ padding:"12px",display:"flex",flexDirection:"column",gap:10 }}>
        {services.map(sv => (
          <Card key={sv.id} t={t} style={{ padding:"16px 18px",opacity:sv.active?1:0.6,transition:"opacity 0.2s" }}>
            <div style={{ display:"flex",alignItems:"center",gap:12 }}>
              <div style={{ fontSize:28,flexShrink:0 }}>{sv.icon}</div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontWeight:700,fontSize:14,color:t.text }}>{sv.name}</div>
                <div style={{ fontSize:12,color:t.textMuted,fontFamily:t.fontBody,marginTop:2 }}>{sv.cat} · {sv.dur}min · {sv.bookings} rés.</div>
                <div style={{ display:"flex",gap:6,marginTop:6,flexWrap:"wrap",alignItems:"center" }}>
                  {sv.deposit && <span style={{ fontSize:10,color:t.primary,fontWeight:600 }}>🔒 Acompte</span>}
                  <span style={{ fontSize:10,color:sv.active?"#10B981":"#94A3B8",fontWeight:600 }}>{sv.active ? "● Actif" : "○ Inactif"}</span>
                </div>
              </div>
              <div style={{ textAlign:"right",flexShrink:0,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8 }}>
                <div style={{ fontFamily:t.font,fontSize:22,fontWeight:700,color:t.primary }}>{sv.price}€</div>
                <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                  <Btn t={t} size="sm" variant="ghost" onClick={() => setEditSvc(sv)}>✏️ Éditer</Btn>
                  <PrimaryToggle on={sv.active} onToggle={() => toggleActive(sv.id)} t={t}/>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {editSvc && (
        <Modal t={t} title={editSvc === "new" ? "Nouvelle prestation" : `Modifier : ${svc?.name || ""}`} onClose={() => setEditSvc(null)}>
          <Input t={t} label="Nom" placeholder="Ex: Brushing Star" defaultValue={svc?.name || ""}/>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            <Input t={t} label="Prix (€)" type="number" placeholder="25" defaultValue={svc?.price || ""}/>
            <Input t={t} label="Durée (min)" type="number" placeholder="30" defaultValue={svc?.dur || ""}/>
          </div>
          <Input t={t} label="Catégorie" placeholder="Coiffure / Onglerie / Soin" defaultValue={svc?.cat || ""}/>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 0",borderTop:`1px solid ${t.border}`,marginBottom:16 }}>
            <div>
              <div style={{ fontSize:13,fontWeight:600,color:t.text }}>🔒 Acompte anti no-show</div>
              <div style={{ fontSize:11,color:t.textMuted,marginTop:2 }}>1% du prix encaissé via Stripe</div>
            </div>
            {svc
              ? <PrimaryToggle on={svc.deposit} onToggle={() => toggleDeposit(svc.id)} t={t}/>
              : <PrimaryToggle on={false} onToggle={() => {}} t={t}/>
            }
          </div>
          <Btn t={t} style={{ width:"100%",padding:"13px" }} onClick={() => setEditSvc(null)}>Enregistrer ✓</Btn>
          {editSvc !== "new" && (
            <Btn t={t} variant="danger" style={{ width:"100%",padding:"11px",marginTop:8 }} onClick={() => { setServices(prev => prev.filter(s => s.id !== svc?.id)); setEditSvc(null); }}>
              Supprimer la prestation
            </Btn>
          )}
        </Modal>
      )}
    </div>
  );
}
