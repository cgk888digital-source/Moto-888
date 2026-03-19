'use client'

import { useRef, useState } from 'react'

interface Props {
  onSend: (text: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    // Reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value)
    // Auto-grow
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 p-3 bg-surface border-t border-border">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="Describe el problema de tu moto..."
        disabled={disabled}
        rows={1}
        className="flex-1 bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm font-body text-text-base placeholder:text-text-muted focus:outline-none focus:border-accent resize-none transition-colors disabled:opacity-50"
        style={{ minHeight: '48px' }}
      />
      <button
        type="submit"
        disabled={!value.trim() || disabled}
        className="shrink-0 w-11 h-11 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
      >
        {disabled ? (
          <span className="animate-spin inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
        ) : (
          <span className="text-black font-bold text-lg leading-none">↑</span>
        )}
      </button>
    </form>
  )
}
