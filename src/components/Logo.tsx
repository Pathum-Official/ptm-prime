export const Logo = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 10 L85 30 L85 70 L50 90 L15 70 L15 30 Z" fill="url(#goldGradient)" stroke="#FFD700" strokeWidth="2" />
    <path d="M35 70 L35 30 L55 30 C 65 30 70 35 70 45 C 70 55 65 60 55 60 L35 60" stroke="#0B0B0E" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M35 70 L35 30 L55 30 C 65 30 70 35 70 45 C 70 55 65 60 55 60 L35 60" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="goldGradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#D4AF37" />
        <stop offset="50%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#8B6508" />
      </linearGradient>
    </defs>
  </svg>
);
