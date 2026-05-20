interface Props {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function LandBoundaryIcon({ size = 20, color = "#374151", strokeWidth = 2 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Folded map base */}
      <polygon points="2,21 5,12 19,12 22,21" />
      {/* Fold lines from bottom corners and top-left to centre fold point */}
      <line x1="2"  y1="21" x2="12" y2="16" />
      <line x1="22" y1="21" x2="12" y2="16" />
      <line x1="5"  y1="12" x2="12" y2="16" />
      {/* Pin teardrop */}
      <path d="M12 1 C9 1 7 3.2 7 5.8 C7 9 12 14 12 14 C12 14 17 9 17 5.8 C17 3.2 15 1 12 1 Z" />
      {/* Pin inner circle */}
      <circle cx="12" cy="5.8" r="2.2" />
    </svg>
  );
}
