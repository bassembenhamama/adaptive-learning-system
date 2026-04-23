import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, AlertTriangle, Bot } from 'lucide-react';
import { MarkdownRenderer } from '../ui/MarkdownRenderer';
import { useChatHistory, useSendMessage } from '../../hooks/useChatHooks';
import type { ChatMessage } from '../../types';

interface Props {
  moduleId: string;
  moduleTitle: string;
  enrollmentId: string;
  onClose: () => void;
}

/** Three-dot typing indicator — each dot animates in sequence. */
const TypingIndicator: React.FC = () => (
  <div className="flex items-center gap-1 px-4 py-3">
    {[0, 1, 2].map(i => (
      <motion.span
        key={i}
        className="w-2 h-2 rounded-full bg-emerald-400"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          delay: i * 0.25,
          ease: 'easeInOut',
        }}
      />
    ))}
  </div>
);

/** Empty state shown when there are no messages yet. */
const EmptyChat: React.FC<{ moduleTitle: string }> = ({ moduleTitle }) => (
  <div className="flex flex-col items-center justify-center h-full px-6 text-center gap-4 py-12">
    <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
      <Sparkles className="w-8 h-8 text-emerald-500" />
    </div>
    <div>
      <p className="font-bold text-slate-900 dark:text-white text-base">
        Ask me anything about{' '}
        <span className="text-emerald-600 dark:text-emerald-400">{moduleTitle}</span>
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
        Responses are generated from the course materials only. I cannot answer
        questions outside the scope of this module.
      </p>
    </div>
  </div>
);

/** AI-generated badge shown beneath every AI message (NFR-U03). */
const AIBadge: React.FC = () => (
  <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
    <Sparkles className="w-2.5 h-2.5" />
    AI generated
  </span>
);

let _msgCounter = 0;
const newId = () => `msg-${Date.now()}-${++_msgCounter}`;

/**
 * AIChatUI — sliding chat overlay (Task 11-E).
 *
 * - Loads history on mount via useChatHistory.
 * - Sends messages optimistically, then appends AI reply.
 * - Typing indicator shown while waiting for the backend.
 * - User messages: right-aligned emerald bubbles.
 * - AI messages: left-aligned glass panel with MarkdownRenderer + AIBadge.
 * - Out-of-context messages: amber warning styling.
 */
export const AIChatUI: React.FC<Props> = ({
  moduleId,
  moduleTitle,
  enrollmentId,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ── Load history on mount ────────────────────────────────────────────────
  const { data: history } = useChatHistory(moduleId, enrollmentId);

  useEffect(() => {
    if (history && history.length > 0 && messages.length === 0) {
      setMessages(history);
    }
    // Intentionally only on history load (not messages dep to avoid stale closure)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  // ── Auto-scroll ──────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ── Send mutation ─────────────────────────────────────────────────────────
  const { mutate: sendMessage } = useSendMessage();

  const handleSend = useCallback(() => {
    const query = input.trim();
    if (!query || isTyping) return;

    const userMsg: ChatMessage = {
      id: newId(),
      role: 'user',
      content: query,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    sendMessage(
      { moduleId, enrollmentId, query },
      {
        onSuccess: (response) => {
          const aiMsg: ChatMessage = {
            id: newId(),
            role: 'ai',
            content: response.response,
            isOutOfContext: response.isOutOfContext,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, aiMsg]);
          setIsTyping(false);
        },
        onError: () => {
          const errMsg: ChatMessage = {
            id: newId(),
            role: 'ai',
            content: 'Sorry, I encountered an error. Please try again.',
            isOutOfContext: false,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, errMsg]);
          setIsTyping(false);
        },
      },
    );
  }, [input, isTyping, moduleId, enrollmentId, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div
      initial={{ x: 80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 80, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      className="
        fixed bottom-24 right-6 z-40
        w-[360px] max-w-[calc(100vw-1.5rem)]
        h-[540px] max-h-[calc(100vh-8rem)]
        flex flex-col
        rounded-2xl overflow-hidden
        border border-white/20 dark:border-white/10
        bg-white/80 dark:bg-slate-900/80
        backdrop-blur-xl
        shadow-2xl shadow-slate-900/20
      "
      role="dialog"
      aria-modal="true"
      aria-label="AI Tutor Chat"
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200/60 dark:border-white/10 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">AI Tutor</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{moduleTitle}</p>
        </div>
        <button
          id="ai-chat-close-btn"
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── Message List ── */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.length === 0 && !isTyping ? (
          <EmptyChat moduleTitle={moduleTitle} />
        ) : (
          <>
            <AnimatePresence initial={false}>
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}
                >
                  {/* Bot icon for AI messages */}
                  {msg.role === 'ai' && (
                    <div className="shrink-0 w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mt-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}

                  <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                    {/* Message bubble */}
                    {msg.role === 'user' ? (
                      <div className="px-4 py-2.5 rounded-2xl rounded-br-sm bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm leading-relaxed">
                        {msg.content}
                      </div>
                    ) : msg.isOutOfContext ? (
                      /* Out-of-context: amber warning styling */
                      <div className="px-4 py-3 rounded-2xl rounded-bl-sm border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 text-sm leading-relaxed">
                        <div className="flex items-center gap-1.5 mb-1 text-xs font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="w-3 h-3" />
                          Outside course scope
                        </div>
                        <MarkdownRenderer
                          content={msg.content}
                          className="prose-sm prose-amber dark:prose-invert text-amber-800 dark:text-amber-300"
                        />
                        <AIBadge />
                      </div>
                    ) : (
                      /* Normal AI message: glass panel */
                      <div className="px-4 py-3 rounded-2xl rounded-bl-sm border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
                        <MarkdownRenderer
                          content={msg.content}
                          className="prose-sm dark:prose-invert"
                        />
                        <AIBadge />
                      </div>
                    )}

                    {/* Timestamp */}
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2"
              >
                <div className="shrink-0 w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="rounded-2xl rounded-bl-sm border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
                  <TypingIndicator />
                </div>
              </motion.div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input Area ── */}
      <div className="shrink-0 px-3 py-3 border-t border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm">
        <div className="flex items-end gap-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-400/50 focus-within:border-emerald-400 dark:focus-within:border-emerald-500 transition-all">
          <textarea
            ref={inputRef}
            id="ai-chat-input"
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
            placeholder={isTyping ? 'Waiting for response…' : 'Ask a question…'}
            className="flex-1 resize-none bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none disabled:opacity-50 max-h-28 leading-relaxed py-0.5"
            style={{ overflowY: 'auto', lineHeight: '1.5rem' }}
          />
          <button
            id="ai-chat-send-btn"
            type="button"
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            aria-label="Send message"
            className="shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed hover:from-emerald-400 hover:to-teal-500 active:scale-95 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-2">
          Shift+Enter for new line · responses from course materials only
        </p>
      </div>
    </motion.div>
  );
};
