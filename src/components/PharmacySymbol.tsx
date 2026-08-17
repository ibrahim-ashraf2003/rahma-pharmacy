import React from 'react';

interface PharmacyEmblemProps {
  className?: string;
  size?: number | string;
  scrolled?: boolean;
}

export function PharmacyEmblem({ className = "w-full h-full", size }: PharmacyEmblemProps) {
  return (
    <svg
      viewBox="0 0 500 500"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Pharmacy Emblem Logo"
    >
      <defs>
        {/* Subtle 3D outer ring gradient */}
        <linearGradient id="pharmacyRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#f0f4f9" />
          <stop offset="100%" stopColor="#d2ddec" />
        </linearGradient>
        {/* Rich vibrant royal blue gradient */}
        <radialGradient id="pharmacyBlueBg" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#256dc4" />
          <stop offset="70%" stopColor="#1b58a6" />
          <stop offset="100%" stopColor="#154687" />
        </radialGradient>
        <filter id="subtleShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Outer Blue Thin Border */}
      <circle cx="250" cy="250" r="242" fill="none" stroke="#1b58a6" strokeWidth="12" />

      {/* White / Silver Shaded Beveled Ring */}
      <circle cx="250" cy="250" r="236" fill="url(#pharmacyRingGrad)" stroke="#c4d3e5" strokeWidth="2" />
      <circle cx="250" cy="250" r="200" fill="none" stroke="#b0c4dc" strokeWidth="3" />

      {/* Inner Solid Royal Blue Disc */}
      <circle cx="250" cy="250" r="197" fill="url(#pharmacyBlueBg)" />

      {/* Bowl of Hygieia (Chalice & Snake) in Crisp White */}
      <g fill="#ffffff" filter="url(#subtleShadow)">
        {/* ── 1. The Chalice / Bowl ── */}
        {/* Chalice Base */}
        <path
          d="M 205 412 C 205 412, 230 407, 250 407 C 270 407, 295 412, 295 412 C 302 414, 298 418, 290 418 L 210 418 C 202 418, 198 414, 205 412 Z"
        />
        {/* Chalice Stem (Middle vertical bar) */}
        <path
          d="M 245 255 L 255 255 L 255 408 L 245 408 Z"
        />
        {/* Chalice Cup */}
        <path
          d="M 155 196 C 160 196, 250 199, 345 196 C 348 196, 350 200, 344 205 C 316 226, 290 252, 256 264 L 244 264 C 210 252, 184 226, 156 205 C 150 200, 152 196, 155 196 Z"
        />

        {/* ── 2. The Snake ── */}
        {/* Head and Top Serpentine Neck */}
        <path
          d="M 252 108 
             C 255 98, 266 102, 268 116 
             C 270 126, 260 148, 250 152 
             C 246 150, 248 140, 252 136 
             C 260 128, 262 118, 258 112 
             C 254 107, 246 108, 240 114 
             C 228 126, 222 144, 230 162 
             C 238 178, 262 195, 276 215 
             C 292 238, 298 266, 288 290 
             C 278 312, 256 324, 238 322 
             C 222 320, 218 306, 226 295 
             C 234 284, 250 282, 262 288 
             C 274 294, 276 308, 270 318 
             C 262 330, 246 338, 232 336 
             C 214 334, 204 316, 210 296 
             C 218 272, 242 258, 262 248 
             C 280 238, 288 220, 280 202 
             C 272 186, 254 172, 240 156 
             C 220 134, 216 106, 232 86 
             C 248 66, 278 72, 284 94 
             C 288 108, 278 128, 266 136 
             C 262 138, 260 132, 264 126 
             C 272 114, 274 100, 268 90 
             C 262 80, 246 78, 236 90 
             C 224 104, 226 126, 240 142 
             Z"
        />

        {/* Lower Tail Coil around the stem */}
        <path
          d="M 235 324 
             C 224 338, 222 360, 234 374 
             C 244 386, 264 388, 274 378 
             C 284 368, 282 352, 272 344 
             C 264 338, 252 342, 248 350 
             C 244 358, 248 368, 258 370 
             C 268 372, 274 362, 270 354 
             C 268 350, 274 348, 276 352 
             C 282 364, 272 380, 258 382 
             C 242 384, 228 372, 222 358 
             C 216 342, 222 328, 232 320 
             Z"
        />
        
        {/* Snake Head Diamond Silhouette */}
        <path
          d="M 264 102 
             L 276 118 
             L 266 138 
             L 256 122 
             Z"
        />
      </g>
    </svg>
  );
}

export default PharmacyEmblem;
