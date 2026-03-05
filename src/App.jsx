import { useState, useEffect, useRef, useCallback } from "react";

// ─── FONTS ───────────────────────────────────────────────────────────────────
const FONTS = {
  beauty: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Jost:wght@300;400;500;600;700&display=swap",
  barber: "https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Barlow:wght@300;400;500;600;700&display=swap",
};

// ─── THEMES ──────────────────────────────────────────────────────────────────
const T = {
  beauty: {
    id:"beauty",
    bg:"#FAF5F9", bgCard:"#FFFFFF", bgInput:"#FFF7FB", bgMuted:"#FCE7F3",
    primary:"#C2185B", primaryHover:"#AD1457", primaryGlow:"rgba(194,24,91,0.15)",
    primaryLight:"#FCE4EC", accent:"#E91E8C", accent2:"#9C27B0",
    text:"#1A0A12", textMuted:"#9C4068", textSoft:"#C06080", textInv:"#FFFFFF",
    border:"#F0C0D8", borderFocus:"#C2185B",
    heroGrad:"linear-gradient(135deg,#C2185B 0%,#880E4F 100%)",
    statsGrad1:"linear-gradient(135deg,#C2185B,#E91E8C)",
    statsGrad2:"linear-gradient(135deg,#9C27B0,#673AB7)",
    statsGrad3:"linear-gradient(135deg,#00897B,#26A69A)",
    statsGrad4:"linear-gradient(135deg,#F57C00,#FFA726)",
    font:"'Cormorant Garamond',Georgia,serif",
    fontBody:"'Jost',sans-serif",
    r:"18px", rsm:"12px", rxs:"8px", rpill:"999px",
    shadow:"0 2px 16px rgba(194,24,91,0.07)",
    shadowHover:"0 8px 32px rgba(194,24,91,0.15)",
    navBg:"rgba(255,255,255,0.97)",
    starColor:"#F59E0B",
    sCfm:{ bg:"#E8F5E9", color:"#2E7D32" },
    sPnd:{ bg:"#FFF8E1", color:"#F57F17" },
    sCnx:{ bg:"#FFEBEE", color:"#C62828" },
    sNSh:{ bg:"#FCE4EC", color:"#AD1457" },
    sDne:{ bg:"#E3F2FD", color:"#1565C0" },
  },
  barber: {
    id:"barber",
    bg:"#080D18", bgCard:"#0F1929", bgInput:"#0A1220", bgMuted:"#121F35",
    primary:"#E8A020", primaryHover:"#D4891A", primaryGlow:"rgba(232,160,32,0.18)",
    primaryLight:"#FEF3C7", accent:"#F59E0B", accent2:"#D97706",
    text:"#F1F5F9", textMuted:"#94A3B8", textSoft:"#475569", textInv:"#080D18",
    border:"#1A2D45", borderFocus:"#E8A020",
    heroGrad:"linear-gradient(135deg,#E8A020 0%,#B8720E 100%)",
    statsGrad1:"linear-gradient(135deg,#E8A020,#F59E0B)",
    statsGrad2:"linear-gradient(135deg,#6366F1,#4F46E5)",
    statsGrad3:"linear-gradient(135deg,#10B981,#059669)",
    statsGrad4:"linear-gradient(135deg,#EF4444,#DC2626)",
    font:"'Oswald',Impact,sans-serif",
    fontBody:"'Barlow',sans-serif",
    r:"6px", rsm:"4px", rxs:"2px", rpill:"6px",
    shadow:"0 2px 16px rgba(0,0,0,0.5)",
    shadowHover:"0 8px 32px rgba(0,0,0,0.7)",
    navBg:"rgba(8,13,24,0.97)",
    starColor:"#E8A020",
    sCfm:{ bg:"#0D2818", color:"#34D399" },
    sPnd:{ bg:"#1A1500", color:"#FCD34D" },
    sCnx:{ bg:"#1A0A0A", color:"#F87171" },
    sNSh:{ bg:"#1A0D00", color:"#FB923C" },
    sDne:{ bg:"#0A1020", color:"#60A5FA" },
  },
};

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const APPTS_INIT = [
  { id:1, client:"Léa Martin",    avatar:"LM", service:"Brushing Star",       time:"09:00", duration:30,  price:25,  status:"confirmed", phone:"06 12 34 56 78" },
  { id:2, client:"Sophie Blanc",  avatar:"SB", service:"Coloration complète", time:"10:00", duration:120, price:85,  status:"confirmed", phone:"06 98 76 54 32" },
  { id:3, client:"Emma Rousseau", avatar:"ER", service:"Pose Gel Express",    time:"13:30", duration:45,  price:35,  status:"pending",   phone:"07 11 22 33 44" },
  { id:4, client:"Julie Moreau",  avatar:"JM", service:"Mèches & Balayage",   time:"14:30", duration:150, price:110, status:"confirmed", phone:"06 55 44 33 22" },
  { id:5, client:"Alice Dumont",  avatar:"AD", service:"Brushing Star",       time:"17:00", duration:30,  price:25,  status:"done",      phone:"06 00 11 22 33" },
];

