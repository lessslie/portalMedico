import { create } from 'zustand'

export const useUIStore = create((set) => ({
  sidebar: false,
  toggleSidebar: () => set((state) => ({ sidebar: !state.sidebar }))
}))

