"use client"

import { ReactNode } from "react"
import { useConfig } from "@/shared/hooks/useConfig"

export const MainLayout = ({ children }: { children: ReactNode }) => {
  const { theme } = useConfig()

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.background,
        color: theme.text,
        padding: "16px",
      }}
    >
      {/* 🔥 TOP BAR */}
      <div
        style={{
          marginBottom: "16px",
          fontSize: "20px",
          fontWeight: "bold",
        }}
      >
        JembeeKart
      </div>

      {/* 🔥 MAIN CONTENT */}
      <div>{children}</div>
    </div>
  )
}
