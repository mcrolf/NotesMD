import { useEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MARKDOWN_HINTS, type MarkdownHint } from '@/lib/markdownHints'

type MarkdownHintsPosition = {
  left: number
  top: number
  maxHeight: number
  width: number
}

type MarkdownHintsButtonProps = {
  textareaRef: RefObject<HTMLTextAreaElement | null>
  value: string
  onChange: (nextValue: string) => void
  disabled?: boolean
}

const MARKDOWN_HINTS_WIDTH = 288
const MARKDOWN_HINTS_GAP = 8
const VIEWPORT_PADDING = 16

function getMarkdownHintsPosition(trigger: HTMLElement): MarkdownHintsPosition {
  const rect = trigger.getBoundingClientRect()
  const width = Math.min(MARKDOWN_HINTS_WIDTH, window.innerWidth - VIEWPORT_PADDING * 2)
  const maxLeft = Math.max(VIEWPORT_PADDING, window.innerWidth - width - VIEWPORT_PADDING)
  const left = Math.min(Math.max(VIEWPORT_PADDING, rect.right - width), maxLeft)
  const top = rect.bottom + MARKDOWN_HINTS_GAP

  return {
    left,
    top,
    maxHeight: Math.max(180, window.innerHeight - top - VIEWPORT_PADDING),
    width,
  }
}

export function MarkdownHintsButton({
  textareaRef,
  value,
  onChange,
  disabled = false,
}: MarkdownHintsButtonProps) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<MarkdownHintsPosition | null>(null)

  useEffect(() => {
    if (!open) return

    function updatePosition() {
      if (!triggerRef.current) return
      setPosition(getMarkdownHintsPosition(triggerRef.current))
    }

    function handlePointerDown(ev: PointerEvent) {
      const target = ev.target
      if (!(target instanceof Node)) return
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return
      setOpen(false)
    }

    function handleKeyDown(ev: KeyboardEvent) {
      if (ev.key === 'Escape') setOpen(false)
    }

    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  function insertMarkdownHint(hint: MarkdownHint) {
    const textarea = textareaRef.current
    const selectionStart = textarea?.selectionStart ?? value.length
    const selectionEnd = textarea?.selectionEnd ?? value.length
    const beforeSelection = value.slice(0, selectionStart)
    const afterSelection = value.slice(selectionEnd)
    const leadingBreak = hint.block && beforeSelection.length > 0 && !beforeSelection.endsWith('\n') ? '\n' : ''
    const trailingBreak = hint.block && afterSelection.length > 0 && !afterSelection.startsWith('\n') ? '\n' : ''
    const insertedText = `${leadingBreak}${hint.insertText}${trailingBreak}`
    const nextValue = `${beforeSelection}${insertedText}${afterSelection}`
    const nextSelectionStart = selectionStart + leadingBreak.length + hint.selectionStart
    const nextSelectionEnd = selectionStart + leadingBreak.length + hint.selectionEnd

    onChange(nextValue)
    setOpen(false)

    requestAnimationFrame(() => {
      textareaRef.current?.focus()
      textareaRef.current?.setSelectionRange(nextSelectionStart, nextSelectionEnd)
    })
  }

  function toggleOpen() {
    if (open) {
      setOpen(false)
      return
    }

    if (triggerRef.current) {
      setPosition(getMarkdownHintsPosition(triggerRef.current))
    }
    setOpen(true)
  }

  const dropdown =
    open && position
      ? createPortal(
          <div
            ref={menuRef}
            id="markdown-hints"
            className="markdown-hints-menu"
            style={{
              left: position.left,
              top: position.top,
              width: position.width,
              maxHeight: position.maxHeight,
            }}
          >
            <div className="markdown-hints-header">
              <p className="markdown-hints-title">Click to insert</p>
            </div>
            <div className="markdown-hints-list">
              {MARKDOWN_HINTS.map((hint) => (
                <button
                  key={hint.label}
                  type="button"
                  className="markdown-hints-item"
                  onClick={() => insertMarkdownHint(hint)}
                >
                  <span className="markdown-hints-token">{hint.description}</span>
                  <span className="markdown-hints-label">{hint.label}</span>
                </button>
              ))}
            </div>
          </div>,
          document.body
        )
      : null

  return (
    <div className="markdown-hints-anchor">
      <Button
        ref={triggerRef}
        type="button"
        variant="outline"
        size="sm"
        className="button-with-tight-icon"
        aria-expanded={open}
        aria-controls="markdown-hints"
        disabled={disabled}
        onClick={toggleOpen}
      >
        <Lightbulb className="icon-xs" aria-hidden />
        Markdown hints
        <ChevronDown
          className={`markdown-hints-chevron ${open ? 'markdown-hints-chevron-open' : ''}`}
          aria-hidden
        />
      </Button>
      {dropdown}
    </div>
  )
}
