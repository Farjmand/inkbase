import { create } from 'zustand'

interface UIState {
  dark: boolean
  toggleDark: () => void
}

const initialDark = localStorage.getItem('inkbase-dark') === 'true'
if (initialDark) document.documentElement.classList.add('dark')

export const useUIStore = create<UIState>((set) => ({
  dark: initialDark,
  toggleDark: () =>
    set(state => {
      const next = !state.dark
      document.documentElement.classList.toggle('dark', next)
      localStorage.setItem('inkbase-dark', String(next))
      return { dark: next }
    }),
}))
