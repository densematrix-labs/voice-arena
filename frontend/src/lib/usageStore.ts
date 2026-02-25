import { create } from 'zustand'
import { getUsage, UsageResponse } from './api'
import { useDeviceStore } from './deviceStore'

interface UsageState {
  usage: UsageResponse | null
  isLoading: boolean
  error: string | null
  fetchUsage: () => Promise<void>
  decrementUsage: () => void
}

export const useUsageStore = create<UsageState>((set, get) => ({
  usage: null,
  isLoading: false,
  error: null,
  
  fetchUsage: async () => {
    const deviceId = useDeviceStore.getState().deviceId
    if (!deviceId) return
    
    set({ isLoading: true, error: null })
    
    try {
      const usage = await getUsage(deviceId)
      set({ usage, isLoading: false })
    } catch (error) {
      set({ error: 'Failed to fetch usage', isLoading: false })
    }
  },
  
  decrementUsage: () => {
    const { usage } = get()
    if (usage && usage.remaining > 0) {
      set({
        usage: {
          ...usage,
          remaining: usage.remaining - 1,
          can_generate: usage.remaining - 1 > 0,
        },
      })
    }
  },
}))