const CLIENTS_INIT = [
  { id:"c1", name:"Léa Martin",    avatar:"LM", visits:12, spent:340,  lastVisit:"15 Jan", noShow:0, phone:"06 12 34 56 78", fav:"Brushing Star" },
  { id:"c2", name:"Sophie Blanc",  avatar:"SB", visits:8,  spent:680,  lastVisit:"20 Jan", noShow:0, phone:"06 98 76 54 32", fav:"Coloration" },
  { id:"c3", name:"Emma Rousseau", avatar:"ER", visits:3,  spent:95,   lastVisit:"10 Jan", noShow:1, phone:"07 11 22 33 44", fav:"Pose Gel" },
  { id:"c4", name:"Julie Moreau",  avatar:"JM", visits:15, spent:1650, lastVisit:"22 Jan", noShow:0, phone:"06 55 44 33 22", fav:"Mèches" },
  { id:"c5", name:"Alice Dumont",  avatar:"AD", visits:6,  spent:150,  lastVisit:"25 Jan", noShow:2, phone:"06 00 11 22 33", fav:"Brushing" },
  { id:"c6", name:"Clara Petit",   avatar:"CP", visits:20, spent:2100, lastVisit:"26 Jan", noShow:0, phone:"06 77 88 99 00", fav:"Balayage" },
];

const SVCS_INIT = [
  { id:"s1", name:"Brushing Star",       cat:"Coiffure", dur:30,  price:25,  deposit:false, bookings:48, icon:"💇‍♀️", active:true },
  { id:"s2", name:"Coloration complète", cat:"Coiffure", dur:120, price:85,  deposit:true,  bookings:32, icon:"🎨",   active:true },
  { id:"s3", name:"Mèches & Balayage",   cat:"Coiffure", dur:150, price:110, deposit:true,  bookings:27, icon:"✨",   active:true },
  { id:"s4", name:"Pose Gel Express",    cat:"Onglerie", dur:45,  price:35,  deposit:true,  bookings:19, icon:"💅",   active:true },
  { id:"s5", name:"Soin Kératine",       cat:"Soin",     dur:90,  price:65,  deposit:true,  bookings:11, icon:"🌿",   active:false },
];

const REVENUE_MONTHLY = [1820,2100,2340,1980,2650,2890,3100,2760,3240,3680,4120,4890];
const MONTHS_S = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];
const WDAYS = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
const HOURS = ["08","09","10","11","12","13","14","15","16","17","18"];

// ─── UTILS ───────────────────────────────────────────────────────────────────
const fmt = n => n >= 1000 ? `${(n/1000).toFixed(1)}k` : `${n}`;
const SL = { confirmed:"Confirmé", pending:"En attente", cancelled:"Annulé", no_show:"No-show", done:"Terminé" };

// ─── ATOMS ───────────────────────────────────────────────────────────────────
const Av = ({ init, size=40, t, style={} }) => (
  <div style={{ width:size,height:size,borderRadius:"50%",background:`linear-gradient(135deg,${t.primary},${t.accent2})`,display:"flex",alignItems:"center",justifyContent:"center",color:t.textInv,fontFamily:t.fontBody,fontWeight:700,fontSize:size*0.3,flexShrink:0,boxShadow:`0 2px 10px ${t.primaryGlow}`,...style }}>{init}</div>
);

const SBadge = ({ status, t }) => {
  const s = { confirmed:t.sCfm,pending:t.sPnd,cancelled:t.sCnx,no_show:t.sNSh,done:t.sDne }[status]||t.sPnd;
  return <span style={{ padding:"3px 10px",borderRadius:t.rpill,background:s.bg,color:s.color,fontSize:11,fontWeight:700,fontFamily:t.fontBody,whiteSpace:"nowrap" }}>{SL[status]||status}</span>;
};

const Btn = ({ children, onClick, variant="primary", t, style={}, disabled=false, size="md" }) => {
  const [h,setH] = useState(false);
  const pad = size==="sm"?"7px 14px":size==="lg"?"14px 28px":"11px 22px";
  const fz  = size==="sm"?12:size==="lg"?15:13;
  const base = { display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,border:"none",cursor:disabled?"not-allowed":"pointer",fontFamily:t.fontBody,fontWeight:600,fontSize:fz,transition:"all 0.18s",borderRadius:t.rpill,opacity:disabled?0.45:1,letterSpacing:"0.02em",padding:pad,...style };
  const v = {
    primary:{ background:h?t.primaryHover:t.primary,color:t.textInv,boxShadow:h?`0 6px 22px ${t.primaryGlow}`:`0 2px 10px ${t.primaryGlow}`,transform:h?"translateY(-1px)":"none" },
    ghost:  { background:h?t.bgMuted:"transparent",color:t.text,border:`1.5px solid ${t.border}`,transform:h?"translateY(-1px)":"none" },
    soft:   { background:h?t.primaryLight:`${t.primary}12`,color:t.primary,transform:h?"translateY(-1px)":"none" },
    danger: { background:h?"#C6282820":"#EF444415",color:"#EF4444",border:"1px solid #EF444430",transform:h?"translateY(-1px)":"none" },
  };
  return <button onClick={disabled?undefined:onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{...base,...v[variant]}}>{children}</button>;
};

const Card = ({ children, t, style={}, hover=false, onClick }) => {
  const [h,setH]=useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>hover&&setH(true)} onMouseLeave={()=>hover&&setH(false)} style={{ background:t.bgCard,borderRadius:t.r,border:`1px solid ${h?t.borderFocus:t.border}`,boxShadow:h?t.shadowHover:t.shadow,transition:"all 0.2s",transform:h?"translateY(-2px)":"none",cursor:onClick?"pointer":"default",...style }}>
      {children}
    </div>
  );
};

