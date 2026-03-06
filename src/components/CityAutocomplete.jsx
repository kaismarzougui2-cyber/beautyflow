import { useState, useEffect, useRef } from "react";

export default function CityAutocomplete({ t, value, onChange, placeholder = "Ex: Paris" }) {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(query)}&fields=nom&boost=population&limit=6`
        );
        const data = await res.json();
        setSuggestions(Array.isArray(data) ? data.map(c => c.nom) : []);
      } catch {
        setSuggestions([]);
      }
      setLoading(false);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const select = (city) => {
    setQuery(city);
    onChange(city);
    setSuggestions([]);
    setOpen(false);
  };

  const inpStyle = {
    width: "100%", padding: "13px 16px", borderRadius: t.rsm,
    border: `1.5px solid ${t.border}`, background: t.bgInput,
    color: t.text, fontFamily: t.fontBody, fontSize: 14,
    outline: "none", boxSizing: "border-box",
  };

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <input
        value={query}
        onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={e => { setOpen(true); e.target.style.borderColor = t.primary; }}
        onBlur={e => e.target.style.borderColor = t.border}
        placeholder={placeholder}
        style={inpStyle}
        autoComplete="off"
      />
      {open && (suggestions.length > 0 || loading) && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: t.bgCard, border: `1px solid ${t.border}`,
          borderRadius: t.rsm, zIndex: 200, overflow: "hidden",
          boxShadow: t.shadowHover,
        }}>
          {loading && (
            <div style={{ padding: "10px 14px", fontSize: 13, color: t.textMuted, fontFamily: t.fontBody }}>
              Recherche...
            </div>
          )}
          {suggestions.map((city, i) => (
            <div
              key={city}
              onMouseDown={() => select(city)}
              style={{
                padding: "11px 16px", fontSize: 14, color: t.text, cursor: "pointer",
                fontFamily: t.fontBody, borderBottom: i < suggestions.length - 1 ? `1px solid ${t.border}` : "none",
                display: "flex", alignItems: "center", gap: 8,
              }}
              onMouseEnter={e => e.currentTarget.style.background = `${t.primary}14`}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ fontSize: 12 }}>📍</span>
              {city}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
