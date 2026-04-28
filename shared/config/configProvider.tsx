"use client"

import { useEffect } from "react"
import { useConfigStore } from "../store/configStore"

export default function ConfigProvider({ children }: any) {
  const { theme, setMode } = useConfigStore()

  useEffect(() => {
    // 🔥 default theme load
    setMode("dark")
  }, [])

  return children
}
