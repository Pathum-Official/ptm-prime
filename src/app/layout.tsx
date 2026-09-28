import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { LiveChat } from "@/components/LiveChat";
import { ServerStatus } from "@/components/ServerStatus";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PTM Prime | Elite Algorithmic Trading SaaS",
  description: "Next-generation asynchronous zero-latency trading engine.",
};

const faviconSvg = encodeURIComponent(`
<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M50 10 L85 30 L85 70 L50 90 L15 70 L15 30 Z" fill="#D4AF37" stroke="#FFD700" strokeWidth="2" />
  <path d="M35 70 L35 30 L55 30 C 65 30 70 35 70 45 C 70 55 65 60 55 60 L35 60" stroke="#0B0B0E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
</svg>
`);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href={`data:image/svg+xml,${faviconSvg}`} />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0B0B0E" />
      </head>
      <body className={`${inter.className} bg-[#0B0B0E] text-slate-100`}>
        <ServerStatus />
        {children}
        <LiveChat />
        
        {/* Crisp widget temporarily removed to prevent 'Invalid Website' badge */}
        {/* Replace YOUR_CRISP_WEBSITE_ID below and uncomment to re-enable 
        <Script id="crisp-widget" strategy="afterInteractive">
          {\`
            window.$crisp=[];
            window.CRISP_WEBSITE_ID="YOUR_CRISP_WEBSITE_ID"; 
            (function(){
              d=document;s=d.createElement("script");
              s.src="https://client.crisp.chat/l.js";
              s.async=1;
              d.getElementsByTagName("head")[0].appendChild(s);
            })();
          \`}
        </Script>
        */}
      </body>
    </html>
  );
}
