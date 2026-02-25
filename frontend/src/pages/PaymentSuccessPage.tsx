import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle, ArrowRight, Loader2, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

import { useUsageStore } from '../lib/usageStore'

export default function PaymentSuccessPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  
  const { fetchUsage, usage } = useUsageStore()

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      await fetchUsage()
      setIsLoading(false)
    }
    
    // Small delay to ensure webhook has processed
    const timer = setTimeout(load, 2000)
    return () => clearTimeout(timer)
  }, [fetchUsage])

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-studio-surface border border-studio-border rounded-2xl p-8 text-center"
      >
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-neon-green/20 flex items-center justify-center"
        >
          <CheckCircle className="w-10 h-10 text-neon-green" />
        </motion.div>

        {/* Title */}
        <h1 className="font-display text-2xl font-bold text-white mb-2">
          {t('success.title')}
        </h1>
        <p className="text-gray-400 mb-8">
          {t('success.subtitle')}
        </p>

        {/* Token info */}
        <div className="bg-studio-bg border border-studio-border rounded-xl p-6 mb-8">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{t('success.loading')}</span>
            </div>
          ) : usage ? (
            <div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-2">
                <Sparkles className="w-4 h-4 text-neon-green" />
                <span>{t('success.yourTokens')}</span>
              </div>
              <div className="font-display text-4xl font-bold text-gradient">
                {usage.remaining.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {t('success.generations')}
              </div>
            </div>
          ) : (
            <div className="text-gray-400">{t('success.tokensPending')}</div>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/')}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {t('success.startGenerating')}
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  )
}
