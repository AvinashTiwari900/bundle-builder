import React from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  icon?: React.ReactNode
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon,
  ...rest
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5'
  }

  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-gradient-to-r from-[#062329] to-[#0d7882] text-white shadow-md shadow-teal-950/20 hover:opacity-95 hover:shadow-lg focus:ring-teal-400 active:scale-[0.98]',
    secondary:
      'bg-teal-50 dark:bg-teal-950/50 text-teal-900 dark:text-teal-200 border border-teal-200/60 dark:border-teal-800/40 hover:bg-teal-100/70 focus:ring-teal-300 active:scale-[0.98]',
    outline:
      'bg-white dark:bg-[#072026] border border-teal-200/80 dark:border-teal-800 text-teal-900 dark:text-teal-100 hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:border-teal-300 focus:ring-teal-300 active:scale-[0.98]',
    ghost:
      'bg-transparent text-teal-800 dark:text-teal-200 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-950 focus:ring-teal-200',
    danger:
      'bg-rose-500 text-white shadow-md shadow-rose-500/20 hover:bg-rose-600 focus:ring-rose-300 active:scale-[0.98]',
    success:
      'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 focus:ring-emerald-300 active:scale-[0.98]'
  }

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...rest}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  )
}
