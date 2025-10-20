"use client"

import { useEffect } from "react"

export default function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js")
        console.log("[PWA] Service worker registrado:", reg.scope)
      } catch (err) {
        console.warn("[PWA] Falha ao registrar o service worker:", err)
      }
    }

    const unregisterDev = async () => {
      try {
        const regs = await navigator.serviceWorker.getRegistrations()
        regs.forEach((r) => r.unregister())
        console.log("[PWA] Service workers desregistrados no ambiente de desenvolvimento")
      } catch (err) {
        console.warn("[PWA] Falha ao desregistrar service workers:", err)
      }
    }

    const onLoad = () => {
      if (process.env.NODE_ENV === "production") {
        register()
      } else {
        unregisterDev()
      }
    }

    if (document.readyState === "complete") {
      onLoad()
    } else {
      window.addEventListener("load", onLoad, { once: true })
    }
  }, [])

  return null
}