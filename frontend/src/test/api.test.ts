import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchVoices, generateVoice, getUsage, createCheckout } from '../lib/api'

describe('API functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchVoices', () => {
    it('fetches voices successfully', async () => {
      const mockResponse = {
        total: 2,
        voices: [
          { id: 'voice1', name: 'Voice 1', provider: 'edge' },
          { id: 'voice2', name: 'Voice 2', provider: 'openai' },
        ],
      }
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
      
      const result = await fetchVoices()
      expect(result.total).toBe(2)
      expect(result.voices).toHaveLength(2)
    })

    it('applies filters to request', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ total: 0, voices: [] }),
      })
      
      await fetchVoices({ language: 'en', gender: 'female' })
      
      const url = (global.fetch as any).mock.calls[0][0]
      expect(url).toContain('language=en')
      expect(url).toContain('gender=female')
    })
  })

  describe('generateVoice', () => {
    it('generates voice successfully', async () => {
      const mockResponse = {
        audio_base64: 'base64data',
        format: 'mp3',
        voice_id: 'test-voice',
        provider: 'edge',
      }
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
      
      const result = await generateVoice('Hello', 'test-voice', 'edge', 'device-1')
      expect(result.audio_base64).toBe('base64data')
      expect(result.voice_id).toBe('test-voice')
    })

    it('handles string error detail', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ detail: 'Something went wrong' }),
      })
      
      await expect(generateVoice('Hello', 'voice', 'edge', 'device'))
        .rejects.toThrow('Something went wrong')
    })

    it('handles object error detail with error field', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 402,
        json: () => Promise.resolve({
          detail: { error: 'No tokens remaining', code: 'payment_required' },
        }),
      })
      
      await expect(generateVoice('Hello', 'voice', 'edge', 'device'))
        .rejects.toThrow('No tokens remaining')
    })

    it('handles object error detail with message field', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          detail: { message: 'Invalid input' },
        }),
      })
      
      await expect(generateVoice('Hello', 'voice', 'edge', 'device'))
        .rejects.toThrow('Invalid input')
    })

    it('never throws [object Object]', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 402,
        json: () => Promise.resolve({
          detail: { error: 'Test error', extra: 'data' },
        }),
      })
      
      try {
        await generateVoice('Hello', 'voice', 'edge', 'device')
      } catch (e: any) {
        expect(e.message).not.toContain('[object Object]')
        expect(e.message).not.toContain('object Object')
      }
    })
  })

  describe('getUsage', () => {
    it('fetches usage successfully', async () => {
      const mockUsage = {
        can_generate: true,
        remaining: 3,
        is_premium: false,
        free_limit: 3,
      }
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockUsage),
      })
      
      const result = await getUsage('device-1')
      expect(result.can_generate).toBe(true)
      expect(result.remaining).toBe(3)
    })
  })

  describe('createCheckout', () => {
    it('creates checkout successfully', async () => {
      const mockResponse = {
        checkout_url: 'https://checkout.example.com',
        checkout_id: 'checkout_123',
      }
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
      
      const result = await createCheckout('starter', 'device-1')
      expect(result.checkout_url).toBe('https://checkout.example.com')
    })

    it('handles checkout error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        json: () => Promise.resolve({ detail: 'Payment not configured' }),
      })
      
      await expect(createCheckout('starter', 'device'))
        .rejects.toThrow('Payment not configured')
    })
  })
})
