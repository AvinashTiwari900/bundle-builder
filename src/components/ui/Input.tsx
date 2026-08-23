import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
}

export default function Input({ icon, className = '', ...props }: InputProps) {
  if (icon) {
    return (
      <div className="relative flex items-center w-full">
        <span className="absolute left-3.5 text-slate-400 pointer-events-none">{icon}</span>
        <input
          {...props}
          className={`w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all ${className}`}
        />
      </div>
    )
  }

  return (
    <input
      {...props}
      className={`w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all ${className}`}
    />
  )
}
