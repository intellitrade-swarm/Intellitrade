import type { Metadata } from "next"
import './globals.css'
import { Providers } from '../components/providers'
import { BootSequence } from '../components/boot-sequence'
import { SwarmParticles } from '../components/swarm-particles'
import { HexagonGrid } from '../components/hexagon-grid'

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  title: "Intellitrade - AI-Powered Autonomous Trading Platform",
  description: "Advanced AI trading platform with 6 intelligent agents executing sophisticated strategies across DeFi markets. Real-time analytics, autonomous execution, and institutional-grade performance.",
  keywords: ["AI", "crypto", "trading", "DeFi", "autonomous", "intelligent", "blockchain", "analytics", "Defidash", "Intellitrade"],
  authors: [{ name: "Intellitrade" }],
  creator: "Intellitrade",
  publisher: "Intellitrade",
  openGraph: {
    title: "Intellitrade - AI-Powered Autonomous Trading",
    description: "Advanced AI trading platform with 6 intelligent agents executing sophisticated strategies across DeFi markets",
    url: "/",
    siteName: "Intellitrade",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Intellitrade AI Trading Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Intellitrade - AI-Powered Autonomous Trading",
    description: "Advanced AI trading platform with 6 intelligent agents executing sophisticated strategies across DeFi markets",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden terminal-screen">
      <body className="font-terminal bg-black text-terminal-green overflow-x-hidden terminal-scanline hive-gradient" suppressHydrationWarning>
        <BootSequence />
        <HexagonGrid />
        <SwarmParticles />
        <Providers>
          <div className="w-full overflow-x-hidden terminal-vignette relative z-10">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}