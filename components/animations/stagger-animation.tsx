"use client"

import { useEffect, useRef, ReactNode } from 'react'

interface StaggerAnimationProps {
  children: ReactNode
  delay?: number
  staggerDelay?: number
}

export default function StaggerAnimation({ 
  children, 
  delay = 0, 
  staggerDelay = 100 
}: StaggerAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadAnime = async () => {
      try {
        const { animate, stagger } = await import('animejs')
        
        if (containerRef.current) {
          // AnimaciÃ³n escalonada para mÃºltiples elementos
          animate(containerRef.current.children, {
            opacity: [0, 1],
            translateY: [40, 0],
            scale: [0.8, 1],
            duration: 600,
            delay: stagger(staggerDelay, { start: delay }),
            easing: 'easeOutBack'
          })
        }
      } catch (error) {

      }
    }

    loadAnime()
  }, [delay, staggerDelay])

  return (
    <div ref={containerRef}>
      {children}
    </div>
  )
}
