import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Play, Pause, Download, Trash2, Volume2 } from 'lucide-react'
import { Voice } from '../lib/api'
import { motion, AnimatePresence } from 'framer-motion'

interface AudioResult {
  voiceId: string
  voice: Voice
  audioUrl: string
  isPlaying: boolean
}

interface ComparisonPanelProps {
  results: AudioResult[]
  onRemove: (voiceId: string) => void
  onPlayPause: (voiceId: string) => void
  onDownload: (voiceId: string, voice: Voice) => void
}

export default function ComparisonPanel({
  results,
  onRemove,
  onPlayPause,
  onDownload,
}: ComparisonPanelProps) {
  const { t } = useTranslation()
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({})

  useEffect(() => {
    // Manage audio playback
    results.forEach((result) => {
      const audio = audioRefs.current[result.voiceId]
      if (audio) {
        if (result.isPlaying) {
          audio.play()
        } else {
          audio.pause()
        }
      }
    })
  }, [results])

  if (results.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-studio-surface border border-studio-border rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-neon-green" />
          {t('comparison.title')} ({results.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatePresence>
          {results.map((result) => (
            <motion.div
              key={result.voiceId}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, x: -20 }}
              className="bg-studio-bg border border-studio-border rounded-xl p-4"
            >
              {/* Hidden audio element */}
              <audio
                ref={(el) => {
                  if (el) audioRefs.current[result.voiceId] = el
                }}
                src={result.audioUrl}
                onEnded={() => onPlayPause(result.voiceId)}
              />

              {/* Voice info */}
              <div className="mb-3">
                <h4 className="font-medium text-white truncate">{result.voice.name}</h4>
                <p className="text-xs text-gray-500">{result.voice.provider.toUpperCase()}</p>
              </div>

              {/* Waveform visualization */}
              <div className="h-12 flex items-center justify-center gap-0.5 mb-3">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 bg-gradient-to-t from-neon-green to-neon-cyan rounded-full transition-all duration-100 ${
                      result.isPlaying ? 'waveform-bar' : ''
                    }`}
                    style={{
                      height: result.isPlaying ? `${20 + Math.random() * 80}%` : '20%',
                      animationDelay: `${i * 0.03}s`,
                    }}
                  />
                ))}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => onPlayPause(result.voiceId)}
                  className="w-10 h-10 rounded-full bg-neon-green flex items-center justify-center hover:scale-105 transition-transform"
                >
                  {result.isPlaying ? (
                    <Pause className="w-5 h-5 text-studio-bg" />
                  ) : (
                    <Play className="w-5 h-5 text-studio-bg ml-0.5" />
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onDownload(result.voiceId, result.voice)}
                    className="p-2 rounded-lg bg-studio-muted hover:bg-studio-border transition-colors"
                    title={t('comparison.download')}
                  >
                    <Download className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => onRemove(result.voiceId)}
                    className="p-2 rounded-lg bg-studio-muted hover:bg-red-500/20 hover:text-red-400 transition-colors"
                    title={t('comparison.remove')}
                  >
                    <Trash2 className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
