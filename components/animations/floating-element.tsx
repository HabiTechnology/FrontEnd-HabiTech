"use client"

import { useEffect, useRef, ReactNode } from 'react'

interface FloatingElementProps {
  children: ReactNode
  intensity?: number
  duration?: number
}

export default function FloatingElement({ 
  children, 
  intensity = 10, 
  duration = 3000 
}: FloatingElementProps) {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadAnime = async () => {
      try {
        const { animate } = await import('animejs')
        
        if (elementRef.current) {
          // AnimaciÃ³n flotante continua
          animate(elementRef.current, {
            translateY: [0, -intensity, 0],
            duration: duration,
            loop: true,
            easing: 'easeInOutSine',
            direction: 'alternate'
          })
        }
      } catch (error) {

      }
    }

    loadAnime()
  }, [intensity, duration])

  return (
    <div ref={elementRef}>
      {children}
    </div>
  )
}
