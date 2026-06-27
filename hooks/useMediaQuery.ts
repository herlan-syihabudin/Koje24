"use client"

import { useEffect, useState } from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const media = window.matchMedia(query)

    const updateMatch = () => setMatches(media.matches)

    // Set initial
    updateMatch()

    if (media.addEventListener) {
      media.addEventListener("change", updateMatch)
    } else {
      media.addListener(updateMatch) // Safari fallback
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", updateMatch)
      } else {
        media.removeListener(updateMatch)
      }
    }
  }, [query])

  return matches
}
