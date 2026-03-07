import { SL } from "../data.js";

const EXTRA_LABELS = {
  pending_confirmation: "En attente d'email",
  cancelled: "Annulé",
};

export default function SBadge({ status, t }) {
  const map = {
    confirmed: t.sCfm,
    pending: t.sPnd,
    cancelled: t.sCnx,
    no_show: t.sNSh,
    done: t.sDne,
    pending_confirmation: { bg: "#FFF8E1", color: "#B45309" },
  };
  const s = map[status] || t.sPnd;
  const label = EXTRA_LABELS[status] || SL[status] || status;
  return (
    <span style={{ padding: "3px 10px", borderRadius: t.rpill, background: s.bg, color: s.color, fontSize: 11, fontWeight: 700, fontFamily: t.fontBody, whiteSpace: "nowrap" }}>
      {status === "pending_confirmation" ? "⏳ " : ""}{label}
    </span>
  );
}
