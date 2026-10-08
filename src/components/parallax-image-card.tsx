"use client"

import * as React from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { FadeImage } from "@/components/fade-image"
import { cn } from "@/lib/utils"
import { IMAGE_SIZES } from "@/lib/image-sizes"

/** Gallery tile with scroll-driven image parallax, a numbered index, and a hover-reveal caption — the treatment used across every image grid on the site. */
export function ParallaxImageCard({
  href,
  image,
  title,
  category,
  index,
  className = "",
  cta = "View Story",
  sizes = IMAGE_SIZES.grid,
  eager = false,
  colorOnHover = false,
}: {
  href: string
  image: string
  title: string
  category: string
  index: number
  className?: string
  cta?: string
  /** `sizes` for the photo — pass one that matches this tile's real width. */
  sizes?: string
  /** Load immediately instead of lazily. Use for tiles that start inside the first viewport. */
  eager?: boolean
  /**
   * Show the photo in black and white until the tile is hovered (or keyboard
   * focused), then fade to full colour. Only applies on devices that can hover —
   * touch screens always show colour, since they would never see it otherwise.
   */
  colorOnHover?: boolean
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const imgY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      // Stagger within a row (not across the whole grid) so every row reveals the same way.
      transition={{ duration: 0.7, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative overflow-hidden rounded-2xl cursor-pointer ${className}`}
    >
      <Link href={href} className="absolute inset-0 z-20">
        <span className="sr-only">View {title}</span>
      </Link>

      {/* Parallax image. It only travels vertically (±5% of its own height), so it
          is oversized vertically by just enough to cover that — not 20% in every
          direction, which made the browser decode and paint far more pixels. */}
      <motion.div className="absolute inset-x-0 -inset-y-[7%] z-0" style={{ y: imgY }}>
        <FadeImage
          src={image}
          alt={title}
          fill
          className={cn(
            "object-cover group-hover:scale-110",
            colorOnHover
              ? // Zoom keeps its slow 1.2s; the colour change is quicker (0.6s). `scale` is
                // listed separately because Tailwind's scale utilities use that property.
                "[transition:transform_1.2s_ease-out,scale_1.2s_ease-out,filter_0.6s_ease-out] [@media(hover:hover)]:grayscale group-hover:grayscale-0 group-focus-within:grayscale-0"
              : "transition-transform duration-[1.2s] ease-out"
          )}
          sizes={sizes}
          loading={eager ? "eager" : undefined}
          fetchPriority={eager ? "high" : undefined}
        />
      </motion.div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-90" />

      {/* Index number */}
      <div className="absolute top-6 right-6 z-10">
        <span className="text-white/20 font-heading text-5xl font-bold">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-10">
        {/* Solid translucent fill, not backdrop-blur: a blur filter sitting on top of
            a parallax-moving photo has to be re-rendered every scroll frame. */}
        <span className="inline-block px-3 py-1 rounded-full text-[10px] font-semibold tracking-[0.15em] uppercase mb-3 bg-black/35 text-white/90 border border-white/15">
          {category}
        </span>

        <h3 className="font-heading text-2xl md:text-3xl font-bold text-white translate-y-2 transition-transform duration-500 group-hover:translate-y-0">
          {title}
        </h3>

        <div className="mt-3 overflow-hidden h-0 group-hover:h-8 transition-all duration-500">
          <div className="flex items-center gap-2 text-sm text-primary font-medium">
            {cta}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
