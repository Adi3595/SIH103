import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, X, Bot, User, Loader2, Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTED = [
  'What is driving the cost overrun risk?',
  'Which milestones are most at risk?',
  'What should I do first to fix this?',
  'How does this compare to similar projects?',
]

export default function ProjectChat({ projectId, projectName }: { projectId: string; projectName: string }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `👋 Hi! I'm PAIMANA AI. I have full access to **${projectName}**'s risk data, Digital Fingerprint, and momentum analysis.\n\nAsk me anything about this project.`,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setLoading(true)
    try {
      const res = await axios.post(`http://127.0.0.1:8000/api/projects/${projectId}/chat`, { message: msg })
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Unable to reach the AI engine. Please ensure the backend is running and your OpenRouter key is configured.'
      }])
    }
    setLoading(false)
  }

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 text-white shadow-xl shadow-teal-300/40 hover:shadow-teal-400/60 transition-shadow"
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.97 }}
      >
        <Sparkles size={16} className="shrink-0" />
        <span className="text-sm font-bold tracking-wide">Ask AI</span>
        <MessageSquare size={14} className="shrink-0 opacity-70" />
      </motion.button>

      {/* Slide-over panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
            />

            {/* Chat Panel */}
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col bg-white/90 backdrop-blur-2xl shadow-2xl border-l border-white/60"
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-teal-50 to-white">
                <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center shadow-md shadow-teal-200">
                  <Bot size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-800">PAIMANA AI Advisor</p>
                  <p className="text-[10px] text-teal-600 font-bold uppercase tracking-widest truncate">{projectName}</p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${m.role === 'assistant' ? 'bg-teal-100 text-teal-700' : 'bg-slate-200 text-slate-600'}`}>
                      {m.role === 'assistant' ? <Bot size={13} /> : <User size={13} />}
                    </div>

                    {/* Bubble */}
                    <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      m.role === 'assistant'
                        ? 'bg-slate-50 border border-slate-200/80 text-slate-700 rounded-tl-sm'
                        : 'bg-teal-600 text-white rounded-tr-sm shadow-md shadow-teal-200'
                    }`}>
                      <div className={`whitespace-pre-wrap font-sans ${m.role === 'assistant' ? 'prose prose-sm prose-slate max-w-none' : ''}`}>
                        {m.role === 'assistant' ? (
                          <ReactMarkdown>{m.content}</ReactMarkdown>
                        ) : (
                          m.content
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Typing indicator */}
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2.5"
                  >
                    <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700">
                      <Bot size={13} />
                    </div>
                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                      <Loader2 size={13} className="text-teal-600 animate-spin" />
                      <span className="text-xs text-slate-500">Analysing project data...</span>
                    </div>
                  </motion.div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Suggested questions */}
              {messages.length <= 1 && (
                <div className="px-4 pb-2">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Suggested</p>
                  <div className="flex flex-col gap-1.5">
                    {SUGGESTED.map(q => (
                      <button
                        key={q}
                        onClick={() => send(q)}
                        className="text-left text-xs text-slate-600 bg-slate-50 hover:bg-teal-50 hover:text-teal-700 border border-slate-200 hover:border-teal-200 rounded-xl px-3 py-2 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="px-4 py-4 border-t border-slate-100 bg-white/80">
                <div className="flex gap-2 items-end">
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                    placeholder="Ask about budget, delays, risk..."
                    rows={1}
                    className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 transition-all"
                    style={{ maxHeight: 120, overflowY: 'auto' }}
                  />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => send()}
                    disabled={!input.trim() || loading}
                    className="w-10 h-10 rounded-xl bg-teal-600 disabled:opacity-40 flex items-center justify-center text-white shadow-md shadow-teal-200 hover:bg-teal-700 transition-colors shrink-0"
                  >
                    <Send size={15} />
                  </motion.button>
                </div>
                <p className="text-[9px] text-slate-400 mt-2 text-center">Powered by PAIMANA AI · Context-aware · Project-specific</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
