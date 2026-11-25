import {
  ArrowRight,
  Calendar,
  Headset,
  Loader2,
  MessageSquare,
  Phone,
  RotateCcw,
  Send,
  X,
} from 'lucide-react';
import {useEffect, useRef, useState, type FormEvent} from 'react';
import {Link} from 'react-router-dom';
import {
  ASSISTANT_SUGGESTED_QUESTIONS,
  type AssistantMessage,
} from '../core/hospital-assistant.logic.ts';
import {HOSPITAL_PROFILE} from '../core/hospital-data.ts';

export function HospitalAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastFailedQuestion, setLastFailedQuestion] = useState<string | null>(null);
  const [messages, setMessages] = useState<readonly AssistantMessage[]>([]);
  const [questionInput, setQuestionInput] = useState('');

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const timer = window.setTimeout(() => {
      const el = scrollContainerRef.current;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }, 30);
    return () => window.clearTimeout(timer);
  }, [isOpen, messages, isLoading, errorMessage]);

  const sendQuestion = async (question: string, isRetry = false) => {
    setErrorMessage(null);
    setLastFailedQuestion(null);

    const priorHistory = messages;
    const nextHistory = isRetry ? priorHistory : [...priorHistory, {role: 'user' as const, text: question}];
    if (!isRetry) {
      setMessages(nextHistory);
    }
    setIsLoading(true);

    try {
      const response = await fetch('/api/hospital-assistant', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          message: question,
          history: isRetry ? priorHistory.slice(0, -1) : priorHistory,
        }),
      });

      const payload = (await response.json()) as {reply?: string; error?: string};

      if (!response.ok || !payload.reply) {
        setErrorMessage(
          payload.error ||
            'Unable to retrieve an answer right now. Please try again or call +234 807 801 6691.',
        );
        setLastFailedQuestion(question);
        return;
      }

      setMessages((current) => [...current, {role: 'assistant', text: payload.reply!}]);
    } catch {
      setErrorMessage(
        'Network interruption while reaching the Jonex Hospital Assistant. Please try again or call +234 807 801 6691.',
      );
      setLastFailedQuestion(question);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setErrorMessage(null);
    setLastFailedQuestion(null);
    setQuestionInput('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) {
      return;
    }
    const trimmed = questionInput.trim();
    if (!trimmed) {
      return;
    }
    setQuestionInput('');
    void sendQuestion(trimmed);
  };

  return (
    <aside
      className="fixed bottom-4 right-3 sm:bottom-5 sm:right-5 z-40 max-w-[calc(100vw-1.5rem)]"
      aria-label="Jonex Hospital AI Assistant"
    >
      {isOpen ? (
        <section
          className="w-[min(calc(100vw-1.5rem),25rem)] max-h-[min(78vh,36rem)] bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col overflow-hidden"
          role="dialog"
          aria-label="Ask Jonex Hospital Assistant"
        >
          <header className="bg-[#0F2942] text-white px-4 py-3.5 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-teal-600/30 border border-teal-400/30 flex items-center justify-center shrink-0">
                <Headset className="w-[18px] h-[18px] text-teal-200" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h2 className="font-display text-sm font-bold leading-tight truncate">
                  Jonex Hospital Assistant
                </h2>
                <p className="text-[11px] text-teal-200 truncate">
                  Services, hours, fees &amp; appointments
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={resetChat}
                  aria-label="Clear conversation"
                  title="Clear conversation"
                  className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 inline-flex items-center justify-center transition-colors"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close hospital assistant"
                className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 inline-flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </header>

          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3 bg-slate-50"
          >
            <div className="rounded-xl bg-white border border-slate-200 p-3.5 text-xs text-slate-700 leading-relaxed space-y-2">
              <p className="font-semibold text-[#0F2942]">
                Ask me anything about Jonex Hospital (Ogbor Hill, Aba):
              </p>
              <p>
                I can answer questions about clinical services, fee estimates, doctor schedules,
                24/7 opening hours, Igbo/English care, or how to book and manage an appointment.
              </p>
            </div>

            {messages.length === 0 && (
              <div className="space-y-1.5" aria-label="Suggested hospital questions">
                <p className="text-[11px] font-semibold text-slate-500 px-0.5">Common Questions</p>
                <div className="flex flex-col gap-1.5">
                  {ASSISTANT_SUGGESTED_QUESTIONS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      disabled={isLoading}
                      onClick={() => {
                        if (!isLoading) {
                          void sendQuestion(prompt);
                        }
                      }}
                      className="text-left text-xs font-medium text-[#0F2942] bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-600 rounded-lg px-3 py-2 transition-colors flex items-center justify-between gap-2"
                    >
                      <span>{prompt}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-teal-700 shrink-0" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={`${msg.role}-${idx}`}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-[#0F2942] text-white'
                      : 'bg-white text-slate-800 border border-slate-200'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-xl px-3.5 py-2.5 text-xs text-slate-600 bg-white border border-slate-200 inline-flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-700" aria-hidden="true" />
                  <span>Checking hospital schedule &amp; details…</span>
                </div>
              </div>
            )}

            {errorMessage && (
              <div
                role="alert"
                className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 space-y-2"
              >
                <p>{errorMessage}</p>
                {lastFailedQuestion && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!isLoading) {
                        void sendQuestion(lastFailedQuestion, true);
                      }
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F2942] underline underline-offset-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Try again</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="px-4 py-2 bg-white border-t border-slate-200 flex items-center justify-between gap-2 text-[11px] shrink-0">
            <Link
              to="/appointments"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1 font-semibold text-teal-800 hover:text-[#0F2942]"
            >
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Book Appointment</span>
            </Link>
            <a
              href={HOSPITAL_PROFILE.phoneHref}
              className="inline-flex items-center gap-1 font-mono font-semibold text-slate-600 hover:text-[#0F2942] tabular-nums"
            >
              <Phone className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{HOSPITAL_PROFILE.phoneDisplay}</span>
            </a>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            <label htmlFor="hospitalAssistantInput" className="sr-only">
              Ask a question about Jonex Hospital services, hours, or appointments
            </label>
            <input
              id="hospitalAssistantInput"
              type="text"
              value={questionInput}
              maxLength={1200}
              onChange={(e) => setQuestionInput(e.target.value)}
              placeholder="Ask about services, hours, booking…"
              autoComplete="off"
              className="flex-1 min-w-0 px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
            />
            <button
              type="submit"
              disabled={isLoading || !questionInput.trim()}
              aria-label="Send question"
              className="h-9 px-3.5 rounded-lg bg-[#0F2942] hover:bg-teal-800 disabled:bg-slate-300 text-white text-xs font-semibold inline-flex items-center justify-center gap-1 transition-colors shrink-0"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open Jonex Hospital AI Q&A Assistant"
          className="group rounded-xl bg-[#0F2942] hover:bg-teal-800 text-white px-3 py-2 sm:px-4 sm:py-2.5 border border-white/25 shadow-lg flex items-center gap-2.5 sm:gap-3 transition-colors"
        >
          <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-teal-600/35 border border-teal-300/30 flex items-center justify-center shrink-0">
            <Headset className="w-4 h-4 sm:w-[19px] sm:h-[19px] text-teal-200" aria-hidden="true" />
          </span>
          <span className="text-left">
            <span className="block font-display text-xs sm:text-sm font-bold leading-tight">
              Ask Jonex Care AI
            </span>
            <span className="hidden sm:block text-[11px] text-teal-200 leading-tight mt-0.5">
              Services, hours &amp; appointments
            </span>
          </span>
          <MessageSquare
            className="w-4 h-4 text-teal-200 group-hover:translate-x-0.5 transition-transform"
            aria-hidden="true"
          />
        </button>
      )}
    </aside>
  );
}
