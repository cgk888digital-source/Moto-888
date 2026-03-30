'use client'
import { useRef, useTransition } from 'react'
import { createPost } from '../actions'

export function PostForm() {
  const ref = useRef<HTMLFormElement>(null)
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData(ref.current!)
    startTransition(async () => {
      await createPost(fd)
      ref.current?.reset()
    })
  }

  return (
    <form ref={ref} onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-4 space-y-3">
      <textarea
        name="contenido"
        placeholder="¿Qué está pasando en tu rodada? Comparte con la comunidad..."
        rows={3}
        required
        className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-base placeholder-text-muted resize-none focus:outline-none focus:border-secondary font-body"
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="bg-accent text-bg px-5 py-2 rounded-lg text-sm font-body font-semibold tracking-wide hover:bg-amber-400 transition-colors disabled:opacity-50"
        >
          {pending ? 'Publicando...' : 'Publicar'}
        </button>
      </div>
    </form>
  )
}
