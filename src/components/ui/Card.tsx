import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  hoverable?: boolean
}

export default function Card({ children, className = '', hoverable = false, ...rest }: CardProps) {
  return (
    <div
      className={`bg-white dark:bg-[#072026] border border-teal-100/90 dark:border-teal-900/60 rounded-2xl p-5 shadow-sm transition-all duration-200 ${
        hoverable ? 'hover:shadow-md hover:border-teal-300 dark:hover:border-teal-700 hover:-translate-y-0.5' : ''
      } ${className}`}
      role="group"
      {...rest}
    >
      {children}
    </div>
  )
}
