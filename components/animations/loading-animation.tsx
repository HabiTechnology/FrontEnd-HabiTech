"use client"

import { useEffect, useRef } from 'react'
import anime from 'animejs/lib/anime.es.js'

export default function LoadingAnimation() {
  const loaderRef = useRef<HTMLDivElement>(null)
  const dotsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (loaderRef.current) {
      // AnimaciÃ³n del spinner principal
      anime({
        targets: loaderRef.current,
        rotate: '1turn',
        duration: 1500,
        loop: true,
        easing: 'linear'
      })
    }

    if (dotsRef.current) {
      // AnimaciÃ³n de los puntos
      anime({
        targets: dotsRef.current.children,
        scale: [1, 1.3, 1],
        opacity: [0.5, 1, 0.5],
        duration: 800,
        delay: anime.stagger(200),
        loop: true,
        easing: 'easeInOutQuad'
      })
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        {/* Spinner principal */}
        <div className="relative mb-8">
          <div 
            ref={loaderRef}
            className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full mx-auto"
          />
          <div className="absolute inset-0 h-12 w-12 border-2 border-primary/10 rounded-full mx-auto animate-ping" />
        </div>
        
        {/* Texto con animaciÃ³n */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Cargando HabiTech
          </h2>
          <p className="text-muted-foreground">Preparando tu experiencia...</p>
        </div>

        {/* Puntos animados */}
        <div ref={dotsRef} className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          <div className="w-2 h-2 bg-primary rounded-full"></div>
        </div>
      </div>
    </div>
  )
}
