"use client"

import * as React from "react"
import Lenis from "lenis"

const LenisContext = React.createContext<React.RefObject<Lenis | null> | null>(null)

/** Returns the active Lenis instance, if any. Read `.current` at call time (e.g. in an event handler) — it is not reactive state. */
export function useLenis() {
  return React.useContext(LenisContext)
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = React.useRef<Lenis | null>(null)

  React.useEffect(() => {
    const instance = new Lenis({
      duration: 0.8,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
    })

    lenisRef.current = instance

    // Lenis only needs a frame loop while a smooth scroll is in flight. Running it
    // forever (the usual snippet) keeps the browser producing a full frame 60 times
    // a second on a page that is otherwise perfectly still — wasted work that
    // competes with image decoding and the site's own animations. So the loop
    // starts on demand and stops after the scroll settles.
    const IDLE_MS = 300
    let frame = 0
    let lastActive = 0

    function loop(time: number) {
      instance.raf(time)
      if (instance.isScrolling) lastActive = time
      frame = time - lastActive < IDLE_MS ? requestAnimationFrame(loop) : 0
    }

    // Lenis measures time since its previous frame, so after an idle pause the
    // first frame of the next scroll would see a huge delta and jump straight to
    // the end. Refresh its clock *before* the scroll starts animating.
    function wake() {
      if (frame) return
      instance.raf(performance.now())
      lastActive = performance.now()
      frame = requestAnimationFrame(loop)
    }

    // Capture phase: runs before Lenis's own wheel handler begins the animation.
    window.addEventListener("wheel", wake, { capture: true, passive: true })

    // Programmatic scrolls (e.g. the scroll-to-top button) need the loop too.
    const scrollTo = instance.scrollTo.bind(instance)
    instance.scrollTo = (...args: Parameters<Lenis["scrollTo"]>) => {
      wake()
      return scrollTo(...args)
    }

    return () => {
      window.removeEventListener("wheel", wake, { capture: true })
      if (frame) cancelAnimationFrame(frame)
      instance.destroy()
      lenisRef.current = null
    }
  }, [])

  return <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>
}
