import React from "react";

/**
 * Animated AI Avatar Component
 * @param {boolean} isSpeaking - Controls whether the mouth waveform animates actively
 * @param {string} className - Additional CSS classes (e.g., Tailwind sizing/positioning)
 */
export default function AiAvatar({ isSpeaking = false, className = "w-64 h-64" }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 400 400"
        className="w-full h-full rounded-2xl bg-slate-950 shadow-2xl"
      >
        <defs>
          {/* Background Radial Glow */}
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#090d16" stopOpacity="0" />
          </radialGradient>

          {/* Cyan/Blue Glowing Gradient */}
          <linearGradient id="cyanGlowing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>

          {/* Accent Pink/Indigo Gradient */}
          <linearGradient id="accentGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>

          {/* Neon Filters */}
          <filter id="neonFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <style>{`
          /* Ambient Breathing Pulse */
          .pulse-halo {
            animation: ambientPulse 4s ease-in-out infinite alternate;
            transform-origin: center;
          }

          /* Head Floating Motion */
          .floating-head {
            animation: float 5s ease-in-out infinite alternate;
            transform-origin: center;
          }

          /* Eye Blink Animation */
          .eye-blink {
            animation: blink 4s infinite;
            transform-origin: 200px 185px;
          }

          /* Pupil Scan Animation */
          .pupil-scan {
            animation: scan 6s ease-in-out infinite alternate;
          }

          /* Waveform Mouth Equalizer Animation */
          .wave-bar {
            transform-origin: bottom;
          }

          .wave-active {
            animation: equalize 0.8s ease-in-out infinite alternate;
          }

          .wave-idle {
            animation: idleWave 3s ease-in-out infinite alternate;
          }

          .wave-1 { animation-delay: 0.1s; }
          .wave-2 { animation-delay: 0.4s; }
          .wave-3 { animation-delay: 0.2s; }
          .wave-4 { animation-delay: 0.5s; }
          .wave-5 { animation-delay: 0.3s; }

          /* Scanline Animation */
          .scan-line {
            animation: scanline 4s linear infinite;
          }

          @keyframes ambientPulse {
            0% { transform: scale(0.95); opacity: 0.3; }
            100% { transform: scale(1.15); opacity: 0.7; }
          }

          @keyframes float {
            0% { transform: translateY(-6px); }
            100% { transform: translateY(6px); }
          }

          @keyframes blink {
            0%, 90%, 100% { transform: scaleY(1); }
            95% { transform: scaleY(0.05); }
          }

          @keyframes scan {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-4px); }
            75% { transform: translateX(4px); }
          }

          @keyframes equalize {
            0% { transform: scaleY(0.2); }
            100% { transform: scaleY(1.2); }
          }

          @keyframes idleWave {
            0%, 100% { transform: scaleY(0.3); }
            50% { transform: scaleY(0.5); }
          }

          @keyframes scanline {
            0% { transform: translateY(80px); opacity: 0; }
            50% { opacity: 0.4; }
            100% { transform: translateY(320px); opacity: 0; }
          }
        `}</style>

        {/* Ambient Glow Background */}
        <rect width="400" height="400" fill="url(#bgGlow)" />

        {/* Background Grid Lines */}
        <g stroke="#1e293b" strokeWidth="1" opacity="0.4">
          <line x1="50" y1="0" x2="50" y2="400" />
          <line x1="125" y1="0" x2="125" y2="400" />
          <line x1="200" y1="0" x2="200" y2="400" />
          <line x1="275" y1="0" x2="275" y2="400" />
          <line x1="350" y1="0" x2="350" y2="400" />
          <line x1="0" y1="80" x2="400" y2="80" />
          <line x1="0" y1="160" x2="400" y2="160" />
          <line x1="0" y1="240" x2="400" y2="240" />
          <line x1="0" y1="320" x2="400" y2="320" />
        </g>

        {/* Animated HUD Scanline */}
        <line
          className="scan-line"
          x1="60"
          y1="0"
          x2="340"
          y2="0"
          stroke="#38bdf8"
          strokeWidth="1.5"
          opacity="0.4"
          filter="url(#softGlow)"
        />

        {/* Energy Halo */}
        <circle
          className="pulse-halo"
          cx="200"
          cy="200"
          r="130"
          fill="none"
          stroke="url(#cyanGlowing)"
          strokeWidth="2"
          opacity="0.4"
          filter="url(#neonFilter)"
        />

        {/* Main Floating Head Group */}
        <g className="floating-head">
          {/* Head Outer Frame */}
          <path
            d="M 120 120 C 120 70, 280 70, 280 120 L 290 200 C 290 270, 250 310, 200 310 C 150 310, 110 270, 110 200 Z"
            fill="#0f172a"
            stroke="url(#cyanGlowing)"
            strokeWidth="3"
            filter="url(#softGlow)"
          />

          {/* Temples */}
          <rect x="94" y="175" width="18" height="35" rx="5" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
          <rect x="288" y="175" width="18" height="35" rx="5" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />

          {/* Forehead Node */}
          <circle cx="200" cy="105" r="7" fill="url(#accentGlow)" filter="url(#softGlow)" />
          <circle cx="200" cy="105" r="3" fill="#ffffff" />

          {/* Visor Panel Mask */}
          <path
            d="M 130 145 C 130 135, 270 135, 270 145 L 275 220 C 275 235, 255 245, 200 245 C 145 245, 125 235, 125 220 Z"
            fill="#020617"
            stroke="#1e293b"
            strokeWidth="2"
          />

          {/* Animated Eyes Group */}
          <g className="eye-blink">
            <g className="pupil-scan">
              <circle cx="165" cy="185" r="18" fill="url(#cyanGlowing)" filter="url(#neonFilter)" />
              <circle cx="165" cy="185" r="8" fill="#ffffff" />
              <circle cx="168" cy="182" r="3" fill="#ffffff" opacity="0.8" />
            </g>
            <g className="pupil-scan">
              <circle cx="235" cy="185" r="18" fill="url(#cyanGlowing)" filter="url(#neonFilter)" />
              <circle cx="235" cy="185" r="8" fill="#ffffff" />
              <circle cx="238" cy="182" r="3" fill="#ffffff" opacity="0.8" />
            </g>
          </g>

          {/* Dynamic Audio Equalizer Mouth */}
          <g transform="translate(160, 260)" filter="url(#softGlow)">
            <rect x="-5" y="-3" width="90" height="22" rx="11" fill="#090d16" stroke="#1e293b" strokeWidth="1.5" />
            
            {/* Equalizer Bars - Switches animation speed on `isSpeaking` */}
            <rect className={`wave-bar wave-1 ${isSpeaking ? "wave-active" : "wave-idle"}`} x="12" y="2" width="6" height="12" rx="3" fill="#38bdf8" />
            <rect className={`wave-bar wave-2 ${isSpeaking ? "wave-active" : "wave-idle"}`} x="24" y="0" width="6" height="16" rx="3" fill="#818cf8" />
            <rect className={`wave-bar wave-3 ${isSpeaking ? "wave-active" : "wave-idle"}`} x="36" y="-3" width="8" height="22" rx="4" fill="#c084fc" />
            <rect className={`wave-bar wave-4 ${isSpeaking ? "wave-active" : "wave-idle"}`} x="50" y="0" width="6" height="16" rx="3" fill="#818cf8" />
            <rect className={`wave-bar wave-5 ${isSpeaking ? "wave-active" : "wave-idle"}`} x="62" y="2" width="6" height="12" rx="3" fill="#38bdf8" />
          </g>

          {/* Cheek Accents */}
          <path d="M 135 230 L 150 240" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          <path d="M 265 230 L 250 240" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" opacity="0.6" />

          {/* Chin Indicator */}
          <polygon points="200,285 206,293 194,293" fill="#38bdf8" opacity="0.8" filter="url(#softGlow)" />
        </g>
      </svg>
    </div>
  );
}