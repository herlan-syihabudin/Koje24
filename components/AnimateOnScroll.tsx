// AnimateOnScroll.tsx (SERVER COMPONENT)
import React from 'react'
import ClientMotion from './ClientMotion'

export type AnimationDirection = 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale'

export interface AnimateOnScrollProps {
  children: React.ReactNode
  direction?: AnimationDirection
  delay?: number
  duration?: number
  threshold?: number
  once?: boolean
  className?: string
}

export default function AnimateOnScroll({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.7,
  threshold = 0.2,
  once = true,
  className = '',
}: AnimateOnScrollProps) {
  return (
    <ClientMotion
      direction={direction}
      delay={delay}
      duration={duration}
      threshold={threshold}
      once={once}
      className={className}
    >
      {children}
    </ClientMotion>
  )
}
