import React from 'react'
import { Sparkles, Lightbulb, CheckCircle2 } from 'lucide-react'

interface MarkdownMessageProps {
  content: string
  isUser?: boolean
}

/**
 * Cleanly renders AI Copilot message content:
 * - Strips raw '#' and '##' and '###' and turns them into clean, styled section titles.
 * - Parses '**bold**' and '***bold***' into bold text without raw asterisks.
 * - Parses '`code`' into clean code pills.
 * - Formats step-by-step guides (e.g. '1. Step 1 — ...') into clean numbered items.
 * - Formats '•' and '*' bullets into styled list rows.
 * - Formats '💡 Pro Tip' callouts into frosted accent boxes.
 */
export default function MarkdownMessage({ content, isUser = false }: MarkdownMessageProps) {
  if (!content) return null

  // If message is from user, simple clean text
  if (isUser) {
    return <div className="whitespace-pre-line leading-relaxed">{content}</div>
  }

  // Parse text lines
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []

  // Helper to parse inline **bold**, *italic*, `code`, and clean up leftover markdown symbols
  const renderInlineFormatted = (text: string): React.ReactNode[] => {
    if (!text) return []

    // Tokenize by `code` first, then **bold**
    const parts: React.ReactNode[] = []
    
    // Regex for inline code: `code`
    const codeRegex = /`([^`]+)`/g
    let lastIdx = 0
    let match: RegExpExecArray | null

    const processBoldAndItalic = (subText: string, keyPrefix: string): React.ReactNode[] => {
      const subParts: React.ReactNode[] = []
      // Match ***bold-italic*** or **bold** or *italic*
      const boldRegex = /(\*\*\*([^*]+)\*\*\*|\*\*([^*]+)\*\*|\*([^*]+)\*)/g
      let subLastIdx = 0
      let subMatch: RegExpExecArray | null

      while ((subMatch = boldRegex.exec(subText)) !== null) {
        if (subMatch.index > subLastIdx) {
          subParts.push(subText.substring(subLastIdx, subMatch.index))
        }

        const boldContent = subMatch[2] || subMatch[3] || subMatch[4]
        subParts.push(
          <strong
            key={`${keyPrefix}-bold-${subMatch.index}`}
            className="font-extrabold text-slate-900 dark:text-white"
          >
            {boldContent}
          </strong>
        )
        subLastIdx = subMatch.index + subMatch[0].length
      }

      if (subLastIdx < subText.length) {
        subParts.push(subText.substring(subLastIdx))
      }

      return subParts
    }

    while ((match = codeRegex.exec(text)) !== null) {
      if (match.index > lastIdx) {
        const textChunk = text.substring(lastIdx, match.index)
        parts.push(...processBoldAndItalic(textChunk, `txt-${lastIdx}`))
      }

      const codeContent = match[1]
      parts.push(
        <code
          key={`code-${match.index}`}
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 text-blue-700 dark:text-blue-300 font-mono text-[11px] font-semibold"
        >
          {codeContent}
        </code>
      )
      lastIdx = match.index + match[0].length
    }

    if (lastIdx < text.length) {
      const textChunk = text.substring(lastIdx)
      parts.push(...processBoldAndItalic(textChunk, `txt-${lastIdx}`))
    }

    return parts
  }

  let lineIdx = 0
  while (lineIdx < lines.length) {
    const rawLine = lines[lineIdx]
    const trimmed = rawLine.trim()

    // 1. Empty lines
    if (!trimmed) {
      elements.push(<div key={`space-${lineIdx}`} className="h-1.5" />)
      lineIdx++
      continue
    }

    // 2. Headings (### Title, ## Title, # Title)
    if (trimmed.startsWith('#')) {
      const headingClean = trimmed.replace(/^#+\s*/, '')
      elements.push(
        <h4
          key={`head-${lineIdx}`}
          className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white mt-1 mb-1.5 flex items-center gap-1.5"
        >
          <Sparkles size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
          <span>{headingClean}</span>
        </h4>
      )
      lineIdx++
      continue
    }

    // 3. Pro Tips / Callout Boxes (💡 **Pro Tip**: ... or > ...)
    if (trimmed.startsWith('💡') || trimmed.startsWith('>') || trimmed.toLowerCase().includes('pro tip:')) {
      const tipText = trimmed.replace(/^[💡>]\s*/, '').replace(/^\*\*Pro Tip\*\*:\s*/i, '').replace(/^Pro Tip:\s*/i, '')
      elements.push(
        <div
          key={`tip-${lineIdx}`}
          className="mt-2.5 mb-1.5 p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5 shadow-xs"
        >
          <Lightbulb size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-extrabold text-amber-950 dark:text-amber-300 mr-1">Pro Tip:</span>
            <span>{renderInlineFormatted(tipText)}</span>
          </div>
        </div>
      )
      lineIdx++
      continue
    }

    // 4. Step indicators (e.g. 1. **Step 1 — Title**, 2. Step 2...)
    const stepMatch = trimmed.match(/^(\d+)\.\s+(.*)$/)
    if (stepMatch) {
      const stepNum = stepMatch[1]
      let stepBody = stepMatch[2]

      elements.push(
        <div key={`step-${lineIdx}`} className="flex items-start gap-2.5 my-1.5">
          <span className="w-5 h-5 rounded-full bg-blue-600 dark:bg-blue-500 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
            {stepNum}
          </span>
          <div className="flex-1 text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed">
            {renderInlineFormatted(stepBody)}
          </div>
        </div>
      )
      lineIdx++
      continue
    }

    // 5. Bullet Lists (• bullet, * bullet, - bullet)
    const bulletMatch = trimmed.match(/^[•*-]\s+(.*)$/)
    if (bulletMatch) {
      const bulletBody = bulletMatch[1]
      elements.push(
        <div key={`bullet-${lineIdx}`} className="flex items-start gap-2 my-1 pl-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 shrink-0 mt-2" />
          <div className="flex-1 text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed">
            {renderInlineFormatted(bulletBody)}
          </div>
        </div>
      )
      lineIdx++
      continue
    }

    // 6. Section labels (e.g. **Steps:**, **What happens next?**, **Popular Guides & Workflows:**)
    if (
      trimmed.startsWith('**') &&
      trimmed.endsWith('**') &&
      trimmed.length < 50
    ) {
      const sectionClean = trimmed.replace(/^\*\*|\*\*$/g, '')
      elements.push(
        <div
          key={`sec-${lineIdx}`}
          className="font-extrabold text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 mt-2 mb-1"
        >
          {sectionClean}
        </div>
      )
      lineIdx++
      continue
    }

    // 7. Standard Paragraph
    elements.push(
      <p
        key={`p-${lineIdx}`}
        className="text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed my-1"
      >
        {renderInlineFormatted(trimmed)}
      </p>
    )
    lineIdx++
  }

  return <div className="space-y-1">{elements}</div>
}
