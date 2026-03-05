import { useState } from "react";

export default function Card({ children, t, style = {}, hover = false, onClick }) {
  const [h, setH] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hover && setH(true)}
      onMouseLeave={() => hover && setH(false)}
      style={{ background:t.bgCard,borderRadius:t.r,border:`1px solid ${h?t.borderFocus:t.border}`,boxShadow:h?t.shadowHover:t.shadow,transition:"all 0.2s",transform:h?"translateY(-2px)":"none",cursor:onClick?"pointer":"default",...style }}
    >
      {children}
    </div>
  );
}
