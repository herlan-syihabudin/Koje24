"use client"
import { useEffect } from "react"

export default function AnimateOnScroll() {
  // ✨ Efek muncul saat di-scroll
  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>(".animate-on-scroll")

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement
          if (entry.isIntersecting) {
            el.classList.add("show")
            observer.unobserve(el) // 🔹 opsional: biar gak terus dipantau setelah muncul
          }
        })
      },
      { threshold: 0.15 }
    )

    items.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // 🎥 Parallax background ringan
  useEffect(() => {
    const handleScroll = () => {
      const parallax = document.querySelectorAll<HTMLElement>(".parallax-bg")
      parallax.forEach((el) => {
        const speed = 0.15
        const yOffset = window.scrollY * speed
        el.style.transform = `translateY(${yOffset}px)`
      })
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return null
}
