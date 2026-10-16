export const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';

export const API_URL = isLocalhost 
  ? 'http://localhost:8000' 
  : 'https://nam-fitting-economics-guides.trycloudflare.com';

export const WS_URL = API_URL.replace('http://', 'ws://').replace('https://', 'wss://');
