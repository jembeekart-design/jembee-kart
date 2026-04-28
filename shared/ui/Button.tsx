"use client"

import React from "react"

type Props = {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "ghost"
  full?: boolean
}

export const Button = ({
  children,
  onClick,
  variant = "primary",
  full = false,
}: Props) => {
  return (
    <button
      onClick={onClick}
      className={`btn ${variant} ${full ? "full" : ""}`}
    >
      <span>{children}</span>
    </button>
  )
}
