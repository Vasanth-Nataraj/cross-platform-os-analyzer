// frontend/src/components/Sparkline.jsx
import React from 'react';

export default function Sparkline({ data = [], color = '#f59e0b', height = 64, strokeWidth = 2 }) {
  if (!data || data.length < 2) {
    return (
      <div 
        className="w-full flex items-center justify-center text-[10px] font-mono text-slate-600 border border-white/[0.04] rounded-lg bg-black/20"
        style={{ height }}
      >
        BUFFERING TELEMETRY STREAM...
      </div>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;
  const padding = 6;
  const width = 300;

  // Map data values to SVG coordinates
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - padding - ((val - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const polylineStr = points.join(' ');
  const areaPoints = `0,${height} ${polylineStr} ${width},${height}`;
  const gradientId = `grad-${color.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <div className="w-full overflow-hidden">
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full overflow-visible"
        style={{ height }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Translucent fill underneath the wave */}
        <polygon points={areaPoints} fill={`url(#${gradientId})`} />

        {/* Glowing stroke */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          points={polylineStr}
        />

        {/* Latest active pulse head */}
        {points.length > 0 && (
          <circle
            cx={points[points.length - 1].split(',')[0]}
            cy={points[points.length - 1].split(',')[1]}
            r={3.5}
            fill={color}
            className="animate-ping"
            style={{ transformOrigin: `${points[points.length - 1].split(',')[0]}px ${points[points.length - 1].split(',')[1]}px` }}
          />
        )}
      </svg>
    </div>
  );
}