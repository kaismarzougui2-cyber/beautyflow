export default function BarChart({ data, labels, color, height = 90 }) {
  const max = Math.max(...data);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:3, height }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
          <div style={{ width:"100%", borderRadius:"3px 3px 0 0", height:`${(v / max) * (height - 18)}px`, background:i === data.length - 1 ? color : `${color}50`, transition:"height 0.6s ease" }} />
          <div style={{ fontSize:8, color:"#94A3B8", whiteSpace:"nowrap" }}>{labels[i]}</div>
        </div>
      ))}
    </div>
  );
}
