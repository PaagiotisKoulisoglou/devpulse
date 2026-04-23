'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatInterfaceProps {
  initialMessages: Message[]
}

const STARTER_QUESTIONS = [
  'What day am I most productive?',
  'Which repo needs the most attention?',
  'How can I build a better coding streak?',
]

export default function ChatInterface({ initialMessages }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    const text = input.trim()
    if (!text || streaming) return

    const userMessage: Message = { role: 'user', content: text }
    const history = [...messages, userMessage]

    setMessages(history)
    setInput('')
    setStreaming(true)

    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })

      if (!res.ok || !res.body) throw new Error('No response')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        fullResponse += chunk

        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: 'assistant',
            content: fullResponse,
          }
          return updated
        })
      }

      await Promise.all([
        fetch('/api/chat/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'user', content: text }),
        }),
        fetch('/api/chat/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'assistant', content: fullResponse }),
        }),
      ])
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'Something went wrong. Please try again.',
        }
        return updated
      })
    } finally {
      setStreaming(false)
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="flex h-[520px] flex-col rounded-xl border border-border bg-background">

      <div className="border-b border-border px-6 py-4">
        <h2 className="font-semibold text-foreground">Chat with DevPulse AI</h2>
        <p className="mt-0.5 text-xs text-muted">
          Ask anything about your coding habits
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-4">

        {messages.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <p className="text-sm text-muted">Ask me about your code</p>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              {STARTER_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="rounded-lg border border-border px-3 py-2 text-left text-xs text-indigo-400 hover:border-border hover:text-indigo-300 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'rounded-br-sm bg-indigo-600 text-white'
                  : 'rounded-bl-sm bg-foreground/10 text-foreground'
              }`}
            >
              {msg.content || (
                <span className="inline-block h-4 w-0.5 animate-pulse bg-muted" />
              )}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border px-4 py-4">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask about your coding habits..."
            rows={1}
            disabled={streaming}
            className="flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-indigo-500 focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={send}
            disabled={!input.trim() || streaming}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
          >
            {streaming ? '...' : 'Send'}
          </button>
        </div>
        <p className="mt-2 text-xs text-muted">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}