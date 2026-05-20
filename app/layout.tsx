import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'

const jakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-display', weight: ['700', '800'], display: 'swap' })
import './globals.css'
import { getMeshStyle, getScrollbarColor, COLOR_MAP } from '@/lib/themeColors'
import Link from 'next/link'
import OwnerAssistant from '@/components/OwnerPanel'
import AuthButton from '@/components/AuthButton'
import AffiliateStrip from '@/components/AffiliateStrip'
import OnboardingTour from '@/components/OnboardingTour'

const inter = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' })

export const metadata: Metadata = {
  title:       'AnyLocal — Find Anything Near You, Anywhere in the World',
  description: 'AI-powered local search. Find restaurants, hotels, plumbers, dentists and more — ranked by honest AI review analysis, not just star ratings.',
  keywords:    ['find local', 'near me', 'restaurant finder', 'plumber near me', 'local business', 'AI reviews'],
}

const themeColor = 'orange'
const colors     = COLOR_MAP[themeColor]
const meshStyle  = getMeshStyle(themeColor)

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="h-full"
      style={{
        '--theme-primary':   colors.primary,
        '--theme-secondary': colors.secondary,
        '--theme-base':      colors.base,
        '--scrollbar-color': getScrollbarColor(themeColor),
      } as React.CSSProperties}
      suppressHydrationWarning
    >
      <body className={`${inter.variable} ${jakartaSans.variable} min-h-full flex flex-col text-white`}
        style={{ background: colors.base, fontFamily: 'var(--font-body, system-ui)', overflowX: 'hidden' }}
      >
        <style>{`
          *, *::before, *::after { box-sizing: border-box; }
          html { overflow-x: hidden; max-width: 100%; }
          body { overflow-x: hidden; max-width: 100%; }
          h1, h2, h3, .font-display { font-family: var(--font-display, system-ui) !important; }
          img, video { max-width: 100%; }
          /* Horizontal category scroll — mobile only */
          .cat-scroll { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; -ms-overflow-style: none; }
          .cat-scroll::-webkit-scrollbar { display: none; }
          /* Stronger card lift */
          .local-card { transition: all 180ms cubic-bezier(0.23,1,0.32,1); }
          .local-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.5); border-color: rgba(249,115,22,0.4) !important; }
          /* Search bar pulse on focus */
          .search-bar:focus-within { border-color: rgba(249,115,22,0.5) !important; box-shadow: 0 0 0 3px rgba(249,115,22,0.1) !important; }
          @media (max-width: 640px) {
            .desktop-grid { display: flex !important; flex-wrap: nowrap !important; overflow-x: auto !important; scrollbar-width: none; }
            .desktop-grid::-webkit-scrollbar { display: none; }
            .desktop-grid > * { flex-shrink: 0 !important; min-width: 100px !important; }
          }
        `}</style>
        <div style={meshStyle} />

        <div style={{ position:"fixed", top:"10px", right:"16px", zIndex:60 }}><AuthButton /></div>

        {/* Navbar */}
        <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-black/20 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-white text-lg">
              <span className="text-2xl">📍</span>
              <span>AnyLocal</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href="/portal"
                className="text-sm text-white/60 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/[0.06] transition-colors hidden sm:block"
              >
                My quotes
              </Link>
              <Link
                href="/for-businesses"
                className="text-sm text-orange-300 hover:text-orange-200 px-3 py-1.5 rounded-lg hover:bg-orange-500/[0.08] border border-orange-500/20 transition-colors hidden sm:block"
              >
                For businesses
              </Link>
              <Link
                href="/search"
                className="text-sm font-semibold bg-orange-500/90 hover:bg-orange-500 text-white px-4 py-1.5 rounded-lg transition-colors"
              >
                Search
              </Link>
            </div>
          </div>
        </nav>

        <main className="flex-1">
          {children}
        </main>

        <OnboardingTour />
        <OwnerAssistant />
        <AffiliateStrip />

        <footer className="border-t border-white/[0.06] py-10 px-6 mt-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 font-bold text-white mb-3">
                  <span className="text-xl">📍</span> AnyLocal
                </div>
                <p className="text-white/40 text-sm leading-relaxed">
                  Find any local business, anywhere in the world — with honest AI review analysis.
                </p>
              </div>
              <div>
                <div className="font-semibold text-white/70 text-sm mb-3">Food & Stays</div>
                <div className="flex flex-col gap-1.5 text-sm text-white/40">
                  <Link href="/search?q=restaurants" className="hover:text-white/70 transition-colors">Restaurants</Link>
                  <Link href="/search?q=hotels" className="hover:text-white/70 transition-colors">Hotels</Link>
                  <Link href="/search?q=cafes" className="hover:text-white/70 transition-colors">Cafes</Link>
                  <Link href="/search?q=pubs and bars" className="hover:text-white/70 transition-colors">Pubs & Bars</Link>
                </div>
              </div>
              <div>
                <div className="font-semibold text-white/70 text-sm mb-3">Services</div>
                <div className="flex flex-col gap-1.5 text-sm text-white/40">
                  <Link href="/search?q=plumbers" className="hover:text-white/70 transition-colors">Plumbers</Link>
                  <Link href="/search?q=electricians" className="hover:text-white/70 transition-colors">Electricians</Link>
                  <Link href="/search?q=dentists" className="hover:text-white/70 transition-colors">Dentists</Link>
                  <Link href="/search?q=gyms" className="hover:text-white/70 transition-colors">Gyms</Link>
                </div>
              </div>
              <div>
                <div className="font-semibold text-white/70 text-sm mb-3">Businesses</div>
                <div className="flex flex-col gap-1.5 text-sm text-white/40">
                  <Link href="/for-businesses" className="hover:text-orange-400 text-orange-400/70 transition-colors font-medium">List your trade →</Link>
                  <Link href="/for-businesses#register" className="hover:text-white/70 transition-colors">Register free</Link>
                  <Link href="/for-businesses" className="hover:text-white/70 transition-colors">Pricing</Link>
                  <a href="mailto:hello@anylocal.app" className="hover:text-white/70 transition-colors">Contact us</a>
                </div>
              </div>
            </div>
            <div className="border-t border-white/[0.06] pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-white/30 text-xs">
              <span>© {new Date().getFullYear()} AnyLocal. All rights reserved.</span>
              <span>Powered by Google Places + AI review analysis</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
