import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Zap, ArrowRight, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { Voice, fetchVoices, fetchLanguages, generateVoice } from '../lib/api'
import { useDeviceStore } from '../lib/deviceStore'
import { useUsageStore } from '../lib/usageStore'

import VoiceFilters from '../components/VoiceFilters'
import VoiceCard from '../components/VoiceCard'
import TextInput from '../components/TextInput'
import ComparisonPanel from '../components/ComparisonPanel'

interface AudioResult {
  voiceId: string
  voice: Voice
  audioUrl: string
  isPlaying: boolean
}

export default function HomePage() {
  const { t } = useTranslation()
  const { deviceId } = useDeviceStore()
  const { usage, fetchUsage, decrementUsage } = useUsageStore()

  // Voice data
  const [voices, setVoices] = useState<Voice[]>([])
  const [languages, setLanguages] = useState<{ code: string; name: string; count: number }[]>([])
  const [isLoadingVoices, setIsLoadingVoices] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [language, setLanguage] = useState('')
  const [gender, setGender] = useState('')
  const [provider, setProvider] = useState('')

  // Selection and generation
  const [selectedVoices, setSelectedVoices] = useState<Set<string>>(new Set())
  const [text, setText] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatingVoices, setGeneratingVoices] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  // Results
  const [audioResults, setAudioResults] = useState<AudioResult[]>([])

  // Load voices
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingVoices(true)
      try {
        const [voicesRes, langsRes] = await Promise.all([
          fetchVoices({ language, gender, provider, search }),
          fetchLanguages(),
        ])
        setVoices(voicesRes.voices)
        setLanguages(langsRes.languages)
      } catch (err) {
        console.error('Failed to load voices:', err)
      } finally {
        setIsLoadingVoices(false)
      }
    }
    loadData()
  }, [language, gender, provider, search])

  const toggleVoice = (voiceId: string) => {
    setSelectedVoices((prev) => {
      const next = new Set(prev)
      if (next.has(voiceId)) {
        next.delete(voiceId)
      } else if (next.size < 4) {
        next.add(voiceId)
      }
      return next
    })
  }

  const clearFilters = () => {
    setSearch('')
    setLanguage('')
    setGender('')
    setProvider('')
  }

  const hasActiveFilters = search !== '' || language !== '' || gender !== '' || provider !== ''

  const handleGenerate = async () => {
    if (!deviceId || !text.trim() || selectedVoices.size === 0) return
    
    if (!usage?.can_generate) {
      setError(t('errors.noGenerations'))
      return
    }

    setError(null)
    setIsGenerating(true)
    setGeneratingVoices(new Set(selectedVoices))

    const results: AudioResult[] = []

    for (const voiceId of selectedVoices) {
      const voice = voices.find((v) => v.id === voiceId)
      if (!voice) continue

      try {
        const response = await generateVoice(text, voiceId, voice.provider, deviceId)
        
        // Convert base64 to blob URL
        const binaryString = atob(response.audio_base64)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        const blob = new Blob([bytes], { type: 'audio/mpeg' })
        const audioUrl = URL.createObjectURL(blob)

        results.push({
          voiceId,
          voice,
          audioUrl,
          isPlaying: false,
        })

        decrementUsage()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Generation failed'
        setError(message)
        break
      }

      setGeneratingVoices((prev) => {
        const next = new Set(prev)
        next.delete(voiceId)
        return next
      })
    }

    setAudioResults((prev) => [...prev, ...results])
    setIsGenerating(false)
    setGeneratingVoices(new Set())
    setSelectedVoices(new Set())
    fetchUsage()
  }

  const handlePlayPause = (voiceId: string) => {
    setAudioResults((prev) =>
      prev.map((r) => ({
        ...r,
        isPlaying: r.voiceId === voiceId ? !r.isPlaying : false,
      }))
    )
  }

  const handleRemove = (voiceId: string) => {
    setAudioResults((prev) => {
      const result = prev.find((r) => r.voiceId === voiceId)
      if (result) {
        URL.revokeObjectURL(result.audioUrl)
      }
      return prev.filter((r) => r.voiceId !== voiceId)
    })
  }

  const handleDownload = (voiceId: string, voice: Voice) => {
    const result = audioResults.find((r) => r.voiceId === voiceId)
    if (!result) return

    const a = document.createElement('a')
    a.href = result.audioUrl
    a.download = `${voice.name.replace(/\s+/g, '_')}.mp3`
    a.click()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
          <span className="text-white">{t('hero.title1')}</span>{' '}
          <span className="text-gradient">{t('hero.title2')}</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          {t('hero.subtitle')}
        </p>
        
        {/* Stats */}
        <div className="flex justify-center gap-8 mt-8">
          <div className="text-center">
            <div className="font-display text-3xl font-bold text-neon-green">200+</div>
            <div className="text-sm text-gray-500">{t('hero.voices')}</div>
          </div>
          <div className="text-center">
            <div className="font-display text-3xl font-bold text-neon-cyan">2</div>
            <div className="text-sm text-gray-500">{t('hero.providers')}</div>
          </div>
          <div className="text-center">
            <div className="font-display text-3xl font-bold text-neon-purple">40+</div>
            <div className="text-sm text-gray-500">{t('hero.languages')}</div>
          </div>
        </div>
      </motion.div>

      {/* Text Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <TextInput value={text} onChange={setText} />
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <VoiceFilters
          search={search}
          onSearchChange={setSearch}
          language={language}
          onLanguageChange={setLanguage}
          gender={gender}
          onGenderChange={setGender}
          provider={provider}
          onProviderChange={setProvider}
          languages={languages}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </motion.div>

      {/* Selection info & Generate button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap items-center justify-between gap-4 mb-8 p-4 bg-studio-surface border border-studio-border rounded-xl"
      >
        <div className="flex items-center gap-4">
          <span className="text-gray-400">
            {t('selection.selected')}: <span className="text-neon-green font-mono">{selectedVoices.size}/4</span>
          </span>
          {selectedVoices.size > 0 && (
            <button
              onClick={() => setSelectedVoices(new Set())}
              className="text-sm text-gray-500 hover:text-white"
            >
              {t('selection.clear')}
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          {!usage?.can_generate && (
            <Link
              to="/pricing"
              className="flex items-center gap-2 text-sm text-neon-cyan hover:underline"
            >
              {t('selection.getMore')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
          
          <button
            onClick={handleGenerate}
            disabled={isGenerating || selectedVoices.size === 0 || !text.trim()}
            className="btn-primary flex items-center gap-2"
          >
            <Zap className="w-5 h-5" />
            {isGenerating ? t('selection.generating') : t('selection.generate')}
          </button>
        </div>
      </motion.div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-400">{error}</span>
        </motion.div>
      )}

      {/* Comparison Results */}
      {audioResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <ComparisonPanel
            results={audioResults}
            onRemove={handleRemove}
            onPlayPause={handlePlayPause}
            onDownload={handleDownload}
          />
        </motion.div>
      )}

      {/* Voice Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-white">
            {t('voices.title')} ({voices.length})
          </h2>
        </div>

        {isLoadingVoices ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-studio-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-studio-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {voices.slice(0, 40).map((voice) => (
                <VoiceCard
                  key={voice.id}
                  voice={voice}
                  isSelected={selectedVoices.has(voice.id)}
                  onSelect={() => toggleVoice(voice.id)}
                  isGenerating={generatingVoices.has(voice.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {voices.length > 40 && (
          <div className="mt-6 text-center text-gray-500">
            {t('voices.showingOf', { shown: 40, total: voices.length })}
          </div>
        )}
      </motion.div>
    </div>
  )
}
