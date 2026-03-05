import { useState, useEffect } from "react";
import Av from "../components/Av.jsx";
import Btn from "../components/Btn.jsx";
import Card from "../components/Card.jsx";
import SBadge from "../components/SBadge.jsx";
import Sparkline from "../components/Sparkline.jsx";
import BarChart from "../components/BarChart.jsx";
import { APPTS_INIT, REVENUE_MONTHLY, MONTHS_S, fmt } from "../data.js";

export default function DashboardScreen({ t, proName, proType }) {
  const [period, setPeriod] = useState("week");
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isB = t.id === "beauty";
  const slug = isB ? "marie-coiff" : "sam-barber";

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(id);
  }, []);

  const STATS = {
    today: { rev:255,  apts:4,  clients:4,  noShow:0 },
    week:  { rev:1240, apts:22, clients:18, noShow:1 },
    month: { rev:4890, apts:87, clients:61, noShow:3 },
  };
  const s = STATS[period];

  const todayStr = new Date().toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long" });

  const cards = [
    { label:"Revenus",      value:`${fmt(s.rev)}€`,  sub:"+12% vs avant",           grad:t.statsGrad1, spark:[620,840,780,920,1100,890,s.rev] },
    { label:"RDV",          value:s.apts,             sub:`${s.clients} clients`,    grad:t.statsGrad2, spark:[4,6,5,8,7,9,s.apts>9?9:s.apts] },
    { label:"Satisfaction", value:"4.9 ★",            sub:"127 avis",               grad:t.statsGrad3, spark:[4.7,4.8,4.8,4.9,4.9,4.9,4.9] },
    { label:"No-shows",     value:s.noShow,           sub:s.noShow===0?"Parfait 🎉":"À surveiller", grad:t.statsGrad4, spark:[1,0,2,0,1,0,s.noShow] },
  ];

  const handleCopy = () => {
    const url = `beautyflow.app/${slug}`;
    if (navigator.clipboard) { navigator.clipboard.writeText(url).catch(() => {}); }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ paddingBottom:80 }}>
      {/* Hero header */}
      <div style={{ padding:"20px 20px 16px",background:isB?"linear-gradient(160deg,#FDE9F4,#FAF5F9)":"linear-gradient(160deg,#0D1525,#080D18)",position:"relative",overflow:"hidden" }}>
        <div style={{ position:"absolute",top:-40,right:-40,width:160,height:160,borderRadius:"50%",background:`${t.primary}10`,pointerEvents:"none" }}/>
        <div style={{ fontSize:12,color:t.textMuted,fontFamily:t.fontBody,textTransform:"capitalize",marginBottom:4 }}>{todayStr}</div>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14 }}>
          <div>
            <div style={{ fontFamily:t.font,fontSize:26,fontWeight:700,color:t.text,lineHeight:1.1 }}>
              {isB ? `Bonjour, ${proName} 👋` : `Welcome back, ${proName} ✂️`}
            </div>
            <div style={{ fontSize:13,color:t.textMuted,fontFamily:t.fontBody,marginTop:3 }}>{proType}</div>
          </div>
          <Av init={proName.split(" ").map(n => n[0]).join("").slice(0,2)} size={48} t={t} style={{ border:`2.5px solid ${t.bgCard}` }}/>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:8,background:t.bgCard,borderRadius:t.rsm,padding:"10px 14px",border:`1px solid ${t.border}` }}>
          <span style={{ fontSize:13,color:t.primary,fontFamily:t.fontBody,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
            beautyflow.app/{slug}
          </span>
          <Btn t={t} size="sm" variant="soft" onClick={handleCopy}>
            {copied ? "✓ Copié !" : "Copier 🔗"}
          </Btn>
        </div>
      </div>

      <div style={{ padding:"16px 16px 0" }}>
        {/* Period tabs */}
        <div style={{ display:"flex",gap:4,marginBottom:18,background:t.bgCard,padding:4,borderRadius:t.r,border:`1px solid ${t.border}` }}>
          {[["today","Auj."],["week","Semaine"],["month","Mois"]].map(([p, lbl]) => (
            <button key={p} onClick={() => setPeriod(p)} style={{ flex:1,padding:"8px 4px",border:"none",cursor:"pointer",borderRadius:t.rsm,background:period===p?t.primary:"transparent",color:period===p?t.textInv:t.textMuted,fontFamily:t.fontBody,fontWeight:600,fontSize:12,transition:"all 0.2s" }}>{lbl}</button>
          ))}
        </div>

        {/* Stat cards */}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20 }}>
          {cards.map((c, i) => (
            <div key={i} style={{ background:c.grad,borderRadius:t.r,padding:"16px 14px",boxShadow:`0 4px 20px ${t.primaryGlow}`,opacity:mounted?1:0,transform:mounted?"none":"translateY(10px)",transition:`all 0.4s ease ${i*0.08}s` }}>
              <div style={{ fontSize:10,color:"rgba(255,255,255,0.65)",fontFamily:t.fontBody,marginBottom:4,letterSpacing:"0.07em",textTransform:"uppercase" }}>{c.label}</div>
              <div style={{ fontFamily:t.font,fontSize:30,fontWeight:700,color:"#fff",lineHeight:1,marginBottom:6 }}>{c.value}</div>
              <div style={{ display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:8 }}>
                <div style={{ fontSize:11,color:"rgba(255,255,255,0.55)",lineHeight:1.3 }}>{c.sub}</div>
                <Sparkline data={c.spark} color="rgba(255,255,255,0.7)" height={30} width={64}/>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue chart */}
        <Card t={t} style={{ padding:"18px",marginBottom:20 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
            <div style={{ fontFamily:t.font,fontSize:18,fontWeight:700,color:t.text }}>Revenus 2024</div>
            <div style={{ fontFamily:t.font,fontSize:18,fontWeight:700,color:t.primary }}>{fmt(REVENUE_MONTHLY.reduce((a, b) => a + b, 0))}€</div>
          </div>
          <BarChart data={REVENUE_MONTHLY} labels={MONTHS_S} color={t.primary} height={100}/>
        </Card>

        {/* Today's appointments */}
        <div style={{ marginBottom:16 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
            <div style={{ fontFamily:t.font,fontSize:20,fontWeight:700,color:t.text }}>{"Aujourd'hui"}</div>
            <span style={{ fontSize:11,fontFamily:t.fontBody,fontWeight:700,color:t.primary,background:`${t.primary}12`,padding:"4px 12px",borderRadius:t.rpill }}>
              {APPTS_INIT.filter(a => a.status !== "done").length} à venir
            </span>
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:9 }}>
            {APPTS_INIT.slice(0,3).map(apt => (
              <Card key={apt.id} t={t} hover style={{ padding:"12px 16px" }}>
                <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <div style={{ background:`${t.primary}15`,borderRadius:t.rxs,padding:"6px 10px",textAlign:"center",minWidth:50,flexShrink:0 }}>
                    <div style={{ fontSize:13,fontWeight:700,color:t.primary,fontFamily:t.fontBody }}>{apt.time}</div>
                    <div style={{ fontSize:9,color:t.textMuted }}>{apt.duration}min</div>
                  </div>
                  <Av init={apt.avatar} size={34} t={t}/>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontWeight:700,fontSize:13,color:t.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{apt.client}</div>
                    <div style={{ fontSize:11,color:t.textMuted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{apt.service}</div>
                  </div>
                  <div style={{ textAlign:"right",flexShrink:0 }}>
                    <div style={{ fontFamily:t.font,fontSize:17,fontWeight:700,color:t.text }}>{apt.price}€</div>
                    <SBadge status={apt.status} t={t}/>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* No-show alert */}
        <Card t={t} style={{ padding:"14px 16px",border:`1px solid #F59E0B40`,background:`#F59E0B06`,marginBottom:8 }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <span style={{ fontSize:20 }}>⚠️</span>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700,fontSize:13,color:t.text }}>Protégez vos créneaux</div>
              <div style={{ fontSize:12,color:t.textMuted,marginTop:2 }}>Activez Stripe pour exiger un acompte automatique</div>
            </div>
            <Btn t={t} size="sm" variant="soft">Activer →</Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}
