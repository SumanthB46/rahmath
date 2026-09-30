interface BrandLogoProps {
  className?: string;
  size?: number;
}

export function BrandLogo({ className = "", size = 28 }: BrandLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-300 ${className}`}
    >
      <defs>
        {/* Luxury Gold Gradient */}
        <linearGradient id="mubarakGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5D77F" />
          <stop offset="35%" stopColor="#D4AF37" />
          <stop offset="70%" stopColor="#AA771C" />
          <stop offset="100%" stopColor="#E6CA65" />
        </linearGradient>

        {/* Tile Slab Dark Shadow Gradient */}
        <linearGradient id="tileDarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2A2826" />
          <stop offset="100%" stopColor="#141312" />
        </linearGradient>

        {/* Soft Bevel Inner Shadow */}
        <linearGradient id="bevelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Outer Rectified Tile Slab Base */}
      <rect
        x="3"
        y="3"
        width="42"
        height="42"
        rx="10"
        fill="url(#tileDarkGrad)"
        stroke="url(#mubarakGoldGrad)"
        strokeWidth="2"
      />

      {/* Inner Tile Slab Grid Accent */}
      <rect
        x="6"
        y="6"
        width="36"
        height="36"
        rx="7"
        fill="none"
        stroke="url(#mubarakGoldGrad)"
        strokeWidth="0.8"
        strokeOpacity="0.4"
      />

      {/* Architectural Stylized 'M' Ceramic Monogram */}
      <path
        d="M13 33V16L24 25.5L35 16V33M19 33V23.5L24 28L29 23.5V33"
        stroke="url(#mubarakGoldGrad)"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Golden Corner Tile Anchor Dots */}
      <circle cx="9" cy="9" r="1.2" fill="url(#mubarakGoldGrad)" />
      <circle cx="39" cy="9" r="1.2" fill="url(#mubarakGoldGrad)" />
      <circle cx="9" cy="39" r="1.2" fill="url(#mubarakGoldGrad)" />
      <circle cx="39" cy="39" r="1.2" fill="url(#mubarakGoldGrad)" />
    </svg>
  );
}

export default BrandLogo;
