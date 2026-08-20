import React from 'react';
import './HeroIllustration.css';

export default function HeroIllustration() {
  const stroke = "currentColor";
  const strokeGreen = "var(--color-success)";
  const strokeOrange = "var(--color-deco-orange)";
  const strokeYellow = "var(--color-deco-yellow)";
 

  return (
    <div className="hero-illustration-wrapper">
      <svg 
        className="hero-illustration-svg" 
        viewBox="0 0 800 320" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* =======================
            Left Group
        ======================= */}
        <g className="illust-group-left">
          {/* Main Card */}
          <rect x="60" y="90" width="160" height="100" rx="8" stroke={strokeGreen} strokeWidth="3" fill="var(--color-bg)"/>
          
          {/* Inner Content */}
          <circle cx="90" cy="120" r="10" stroke={strokeGreen} strokeWidth="3"/>
          <line x1="115" y1="120" x2="190" y2="120" stroke={strokeGreen} strokeWidth="3" strokeLinecap="round"/>
          
          <line x1="85" y1="150" x2="190" y2="150" stroke={strokeGreen} strokeWidth="3" strokeLinecap="round"/>
          <line x1="85" y1="170" x2="150" y2="170" stroke={strokeGreen} strokeWidth="3" strokeLinecap="round"/>

          {/* Overlapping Circle (Bottom Right) */}
          <circle cx="210" cy="170" r="28" stroke={strokeGreen} strokeWidth="3" fill="var(--color-bg)"/>

          {/* Bottom Arc (Wider Elliptical Curve centered under the circle at x=210) */}
          <path d="M 130 250 A 80 40 0 0 1 290 250" stroke={strokeGreen} strokeWidth="3" strokeLinecap="round"/>
        </g>

        {/* =======================
            Connecting Lines
        ======================= */}
        {/* Left to Center */}
        <line x1="250" y1="210" x2="310" y2="180" stroke={strokeGreen} strokeWidth="3" strokeLinecap="round" />

        {/* =======================
            Center Group
        ======================= */}
        <g className="illust-group-center">
          {/* Main Large Card */}
          <rect x="340" y="50" width="200" height="230" rx="8" stroke={strokeGreen} strokeWidth="3" fill="var(--color-bg)"/>
          
          {/* Inner Content - Header */}
          <circle cx="375" cy="90" r="12" stroke={strokeYellow} strokeWidth="3"/>
          <line x1="405" y1="85" x2="510" y2="85" stroke={strokeYellow} strokeWidth="3" strokeLinecap="round"/>
          <line x1="405" y1="105" x2="460" y2="105" stroke={strokeYellow} strokeWidth="3" strokeLinecap="round"/>
          
          <line x1="370" y1="140" x2="510" y2="140" stroke={strokeYellow} strokeWidth="3" strokeLinecap="round"/>
          <line x1="370" y1="165" x2="510" y2="165" stroke={strokeYellow} strokeWidth="3" strokeLinecap="round"/>
          <line x1="370" y1="190" x2="470" y2="190" stroke={strokeYellow} strokeWidth="3" strokeLinecap="round"/>
          
          {/* Bottom Pills */}
          <rect x="370" y="225" width="45" height="20" rx="10" stroke={strokeYellow} strokeWidth="3"/>
          <rect x="425" y="225" width="55" height="20" rx="10" stroke={strokeYellow} strokeWidth="3"/>
          <rect x="490" y="225" width="35" height="20" rx="10" stroke={strokeYellow} strokeWidth="3"/>
        </g>

        {/* =======================
            Right Group
        ======================= */}
        <g className="illust-group-right">
          {/* Top Circle */}
          <circle cx="680" cy="160" r="28" stroke={strokeYellow} strokeWidth="3" fill="var(--color-bg)"/>
          
          {/* Floating Window */}
          <rect x="580" y="215" width="70" height="45" rx="6" stroke={strokeYellow} strokeWidth="3" fill="var(--color-bg)"/>
          
          {/* Bottom Arc (Wider Elliptical Curve centered under the circle at x=680) */}
          <path d="M 600 240 A 80 40 0 0 1 760 240" stroke={strokeYellow} strokeWidth="3" strokeLinecap="round"/>
        </g>

        {/* =======================
            Colored Sparkles
        ======================= */}
        <g className="illust-sparkles">
          {/* Orange Star (Left) */}
          <path className="illust-fill-orange" d="M280 60 L 283 68 L 291 71 L 283 74 L 280 82 L 277 74 L 269 71 L 277 68 Z" />
          
          {/* Green Star/Diamond (Bottom Left corner) */}
          <path className="illust-fill-green" d="M145 250 L 148 255 L 153 258 L 148 261 L 145 266 L 142 261 L 137 258 L 142 255 Z" />
          
          {/* Orange Star (Top Right) */}
          <path className="illust-fill-orange" d="M550 50 L 553 58 L 561 61 L 553 64 L 550 72 L 547 64 L 539 61 L 547 58 Z" />
          
          {/* Green Diamond (Far Right) */}
          <rect x="730" y="90" width="10" height="10" transform="rotate(45 735 95)" className="illust-fill-green" />
        </g>
      </svg>
    </div>
  );
}
