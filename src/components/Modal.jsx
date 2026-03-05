export default function Modal({ t, title, onClose, children }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:200,display:"flex",alignItems:"flex-end",backdropFilter:"blur(6px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width:"100%",maxWidth:430,margin:"0 auto",background:t.bgCard,borderRadius:`${t.r} ${t.r} 0 0`,padding:"20px 20px 44px",border:`1px solid ${t.border}`,boxShadow:`0 -8px 40px rgba(0,0,0,0.4)` }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
          <div style={{ fontFamily:t.font,fontSize:20,fontWeight:700,color:t.text }}>{title}</div>
          <button onClick={onClose} style={{ background:t.bgMuted,border:"none",width:34,height:34,borderRadius:t.rsm,cursor:"pointer",fontSize:16,color:t.text }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
