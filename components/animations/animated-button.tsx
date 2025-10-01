"use client"

import { useRef, ReactNode } from 'react'

interface AnimatedButtonProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  variant?: 'default' | 'hover' | 'press'
}

export default function AnimatedButton({ 
  children, 
  onClick, 
  className = '',
  variant = 'default'
}: AnimatedButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null)

  const handleClick = async () => {
    if (buttonRef.current) {
      try {
        const { animate } = await import('animejs')
        animate(buttonRef.current, {
          scale: [1, 0.95, 1.05, 1],
          duration: 400,
          easing: 'easeOutElastic(1, .8)'
        })
      } catch (error) {

      }
    }
    onClick?.()
  }

  const handleMouseEnter = async () => {
    if (buttonRef.current && variant === 'hover') {
      try {
        const { animate } = await import('animejs')
        animate(buttonRef.current, {
          scale: 1.05,
          translateY: -2,
          duration: 300,
          easing: 'easeOutQuad'
        })
      } catch (error) {

      }
    }
  }

  const handleMouseLeave = async () => {
    if (buttonRef.current && variant === 'hover') {
      try {
        const { animate } = await import('animejs')
        animate(buttonRef.current, {
          scale: 1,
          translateY: 0,
          duration: 300,
          easing: 'easeOutQuad'
        })
      } catch (error) {

      }
    }
  }

  return (
    <div
      ref={buttonRef}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`cursor-pointer ${className}`}
    >
      {children}
    </div>
  )
}
