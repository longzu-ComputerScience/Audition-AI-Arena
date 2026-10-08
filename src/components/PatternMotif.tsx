import React from 'react';

interface PatternMotifProps {
  type: string;
  className?: string;
  color?: string;
}

export const PatternMotif: React.FC<PatternMotifProps> = ({
  type,
  className = 'w-full h-full',
  color = 'currentColor',
}) => {
  switch (type) {
    case 'phoenix-court':
      // Imperial court embroidery motif for Áo Nhật Bình
      return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect x="35" y="35" width="130" height="130" rx="2" stroke={color} strokeWidth="1.2" strokeDasharray="6 3" opacity="0.5" />
          <path
            d="M100 45 L135 80 L135 120 L100 155 L65 120 L65 80 Z"
            stroke={color}
            strokeWidth="1.5"
            fill={color}
            fillOpacity="0.06"
          />
          <path d="M100 35 L100 165" stroke={color} strokeWidth="1" opacity="0.4" />
          <path d="M35 100 L165 100" stroke={color} strokeWidth="1" opacity="0.4" />
          <circle cx="100" cy="100" r="14" stroke={color} strokeWidth="1.5" fill="none" />
          <circle cx="100" cy="100" r="4" fill={color} />
          {/* Five color bands hint */}
          <path d="M75 140 Q100 125 125 140" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M70 148 Q100 133 130 148" stroke={color} strokeWidth="1.2" opacity="0.7" strokeLinecap="round" />
        </svg>
      );

    case 'silk-ribbon':
      // Graceful flowing ribbons for Áo Tứ Thân
      return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path
            d="M70 30 C70 80 50 120 50 170"
            stroke={color}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M90 30 C90 85 80 125 80 170"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.8"
          />
          <path
            d="M110 30 C110 85 120 125 120 170"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.8"
          />
          <path
            d="M130 30 C130 80 150 120 150 170"
            stroke={color}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Waist knot */}
          <ellipse cx="100" cy="95" rx="20" ry="10" stroke={color} strokeWidth="1.4" fill={color} fillOpacity="0.08" />
          <path d="M90 95 Q100 115 110 95" stroke={color} strokeWidth="1.5" />
        </svg>
      );

    case 'lotus-imperial':
    case 'lotus':
      return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="100" cy="100" r="88" stroke={color} strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
          <path
            d="M100 35 C115 65 145 85 145 110 C145 135 125 155 100 155 C75 155 55 135 55 110 C55 85 85 65 100 35 Z"
            stroke={color}
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M100 60 C108 80 125 95 125 115 C125 130 115 142 100 142 C85 142 75 130 75 115 C75 95 92 80 100 60 Z"
            stroke={color}
            strokeWidth="1"
            fill={color}
            fillOpacity="0.08"
          />
          <path
            d="M60 110 C45 120 35 132 45 145 C55 152 75 148 90 135"
            stroke={color}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M140 110 C155 120 165 132 155 145 C145 152 125 148 110 135"
            stroke={color}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <circle cx="100" cy="100" r="3" fill={color} />
          <path d="M100 155 L100 175" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'clouds-phoenix':
      return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path
            d="M40 120 C40 100 60 90 80 95 C85 75 115 70 125 90 C145 85 160 100 155 120 C165 130 160 150 140 150 L60 150 C40 150 35 135 40 120 Z"
            stroke={color}
            strokeWidth="1.5"
            fill={color}
            fillOpacity="0.06"
          />
          <path
            d="M65 110 C75 100 95 102 105 112 C115 105 135 108 140 122"
            stroke={color}
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          <path
            d="M130 70 C145 55 165 60 160 80"
            stroke={color}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <circle cx="95" cy="120" r="2" fill={color} />
          <circle cx="120" cy="115" r="2" fill={color} />
        </svg>
      );

    case 'wave-mandarin':
    case 'waves':
      return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path
            d="M20 140 C50 110 70 160 100 130 C130 100 150 150 180 120"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M20 110 C50 80 70 130 100 100 C130 70 150 120 180 90"
            stroke={color}
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.7"
          />
          <path
            d="M20 80 C50 50 70 100 100 70 C130 40 150 90 180 60"
            stroke={color}
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity="0.4"
          />
          <path
            d="M100 130 C100 90 100 50 100 30"
            stroke={color}
            strokeWidth="1"
            strokeDasharray="2 2"
            opacity="0.5"
          />
        </svg>
      );

    case 'bamboo-scholar':
    case 'stripes':
      return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <line x1="60" y1="20" x2="60" y2="180" stroke={color} strokeWidth="1.5" strokeDasharray="18 4" />
          <line x1="100" y1="20" x2="100" y2="180" stroke={color} strokeWidth="2" strokeDasharray="24 6" />
          <line x1="140" y1="20" x2="140" y2="180" stroke={color} strokeWidth="1.5" strokeDasharray="18 4" />
          <path d="M100 80 C115 70 130 72 135 65" stroke={color} strokeWidth="1" strokeLinecap="round" />
          <path d="M100 110 C85 100 70 102 65 95" stroke={color} strokeWidth="1" strokeLinecap="round" />
          <path d="M140 130 C155 120 170 122 175 115" stroke={color} strokeWidth="1" strokeLinecap="round" />
        </svg>
      );

    case 'grid':
      return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M40 40 H160 V160 H40 Z" stroke={color} strokeWidth="1" opacity="0.6" />
          <path d="M80 40 V160 M120 40 V160 M40 80 H160 M40 120 H160" stroke={color} strokeWidth="0.75" strokeDasharray="2 2" opacity="0.4" />
          <circle cx="100" cy="100" r="16" stroke={color} strokeWidth="1" fill={color} fillOpacity="0.05" />
          <path d="M92 100 H108 M100 92 V108" stroke={color} strokeWidth="1" />
        </svg>
      );

    case 'geometric':
    default:
      return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect x="50" y="50" width="100" height="100" rx="4" stroke={color} strokeWidth="1.2" transform="rotate(45 100 100)" />
          <rect x="65" y="65" width="70" height="70" rx="2" stroke={color} strokeWidth="0.8" strokeDasharray="3 2" transform="rotate(45 100 100)" opacity="0.5" />
          <circle cx="100" cy="100" r="6" stroke={color} strokeWidth="1" fill={color} fillOpacity="0.1" />
        </svg>
      );
  }
};
