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
  keywords: ["AI", "crypto", "trading", "DeFi", "autonomous", "intelligent", "blockchain", "analytics", "Intellitrade"],
  authors: [{ name: "Intellitrade" }],
  creator: "Intellitrade",
  publisher: "Intellitrade",
  openGraph: {
    title: "Intellitrade - AI-Powered Autonomous Trading",
    description: "Advanced AI trading platform with 6 intelligent agents executing sophisticated strategies across DeFi markets",
    url: "https://intellitrade.xyz",
    siteName: "Intellitrade",
    images: [
      {
        url: "https://intellitrade.xyz/og-image.webp?v=2",
        width: 1200,
        height: 630,
        alt: "Intellitrade AI Trading Platform",
        type: "image/webp",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Intellitrade - AI-Powered Autonomous Trading",
    description: "Advanced AI trading platform with 6 intelligent agents executing sophisticated strategies across DeFi markets",
    images: ["https://intellitrade.xyz/og-image.webp?v=2"],
  },
  icons: {
    icon: "/intellitrade-logo.webp",
    shortcut: "/intellitrade-logo.webp",
    apple: "/intellitrade-logo.webp",
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
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="preload" href="/intellitrade-logo.webp" as="image" type="image/webp" />

        <meta name="supported-color-schemes" content="dark light" />
        <meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
      </head>
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
