'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatInterfaceProps {
  initialMessages: Message[]
  initialSessionId: string | null
  initialExpiresAt: string | null
}

const MAX_MESSAGES = 20

const STARTER_QUESTIONS = [
  'What day am I most productive?',
  'Which repo needs the most attention?',
  'How can I build a better coding streak?',
]

function generateSessionId(): string {
  return crypto.randomUUID()
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function ChatInterface({
  initialMessages,
  initialSessionId,
  initialExpiresAt,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [sessionId, setSessionId] = useState<string>(
    initialSessionId ?? generateSessionId()
  )
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [limitReached, setLimitReached] = useState(
    initialMessages.length >= MAX_MESSAGES
  )
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [clearing, setClearing] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (initialExpiresAt && initialMessages.length > 0) {
      const secondsLeft = Math.floor(
        (new Date(initialExpiresAt).getTime() - Date.now()) / 1000
      )
      if (secondsLeft > 0) setTimeLeft(secondsLeft)
    }
  }, [initialExpiresAt, initialMessages.length])

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          setMessages([])
          setSessionId(generateSessionId())
          setLimitReached(false)
          return null
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [timeLeft])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function resetTimer() {
    if (timerRef.current) clearInterval(timerRef.current)
    setTimeLeft(30 * 60)
  }

  async function startNewChat() {
    if (clearing) return
    setClearing(true)

    try {
      await fetch('/api/chat/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
    } catch (err) {
      console.error('Failed to clear session:', err)
    }

    setMessages([])
    setSessionId(generateSessionId())
    setLimitReached(false)
    setInput('')
    if (timerRef.current) clearInterval(timerRef.current)
    setTimeLeft(null)
    setClearing(false)
  }

  async function send() {
    const text = input.trim()
    if (!text || streaming || limitReached) return

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

      const [userSave, assistantSave] = await Promise.all([
        fetch('/api/chat/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: 'user',
            content: text,
            sessionId,
          }),
        }),
        fetch('/api/chat/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: 'assistant',
            content: fullResponse,
            sessionId,
          }),
        }),
      ])

      const saveData = await assistantSave.json()
      if (saveData.limitReached) {
        setLimitReached(true)
      }

      resetTimer()

      if (history.length + 1 >= MAX_MESSAGES) {
        setLimitReached(true)
      }

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

  const messagesLeft = MAX_MESSAGES - messages.length

  return (
    <div className="flex h-[520px] flex-col rounded-xl border border-border bg-background">

      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h2 className="font-semibold text-foreground">Chat with DevPulse AI</h2>
          <p className="mt-0.5 text-xs text-muted">
            Quick coaching sessions · auto-clears after 30min
          </p>
        </div>

        <div className="flex items-center gap-3">
          {timeLeft !== null && timeLeft > 0 && (
            <div className={`text-xs font-mono tabular-nums ${
              timeLeft < 300 ? 'text-red-500 dark:text-red-400' : 'text-muted'
            }`}>
              {formatTime(timeLeft)}
            </div>
          )}

          {/* Messages remaining */}
          {messages.length > 0 && !limitReached && (
            <div className="text-xs text-muted">
              {messagesLeft} left
            </div>
          )}

          {messages.length > 0 && (
            <button
              onClick={startNewChat}
              disabled={clearing}
              className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:bg-foreground/10 hover:text-foreground disabled:opacity-50"
            >
              {clearing ? 'Clearing...' : 'New chat'}
            </button>
          )}
        </div>
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
                  className="rounded-lg border border-border px-3 py-2 text-left text-xs text-indigo-600 transition-colors hover:bg-foreground/5 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message bubbles */}
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

        {/* Limit reached banner */}
        {limitReached && (
          <div className="rounded-xl border border-border bg-foreground/5 px-4 py-3 text-center">
            <p className="text-sm text-foreground font-medium">
              Session limit reached
            </p>
            <p className="mt-1 text-xs text-muted">
              Start a new chat to keep talking
            </p>
            <button
              onClick={startNewChat}
              className="mt-3 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 transition-colors"
            >
              Start new chat
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border px-4 py-4">
        {limitReached ? (
          <p className="py-1 text-center text-xs text-muted">
            Start a new chat to continue
          </p>
        ) : (
          <>
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
              Enter to send · Shift+Enter for newline · sessions auto-clear after 30min inactivity
            </p>
          </>
        )}
      </div>
    </div>
  )
}