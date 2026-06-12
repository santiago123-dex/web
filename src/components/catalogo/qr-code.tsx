"use client"

import { useEffect, useRef } from "react"
import QRCodeLib from "qrcode"

export function QRCode({
  url,
  size = 160,
}: {
  url: string
  size?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      QRCodeLib.toCanvas(canvasRef.current, url, {
        width: size,
        margin: 2,
        color: { dark: "#171717", light: "#ffffff" },
      })
    }
  }, [url, size])

  return <canvas ref={canvasRef} className="rounded-lg" />
}
