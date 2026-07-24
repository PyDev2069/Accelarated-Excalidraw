// ── Placeholder vector art shown on board thumbnails ─────────────────────
// A handful of abstract line/shape patterns, cycled by index, standing in
// for a real board preview image.
function PlaceholderArt({ index = 0, tint, size = 64 }) {
  const { stroke, fill } = tint;
  const patterns = [
    // scattered notes / sticky shapes
    <svg key="a" viewBox="0 0 64 64" width={size} height={size} fill="none">
      <rect x="10" y="12" width="18" height="18" rx="3" fill={fill} stroke={stroke} strokeWidth="1.5" transform="rotate(-6 19 21)" />
      <rect x="30" y="26" width="18" height="18" rx="3" fill="white" stroke={stroke} strokeWidth="1.5" transform="rotate(5 39 35)" />
      <circle cx="46" cy="16" r="6" fill={fill} stroke={stroke} strokeWidth="1.5" />
    </svg>,
    // flow / connector diagram
    <svg key="b" viewBox="0 0 64 64" width={size} height={size} fill="none">
      <rect x="8" y="14" width="16" height="12" rx="3" fill="white" stroke={stroke} strokeWidth="1.5" />
      <rect x="40" y="14" width="16" height="12" rx="3" fill="white" stroke={stroke} strokeWidth="1.5" />
      <rect x="24" y="38" width="16" height="12" rx="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
      <path d="M24 20 H40 M16 26 V38 H24 M48 26 V38 H40" stroke={stroke} strokeWidth="1.5" fill="none" />
    </svg>,
    // freeform sketch strokes
    <svg key="c" viewBox="0 0 64 64" width={size} height={size} fill="none">
      <path d="M10 40 Q 20 14, 32 30 T 54 20" stroke={stroke} strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="14" cy="46" r="4" fill={fill} stroke={stroke} strokeWidth="1.5" />
      <circle cx="46" cy="44" r="6" fill="white" stroke={stroke} strokeWidth="1.5" />
    </svg>,
    // grid / mind-map bubbles
    <svg key="d" viewBox="0 0 64 64" width={size} height={size} fill="none">
      <circle cx="32" cy="18" r="9" fill={fill} stroke={stroke} strokeWidth="1.5" />
      <circle cx="16" cy="42" r="7" fill="white" stroke={stroke} strokeWidth="1.5" />
      <circle cx="48" cy="42" r="7" fill="white" stroke={stroke} strokeWidth="1.5" />
      <path d="M27 24 L19 36 M37 24 L45 36" stroke={stroke} strokeWidth="1.5" fill="none" />
    </svg>,
    // simple bar/chart doodle
    <svg key="e" viewBox="0 0 64 64" width={size} height={size} fill="none">
      <rect x="12" y="30" width="8" height="20" rx="2" fill={fill} stroke={stroke} strokeWidth="1.5" />
      <rect x="28" y="18" width="8" height="32" rx="2" fill="white" stroke={stroke} strokeWidth="1.5" />
      <rect x="44" y="24" width="8" height="26" rx="2" fill={fill} stroke={stroke} strokeWidth="1.5" />
    </svg>,
  ];
  return patterns[index % patterns.length];
}

export default PlaceholderArt;
