"use client"

import * as React from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ParallaxImageCard } from "@/components/parallax-image-card"
import { portfolioShoots } from "@/lib/portfolio-data"

const portfolioCategories = ["All", "Wedding", "Pre-Wedding", "Haldi", "Ring-Ceremony", "Portraits"]

/** Reads the active category from the URL. Must sit inside <Suspense>. */
export function PortfolioContent() {
  const searchParams = useSearchParams()

  // Read category from URL, default to "All"
  return <PortfolioView category={searchParams.get("category")?.toLowerCase() || "all"} />
}

/**
 * The filter pills + grid for a given category. Split from PortfolioContent so
 * the server can also render it as the Suspense fallback: `useSearchParams`
 * makes PortfolioContent client-only, and without a real fallback the HTML
 * would contain just "Loading…" — no <img> tags, so no photo could start
 * downloading until the JavaScript bundle had loaded and run.
 */
export function PortfolioView({ category: currentCategory }: { category: string }) {
  // Filter the shoots
  const filteredShoots = portfolioShoots.filter(shoot => {
    if (currentCategory === "all") return true
    return shoot.category.toLowerCase() === currentCategory
  })

  return (
    <>
      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-3 px-6 mb-16">
        {portfolioCategories.map((cat) => {
          const isActive = currentCategory === cat.toLowerCase()
          return (
            <Link
              key={cat}
              href={cat.toLowerCase() === "all" ? "/portfolio" : `/portfolio?category=${cat.toLowerCase()}`}
              className={`relative px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                isActive
                  ? "text-white"
                  : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="portfolio-category-active"
                  className="absolute inset-0 rounded-full gold-shimmer -z-10 shadow-md shadow-primary/20"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              {cat}
            </Link>
          )
        })}
      </div>

      {/* Grid — equal tiles, 3 across on desktop / 2 on tablet / 1 on phones.
          Wrapped flex rows (rather than a CSS grid) so a short last row is
          centered under the full rows instead of leaving a hole on one side. */}
      <section className="page-shell pb-32 min-h-[500px]">
        {filteredShoots.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-4 md:gap-5">
            {filteredShoots.map((shoot, i) => (
              <div
                key={shoot.slug}
                className="w-full sm:w-[calc((100%-1rem)/2)] md:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]"
              >
                <ParallaxImageCard
                  href={`/portfolio/${shoot.slug}`}
                  image={shoot.coverImage}
                  title={shoot.title}
                  category={shoot.category}
                  index={i}
                  className="aspect-[4/5] w-full"
                  eager={i < 3}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-20">
            No projects found for {currentCategory}.
          </div>
        )}
      </section>
    </>
  )
}
