import React, { useState, useEffect, useRef } from 'react'
import { Check, ChevronDown, Plus, Search, X } from 'lucide-react'

interface SearchableSelectProps {
  label?: string
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  icon?: React.ReactNode
  allowCustom?: boolean
  onAddCustom?: (value: string) => void
  disabled?: boolean
  required?: boolean
  error?: string
  helperText?: string
  customTypeLabel?: string
  theme?: 'light' | 'dark'
}

export default function SearchableSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select or search...',
  icon,
  allowCustom = true,
  onAddCustom,
  disabled = false,
  required = false,
  error,
  helperText,
  customTypeLabel = 'item',
  theme = 'light'
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const isDark = theme === 'dark'

  // Filter options based on search query
  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  )

  const exactMatch = options.some(
    (opt) => opt.toLowerCase() === search.trim().toLowerCase()
  )

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (item: string) => {
    onChange(item)
    setIsOpen(false)
    setSearch('')
  }

  const handleAddCustom = (customVal: string) => {
    const trimmed = customVal.trim()
    if (!trimmed) return
    if (onAddCustom) onAddCustom(trimmed)
    onChange(trimmed)
    setIsOpen(false)
    setSearch('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
    setSearch('')
  }

  return (
    <div className="w-full relative" ref={containerRef}>
      {label && (
        <label
          className={`block text-xs font-bold mb-1 uppercase tracking-wider ${
            isDark ? 'text-slate-300' : 'text-slate-700'
          }`}
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Main trigger box */}
      <div
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen)
            setTimeout(() => inputRef.current?.focus(), 50)
          }
        }}
        className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-between gap-2 cursor-pointer transition-all ${
          disabled
            ? isDark
              ? 'bg-slate-900/40 border border-slate-800 text-slate-600 cursor-not-allowed'
              : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
            : isDark
            ? isOpen
              ? 'bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/20 text-white shadow-lg'
              : error
              ? 'bg-slate-900/80 border-rose-500 text-white'
              : 'bg-slate-900/80 border border-slate-700/70 hover:border-slate-600 text-white'
            : isOpen
            ? 'bg-white border-blue-500 ring-2 ring-blue-100 shadow-sm text-slate-900'
            : error
            ? 'bg-white border-rose-400 text-slate-900'
            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900'
        }`}
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {icon && (
            <span className={isDark ? 'text-slate-400 shrink-0' : 'text-slate-400 shrink-0'}>
              {icon}
            </span>
          )}
          {value ? (
            <span className={`font-semibold truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              {value}
            </span>
          ) : (
            <span className="text-slate-500 truncate font-normal">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className={`p-1 rounded-md transition-colors ${
                isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Clear selection"
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${
              isDark ? 'text-slate-400' : 'text-slate-400'
            } ${isOpen ? 'rotate-180 text-indigo-400' : ''}`}
          />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div
          className={`absolute z-50 mt-1.5 w-full rounded-2xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
            isDark
              ? 'bg-slate-900 border-slate-700/80 shadow-indigo-950/50'
              : 'bg-white border-slate-200 shadow-2xl'
          }`}
        >
          {/* Search input header */}
          <div
            className={`p-2.5 border-b flex items-center gap-2 ${
              isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-slate-50/70'
            }`}
          >
            <Search size={15} className="text-slate-400 ml-1.5 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  if (filtered.length > 0) {
                    handleSelect(filtered[0])
                  } else if (allowCustom && search.trim()) {
                    handleAddCustom(search)
                  }
                } else if (e.key === 'Escape') {
                  setIsOpen(false)
                }
              }}
              placeholder={`Search or type custom ${customTypeLabel}...`}
              className={`w-full bg-transparent text-xs placeholder-slate-500 focus:outline-none py-1 ${
                isDark ? 'text-white' : 'text-slate-800'
              }`}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Options list */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
            {filtered.length > 0 ? (
              filtered.map((item) => {
                const isSelected = item === value
                return (
                  <button
                    type="button"
                    key={item}
                    onClick={() => handleSelect(item)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      isSelected
                        ? isDark
                          ? 'bg-indigo-600/30 text-indigo-300 font-bold border border-indigo-500/30'
                          : 'bg-blue-50 text-blue-700 font-bold'
                        : isDark
                        ? 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className="truncate">{item}</span>
                    {isSelected && (
                      <Check
                        size={14}
                        className={`shrink-0 ml-2 ${isDark ? 'text-indigo-400' : 'text-blue-600'}`}
                      />
                    )}
                  </button>
                )
              })
            ) : (
              <div className="px-3 py-3 text-center text-xs text-slate-500">
                No matching {customTypeLabel} found
              </div>
            )}

            {/* Allow adding custom item if not exact match */}
            {allowCustom && search.trim() && !exactMatch && (
              <div className={`pt-1.5 mt-1 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <button
                  type="button"
                  onClick={() => handleAddCustom(search)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-indigo-950/60 hover:bg-indigo-900/70 text-indigo-300 border border-indigo-800/40'
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                  }`}
                >
                  <Plus size={14} className="shrink-0" />
                  <span className="truncate">
                    Use custom: <span className="underline font-extrabold">"{search.trim()}"</span>
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-[11px] text-rose-500 mt-1 font-medium">{error}</p>}
      {helperText && !error && (
        <p className={`text-[11px] mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
          {helperText}
        </p>
      )}
    </div>
  )
}
