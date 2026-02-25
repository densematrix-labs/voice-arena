import { useTranslation } from 'react-i18next'
import { Type, AlertCircle } from 'lucide-react'

interface TextInputProps {
  value: string
  onChange: (value: string) => void
  maxLength?: number
  error?: string
}

export default function TextInput({
  value,
  onChange,
  maxLength = 5000,
  error,
}: TextInputProps) {
  const { t } = useTranslation()
  const charCount = value.length

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
          <Type className="w-4 h-4" />
          {t('input.label')}
        </label>
        <span className={`text-xs ${charCount > maxLength * 0.9 ? 'text-yellow-400' : 'text-gray-500'}`}>
          {charCount.toLocaleString()} / {maxLength.toLocaleString()}
        </span>
      </div>
      
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        rows={4}
        placeholder={t('input.placeholder')}
        className={`input resize-none ${error ? 'border-red-500 focus:border-red-500' : ''}`}
        data-testid="text-input"
      />
      
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
