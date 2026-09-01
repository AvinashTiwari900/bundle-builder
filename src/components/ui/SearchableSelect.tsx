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
  customTypeLabel = 'item'
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
        <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
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
        className={`w-full min-h-[42px] px-3.5 py-2 bg-white border rounded-xl text-sm flex items-center justify-between gap-2 cursor-pointer transition-all ${disabled
            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
            : isOpen
              ? 'border-blue-500 ring-2 ring-blue-100 shadow-sm'
              : error
                ? 'border-rose-400 focus:border-rose-500'
                : 'border-slate-200 hover:border-slate-300'
          }`}
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {icon && <span className="text-slate-400 shrink-0">{icon}</span>}
          {value ? (
            <span className="text-slate-900 font-medium truncate">{value}</span>
          ) : (
            <span className="text-slate-400 truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
              title="Clear selection"
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : ''
              }`}
          />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1.5 w-full bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search input header */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/70 flex items-center gap-2">
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
              className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none py-1.5"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="p-1 text-slate-400 hover:text-slate-700"
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
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${isSelected
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                  >
                    <span className="truncate">{item}</span>
                    {isSelected && <Check size={14} className="text-blue-600 shrink-0 ml-2" />}
                  </button>
                )
              })
            ) : (
              <div className="px-3 py-3 text-center text-xs text-slate-400">
                No matching {customTypeLabel} found
              </div>
            )}

            {/* Allow adding custom item if not exact match */}
            {allowCustom && search.trim() && !exactMatch && (
              <div className="pt-1.5 mt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleAddCustom(search)}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold flex items-center gap-2 transition-colors cursor-pointer"
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

      {error && <p className="text-[11px] text-rose-600 mt-1 font-medium">{error}</p>}
      {helperText && !error && (
        <p className="text-[11px] text-slate-400 mt-1 font-medium">{helperText}</p>
      )}
    </div>
  )
}
