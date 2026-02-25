import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Zap, Star, Crown, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

import { createCheckout } from '../lib/api'
import { useDeviceStore } from '../lib/deviceStore'

const PLANS = [
  {
    id: 'starter',
    icon: Zap,
    price: 3,
    tokens: 50,
    features: ['features.multiVoice', 'features.hdQuality', 'features.download'],
  },
  {
    id: 'pro',
    icon: Star,
    price: 8,
    tokens: 200,
    popular: true,
    features: ['features.multiVoice', 'features.hdQuality', 'features.download', 'features.batch', 'features.priority'],
  },
  {
    id: 'unlimited',
    icon: Crown,
    price: 12,
    tokens: 9999,
    monthly: true,
    features: ['features.multiVoice', 'features.hdQuality', 'features.download', 'features.batch', 'features.priority', 'features.api'],
  },
]

export default function PricingPage() {
  const { t } = useTranslation()
  const { deviceId } = useDeviceStore()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handlePurchase = async (planId: string) => {
    if (!deviceId) return

    setLoadingPlan(planId)
    setError(null)

    try {
      const { checkout_url } = await createCheckout(planId, deviceId)
      window.location.href = checkout_url
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Purchase failed'
      setError(message)
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
          {t('pricing.title')}
        </h1>
        <p className="text-xl text-gray-400 max-w-xl mx-auto">
          {t('pricing.subtitle')}
        </p>
      </motion.div>

      {/* Free tier info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-studio-surface border border-studio-border rounded-2xl p-6 mb-12 text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-neon-green/10 rounded-full text-neon-green text-sm font-medium mb-4">
          <Zap className="w-4 h-4" />
          {t('pricing.freeTier')}
        </div>
        <p className="text-gray-400">
          {t('pricing.freeDescription')}
        </p>
      </motion.div>

      {/* Error */}
      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center">
          {error}
        </div>
      )}

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan, index) => {
          const Icon = plan.icon
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={`relative bg-studio-surface border rounded-2xl p-6 flex flex-col ${
                plan.popular
                  ? 'border-neon-green glow-green'
                  : 'border-studio-border'
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-neon-green rounded-full text-studio-bg text-xs font-bold">
                  {t('pricing.popular')}
                </div>
              )}

              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                plan.popular ? 'bg-neon-green/20' : 'bg-studio-muted'
              }`}>
                <Icon className={`w-6 h-6 ${plan.popular ? 'text-neon-green' : 'text-gray-400'}`} />
              </div>

              {/* Plan name */}
              <h3 className="font-display text-xl font-bold text-white mb-2">
                {t(`pricing.plans.${plan.id}.name`)}
              </h3>

              {/* Price */}
              <div className="mb-4">
                <span className="font-display text-4xl font-bold text-white">${plan.price}</span>
                {plan.monthly && (
                  <span className="text-gray-500 ml-1">/{t('pricing.month')}</span>
                )}
              </div>

              {/* Tokens */}
              <div className="text-sm text-gray-400 mb-6">
                {plan.tokens === 9999 
                  ? t('pricing.unlimited')
                  : t('pricing.tokens', { count: plan.tokens })
                }
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-neon-green flex-shrink-0 mt-0.5" />
                    <span>{t(`pricing.${feature}`)}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => handlePurchase(plan.id)}
                disabled={loadingPlan !== null}
                className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  plan.popular
                    ? 'bg-neon-green text-studio-bg hover:shadow-lg hover:shadow-neon-green/30'
                    : 'bg-studio-muted text-white hover:bg-studio-border'
                } disabled:opacity-50`}
              >
                {loadingPlan === plan.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('pricing.processing')}
                  </>
                ) : (
                  t('pricing.purchase')
                )}
              </button>
            </motion.div>
          )
        })}
      </div>

      {/* Comparison note */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-center"
      >
        <p className="text-sm text-gray-500">
          {t('pricing.comparison')}
        </p>
      </motion.div>
    </div>
  )
}
