"use client"

import * as React from "react"
import Image, { type ImageProps } from "next/image"
import { cn } from "@/lib/utils"

// Flips to true after the first React commit (hydration). FadeImages created
// during that first pass came from the server HTML, so the visitor has already
// been looking at their empty tile — even if the photo finished downloading
// before hydration, it must still fade in rather than snap into view.
let hasHydrated = false

/**
 * next/image that fades in smoothly instead of popping in.
 *
 * While the photo downloads, the frame shows a plain neutral tile (no blur, no
 * preview). Once the photo has loaded and *decoded* it fades in over the tile —
 * waiting for the decode means a large photo can't land mid-animation and make
 * the fade skip frames. The tile stays underneath until the fade is done, so the
 * page background never shows through mid-transition. Images that come straight
 * from cache after a client-side navigation appear immediately with no fade.
 *
 * The parent must be `position: relative` (it already has to be for `fill`).
 */
export function FadeImage({
  className,
  alt,
  src,
  onLoad,
  style,
  revealMs = 500,
  ...props
}: ImageProps & {
  /** Length of the fade-in. Use longer values for full-bleed photos. */
  revealMs?: number
}) {
  const [phase, setPhase] = React.useState<"loading" | "reveal" | "instant">("loading")
  const [tileGone, setTileGone] = React.useState(false)
  // False until the mount effect has run. A cached image is already complete when
  // it attaches, so next/image fires onLoad from its ref callback — before that
  // effect. An image that only finishes *after* mounting (however quickly) was
  // visible as an empty tile for at least a frame, so it gets the fade.
  const mounted = React.useRef(false)
  const fromServer = React.useRef(!hasHydrated)

  React.useEffect(() => {
    mounted.current = true
    hasHydrated = true
  }, [])

  React.useEffect(() => {
    if (phase !== "reveal") return
    const timer = setTimeout(() => setTileGone(true), revealMs + 100)
    return () => clearTimeout(timer)
  }, [phase, revealMs])

  return (
    <>
      {phase !== "instant" && !tileGone && (
        <span aria-hidden className="pointer-events-none absolute inset-0 bg-muted" />
      )}
      <Image
        {...props}
        src={src}
        alt={alt}
        // `relative` keeps in-flow images above the tile; `fill` images are
        // positioned absolutely by next/image's inline style, which wins.
        className={cn(
          "relative",
          phase === "loading" && "opacity-0",
          phase === "reveal" && "img-reveal",
          className
        )}
        style={{ ...style, "--reveal-ms": `${revealMs}ms` } as React.CSSProperties}
        onLoad={(event) => {
          const cached = !fromServer.current && !mounted.current
          const img = event.currentTarget
          const start = () =>
            setPhase((current) => (current === "loading" ? (cached ? "instant" : "reveal") : current))
          // decode() resolves at once for an already-decoded image; if it fails
          // (or isn't supported) just show the image rather than leave it hidden.
          if (cached || typeof img.decode !== "function") start()
          else img.decode().then(start, start)
          onLoad?.(event)
        }}
      />
    </>
  )
}
