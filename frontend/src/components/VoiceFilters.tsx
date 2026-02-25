import { useTranslation } from 'react-i18next'
import { Search, Filter, X } from 'lucide-react'

interface VoiceFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  language: string
  onLanguageChange: (value: string) => void
  gender: string
  onGenderChange: (value: string) => void
  provider: string
  onProviderChange: (value: string) => void
  languages: { code: string; name: string; count: number }[]
  onClearFilters: () => void
  hasActiveFilters: boolean
}

export default function VoiceFilters({
  search,
  onSearchChange,
  language,
  onLanguageChange,
  gender,
  onGenderChange,
  provider,
  onProviderChange,
  languages,
  onClearFilters,
  hasActiveFilters,
}: VoiceFiltersProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('filters.searchPlaceholder')}
          className="input pl-12"
          data-testid="voice-search"
        />
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-gray-400">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">{t('filters.title')}</span>
        </div>

        {/* Language filter */}
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="bg-studio-surface border border-studio-border rounded-lg px-3 py-2 text-sm text-white focus:border-neon-green/50 focus:outline-none"
          data-testid="language-filter"
        >
          <option value="">{t('filters.allLanguages')}</option>
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name} ({lang.count})
            </option>
          ))}
        </select>

        {/* Gender filter */}
        <select
          value={gender}
          onChange={(e) => onGenderChange(e.target.value)}
          className="bg-studio-surface border border-studio-border rounded-lg px-3 py-2 text-sm text-white focus:border-neon-green/50 focus:outline-none"
          data-testid="gender-filter"
        >
          <option value="">{t('filters.allGenders')}</option>
          <option value="male">{t('filters.male')}</option>
          <option value="female">{t('filters.female')}</option>
          <option value="neutral">{t('filters.neutral')}</option>
        </select>

        {/* Provider filter */}
        <select
          value={provider}
          onChange={(e) => onProviderChange(e.target.value)}
          className="bg-studio-surface border border-studio-border rounded-lg px-3 py-2 text-sm text-white focus:border-neon-green/50 focus:outline-none"
          data-testid="provider-filter"
        >
          <option value="">{t('filters.allProviders')}</option>
          <option value="edge">Edge TTS (200+)</option>
          <option value="openai">OpenAI TTS (6)</option>
        </select>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
            {t('filters.clear')}
          </button>
        )}
      </div>
    </div>
  )
}
