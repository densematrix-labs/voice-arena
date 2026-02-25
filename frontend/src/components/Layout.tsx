import { ReactNode, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, X, Globe, Sparkles } from 'lucide-react'
import { useUsageStore } from '../lib/usageStore'
import { useDeviceStore } from '../lib/deviceStore'
import { useEffect } from 'react'

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
]

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  
  const { usage, fetchUsage } = useUsageStore()
  const { deviceId } = useDeviceStore()
  
  useEffect(() => {
    if (deviceId) {
      fetchUsage()
    }
  }, [deviceId, fetchUsage])

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code)
    setLangMenuOpen(false)
  }

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0]

  return (
    <div className="min-h-screen bg-studio-bg grid-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-studio-bg/80 backdrop-blur-xl border-b border-studio-border">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-green to-neon-cyan flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-studio-bg" />
              </div>
              <span className="font-display font-bold text-xl text-white group-hover:text-gradient transition-all">
                Voice Arena
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              {usage && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="text-neon-green font-mono">{usage.remaining}</span>
                  <span>{t('nav.remaining')}</span>
                </div>
              )}
              
              <Link
                to="/pricing"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/pricing'
                    ? 'text-neon-green'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {t('nav.pricing')}
              </Link>

              {/* Language Switcher */}
              <div className="relative">
                <button
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-studio-surface border border-studio-border hover:border-neon-green/30 transition-all"
                  data-testid="lang-switcher"
                >
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{currentLang.flag}</span>
                </button>
                
                {langMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-studio-surface border border-studio-border rounded-lg shadow-xl overflow-hidden animate-slide-up">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-studio-muted transition-colors ${
                          i18n.language === lang.code ? 'text-neon-green' : 'text-gray-300'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg bg-studio-surface"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Nav */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-studio-border animate-slide-up">
              <div className="flex flex-col gap-4">
                {usage && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="text-neon-green font-mono">{usage.remaining}</span>
                    <span>{t('nav.remaining')}</span>
                  </div>
                )}
                <Link
                  to="/pricing"
                  className="text-gray-400 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.pricing')}
                </Link>
                <div className="flex gap-2 flex-wrap">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code)
                        setMobileMenuOpen(false)
                      }}
                      className={`px-3 py-1 rounded-full text-sm ${
                        i18n.language === lang.code
                          ? 'bg-neon-green/20 text-neon-green'
                          : 'bg-studio-surface text-gray-400'
                      }`}
                    >
                      {lang.flag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Main */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-studio-border bg-studio-bg/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-green to-neon-cyan flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-studio-bg" />
              </div>
              <span className="font-display text-lg text-white">Voice Arena</span>
            </div>
            <p className="text-sm text-gray-500">
              © 2026 DenseMatrix Labs. {t('footer.rights')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
