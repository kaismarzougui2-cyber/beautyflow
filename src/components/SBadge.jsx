import { SL } from "../data.js";

export default function SBadge({ status, t }) {
  const s = { confirmed:t.sCfm, pending:t.sPnd, cancelled:t.sCnx, no_show:t.sNSh, done:t.sDne }[status] || t.sPnd;
  return (
    <span style={{ padding:"3px 10px",borderRadius:t.rpill,background:s.bg,color:s.color,fontSize:11,fontWeight:700,fontFamily:t.fontBody,whiteSpace:"nowrap" }}>
      {SL[status] || status}
    </span>
  );
}
