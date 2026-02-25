const API_BASE = '/api/v1'

export interface Voice {
  id: string
  name: string
  language: string
  language_name: string
  gender: string
  provider: 'edge' | 'openai'
  styles: string[]
}

export interface VoicesResponse {
  total: number
  voices: Voice[]
}

export interface GenerateResponse {
  audio_base64: string
  format: string
  voice_id: string
  provider: string
}

export interface UsageResponse {
  can_generate: boolean
  remaining: number
  is_premium: boolean
  free_limit: number
}

export async function fetchVoices(params?: {
  language?: string
  gender?: string
  provider?: string
  search?: string
}): Promise<VoicesResponse> {
  const url = new URL(`${API_BASE}/voices`, window.location.origin)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value)
    })
  }
  
  const response = await fetch(url.toString())
  if (!response.ok) {
    throw new Error('Failed to fetch voices')
  }
  return response.json()
}

export async function generateVoice(
  text: string,
  voiceId: string,
  provider: string,
  deviceId: string
): Promise<GenerateResponse> {
  const response = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Id': deviceId,
    },
    body: JSON.stringify({
      text,
      voice_id: voiceId,
      provider,
    }),
  })
  
  if (!response.ok) {
    const data = await response.json()
    // Handle detail being string or object
    const errorMessage = typeof data.detail === 'string'
      ? data.detail
      : data.detail?.error || data.detail?.message || 'Generation failed'
    throw new Error(errorMessage)
  }
  
  return response.json()
}

export async function getUsage(deviceId: string): Promise<UsageResponse> {
  const response = await fetch(`${API_BASE}/usage`, {
    headers: {
      'X-Device-Id': deviceId,
    },
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch usage')
  }
  
  return response.json()
}

export async function createCheckout(
  productSku: string,
  deviceId: string
): Promise<{ checkout_url: string; checkout_id: string }> {
  const response = await fetch(`${API_BASE}/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product_sku: productSku,
      device_id: deviceId,
      success_url: `${window.location.origin}/payment/success`,
    }),
  })
  
  if (!response.ok) {
    const data = await response.json()
    const errorMessage = typeof data.detail === 'string'
      ? data.detail
      : data.detail?.error || data.detail?.message || 'Checkout failed'
    throw new Error(errorMessage)
  }
  
  return response.json()
}

export async function fetchLanguages(): Promise<{ languages: { code: string; name: string; count: number }[] }> {
  const response = await fetch(`${API_BASE}/voices/languages`)
  if (!response.ok) {
    throw new Error('Failed to fetch languages')
  }
  return response.json()
}
