// Cartoon avatar — long brown hair, tan skin, strong jaw, deep green bg
export default function Avatar({ size = 40, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ borderRadius: '50%', flexShrink: 0 }}
    >
      {/* Background */}
      <circle cx="50" cy="50" r="50" fill="#14532d" />

      {/* Hair — back layer, long past shoulders */}
      <path d="M28 38 Q24 58 22 80 Q26 88 32 82 Q30 62 33 42Z" fill="#6b3f1a" />
      <path d="M72 38 Q76 58 78 80 Q74 88 68 82 Q70 62 67 42Z" fill="#6b3f1a" />
      <ellipse cx="50" cy="34" rx="22" ry="24" fill="#7a4820" />

      {/* Neck */}
      <path d="M44 64 L44 74 Q50 77 56 74 L56 64Z" fill="#c8956a" />

      {/* Shoulders */}
      <path d="M15 100 Q22 76 44 72 Q50 74 56 72 Q78 76 85 100Z" fill="#c8956a" />

      {/* Face */}
      <ellipse cx="50" cy="48" rx="19" ry="21" fill="#d4a47a" />

      {/* Jaw definition */}
      <path d="M33 52 Q32 64 40 70 Q50 74 60 70 Q68 64 67 52" fill="#c8956a" />

      {/* Hair — front, sweeps back naturally */}
      <path d="M31 36 Q33 20 50 17 Q67 20 69 36 Q62 26 50 27 Q38 26 31 36Z" fill="#5c3412" />
      {/* Hair part / natural flow */}
      <path d="M31 36 Q36 30 44 32 Q50 27 56 32 Q64 30 69 36 Q60 28 50 27 Q40 28 31 36Z" fill="#4a2a0e" />

      {/* Eyebrows — strong and defined */}
      <path d="M37 41 Q42 38.5 47 40" stroke="#3d2008" stroke-width="2" fill="none" stroke-linecap="round" />
      <path d="M53 40 Q58 38.5 63 41" stroke="#3d2008" stroke-width="2" fill="none" stroke-linecap="round" />

      {/* Eyes — dark, intense */}
      <ellipse cx="42" cy="45" rx="3.5" ry="3.8" fill="#1a0e06" />
      <ellipse cx="58" cy="45" rx="3.5" ry="3.8" fill="#1a0e06" />
      {/* Iris */}
      <circle cx="42" cy="45" r="2.5" fill="#3d2410" />
      <circle cx="58" cy="45" r="2.5" fill="#3d2410" />
      {/* Shine */}
      <circle cx="43.5" cy="43.8" r="1" fill="white" opacity="0.7" />
      <circle cx="59.5" cy="43.8" r="1" fill="white" opacity="0.7" />

      {/* Nose */}
      <path d="M47 50 Q50 55 53 50" stroke="#a87048" stroke-width="1.3" fill="none" stroke-linecap="round" />
      <circle cx="47.5" cy="52" r="1.2" fill="#b87850" opacity="0.5" />
      <circle cx="52.5" cy="52" r="1.2" fill="#b87850" opacity="0.5" />

      {/* Mouth — straight, calm */}
      <path d="M43 60 Q50 63 57 60" stroke="#a06040" stroke-width="1.5" fill="none" stroke-linecap="round" />

      {/* Subtle tattoo hint on left shoulder */}
      <path d="M20 88 Q22 84 25 86 Q27 82 30 84" stroke="#2a4a3a" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.6" />
    </svg>
  )
}
