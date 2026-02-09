export default function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 60"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Thias Consultancy Logo"
    >
      {/* Modern, minimalist logo design */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#9d7f6a" />
        </linearGradient>
      </defs>
      
      {/* Abstract geometric shape representing innovation */}
      <path
        d="M20 30 L40 10 L60 30 L50 40 L30 40 Z"
        fill="url(#logoGradient)"
        className="transition-transform duration-300 hover:scale-110"
      />
      
      {/* Text */}
      <text
        x="75"
        y="35"
        fontSize="24"
        fontWeight="600"
        fill="#1e293b"
        fontFamily="system-ui, sans-serif"
      >
        Thias
      </text>
      <text
        x="75"
        y="50"
        fontSize="12"
        fill="#64748b"
        fontFamily="system-ui, sans-serif"
      >
        Consultancy
      </text>
    </svg>
  );
}
