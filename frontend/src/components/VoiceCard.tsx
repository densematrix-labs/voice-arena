import { Play, Pause, Check, Volume2 } from 'lucide-react'
import { Voice } from '../lib/api'
import { motion } from 'framer-motion'

interface VoiceCardProps {
  voice: Voice
  isSelected: boolean
  onSelect: () => void
  audioUrl?: string
  isPlaying?: boolean
  onPlayPause?: () => void
  isGenerating?: boolean
}

export default function VoiceCard({
  voice,
  isSelected,
  onSelect,
  audioUrl,
  isPlaying = false,
  onPlayPause,
  isGenerating = false,
}: VoiceCardProps) {
  const providerColors = {
    edge: 'from-blue-500 to-blue-600',
    openai: 'from-green-500 to-emerald-600',
  }

  const genderColors = {
    Male: 'text-blue-400',
    Female: 'text-pink-400',
    Neutral: 'text-purple-400',
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      className={`card cursor-pointer relative overflow-hidden group ${
        isSelected ? 'border-neon-green glow-green' : ''
      }`}
      onClick={onSelect}
      data-testid={`voice-card-${voice.id}`}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-neon-green flex items-center justify-center">
          <Check className="w-4 h-4 text-studio-bg" />
        </div>
      )}

      {/* Provider badge */}
      <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${providerColors[voice.provider]} text-white`}>
        {voice.provider === 'edge' ? 'Edge' : 'OpenAI'}
      </div>

      {/* Content */}
      <div className="pt-6">
        <h3 className="font-display font-bold text-lg text-white truncate">{voice.name}</h3>
        <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
          <span>{voice.language}</span>
          <span>•</span>
          <span className={genderColors[voice.gender as keyof typeof genderColors] || 'text-gray-400'}>
            {voice.gender}
          </span>
        </div>

        {/* Styles */}
        {voice.styles.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {voice.styles.slice(0, 3).map((style) => (
              <span
                key={style}
                className="px-2 py-0.5 bg-studio-muted rounded text-xs text-gray-400"
              >
                {style}
              </span>
            ))}
          </div>
        )}

        {/* Waveform visualization (when audio available) */}
        {audioUrl && (
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onPlayPause?.()
              }}
              className="w-10 h-10 rounded-full bg-neon-green/20 flex items-center justify-center hover:bg-neon-green/30 transition-colors"
              disabled={isGenerating}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-neon-green" />
              ) : (
                <Play className="w-5 h-5 text-neon-green ml-0.5" />
              )}
            </button>
            
            {/* Simple waveform animation */}
            <div className="flex items-center gap-0.5 h-8">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 bg-neon-green rounded-full transition-all duration-150 ${
                    isPlaying ? 'waveform-bar' : ''
                  }`}
                  style={{
                    height: isPlaying ? `${Math.random() * 100}%` : '30%',
                    animationDelay: `${i * 0.05}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Generate indicator */}
        {isGenerating && (
          <div className="mt-4 flex items-center gap-2 text-neon-cyan text-sm">
            <Volume2 className="w-4 h-4 animate-pulse" />
            <span>Generating...</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
