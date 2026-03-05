import { useState } from "react";
import Av from "../components/Av.jsx";
import Btn from "../components/Btn.jsx";
import Card from "../components/Card.jsx";
import SBadge from "../components/SBadge.jsx";
import { APPTS_INIT, CLIENTS_INIT } from "../data.js";

export default function ClientsScreen({ t }) {
  const [search, setSearch] = useState("");
  const [sort, setSort]     = useState("spent");
  const [selectedId, setSelectedId] = useState(null);

  const filtered = [...CLIENTS_INIT]
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sort === "spent" ? b.spent - a.spent : sort === "visits" ? b.visits - a.visits : b.noShow - a.noShow);

  if (selectedId !== null) {
    const c = CLIENTS_INIT.find(cl => cl.id === selectedId);
    if (!c) { setSelectedId(null); return null; }
    return (
      <div style={{ minHeight:"100vh",background:t.bg,paddingBottom:80 }}>
        <div style={{ background:t.navBg,borderBottom:`1px solid ${t.border}`,padding:"14px 16px",display:"flex",gap:12,alignItems:"center",backdropFilter:"blur(20px)",position:"sticky",top:0,zIndex:20 }}>
          <button onClick={() => setSelectedId(null)} style={{ background:t.bgMuted,border:"none",width:36,height:36,borderRadius:t.rsm,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",color:t.text }}>←</button>
          <div style={{ fontFamily:t.font,fontSize:18,fontWeight:700,color:t.text }}>Fiche client</div>
        </div>
        <div style={{ padding:"20px 16px" }}>
          <Card t={t} style={{ padding:"20px",marginBottom:16 }}>
            <div style={{ display:"flex",gap:14,alignItems:"center",marginBottom:16 }}>
              <Av init={c.avatar} size={60} t={t} style={{ border:`3px solid ${t.bgCard}`,boxShadow:`0 4px 16px ${t.primaryGlow}` }}/>
              <div>
                <div style={{ fontFamily:t.font,fontSize:22,fontWeight:700,color:t.text }}>{c.name}</div>
                <div style={{ fontSize:13,color:t.textMuted,fontFamily:t.fontBody,marginTop:2 }}>📱 {c.phone}</div>
                {c.noShow > 0 && <div style={{ fontSize:12,color:"#EF4444",marginTop:4,fontWeight:600 }}>⚠️ {c.noShow} no-show(s)</div>}
              </div>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10 }}>
              {[["Visites",c.visits,"📅"],["Dépensé",`${c.spent}€`,"💶"],["No-shows",c.noShow,"⚠️"]].map(([l, v, ic]) => (
                <div key={l} style={{ textAlign:"center",background:t.bgMuted,borderRadius:t.rsm,padding:"12px 6px" }}>
                  <div style={{ fontSize:18 }}>{ic}</div>
                  <div style={{ fontFamily:t.font,fontSize:20,fontWeight:700,color:t.primary,marginTop:4 }}>{v}</div>
                  <div style={{ fontSize:10,color:t.textMuted,fontFamily:t.fontBody }}>{l}</div>
                </div>
              ))}
            </div>
          </Card>
          <Card t={t} style={{ padding:"14px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:12 }}>
            <span style={{ fontSize:22 }}>⭐</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:11,color:t.textMuted,fontFamily:t.fontBody }}>Prestation favorite</div>
              <div style={{ fontSize:14,fontWeight:700,color:t.text,fontFamily:t.fontBody }}>{c.fav}</div>
            </div>
            <div style={{ fontSize:11,color:t.textMuted,fontFamily:t.fontBody }}>Dernier RDV : {c.lastVisit}</div>
          </Card>
          <div style={{ fontFamily:t.font,fontSize:18,fontWeight:700,color:t.text,marginBottom:10 }}>Historique</div>
          {APPTS_INIT.slice(0,3).map(a => (
            <Card key={a.id} t={t} style={{ padding:"12px 16px",marginBottom:8 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <div>
                  <div style={{ fontSize:13,fontWeight:700,color:t.text }}>{a.service}</div>
                  <div style={{ fontSize:11,color:t.textMuted,fontFamily:t.fontBody }}>{a.time}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:t.font,fontSize:16,fontWeight:700,color:t.text }}>{a.price}€</div>
                  <SBadge status={a.status} t={t}/>
                </div>
              </div>
            </Card>
          ))}
          {c.noShow > 0 && (
            <Card t={t} style={{ padding:"14px 16px",background:"#EF444408",border:"1px solid #EF444430",marginTop:12 }}>
              <div style={{ fontSize:13,fontWeight:700,color:"#EF4444",marginBottom:8 }}>⚠️ Client à risque no-show</div>
              <div style={{ fontSize:12,color:t.textMuted,fontFamily:t.fontBody,lineHeight:1.6 }}>
                {c.noShow} absence(s) non justifiée(s). Activez un acompte obligatoire pour ce client.
              </div>
              <Btn t={t} size="sm" style={{ marginTop:10 }} variant="soft">{"Forcer l'acompte"}</Btn>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh",background:t.bg,paddingBottom:80 }}>
      <div style={{ background:t.navBg,borderBottom:`1px solid ${t.border}`,padding:"14px 16px",backdropFilter:"blur(20px)",position:"sticky",top:0,zIndex:20 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
          <div style={{ fontFamily:t.font,fontSize:22,fontWeight:700,color:t.text }}>Clients <span style={{ fontSize:14,color:t.textMuted,fontFamily:t.fontBody }}>({filtered.length})</span></div>
        </div>
        <div style={{ position:"relative",marginBottom:10 }}>
          <span style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:14,pointerEvents:"none" }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Chercher un client..." style={{ width:"100%",padding:"10px 14px 10px 36px",borderRadius:t.rsm,border:`1.5px solid ${t.border}`,background:t.bgInput,color:t.text,fontFamily:t.fontBody,fontSize:13,outline:"none",boxSizing:"border-box" }}
            onFocus={e => e.target.style.borderColor = t.primary} onBlur={e => e.target.style.borderColor = t.border}/>
        </div>
        <div style={{ display:"flex",gap:6 }}>
          {[["spent","💶 Dépenses"],["visits","📅 Visites"],["noshow","⚠️ No-shows"]].map(([s, l]) => (
            <button key={s} onClick={() => setSort(s)} style={{ padding:"5px 12px",border:"none",cursor:"pointer",borderRadius:t.rpill,background:sort===s?t.primary:t.bgMuted,color:sort===s?t.textInv:t.textMuted,fontFamily:t.fontBody,fontSize:11,fontWeight:600,transition:"all 0.2s" }}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{ padding:"12px",display:"flex",flexDirection:"column",gap:9 }}>
        {filtered.map(c => (
          <Card key={c.id} t={t} hover onClick={() => setSelectedId(c.id)} style={{ padding:"14px 16px" }}>
            <div style={{ display:"flex",alignItems:"center",gap:12 }}>
              <div style={{ position:"relative" }}>
                <Av init={c.avatar} size={44} t={t}/>
                {c.noShow > 0 && <div style={{ position:"absolute",top:-2,right:-2,width:16,height:16,borderRadius:"50%",background:"#EF4444",border:`2px solid ${t.bgCard}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#fff",fontWeight:700 }}>{c.noShow}</div>}
              </div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontWeight:700,fontSize:14,color:t.text }}>{c.name}</div>
                <div style={{ fontSize:11,color:t.textMuted,fontFamily:t.fontBody }}>{c.fav} · {c.visits} visites</div>
                <div style={{ fontSize:10,color:t.textSoft,fontFamily:t.fontBody }}>Dernier RDV : {c.lastVisit}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontFamily:t.font,fontSize:18,fontWeight:700,color:t.primary }}>{c.spent}€</div>
                <div style={{ fontSize:10,color:t.textSoft,fontFamily:t.fontBody }}>total dépensé</div>
                <div style={{ fontSize:11,color:t.textSoft,marginTop:2 }}>›</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
