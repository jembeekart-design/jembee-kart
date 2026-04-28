"use client"

import React from "react"

type Props = {
  children: React.ReactNode
  padding?: string
  className?: string
  onClick?: () => void
}

export const GlassCard = ({
  children,
  padding = "16px",
  className = "",
  onClick,
}: Props) => {
  return (
    <div
      onClick={onClick}
      className={`glass-card ${className}`}
      style={{
        padding,
      }}
    >
      {children}
    </div>
  )
}
