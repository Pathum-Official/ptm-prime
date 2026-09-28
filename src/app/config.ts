export const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';

export const API_URL = isLocalhost 
  ? 'http://localhost:8000' 
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000');

export const WS_URL = API_URL.replace('http://', 'ws://').replace('https://', 'wss://');
