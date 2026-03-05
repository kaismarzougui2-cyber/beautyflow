export default function Sparkline({ data, color, height = 40, width = 80 }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / (max - min || 1)) * (height - 6) - 3}`).join(" ");
  return (
    <svg width={width} height={height} style={{ overflow:"visible", flexShrink:0 }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={`0,${height} ${pts} ${width},${height}`} fill={color} fillOpacity="0.15" stroke="none" />
    </svg>
  );
}
