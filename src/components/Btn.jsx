import { useState } from "react";

export default function Btn({ children, onClick, variant = "primary", t, style = {}, disabled = false, size = "md" }) {
  const [h, setH] = useState(false);
  const pad = size === "sm" ? "7px 14px" : size === "lg" ? "14px 28px" : "11px 22px";
  const fz  = size === "sm" ? 12 : size === "lg" ? 15 : 13;
  const base = { display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,border:"none",cursor:disabled?"not-allowed":"pointer",fontFamily:t.fontBody,fontWeight:600,fontSize:fz,transition:"all 0.18s",borderRadius:t.rpill,opacity:disabled?0.45:1,letterSpacing:"0.02em",padding:pad,...style };
  const v = {
    primary: { background:h?t.primaryHover:t.primary,color:t.textInv,boxShadow:h?`0 6px 22px ${t.primaryGlow}`:`0 2px 10px ${t.primaryGlow}`,transform:h?"translateY(-1px)":"none" },
    ghost:   { background:h?t.bgMuted:"transparent",color:t.text,border:`1.5px solid ${t.border}`,transform:h?"translateY(-1px)":"none" },
    soft:    { background:h?t.primaryLight:`${t.primary}12`,color:t.primary,transform:h?"translateY(-1px)":"none" },
    danger:  { background:h?"#C6282820":"#EF444415",color:"#EF4444",border:"1px solid #EF444430",transform:h?"translateY(-1px)":"none" },
  };
  return (
    <button onClick={disabled ? undefined : onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ ...base, ...v[variant] }}>
      {children}
    </button>
  );
}
