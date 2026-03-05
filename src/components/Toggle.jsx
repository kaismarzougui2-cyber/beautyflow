export function Toggle({ on, onToggle }) {
  return (
    <div onClick={e => { e.stopPropagation(); onToggle(); }} style={{ width:44,height:24,borderRadius:12,background:on?"#10B981":"#94A3B840",cursor:"pointer",position:"relative",transition:"background 0.25s",flexShrink:0 }}>
      <div style={{ position:"absolute",top:3,left:on?22:3,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left 0.25s",boxShadow:"0 1px 4px rgba(0,0,0,0.3)" }} />
    </div>
  );
}

export function PrimaryToggle({ on, onToggle, t }) {
  return (
    <div onClick={e => { e.stopPropagation(); onToggle(); }} style={{ width:44,height:24,borderRadius:12,background:on?t.primary:"#94A3B840",cursor:"pointer",position:"relative",transition:"background 0.25s",flexShrink:0 }}>
      <div style={{ position:"absolute",top:3,left:on?22:3,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left 0.25s",boxShadow:"0 1px 4px rgba(0,0,0,0.3)" }} />
    </div>
  );
}
