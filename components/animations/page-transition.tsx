"use client"

import { useEffect, useRef, ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
  delay?: number
}

export default function PageTransition({ children, delay = 0 }: PageTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadAnime = async () => {
      try {
        const { animate } = await import('animejs')
        
        if (containerRef.current) {
          // AnimaciÃ³n de entrada de pÃ¡gina
          animate(containerRef.current, {
            opacity: [0, 1],
            translateY: [30, 0],
            duration: 800,
            delay: delay,
            easing: 'easeOutExpo'
          })
        }
      } catch (error) {

      }
    }

    loadAnime()
  }, [delay])

  return (
    <div ref={containerRef} style={{ opacity: 0 }}>
      {children}
    </div>
  )
}

export { PageTransition }
