import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import config from '@/vertical.config'
import { getMeshStyle, getScrollbarColor, COLOR_MAP } from '@/lib/themeColors'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title:       config.metaTitle,
  description: config.metaDescription,
  keywords:    config.keywords,
}

const colors    = COLOR_MAP[config.themeColor] ?? COLOR_MAP['orange']
const meshStyle = getMeshStyle(config.themeColor)

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="h-full"
      style={{
        '--theme-primary':   colors.primary,
        '--theme-secondary': colors.secondary,
        '--theme-base':      colors.base,
        '--scrollbar-color': getScrollbarColor(config.themeColor),
      } as React.CSSProperties}
      suppressHydrationWarning
    >
      <body className={`${inter.className} min-h-full flex flex-col text-white`}
        style={{ background: colors.base }}
      >
        <div style={meshStyle} />

        {/* Navbar */}
        <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-black/20 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-white text-lg">
              <span className="text-2xl">🔧</span>
              <span>{config.name}</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href="/search"
                className="text-sm text-white/60 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
              >
                Browse trades
              </Link>
              <Link
                href="/"
                className="text-sm font-semibold bg-orange-500/90 hover:bg-orange-500 text-white px-4 py-1.5 rounded-lg transition-colors"
              >
                Find a tradesperson
              </Link>
            </div>
          </div>
        </nav>

        <main className="flex-1">
          {children}
        </main>

        <footer className="border-t border-white/[0.06] py-10 px-6 mt-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 font-bold text-white mb-3">
                  <span className="text-xl">🔧</span> {config.name}
                </div>
                <p className="text-white/40 text-sm leading-relaxed">
                  AI-powered global directory for trusted tradespeople. Real reviews, honest rankings.
                </p>
              </div>
              <div>
                <div className="font-semibold text-white/70 text-sm mb-3">Popular Trades</div>
                <div className="flex flex-col gap-1.5 text-sm text-white/40">
                  <Link href="/search?trade=plumber" className="hover:text-white/70 transition-colors">Plumbers</Link>
                  <Link href="/search?trade=electrician" className="hover:text-white/70 transition-colors">Electricians</Link>
                  <Link href="/search?trade=builder" className="hover:text-white/70 transition-colors">Builders</Link>
                  <Link href="/search?trade=cleaner" className="hover:text-white/70 transition-colors">Cleaners</Link>
                </div>
              </div>
              <div>
                <div className="font-semibold text-white/70 text-sm mb-3">More Trades</div>
                <div className="flex flex-col gap-1.5 text-sm text-white/40">
                  <Link href="/search?trade=gardener" className="hover:text-white/70 transition-colors">Gardeners</Link>
                  <Link href="/search?trade=painter" className="hover:text-white/70 transition-colors">Painters</Link>
                  <Link href="/search?trade=roofer" className="hover:text-white/70 transition-colors">Roofers</Link>
                  <Link href="/search?trade=hvac" className="hover:text-white/70 transition-colors">HVAC / Heating</Link>
                </div>
              </div>
              <div>
                <div className="font-semibold text-white/70 text-sm mb-3">Company</div>
                <div className="flex flex-col gap-1.5 text-sm text-white/40">
                  <a href="/about" className="hover:text-white/70 transition-colors">About</a>
                  <a href="/privacy" className="hover:text-white/70 transition-colors">Privacy</a>
                  <a href="/terms" className="hover:text-white/70 transition-colors">Terms</a>
                </div>
              </div>
            </div>
            <div className="border-t border-white/[0.06] pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-white/30 text-xs">
              <span>© {new Date().getFullYear()} {config.name}. All rights reserved.</span>
              <span>Powered by Google Places + AI review analysis</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
