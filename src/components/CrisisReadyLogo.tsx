import React from 'react';

interface CrisisReadyLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  onClick?: () => void;
  textClassName?: string;
  shieldClassName?: string;
}

/**
 * Precision vector SVG reproduction of the CrisisReady shield + medical cross + response arrow logo
 */
export const CrisisReadyLogoIcon: React.FC<{ size?: number | string; className?: string }> = ({
  size = 36,
  className = ''
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="CrisisReady Shield Logo"
    >
      {/* Outer Red Shield Frame */}
      <path
        d="M 18 20 
           L 30 14 
           L 50 20 
           L 70 14 
           L 82 20 
           L 82 52 
           C 82 72, 66 88, 56 94 
           L 50 84 
           L 44 94 
           C 34 88, 18 72, 18 52 
           Z"
        fill="none"
        stroke="#c92a2a"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Solid Red Medical Cross with Integrated Response Arrow and Diagonal Slash */}
      <g>
        {/* Main Cross Body */}
        <path
          d="M 40 28 
             H 60 
             V 40 
             H 72 
             V 60 
             H 60 
             V 72 
             H 40 
             V 60 
             H 28 
             V 40 
             H 40 
             Z"
          fill="#c92a2a"
        />

        {/* Diagonal Dynamic Cut / White Channel Through Center */}
        <polygon
          points="35,65 63,33 68,37 40,69"
          fill="#fcf9f8"
          className="transition-colors"
        />

        {/* Upward Arrow Notch in Bottom Arm */}
        <polygon
          points="50,56 41,74 46,74 46,86 54,86 54,74 59,74"
          fill="#fcf9f8"
          className="transition-colors"
        />

        {/* Bottom Red Arrow Pointing Up into Cross */}
        <polygon
          points="50,60 43,76 47,76 47,88 53,88 53,76 57,76"
          fill="#c92a2a"
        />
      </g>
    </svg>
  );
};

export const CrisisReadyLogo: React.FC<CrisisReadyLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  onClick,
  textClassName = '',
  shieldClassName = ''
}) => {
  const sizeMap = {
    xs: { icon: 22, text: 'text-base font-bold tracking-tight' },
    sm: { icon: 28, text: 'text-lg font-bold tracking-tight' },
    md: { icon: 36, text: 'text-2xl font-black tracking-tight' },
    lg: { icon: 48, text: 'text-3xl font-black tracking-tight' },
    xl: { icon: 64, text: 'text-4xl font-black tracking-tight' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 select-none ${
        onClick ? 'cursor-pointer hover:opacity-95 transition-opacity' : ''
      } ${className}`}
      role={onClick ? 'button' : 'banner'}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <CrisisReadyLogoIcon size={currentSize.icon} className={shieldClassName} />
      {showText && (
        <span
          className={`text-[#0f172a] font-sans font-extrabold ${currentSize.text} ${textClassName}`}
          style={{ letterSpacing: '-0.025em' }}
        >
          CrisisReady
        </span>
      )}
    </div>
  );
};

export default CrisisReadyLogo;
