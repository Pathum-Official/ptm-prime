export const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';

export const API_URL = isLocalhost 
  ? 'http://localhost:8000' 
  : (process.env.NEXT_PUBLIC_API_URL || 'https://85.17.145.133.sslip.io');

export const WS_URL = API_URL.replace('http://', 'ws://').replace('https://', 'wss://');
