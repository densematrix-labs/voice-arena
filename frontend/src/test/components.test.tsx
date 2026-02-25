import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import TextInput from '../components/TextInput'
import VoiceFilters from '../components/VoiceFilters'

describe('TextInput', () => {
  it('renders with placeholder', () => {
    render(<TextInput value="" onChange={() => {}} />)
    expect(screen.getByTestId('text-input')).toBeInTheDocument()
  })

  it('shows character count', () => {
    render(<TextInput value="Hello" onChange={() => {}} />)
    expect(screen.getByText(/5/)).toBeInTheDocument()
  })

  it('calls onChange when typing', () => {
    const onChange = vi.fn()
    render(<TextInput value="" onChange={onChange} />)
    
    const input = screen.getByTestId('text-input')
    fireEvent.change(input, { target: { value: 'Test' } })
    
    expect(onChange).toHaveBeenCalledWith('Test')
  })

  it('displays error message', () => {
    render(<TextInput value="" onChange={() => {}} error="Test error" />)
    expect(screen.getByText('Test error')).toBeInTheDocument()
  })
})

describe('VoiceFilters', () => {
  const defaultProps = {
    search: '',
    onSearchChange: vi.fn(),
    language: '',
    onLanguageChange: vi.fn(),
    gender: '',
    onGenderChange: vi.fn(),
    provider: '',
    onProviderChange: vi.fn(),
    languages: [{ code: 'en', name: 'English', count: 10 }],
    onClearFilters: vi.fn(),
    hasActiveFilters: false,
  }

  it('renders search input', () => {
    render(<VoiceFilters {...defaultProps} />)
    expect(screen.getByTestId('voice-search')).toBeInTheDocument()
  })

  it('renders filter dropdowns', () => {
    render(<VoiceFilters {...defaultProps} />)
    expect(screen.getByTestId('language-filter')).toBeInTheDocument()
    expect(screen.getByTestId('gender-filter')).toBeInTheDocument()
    expect(screen.getByTestId('provider-filter')).toBeInTheDocument()
  })

  it('shows clear button when filters active', () => {
    render(<VoiceFilters {...defaultProps} hasActiveFilters={true} />)
    expect(screen.getByText('filters.clear')).toBeInTheDocument()
  })

  it('calls onClearFilters when clear clicked', () => {
    const onClearFilters = vi.fn()
    render(<VoiceFilters {...defaultProps} hasActiveFilters={true} onClearFilters={onClearFilters} />)
    
    fireEvent.click(screen.getByText('filters.clear'))
    expect(onClearFilters).toHaveBeenCalled()
  })
})
