// `sizes` strings for next/image, matched to the real rendered width of each
// layout. The browser uses them to pick the smallest generated variant that
// still looks sharp — a wrong `sizes` (e.g. "50vw" on a 3-column grid) makes it
// download several times more pixels than are ever displayed.
//
// All of these assume the shared `page-shell` width (80rem max, 1.5rem gutters,
// 2rem from the lg breakpoint) defined in globals.css.

export const IMAGE_SIZES = {
  /** Full-bleed backgrounds and heroes. */
  full: "100vw",

  /** Portfolio / featured tiles: 1 column -> 2 (sm) -> 3 (lg), 1.25rem gaps. */
  grid:
    "(min-width: 1280px) 392px, (min-width: 1024px) calc((100vw - 104px) / 3), (min-width: 640px) calc((100vw - 68px) / 2), calc(100vw - 48px)",

  /** A tile that spans 2 of the 3 grid columns on desktop (full width below lg) — the big feature tile. */
  gridDouble:
    "(min-width: 1280px) 804px, (min-width: 1024px) calc((200vw - 208px) / 3 + 20px), calc(100vw - 48px)",

  /** A single-column tile that stretches to full width below lg (the wide closing tile of the home grid). */
  gridWide:
    "(min-width: 1280px) 392px, (min-width: 1024px) calc((100vw - 104px) / 3), calc(100vw - 48px)",

  /** Masonry photos on a shoot page: 1 column -> 2 (md) -> 3 (lg), 1.5rem gaps. */
  gallery:
    "(min-width: 1280px) 390px, (min-width: 1024px) calc((100vw - 112px) / 3), (min-width: 768px) calc((100vw - 72px) / 2), calc(100vw - 48px)",

  /** One half of a two-column section with a 6rem gap (home teaser / why-us). */
  half:
    "(min-width: 1280px) 560px, (min-width: 1024px) calc((100vw - 160px) / 2), calc(100vw - 48px)",

  /** One half of a two-column section with a 4rem gap (about page intro). */
  halfTight:
    "(min-width: 1280px) 576px, (min-width: 1024px) calc((100vw - 128px) / 2), calc(100vw - 48px)",

  /** Testimonial photo (max-w-6xl split layout). */
  testimonial:
    "(min-width: 1280px) 544px, (min-width: 1024px) calc((100vw - 128px) / 2), calc(100vw - 48px)",

  /** Vertical film posters: 2 columns -> 3 (md), inside a max-w-4xl block. */
  poster:
    "(min-width: 944px) 280px, (min-width: 768px) calc((100vw - 104px) / 3), calc((100vw - 68px) / 2)",
} as const
