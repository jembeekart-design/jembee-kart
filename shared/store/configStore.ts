import { create } from "zustand"
import { Theme, ThemeMode, getTheme } from "../core/theme"
import { applyTheme } from "../utils/applyTheme"

type ConfigState = {
  // 🎨 Theme
  mode: ThemeMode
  theme: Theme

  // ⚙️ Feature toggles
  features: {
    reviews: boolean
    wishlist: boolean
    flashSale: boolean
  }

  // 🔔 Notifications
  notifications: {
    enabled: boolean
  }

  // 📲 WhatsApp
  whatsapp: {
    enabled: boolean
    number: string
  }

  // 🔄 Actions
  setMode: (mode: ThemeMode) => void
  setTheme: (theme: Theme) => void
  toggleFeature: (key: keyof ConfigState["features"]) => void
  setConfig: (data: Partial<ConfigState>) => void
}

// 🚀 STORE
export const useConfigStore = create<ConfigState>((set, get) => ({
  // 🌙 default
  mode: "dark",
  theme: getTheme("dark"),

  features: {
    reviews: true,
    wishlist: true,
    flashSale: true
  },

  notifications: {
    enabled: true
  },

  whatsapp: {
    enabled: true,
    number: ""
  },

  // 🎯 CHANGE THEME MODE
  setMode: (mode) => {
    const newTheme = getTheme(mode)

    applyTheme(newTheme) // 🔥 CSS + status bar update

    set({
      mode,
      theme: newTheme
    })
  },

  // 🎨 DIRECT THEME UPDATE (admin custom theme)
  setTheme: (theme) => {
    applyTheme(theme)

    set({ theme })
  },

  // ⚙️ FEATURE TOGGLE
  toggleFeature: (key) => {
    const features = get().features

    set({
      features: {
        ...features,
        [key]: !features[key]
      }
    })
  },

  // 🔄 FULL CONFIG UPDATE (Firestore se)
  setConfig: (data) => {
    if (data.theme) {
      applyTheme(data.theme)
    }

    set((state) => ({
      ...state,
      ...data
    }))
  }
}))
