import { useConfigStore } from "../store/configStore"

export const useConfig = () => {
  const store = useConfigStore()

  return {
    theme: store.theme,
    mode: store.mode,

    features: store.features,
    notifications: store.notifications,
    whatsapp: store.whatsapp,

    // actions
    setMode: store.setMode,
    setTheme: store.setTheme,
    toggleFeature: store.toggleFeature,
    setConfig: store.setConfig
  }
}