const Toggle = ({ on, onToggle }) => (
  <div onClick={e => { e.stopPropagation(); onToggle(); }} style={{ width:44,height:24,borderRadius:12,background:on?"#10B981":"#94A3B840",cursor:"pointer",position:"relative",transition:"background 0.25s",flexShrink:0 }}>
    <div style={{ position:"absolute",top:3,left:on?22:3,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left 0.25s",boxShadow:"0 1px 4px rgba(0,0,0,0.3)" }} />
  </div>
);

const PrimaryToggle = ({ on, onToggle, t }) => (
  <div onClick={e => { e.stopPropagation(); onToggle(); }} style={{ width:44,height:24,borderRadius:12,background:on?t.primary:"#94A3B840",cursor:"pointer",position:"relative",transition:"background 0.25s",flexShrink:0 }}>
    <div style={{ position:"absolute",top:3,left:on?22:3,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left 0.25s",boxShadow:"0 1px 4px rgba(0,0,0,0.3)" }} />
  </div>
);

const Sparkline = ({ data, color, height=40, width=80 }) => {
  const max=Math.max(...data), min=Math.min(...data);
  const pts = data.map((v,i) => `${(i/(data.length-1))*width},${height-((v-min)/(max-min||1))*(height-6)-3}`).join(" ");
  return (
    <svg width={width} height={height} style={{ overflow:"visible",flexShrink:0 }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points={`0,${height} ${pts} ${width},${height}`} fill={color} fillOpacity="0.15" stroke="none"/>
    </svg>
  );
};

const BarChart = ({ data, labels, color, height=90 }) => {
  const max=Math.max(...data);
  return (
    <div style={{ display:"flex",alignItems:"flex-end",gap:3,height }}>
      {data.map((v,i)=>(
        <div key={i} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3 }}>
          <div style={{ width:"100%",borderRadius:"3px 3px 0 0",height:`${(v/max)*(height-18)}px`,background:i===data.length-1?color:`${color}50`,transition:"height 0.6s ease" }}/>
          <div style={{ fontSize:8,color:"#94A3B8",whiteSpace:"nowrap" }}>{labels[i]}</div>
        </div>
      ))}
    </div>
  );
};

// ─── MODAL WRAPPER ────────────────────────────────────────────────────────────
const Modal = ({ t, title, onClose, children }) => (
  <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:200,display:"flex",alignItems:"flex-end",backdropFilter:"blur(6px)" }} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{ width:"100%",maxWidth:430,margin:"0 auto",background:t.bgCard,borderRadius:`${t.r} ${t.r} 0 0`,padding:"20px 20px 44px",border:`1px solid ${t.border}`,boxShadow:`0 -8px 40px rgba(0,0,0,0.4)` }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <div style={{ fontFamily:t.font,fontSize:20,fontWeight:700,color:t.text }}>{title}</div>
        <button onClick={onClose} style={{ background:t.bgMuted,border:"none",width:34,height:34,borderRadius:t.rsm,cursor:"pointer",fontSize:16,color:t.text }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

const Input = ({ t, label, type="text", placeholder="", defaultValue="", value, onChange }) => (
  <div style={{ marginBottom:14 }}>
    {label && <label style={{ display:"block",fontSize:12,fontWeight:600,color:t.textMuted,marginBottom:6,letterSpacing:"0.04em" }}>{label}</label>}
    <input type={type} placeholder={placeholder} defaultValue={defaultValue} value={value} onChange={onChange}
      style={{ width:"100%",padding:"12px 14px",borderRadius:t.rsm,border:`1.5px solid ${t.border}`,background:t.bgInput,color:t.text,fontFamily:t.fontBody,fontSize:14,outline:"none",boxSizing:"border-box",transition:"border-color 0.2s" }}
      onFocus={e=>e.target.style.borderColor=t.primary} onBlur={e=>e.target.style.borderColor=t.border}/>
  </div>
);

// ─── SCREEN: DASHBOARD ────────────────────────────────────────────────────────
const DashboardScreen = ({ t, proName, proType }) => {
  const [period,setPeriod] = useState("week");
  const [copied,setCopied]  = useState(false);
  const [mounted,setMounted]= useState(false);
  const isB = t.id==="beauty";
  const slug = isB?"marie-coiff":"sam-barber";

  useEffect(()=>{ const id=setTimeout(()=>setMounted(true),60); return()=>clearTimeout(id); },[]);

  const STATS = {
    today:{ rev:255,  apts:4,  clients:4,  noShow:0 },
    week: { rev:1240, apts:22, clients:18, noShow:1 },
    month:{ rev:4890, apts:87, clients:61, noShow:3 },
  };
  const s = STATS[period];

  const todayStr = new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});

  const cards = [
    { label:"Revenus",      value:`${fmt(s.rev)}€`,  sub:"+12% vs avant",           grad:t.statsGrad1, spark:[620,840,780,920,1100,890,s.rev] },
    { label:"RDV",          value:s.apts,             sub:`${s.clients} clients`,    grad:t.statsGrad2, spark:[4,6,5,8,7,9,s.apts>9?9:s.apts] },
    { label:"Satisfaction", value:"4.9 ★",            sub:"127 avis",               grad:t.statsGrad3, spark:[4.7,4.8,4.8,4.9,4.9,4.9,4.9] },
    { label:"No-shows",     value:s.noShow,           sub:s.noShow===0?"Parfait 🎉":"À surveiller", grad:t.statsGrad4, spark:[1,0,2,0,1,0,s.noShow] },
  ];

  const handleCopy = () => {
    const url = `beautyflow.app/${slug}`;
    if (navigator.clipboard) { navigator.clipboard.writeText(url).catch(()=>{}); }
    setCopied(true);
    setTimeout(()=>setCopied(false),2000);
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
              {isB?`Bonjour, ${proName} 👋`:`Welcome back, ${proName} ✂️`}
            </div>
            <div style={{ fontSize:13,color:t.textMuted,fontFamily:t.fontBody,marginTop:3 }}>{proType}</div>
          </div>
          <Av init={proName.split(" ").map(n=>n[0]).join("").slice(0,2)} size={48} t={t} style={{ border:`2.5px solid ${t.bgCard}` }}/>
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
          {[["today","Auj."],["week","Semaine"],["month","Mois"]].map(([p,lbl])=>(
            <button key={p} onClick={()=>setPeriod(p)} style={{ flex:1,padding:"8px 4px",border:"none",cursor:"pointer",borderRadius:t.rsm,background:period===p?t.primary:"transparent",color:period===p?t.textInv:t.textMuted,fontFamily:t.fontBody,fontWeight:600,fontSize:12,transition:"all 0.2s" }}>{lbl}</button>
          ))}
        </div>

        {/* Stat cards */}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20 }}>
          {cards.map((c,i)=>(
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
            <div style={{ fontFamily:t.font,fontSize:18,fontWeight:700,color:t.primary }}>{fmt(REVENUE_MONTHLY.reduce((a,b)=>a+b,0))}€</div>
          </div>
          <BarChart data={REVENUE_MONTHLY} labels={MONTHS_S} color={t.primary} height={100}/>
        </Card>

        {/* Today's appointments */}
        <div style={{ marginBottom:16 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
            <div style={{ fontFamily:t.font,fontSize:20,fontWeight:700,color:t.text }}>Aujourd'hui</div>
            <span style={{ fontSize:11,fontFamily:t.fontBody,fontWeight:700,color:t.primary,background:`${t.primary}12`,padding:"4px 12px",borderRadius:t.rpill }}>
              {APPTS_INIT.filter(a=>a.status!=="done").length} à venir
            </span>
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:9 }}>
            {APPTS_INIT.slice(0,3).map(apt=>(
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
};

// ─── SCREEN: AGENDA ───────────────────────────────────────────────────────────
const AgendaScreen = ({ t }) => {
  const now  = new Date();
  const [selDay,setSelDay]    = useState(new Date());
  const [showModal,setShowModal] = useState(false);
  const [view,setView] = useState("day");

  const days = Array.from({length:14},(_,i)=>{ const d=new Date(); d.setDate(now.getDate()+i); return d; });

  const getDayApts = (d) => APPTS_INIT.filter((_,i) => (i + d.getDate()) % 2 === 0);
  const dayApts = getDayApts(selDay);
  const fmtDay  = d => d.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});

  const nowHour = String(now.getHours()).padStart(2,"0");
  const nowMin  = now.getMinutes();

  return (
    <div style={{ minHeight:"100vh",background:t.bg,display:"flex",flexDirection:"column",paddingBottom:80 }}>
      {/* Top nav */}
      <div style={{ background:t.navBg,borderBottom:`1px solid ${t.border}`,padding:"14px 16px 0",backdropFilter:"blur(20px)",flexShrink:0,position:"sticky",top:0,zIndex:20 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
          <div style={{ fontFamily:t.font,fontSize:22,fontWeight:700,color:t.text }}>Agenda</div>
          <div style={{ display:"flex",gap:6 }}>
            {["day","week"].map(v=>(
              <button key={v} onClick={()=>setView(v)} style={{ padding:"6px 14px",border:"none",cursor:"pointer",borderRadius:t.rsm,background:view===v?t.primary:t.bgMuted,color:view===v?t.textInv:t.textMuted,fontFamily:t.fontBody,fontSize:12,fontWeight:600,transition:"all 0.2s" }}>
                {v==="day"?"Jour":"Semaine"}
              </button>
            ))}
          </div>
        </div>
        {/* Day scroller */}
        <div style={{ display:"flex",gap:8,overflowX:"auto",paddingBottom:12,msOverflowStyle:"none",scrollbarWidth:"none" }}>
          {days.map((d,i)=>{
            const isSel   = d.toDateString()===selDay.toDateString();
            const isToday = d.toDateString()===now.toDateString();
            const hasDot  = getDayApts(d).length > 0;
            return (
              <div key={i} onClick={()=>setSelDay(new Date(d))} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",flexShrink:0,padding:"8px 12px",borderRadius:t.r,background:isSel?t.primary:t.bgCard,border:`1.5px solid ${isSel?t.primary:isToday?t.borderFocus:t.border}`,transition:"all 0.2s",minWidth:52 }}>
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
          <span style={{ color:t.primary,fontWeight:600 }}>{dayApts.length} RDV · {dayApts.reduce((a,b)=>a+b.price,0)}€</span>
        </div>
        <div style={{ position:"relative",paddingLeft:60,paddingRight:12 }}>
          {HOURS.map((h,hi)=>{
            const apt = dayApts.find(a=>a.time.startsWith(h));
            const isNowRow = h===nowHour;
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
        onClick={()=>setShowModal(true)}
        style={{ position:"fixed",bottom:80,right:20,width:52,height:52,borderRadius:"50%",border:"none",cursor:"pointer",background:t.heroGrad,color:t.textInv,fontSize:26,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 20px ${t.primaryGlow}`,zIndex:50,transition:"transform 0.2s, box-shadow 0.2s" }}
        onMouseEnter={e=>{ e.currentTarget.style.transform="scale(1.12)"; e.currentTarget.style.boxShadow=`0 6px 28px ${t.primaryGlow}`; }}
        onMouseLeave={e=>{ e.currentTarget.style.transform="scale(1)"; e.currentTarget.style.boxShadow=`0 4px 20px ${t.primaryGlow}`; }}>
        +
      </button>

      {showModal && (
        <Modal t={t} title="Nouveau RDV" onClose={()=>setShowModal(false)}>
          <Input t={t} label="Client" placeholder="Nom du client"/>
          <Input t={t} label="Prestation" placeholder="Ex: Brushing Star"/>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            <Input t={t} label="Date" type="date"/>
            <Input t={t} label="Heure" type="time"/>
          </div>
          <Btn t={t} style={{ width:"100%",padding:"13px",marginTop:4 }} onClick={()=>setShowModal(false)}>
            Ajouter le RDV ✓
          </Btn>
        </Modal>
      )}
    </div>
  );
};

// ─── SCREEN: CLIENTS ──────────────────────────────────────────────────────────
const ClientsScreen = ({ t }) => {
  const [search,setSearch] = useState("");
  const [sort,setSort]     = useState("spent");
  const [selectedId,setSelectedId] = useState(null);

  const filtered = [...CLIENTS_INIT]
    .filter(c=>c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b)=>sort==="spent"?b.spent-a.spent:sort==="visits"?b.visits-a.visits:b.noShow-a.noShow);

  if (selectedId !== null) {
    const c = CLIENTS_INIT.find(cl=>cl.id===selectedId);
    if (!c) { setSelectedId(null); return null; }
    return (
      <div style={{ minHeight:"100vh",background:t.bg,paddingBottom:80 }}>
        <div style={{ background:t.navBg,borderBottom:`1px solid ${t.border}`,padding:"14px 16px",display:"flex",gap:12,alignItems:"center",backdropFilter:"blur(20px)",position:"sticky",top:0,zIndex:20 }}>
          <button onClick={()=>setSelectedId(null)} style={{ background:t.bgMuted,border:"none",width:36,height:36,borderRadius:t.rsm,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",color:t.text }}>←</button>
          <div style={{ fontFamily:t.font,fontSize:18,fontWeight:700,color:t.text }}>Fiche client</div>
        </div>
        <div style={{ padding:"20px 16px" }}>
          <Card t={t} style={{ padding:"20px",marginBottom:16 }}>
            <div style={{ display:"flex",gap:14,alignItems:"center",marginBottom:16 }}>
              <Av init={c.avatar} size={60} t={t} style={{ border:`3px solid ${t.bgCard}`,boxShadow:`0 4px 16px ${t.primaryGlow}` }}/>
              <div>
                <div style={{ fontFamily:t.font,fontSize:22,fontWeight:700,color:t.text }}>{c.name}</div>
                <div style={{ fontSize:13,color:t.textMuted,fontFamily:t.fontBody,marginTop:2 }}>📱 {c.phone}</div>
                {c.noShow>0 && <div style={{ fontSize:12,color:"#EF4444",marginTop:4,fontWeight:600 }}>⚠️ {c.noShow} no-show(s)</div>}
              </div>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10 }}>
              {[["Visites",c.visits,"📅"],["Dépensé",`${c.spent}€`,"💶"],["No-shows",c.noShow,"⚠️"]].map(([l,v,ic])=>(
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
          {APPTS_INIT.slice(0,3).map(a=>(
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
          {c.noShow>0 && (
            <Card t={t} style={{ padding:"14px 16px",background:"#EF444408",border:"1px solid #EF444430",marginTop:12 }}>
              <div style={{ fontSize:13,fontWeight:700,color:"#EF4444",marginBottom:8 }}>⚠️ Client à risque no-show</div>
              <div style={{ fontSize:12,color:t.textMuted,fontFamily:t.fontBody,lineHeight:1.6 }}>
                {c.noShow} absence(s) non justifiée(s). Activez un acompte obligatoire pour ce client.
              </div>
              <Btn t={t} size="sm" style={{ marginTop:10 }} variant="soft">Forcer l'acompte</Btn>
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
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Chercher un client..." style={{ width:"100%",padding:"10px 14px 10px 36px",borderRadius:t.rsm,border:`1.5px solid ${t.border}`,background:t.bgInput,color:t.text,fontFamily:t.fontBody,fontSize:13,outline:"none",boxSizing:"border-box" }}
            onFocus={e=>e.target.style.borderColor=t.primary} onBlur={e=>e.target.style.borderColor=t.border}/>
        </div>
        <div style={{ display:"flex",gap:6 }}>
          {[["spent","💶 Dépenses"],["visits","📅 Visites"],["noshow","⚠️ No-shows"]].map(([s,l])=>(
            <button key={s} onClick={()=>setSort(s)} style={{ padding:"5px 12px",border:"none",cursor:"pointer",borderRadius:t.rpill,background:sort===s?t.primary:t.bgMuted,color:sort===s?t.textInv:t.textMuted,fontFamily:t.fontBody,fontSize:11,fontWeight:600,transition:"all 0.2s" }}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{ padding:"12px",display:"flex",flexDirection:"column",gap:9 }}>
        {filtered.map(c=>(
          <Card key={c.id} t={t} hover onClick={()=>setSelectedId(c.id)} style={{ padding:"14px 16px" }}>
            <div style={{ display:"flex",alignItems:"center",gap:12 }}>
              <div style={{ position:"relative" }}>
                <Av init={c.avatar} size={44} t={t}/>
                {c.noShow>0 && <div style={{ position:"absolute",top:-2,right:-2,width:16,height:16,borderRadius:"50%",background:"#EF4444",border:`2px solid ${t.bgCard}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#fff",fontWeight:700 }}>{c.noShow}</div>}
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
};

// ─── SCREEN: SERVICES ─────────────────────────────────────────────────────────
const ServicesScreen = ({ t }) => {
  const [services,setServices] = useState(SVCS_INIT);
  const [editSvc,setEditSvc]   = useState(null);

  const toggleActive = (id) => {
    setServices(prev => prev.map(s => s.id===id ? {...s,active:!s.active} : s));
  };
  const toggleDeposit = (id) => {
    setServices(prev => prev.map(s => s.id===id ? {...s,deposit:!s.deposit} : s));
  };

  const svc = editSvc && editSvc!=="new" ? services.find(s=>s.id===editSvc.id) : null;

  return (
    <div style={{ minHeight:"100vh",background:t.bg,paddingBottom:80 }}>
      <div style={{ background:t.navBg,borderBottom:`1px solid ${t.border}`,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",backdropFilter:"blur(20px)",position:"sticky",top:0,zIndex:20 }}>
        <div style={{ fontFamily:t.font,fontSize:22,fontWeight:700,color:t.text }}>Prestations</div>
        <Btn t={t} size="sm" onClick={()=>setEditSvc("new")}>+ Nouvelle</Btn>
      </div>

      {/* Summary pills */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,padding:"12px 12px 0" }}>
        {[
          { label:"Actives",          value:services.filter(s=>s.active).length,            grad:t.statsGrad1 },
          { label:"Réservations/mois",value:services.reduce((a,b)=>a+b.bookings,0),         grad:t.statsGrad2 },
        ].map(s=>(
          <div key={s.label} style={{ background:s.grad,borderRadius:t.r,padding:"14px 16px" }}>
            <div style={{ fontSize:10,color:"rgba(255,255,255,0.65)",fontFamily:t.fontBody,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4 }}>{s.label}</div>
            <div style={{ fontFamily:t.font,fontSize:30,fontWeight:700,color:"#fff" }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ padding:"12px",display:"flex",flexDirection:"column",gap:10 }}>
        {services.map(sv=>(
          <Card key={sv.id} t={t} style={{ padding:"16px 18px",opacity:sv.active?1:0.6,transition:"opacity 0.2s" }}>
            <div style={{ display:"flex",alignItems:"center",gap:12 }}>
              <div style={{ fontSize:28,flexShrink:0 }}>{sv.icon}</div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontWeight:700,fontSize:14,color:t.text }}>{sv.name}</div>
                <div style={{ fontSize:12,color:t.textMuted,fontFamily:t.fontBody,marginTop:2 }}>{sv.cat} · {sv.dur}min · {sv.bookings} rés.</div>
                <div style={{ display:"flex",gap:6,marginTop:6,flexWrap:"wrap",alignItems:"center" }}>
                  {sv.deposit && <span style={{ fontSize:10,color:t.primary,fontWeight:600 }}>🔒 Acompte</span>}
                  <span style={{ fontSize:10,color:sv.active?"#10B981":"#94A3B8",fontWeight:600 }}>{sv.active?"● Actif":"○ Inactif"}</span>
                </div>
              </div>
              <div style={{ textAlign:"right",flexShrink:0,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8 }}>
                <div style={{ fontFamily:t.font,fontSize:22,fontWeight:700,color:t.primary }}>{sv.price}€</div>
                <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                  <Btn t={t} size="sm" variant="ghost" onClick={()=>setEditSvc(sv)}>✏️ Éditer</Btn>
                  <PrimaryToggle on={sv.active} onToggle={()=>toggleActive(sv.id)} t={t}/>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {editSvc && (
        <Modal t={t} title={editSvc==="new"?"Nouvelle prestation":`Modifier : ${svc?.name||""}`} onClose={()=>setEditSvc(null)}>
          <Input t={t} label="Nom" placeholder="Ex: Brushing Star" defaultValue={svc?.name||""}/>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            <Input t={t} label="Prix (€)" type="number" placeholder="25" defaultValue={svc?.price||""}/>
            <Input t={t} label="Durée (min)" type="number" placeholder="30" defaultValue={svc?.dur||""}/>
          </div>
          <Input t={t} label="Catégorie" placeholder="Coiffure / Onglerie / Soin" defaultValue={svc?.cat||""}/>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 0",borderTop:`1px solid ${t.border}`,marginBottom:16 }}>
            <div>
              <div style={{ fontSize:13,fontWeight:600,color:t.text }}>🔒 Acompte anti no-show</div>
              <div style={{ fontSize:11,color:t.textMuted,marginTop:2 }}>1% du prix encaissé via Stripe</div>
            </div>
            {svc
              ? <PrimaryToggle on={svc.deposit} onToggle={()=>toggleDeposit(svc.id)} t={t}/>
              : <PrimaryToggle on={false} onToggle={()=>{}} t={t}/>
            }
          </div>
          <Btn t={t} style={{ width:"100%",padding:"13px" }} onClick={()=>setEditSvc(null)}>Enregistrer ✓</Btn>
          {editSvc!=="new" && (
            <Btn t={t} variant="danger" style={{ width:"100%",padding:"11px",marginTop:8 }} onClick={()=>{ setServices(prev=>prev.filter(s=>s.id!==svc?.id)); setEditSvc(null); }}>
              Supprimer la prestation
            </Btn>
          )}
        </Modal>
      )}
    </div>
  );
};

// ─── SCREEN: SETTINGS ────────────────────────────────────────────────────────
const SettingsScreen = ({ t, proType, onThemeChange, currentTheme }) => {
  const isB = t.id==="beauty";
  const [notif,setNotif]   = useState({ sms:true,  email:true,  push:false });
  const [hours,setHours]   = useState({ 0:true,1:true,2:true,3:true,4:true,5:true,6:false });
  const [copied,setCopied] = useState(false);
  const slug = isB?"marie-coiff":"sam-barber";

  const handleCopy = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(`beautyflow.app/${slug}`).catch(()=>{});
    setCopied(true); setTimeout(()=>setCopied(false),2000);
  };

  const Section = ({ title, children }) => (
    <div style={{ marginBottom:20 }}>
      <div style={{ fontSize:11,fontWeight:700,color:t.textMuted,fontFamily:t.fontBody,letterSpacing:"0.1em",textTransform:"uppercase",margin:"0 4px 10px" }}>{title}</div>
      <div style={{ background:t.bgCard,borderRadius:t.r,border:`1px solid ${t.border}`,overflow:"hidden" }}>{children}</div>
    </div>
  );

  const Row = ({ icon, label, sub, right, onClick, noBorder=false }) => (
    <div onClick={onClick} style={{ display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderBottom:noBorder?"none":`1px solid ${t.border}`,cursor:onClick?"pointer":"default" }}>
      <span style={{ fontSize:20,flexShrink:0 }}>{icon}</span>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:14,fontWeight:600,color:t.text,fontFamily:t.fontBody }}>{label}</div>
        {sub&&<div style={{ fontSize:11,color:t.textMuted,fontFamily:t.fontBody,marginTop:2 }}>{sub}</div>}
      </div>
      {right&&<div style={{ flexShrink:0 }}>{right}</div>}
    </div>
  );

  const DAY_NAMES = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];

  return (
    <div style={{ minHeight:"100vh",background:t.bg,fontFamily:t.fontBody,paddingBottom:100 }}>
      <div style={{ background:t.navBg,borderBottom:`1px solid ${t.border}`,padding:"14px 16px",backdropFilter:"blur(20px)",position:"sticky",top:0,zIndex:20 }}>
        <div style={{ fontFamily:t.font,fontSize:22,fontWeight:700,color:t.text }}>Paramètres</div>
      </div>
      <div style={{ padding:"16px 12px 0" }}>

        {/* Profile */}
        <Section title="Mon profil">
          <div style={{ padding:"16px",display:"flex",alignItems:"center",gap:14,borderBottom:`1px solid ${t.border}` }}>
            <Av init={isB?"MD":"SK"} size={58} t={t} style={{ border:`3px solid ${t.bgCard}` }}/>
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ fontFamily:t.font,fontSize:20,fontWeight:700,color:t.text }}>{isB?"Marie Dupont":"Sam El Khatib"}</div>
              <div style={{ fontSize:12,color:t.primary,fontFamily:t.fontBody,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>beautyflow.app/{slug}</div>
              <div style={{ fontSize:11,color:t.textMuted,marginTop:2 }}>{proType}</div>
            </div>
          </div>
          <Row icon="✏️" label="Modifier le profil" sub="Nom, bio, photo de couverture" right={<span style={{color:t.textSoft}}>›</span>} onClick={()=>{}}/>
          <Row icon="🔗" label="Lien de réservation" sub={`beautyflow.app/${slug}`} right={<Btn t={t} size="sm" variant="soft" onClick={handleCopy}>{copied?"✓ Copié !":"Copier"}</Btn>} noBorder/>
        </Section>

        {/* Theme */}
        <Section title="Thème interface">
          <div style={{ padding:"14px" }}>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
              {["beauty","barber"].map(th=>(
                <div key={th} onClick={()=>onThemeChange(th)} style={{ padding:"14px",borderRadius:t.r,cursor:"pointer",border:`2px solid ${currentTheme===th?t.primary:t.border}`,background:T[th].bg,transition:"all 0.2s",boxShadow:currentTheme===th?`0 4px 16px ${t.primaryGlow}`:"none" }}>
                  <div style={{ fontSize:22,marginBottom:6 }}>{th==="beauty"?"🌸":"✂️"}</div>
                  <div style={{ fontFamily:T[th].font,fontSize:14,fontWeight:700,color:T[th].text }}>{th==="beauty"?"Beauty":"Barber"}</div>
                  <div style={{ fontSize:10,color:T[th].textMuted,marginTop:2 }}>{th==="beauty"?"Coiffure & Beauté":"Barbier"}</div>
                  <div style={{ display:"flex",gap:4,marginTop:8 }}>
                    {[T[th].primary,T[th].text,T[th].bgCard].map((c,i)=>(
                      <div key={i} style={{ width:14,height:14,borderRadius:"50%",background:c,border:"1px solid rgba(0,0,0,0.15)" }}/>
                    ))}
                  </div>
                  {currentTheme===th && <div style={{ marginTop:8,fontSize:10,color:t.primary,fontWeight:700 }}>✓ Actif</div>}
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Horaires */}
        <Section title="Horaires de travail">
          {DAY_NAMES.map((day,i)=>(
            <Row key={day} icon={hours[i]?"🟢":"⭕"} label={day}
              sub={hours[i]?(i<5?"09:00 – 18:00":"10:00 – 16:00"):"Fermé"}
              right={<Toggle on={hours[i]} onToggle={()=>setHours(h=>({...h,[i]:!h[i]}))}/>}
              noBorder={i===6}/>
          ))}
        </Section>

        {/* Stripe */}
        <Section title="Paiements & No-shows">
          <div style={{ padding:"16px",borderBottom:`1px solid ${t.border}` }}>
            <div style={{ display:"flex",gap:10,marginBottom:12 }}>
              <span style={{ fontSize:26 }}>💳</span>
              <div>
                <div style={{ fontSize:14,fontWeight:700,color:t.text }}>Stripe Connect</div>
                <div style={{ fontSize:12,color:t.textMuted,marginTop:2 }}>Acomptes automatiques · Paiement sécurisé</div>
              </div>
            </div>
            <div style={{ padding:"10px 12px",borderRadius:t.rsm,background:"#F59E0B08",border:"1px solid #F59E0B30",fontSize:12,color:"#D97706",marginBottom:12,fontFamily:t.fontBody }}>
              ⚠️ Non connecté — vos créneaux ne sont pas protégés
            </div>
            <Btn t={t} style={{ width:"100%",padding:"12px" }}>Connecter Stripe →</Btn>
          </div>
          <Row icon="💸" label="Taux d'acompte" sub="Appliqué sur les prestations avec dépôt" right={<span style={{fontSize:14,fontWeight:700,color:t.primary}}>1%</span>}/>
          <Row icon="⚠️" label="Clients à risque" sub={`${CLIENTS_INIT.filter(c=>c.noShow>0).length} client(s) avec no-show`} right={<span style={{color:t.textSoft}}>›</span>} onClick={()=>{}} noBorder/>
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          <Row icon="📱" label="SMS de rappel" sub="24h et 2h avant le RDV" right={<Toggle on={notif.sms} onToggle={()=>setNotif(n=>({...n,sms:!n.sms}))}/>}/>
          <Row icon="✉️" label="Email" sub="Confirmations et rappels" right={<Toggle on={notif.email} onToggle={()=>setNotif(n=>({...n,email:!n.email}))}/>}/>
          <Row icon="🔔" label="Push (app)" sub="Nouvelles réservations en temps réel" right={<Toggle on={notif.push} onToggle={()=>setNotif(n=>({...n,push:!n.push}))}/>} noBorder/>
        </Section>

        {/* Account */}
        <Section title="Compte">
          <Row icon="📤" label="Exporter mes données" sub="CSV clients + revenus" right={<span style={{color:t.textSoft}}>›</span>} onClick={()=>{}}/>
          <Row icon="🚪" label="Déconnexion" right={<span style={{color:"#EF4444",fontSize:14,fontWeight:700}}>→</span>} onClick={()=>{}} noBorder/>
        </Section>
      </div>
    </div>
  );
};

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function BeautyFlowPro() {
  const [themeId,setThemeId] = useState("beauty");
  const [screen,setScreen]   = useState("dashboard");
  const t = T[themeId];
  const isB = themeId==="beauty";

  useEffect(()=>{
    const id=`bf-font-${themeId}`;
    if (!document.getElementById(id)){
      const l=document.createElement("link"); l.id=id; l.rel="stylesheet"; l.href=FONTS[themeId];
      document.head.appendChild(l);
    }
  },[themeId]);

  const NAV = [
    { id:"dashboard", icon:"📊", label:"Dashboard" },
    { id:"agenda",    icon:"📅", label:"Agenda" },
    { id:"clients",   icon:"👥", label:"Clients" },
    { id:"services",  icon:"✨", label:"Services" },
    { id:"settings",  icon:"⚙️", label:"Réglages" },
  ];

  const proName = isB?"Marie D.":"Sam E.";
  const proType = isB?"Coiffure & Onglerie · Paris":"Barbier Premium · Paris";

  return (
    <div style={{ maxWidth:430,margin:"0 auto",background:t.bg,minHeight:"100vh",position:"relative",overflowX:"hidden",fontFamily:t.fontBody }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;height:3px;}
        ::-webkit-scrollbar-thumb{background:${t.border};border-radius:2px;}
        input[type=date]::-webkit-calendar-picker-indicator{filter:${t.id==="barber"?"invert(1)":"none"};}
        input::placeholder{color:${t.textSoft};opacity:0.7;}
        @keyframes slideUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:none;}}
        @keyframes pop{from{transform:scale(0.8);opacity:0;}to{transform:scale(1);opacity:1;}}
      `}</style>

      {/* Theme toggle — top right */}
      <div style={{ position:"fixed",top:10,right:10,zIndex:300,display:"flex",gap:5 }}>
        {["beauty","barber"].map(th=>(
          <button key={th} onClick={()=>setThemeId(th)} style={{ width:34,height:34,borderRadius:T[th].rpill,border:`2px solid ${themeId===th?t.primary:t.border}`,cursor:"pointer",background:themeId===th?`${t.primary}20`:t.bgCard,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s",boxShadow:themeId===th?`0 2px 10px ${t.primaryGlow}`:t.shadow }}>
            {th==="beauty"?"🌸":"✂️"}
          </button>
        ))}
      </div>

      {/* Screen content */}
      <div key={screen} style={{ animation:"slideUp 0.25s ease" }}>
        {screen==="dashboard" && <DashboardScreen t={t} proName={proName} proType={proType}/>}
        {screen==="agenda"    && <AgendaScreen t={t}/>}
        {screen==="clients"   && <ClientsScreen t={t}/>}
        {screen==="services"  && <ServicesScreen t={t}/>}
        {screen==="settings"  && <SettingsScreen t={t} proType={proType} onThemeChange={setThemeId} currentTheme={themeId}/>}
      </div>

      {/* Bottom nav */}
      <div style={{ position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:t.navBg,borderTop:`1px solid ${t.border}`,padding:"6px 0 16px",display:"flex",backdropFilter:"blur(24px)",zIndex:100,boxShadow:`0 -4px 20px ${t.primaryGlow}` }}>
        {NAV.map(item=>{
          const active=screen===item.id;
          return (
            <button key={item.id} onClick={()=>setScreen(item.id)} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:"none",border:"none",cursor:"pointer",padding:"4px 0",flex:1,transition:"all 0.18s" }}>
              <div style={{ fontSize:20,transition:"all 0.2s",filter:active?"none":"grayscale(70%) opacity(0.5)",transform:active?"scale(1.12)":"scale(1)" }}>{item.icon}</div>
              <div style={{ fontSize:9,fontFamily:t.fontBody,fontWeight:700,color:active?t.primary:t.textSoft,transition:"color 0.2s",letterSpacing:"0.04em",textTransform:"uppercase" }}>{item.label}</div>
              {active && <div style={{ width:16,height:3,borderRadius:t.rpill,background:t.primary,animation:"pop 0.2s ease" }}/>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
