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
      <circle cx="50" cy="50" r="50" fill="#242424" />
      <circle cx="50" cy="50" r="47" fill="none" stroke="#3a3a3a" strokeWidth="1.5" />
      <text
        x="50"
        y="57"
        textAnchor="middle"
        fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif"
        fontWeight="700"
        fontSize="28"
        letterSpacing="-1"
        fill="#f0ece4"
      >
        E1
      </text>
    </svg>
  )
}
