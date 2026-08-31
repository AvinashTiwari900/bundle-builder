import React from 'react'

/**
 * Parses inline Markdown: **bold**, *italic*, `code`, and [link](url)
 */
export function parseInlineMarkdown(text: string): React.ReactNode[] {
  if (!text) return []

  // Regex to match **bold**, *italic*, `code`, and [link](url)
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g
  const parts = text.split(regex)

  return parts
    .map((part, index) => {
      if (!part) return null

      // Bold **...**
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return (
          <strong key={index} className="font-extrabold text-slate-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        )
      }

      // Italic *...*
      if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
        return (
          <em key={index} className="italic text-slate-800 dark:text-slate-200 font-medium">
            {part.slice(1, -1)}
          </em>
        )
      }

      // Inline code `...`
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        return (
          <code
            key={index}
            className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-mono text-[11px] font-semibold border border-slate-200/60 dark:border-slate-700"
          >
            {part.slice(1, -1)}
          </code>
        )
      }

      // Link [label](url)
      const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/)
      if (linkMatch) {
        return (
          <a
            key={index}
            href={linkMatch[2]}
            target="_blank"
            rel="noreferrer"
            className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline inline-flex items-center gap-0.5"
          >
            <span>{linkMatch[1]}</span>
          </a>
        )
      }

      return <span key={index}>{part}</span>
    })
    .filter(Boolean) as React.ReactNode[]
}

/**
 * FormattedContent component renders rich Markdown content (headings ###, bold **, bullet lists, numbered lists, code, links)
 * with clean styling and without exposing raw markdown markup.
 */
export default function FormattedContent({
  content,
  className = ''
}: {
  content?: string
  className?: string
}) {
  if (!content) return null

  const lines = content.split('\n')
  const elements: React.ReactNode[] = []

  let currentList: { type: 'ul' | 'ol'; items: React.ReactNode[] } | null = null

  const flushList = () => {
    if (currentList) {
      if (currentList.type === 'ul') {
        elements.push(
          <ul
            key={`list-${elements.length}`}
            className="space-y-1.5 my-2 ml-4 list-disc text-slate-700 dark:text-slate-300"
          >
            {currentList.items.map((item, i) => (
              <li key={i} className="leading-relaxed pl-1">
                {item}
              </li>
            ))}
          </ul>
        )
      } else {
        elements.push(
          <ol
            key={`list-${elements.length}`}
            className="space-y-1.5 my-2 ml-1 text-slate-700 dark:text-slate-300"
          >
            {currentList.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 leading-relaxed">
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400 shrink-0 text-xs mt-0.5">
                  {i + 1}.
                </span>
                <span className="flex-1">{item}</span>
              </li>
            ))}
          </ol>
        )
      }
      currentList = null
    }
  }

  lines.forEach((line, idx) => {
    const trimmed = line.trim()

    if (!trimmed) {
      flushList()
      return
    }

    // Header 3: ### ...
    if (trimmed.startsWith('### ')) {
      flushList()
      const headerText = trimmed.replace(/^###\s+/, '')
      elements.push(
        <h4
          key={`h3-${idx}`}
          className="text-xs sm:text-sm font-black text-slate-900 dark:text-white pt-2.5 pb-0.5 tracking-tight flex items-center gap-1.5"
        >
          {parseInlineMarkdown(headerText)}
        </h4>
      )
      return
    }

    // Header 2: ## ...
    if (trimmed.startsWith('## ')) {
      flushList()
      const headerText = trimmed.replace(/^##\s+/, '')
      elements.push(
        <h3
          key={`h2-${idx}`}
          className="text-sm sm:text-base font-black text-slate-900 dark:text-white pt-3 pb-1 tracking-tight"
        >
          {parseInlineMarkdown(headerText)}
        </h3>
      )
      return
    }

    // Header 1: # ...
    if (trimmed.startsWith('# ')) {
      flushList()
      const headerText = trimmed.replace(/^#\s+/, '')
      elements.push(
        <h2
          key={`h1-${idx}`}
          className="text-base sm:text-lg font-black text-slate-900 dark:text-white pt-3.5 pb-1 tracking-tight"
        >
          {parseInlineMarkdown(headerText)}
        </h2>
      )
      return
    }

    // Numbered list: 1. ... or 2. ...
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/)
    if (numMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList()
        currentList = { type: 'ol', items: [] }
      }
      currentList.items.push(parseInlineMarkdown(numMatch[2]))
      return
    }

    // Bullet list: - ... or * ... or • ...
    const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/)
    if (bulletMatch) {
      if (!currentList || currentList.type !== 'ul') {
        flushList()
        currentList = { type: 'ul', items: [] }
      }
      currentList.items.push(parseInlineMarkdown(bulletMatch[1]))
      return
    }

    // Regular paragraph line
    flushList()
    elements.push(
      <p key={`p-${idx}`} className="leading-relaxed font-normal text-slate-700 dark:text-slate-300">
        {parseInlineMarkdown(trimmed)}
      </p>
    )
  })

  flushList()

  return (
    <div className={`space-y-1.5 text-xs sm:text-sm leading-relaxed ${className}`}>
      {elements}
    </div>
  )
}
