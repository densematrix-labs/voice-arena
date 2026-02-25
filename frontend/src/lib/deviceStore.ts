import { create } from 'zustand'
import FingerprintJS from '@fingerprintjs/fingerprintjs'

interface DeviceState {
  deviceId: string | null
  isLoading: boolean
  initDevice: () => Promise<void>
}

export const useDeviceStore = create<DeviceState>((set, get) => ({
  deviceId: null,
  isLoading: true,
  
  initDevice: async () => {
    if (get().deviceId) return
    
    set({ isLoading: true })
    
    try {
      // Try to get from localStorage first
      const stored = localStorage.getItem('voice_arena_device_id')
      if (stored) {
        set({ deviceId: stored, isLoading: false })
        return
      }
      
      // Generate new fingerprint
      const fp = await FingerprintJS.load()
      const result = await fp.get()
      const deviceId = result.visitorId
      
      localStorage.setItem('voice_arena_device_id', deviceId)
      set({ deviceId, isLoading: false })
    } catch (error) {
      // Fallback to random ID
      const fallbackId = `fallback_${Math.random().toString(36).substring(7)}`
      localStorage.setItem('voice_arena_device_id', fallbackId)
      set({ deviceId: fallbackId, isLoading: false })
    }
  },
}))
