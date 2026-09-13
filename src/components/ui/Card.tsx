import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  hoverable?: boolean
}

export default function Card({ children, className = '', hoverable = false, ...rest }: CardProps) {
  return (
    <div
      className={`bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm transition-all duration-200 ${
        hoverable ? 'hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5' : ''
      } ${className}`}
      role="group"
      {...rest}
    >
      {children}
    </div>
  )
}
