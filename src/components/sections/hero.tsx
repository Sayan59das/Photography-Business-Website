"use client"

import * as React from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { useIsClient } from "@/lib/use-is-client"
import { IMAGE_SIZES } from "@/lib/image-sizes"

const heroImages = [
  "/images/hero/architectural-silhouette.jpg",
  "/images/hero/bridal-portrait.jpg",
  "/images/hero/crowd-celebration.jpg",
  "/images/hero/sangeet-dance.jpg",
  "/images/hero/ring-moment.jpg",
  "/images/hero/jaimala-ceremony.jpg",
]

function generateParticles(count: number) {
  return Array.from({ length: count }).map(() => ({
    width: Math.random() * 6 + 2,
    height: Math.random() * 6 + 2,
    left: Math.random() * 100,
    top: Math.random() * 100,
    opacity: Math.random() * 0.4 + 0.1,
    riseBy: Math.random() * 100 + 50,
    driftBy: (Math.random() - 0.5) * 60,
    duration: Math.random() * 6 + 4,
    delay: Math.random() * 4,
  }))
}

/**
 * Ambient floating particles. Animated with CSS (not per-frame JS via
 * framer-motion) so 20 infinitely-looping particles cost nothing on the
 * main thread once painted.
 */
function FloatingParticles() {
  const isClient = useIsClient()
  // Computed once per mount; only rendered after hydration so the random
  // values never mismatch between the server-rendered and client markup.
  const [particles] = React.useState(() => generateParticles(20))

  if (!isClient) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {particles.map((p, i) => (
        <div
          key={i}
          className="hero-particle"
          style={
            {
              width: p.width,
              height: p.height,
              left: `${p.left}%`,
              top: `${p.top}%`,
              background: `radial-gradient(circle, rgba(201, 162, 75, ${p.opacity}), transparent)`,
              "--pf-dx": `${p.driftBy}px`,
              "--pf-dy": `${-p.riseBy}px`,
              "--pf-duration": `${p.duration}s`,
              "--pf-delay": `${p.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}

export function Hero() {
  const [currentImage, setCurrentImage] = React.useState(0)
  // Only the current slide plus the one about to play are ever mounted, so
  // the browser fetches one hero image at a time instead of all six at once.
  // Starts with the next slide already queued so it's ready before its turn.
  const [loaded, setLoaded] = React.useState(() => new Set([0, 1]))
  const currentRef = React.useRef(0)
  const sectionRef = React.useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  })
  const y = useTransform(scrollYProgress, [0, 1], [0, 200])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  React.useEffect(() => {
    const interval = setInterval(() => {
      const next = (currentRef.current + 1) % heroImages.length
      currentRef.current = next
      setCurrentImage(next)
      // Preload the slide after this one a full dwell-cycle ahead.
      const preload = (next + 1) % heroImages.length
      setLoaded((current) => (current.has(preload) ? current : new Set(current).add(preload)))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const headlineWords = "Your Story, Our Lens".split(" ")

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100svh] flex w-full overflow-hidden -mt-20"
    >
      {/* Background Images with crossfade — only the current slide and the
          one preloading next are ever mounted, so the browser fetches one
          hero image at a time instead of all six on first paint. The fade
          and slow zoom are plain CSS (see .hero-slide), so they run on the
          compositor and stay smooth while the next photo decodes. */}
      {heroImages.map((src, i) =>
        loaded.has(i) ? (
          <div
            key={src}
            className="hero-slide absolute inset-0 z-0"
            data-active={i === currentImage}
            aria-hidden={i !== currentImage}
          >
            <Image
              src={src}
              alt="Photography"
              fill
              loading={i === 0 ? "eager" : undefined}
              fetchPriority={i === 0 ? "high" : undefined}
              className="object-cover"
              sizes={IMAGE_SIZES.full}
            />
          </div>
        ) : null
      )}

      {/* Dark overlay with gradient */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/50 via-black/30 to-black/70" />

      {/* Floating particles */}
      <FloatingParticles />


      {/* Content */}
      <motion.div
        style={{ y, opacity }}
        className="page-shell relative z-10 flex flex-col items-center justify-center text-center text-white pt-32 pb-32"
      >
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.2em" }}
          animate={{ opacity: 1, letterSpacing: "0.4em" }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-xs md:text-sm font-medium tracking-[0.4em] uppercase mb-6 text-white/60"
        >
          Premium Photography Studio
        </motion.p>

        {/* Headline with word-by-word reveal */}
        <h1 className="glass-headline font-heading text-display font-bold tracking-tight mb-8 max-w-5xl text-balance">
          {headlineWords.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 40, rotateX: -40 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.5 + i * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="inline-block mr-[0.3em]"
              style={
                word.replace(",", "") === "Story" || word === "Lens"
                  ? { fontStyle: "italic" }
                  : undefined
              }
            >
              {word}
            </motion.span>
          ))}
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="text-base md:text-xl text-white/70 mb-12 max-w-2xl font-light leading-relaxed"
        >
          We capture the raw, authentic emotion of your most important days —
          turning fleeting moments into timeless art.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link
            href="/portfolio"
            className={cn(
              buttonVariants({ size: "lg" }),
              "rounded-full text-base h-14 px-10 gold-shimmer border-0 text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
            )}
          >
            View Portfolio
          </Link>
          <Link
            href="/contact"
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "rounded-full text-base h-14 px-10 bg-white/5 text-white border-white/20 hover:bg-white/15 hover:border-white/40 backdrop-blur-sm transition-all"
            )}
          >
            Book a Consultation
          </Link>
        </motion.div>
      </motion.div>

      {/* Bottom controls — one centered stack (scroll cue above the slide dots)
          so the hero is balanced left and right. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-6 md:bottom-8 z-10 flex flex-col items-center gap-3">
        <motion.div
          style={{ opacity }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[10px] text-white/40 tracking-[0.3em] uppercase">
            Scroll
          </span>
          <div className="scroll-bounce">
            <ChevronDown className="h-4 w-4 text-white/40" />
          </div>
        </motion.div>

        {/* Image indicator dots */}
        <div className="pointer-events-auto flex items-center">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                currentRef.current = i
                setCurrentImage(i)
                setLoaded((current) => (current.has(i) ? current : new Set(current).add(i)))
              }}
              className="group/dot flex h-6 w-5 items-center justify-center"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === currentImage}
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  i === currentImage
                    ? "w-6 h-2 bg-primary"
                    : "w-2 h-2 bg-white/30 group-hover/dot:bg-white/60"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
