import React from 'react';

export const HairstyleSvg = ({ styleName, color = "currentColor" }: { styleName: string, color?: string }) => {
  const name = styleName.toLowerCase();
  
  // Basic categorization
  let category = 'long';
  if (name.includes('pixie') || name.includes('buzz') || name.includes('crew') || name.includes('short') || name.includes('crop') || name.includes('fade')) {
    category = 'short';
  } else if (name.includes('bob') || name.includes('lob') || name.includes('shoulder')) {
    category = 'medium';
  } else if (name.includes('updo') || name.includes('bun') || name.includes('ponytail') || name.includes('chignon')) {
    category = 'updo';
  }

  // Very simplified abstract geometric representation of hair geometries
  switch (category) {
    case 'short':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
          <g fill={color} opacity="0.85">
            {/* Short / crop */}
            <path d="M 25 50 Q 25 20 50 20 Q 75 20 75 50 Q 75 60 85 60 Q 90 40 50 10 Q 10 40 15 60 Q 25 60 25 50 Z" />
            <path d="M 30 25 Q 50 15 70 25 L 65 35 Q 50 25 35 35 Z" opacity="0.5"/>
          </g>
        </svg>
      );
    case 'medium':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
          <g fill={color} opacity="0.85">
            {/* Bob / shoulder length */}
            <path d="M 20 65 Q 20 20 50 20 Q 80 20 80 65 Q 85 75 70 70 Q 75 40 50 25 Q 25 40 30 70 Q 15 75 20 65 Z" />
          </g>
        </svg>
      );
    case 'updo':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
          <g fill={color} opacity="0.85">
            {/* Bun/Updo */}
            <circle cx="50" cy="20" r="15" />
            <path d="M 25 60 Q 25 30 50 30 Q 75 30 75 60 Q 85 70 70 65 Q 75 45 50 35 Q 25 45 30 65 Q 15 70 25 60 Z" />
          </g>
        </svg>
      );
    case 'long':
    default:
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
          <g fill={color} opacity="0.85">
            {/* Long flowing */}
            <path d="M 15 85 Q 15 20 50 20 Q 85 20 85 85 Q 95 95 75 90 Q 80 40 50 25 Q 20 40 25 90 Q 5 95 15 85 Z" />
            <path d="M 25 80 Q 20 50 40 40 L 40 50 Q 25 60 25 80" opacity="0.4" />
            <path d="M 75 80 Q 80 50 60 40 L 60 50 Q 75 60 75 80" opacity="0.4" />
          </g>
        </svg>
      );
  }
};
