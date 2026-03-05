export default function Input({ t, label, type = "text", placeholder = "", defaultValue = "", value, onChange }) {
  return (
    <div style={{ marginBottom:14 }}>
      {label && <label style={{ display:"block",fontSize:12,fontWeight:600,color:t.textMuted,marginBottom:6,letterSpacing:"0.04em" }}>{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        style={{ width:"100%",padding:"12px 14px",borderRadius:t.rsm,border:`1.5px solid ${t.border}`,background:t.bgInput,color:t.text,fontFamily:t.fontBody,fontSize:14,outline:"none",boxSizing:"border-box",transition:"border-color 0.2s" }}
        onFocus={e => e.target.style.borderColor = t.primary}
        onBlur={e => e.target.style.borderColor = t.border}
      />
    </div>
  );
}
