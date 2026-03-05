export default function Av({ init, size = 40, t, style = {} }) {
  return (
    <div style={{ width:size,height:size,borderRadius:"50%",background:`linear-gradient(135deg,${t.primary},${t.accent2})`,display:"flex",alignItems:"center",justifyContent:"center",color:t.textInv,fontFamily:t.fontBody,fontWeight:700,fontSize:size*0.3,flexShrink:0,boxShadow:`0 2px 10px ${t.primaryGlow}`,...style }}>
      {init}
    </div>
  );
}
