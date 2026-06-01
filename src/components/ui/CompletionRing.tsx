/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React from 'react';

interface CompletionRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  ringColor?: string;
  showText?: boolean;
  textSize?: string;
}

export default function CompletionRing({
  percentage = 0,
  size = 80,
  strokeWidth = 6,
  ringColor = '#3b82f6',
  showText = true,
  textSize = 'text-xs'
}: CompletionRingProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Guard values
  const safePercentage = Math.min(100, Math.max(0, percentage));
  const offset = circumference - (safePercentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg 
        width={size} 
        height={size} 
        className="transform -rotate-90 select-none drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]"
      >
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(39, 39, 42, 0.6)"
          strokeWidth={strokeWidth}
        />
        {/* Glow Shadow under the main circle */}
        {mounted && safePercentage > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 ${strokeWidth / 1.5}px ${ringColor})`,
              opacity: 0.6
            }}
          />
        )}
        {/* Active Completion Circle */}
        {mounted && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        )}
      </svg>
      
      {/* Percentage Center Text */}
      {showText && (
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`font-extrabold text-white tracking-tighter ${textSize}`}>
            {Math.round(safePercentage)}%
          </span>
        </div>
      )}
    </div>
  );
}
