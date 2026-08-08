import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { groqService } from '../../services/groqService';
import { saveChatSession, getChatSessions } from '../../firebase/communityFirestore';
import { EMERGENCY_NUMBERS } from '../../constants';
import type { LegalAIChatMessage, ChatSession } from '../../types';

const QUICK_PROMPTS = [
  { label: '👧 Girls Safety', prompt: 'What are the laws for girls safety in India?' },
  { label: '💻 Cyber Safety', prompt: 'How can I protect my child from online threats?' },
  { label: '👦 Child Rights', prompt: 'What are the fundamental rights of children in India?' },
  { label: '🚨 Emergency', prompt: 'What should I do in an emergency involving my child?' },
  { label: '⚖ Consumer Rights', prompt: 'What are my consumer rights in India?' },
  { label: '🛡 Self Defence', prompt: 'What are the legal provisions for self defence in India?' },
];

export const LegalAIChat = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<LegalAIChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && user) {
      getChatSessions(user.uid).then(setSessions);
    }
  }, [isOpen, user]);

  const handleSend = async (text?: string) => {
    const question = text || input.trim();
    if (!question || isLoading || !user) return;

    const userMsg: LegalAIChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: question,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await groqService.answerLegalQuestion(question, history);

      const assistantMsg: LegalAIChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.answer,
        timestamp: Date.now(),
        emergencyNumbers: response.emergencyNumbers || undefined,
        relatedLevels: response.relatedTopics || undefined,
      };

      const updatedMessages = [...messages, userMsg, assistantMsg];
      setMessages(updatedMessages);

      // Save to Firestore
      const title = messages.length === 0 ? question.slice(0, 50) : undefined;
      const newSessionId = await saveChatSession(
        user.uid,
        updatedMessages,
        title || 'Legal AI Chat',
        sessionId
      );
      setSessionId(newSessionId);
    } catch (err) {
      console.error('AI chat error:', err);
      const errorMsg: LegalAIChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again. If this is an emergency, call **112** immediately.',
        timestamp: Date.now(),
        emergencyNumbers: ['112'],
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSession = (session: ChatSession) => {
    setMessages(session.messages);
    setSessionId(session.id);
    setShowHistory(false);
  };

  const startNewChat = () => {
    setMessages([]);
    setSessionId(undefined);
    setShowHistory(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-container text-white shadow-lg flex items-center justify-center"
        whileHover={{ scale: 1.1, boxShadow: '0 8px 30px rgba(164, 60, 18, 0.3)' }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <span className="material-symbols-outlined text-[28px]">smart_toy</span>
      </motion.button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[120] flex items-end md:items-center justify-center md:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: 'spring', damping: 25 }}
              className="relative bg-surface-container-lowest w-full max-w-2xl h-[90vh] md:h-[80vh] md:rounded-[32px] rounded-t-[32px] shadow-card-hover flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 md:p-5 bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur border-b border-surface-container">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-[20px]">smart_toy</span>
                  </div>
                  <div>
                    <h3 className="font-headline text-title-lg text-on-surface">Ask Legal AI</h3>
                    <p className="font-body text-caption text-on-surface-variant">
                      {isLoading ? 'Thinking...' : 'Legal awareness at your fingertips'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="p-2 rounded-full hover:bg-surface-container transition-colors"
                    title="Chat History"
                  >
                    <span className="material-symbols-outlined text-on-surface-variant">history</span>
                  </button>
                  <button
                    onClick={startNewChat}
                    className="p-2 rounded-full hover:bg-surface-container transition-colors"
                    title="New Chat"
                  >
                    <span className="material-symbols-outlined text-on-surface-variant">add</span>
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-full hover:bg-surface-container transition-colors"
                  >
                    <span className="material-symbols-outlined text-on-surface-variant">close</span>
                  </button>
                </div>
              </div>

              {/* Chat History Sidebar */}
              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-b border-surface-container"
                  >
                    <div className="p-3 max-h-48 overflow-y-auto space-y-1">
                      <p className="font-body text-label-md text-on-surface-variant px-2 mb-2">Recent Chats</p>
                      {sessions.length === 0 ? (
                        <p className="font-body text-caption text-on-surface-variant text-center py-4">No previous chats</p>
                      ) : (
                        sessions.map(s => (
                          <button
                            key={s.id}
                            onClick={() => loadSession(s)}
                            className={`w-full text-left px-3 py-2 rounded-xl hover:bg-surface-container transition-colors ${
                              sessionId === s.id ? 'bg-primary-container/30' : ''
                            }`}
                          >
                            <p className="font-body text-label-md text-on-surface truncate">{s.title}</p>
                            <p className="font-body text-caption text-on-surface-variant">{s.messages.length} messages</p>
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-[40px] text-primary">balance</span>
                    </div>
                    <h4 className="font-headline text-title-lg text-on-surface mb-2">Legal Awareness Assistant</h4>
                    <p className="font-body text-body-md text-on-surface-variant max-w-sm mb-6">
                      Ask me anything about Indian laws, child rights, cyber safety, or emergencies. I'm here to help!
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {QUICK_PROMPTS.map((qp, idx) => (
                        <motion.button
                          key={idx}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleSend(qp.prompt)}
                          className="px-4 py-2 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-body text-label-md transition-colors"
                        >
                          {qp.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] ${
                      msg.role === 'user'
                        ? 'bg-primary text-on-primary rounded-[20px] rounded-br-md px-4 py-3'
                        : 'bg-surface-container rounded-[20px] rounded-bl-md px-4 py-3'
                    }`}>
                      <p className="font-body text-body-md whitespace-pre-wrap">{msg.content}</p>

                      {/* Emergency Numbers */}
                      {msg.emergencyNumbers && msg.emergencyNumbers.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/20">
                          <p className="font-headline text-label-md mb-2 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">emergency</span>
                            Emergency Numbers
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {msg.emergencyNumbers.map(num => {
                              const info = EMERGENCY_NUMBERS.find(e => e.number === num);
                              return (
                                <a
                                  key={num}
                                  href={`tel:${num}`}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-sm font-semibold transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[14px]">call</span>
                                  {num} {info ? `(${info.label})` : ''}
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Related Topics */}
                      {msg.relatedLevels && msg.relatedLevels.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-surface-container-high">
                          <p className="font-body text-caption text-on-surface-variant mb-1">Related RightsQuest Topics:</p>
                          <div className="flex flex-wrap gap-1">
                            {msg.relatedLevels.map((topic, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-full bg-primary-container/30 text-xs font-body text-primary">
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {/* Typing Indicator */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <div className="bg-surface-container rounded-[20px] rounded-bl-md px-4 py-3 flex items-center gap-2">
                      <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full bg-primary"
                            animate={{ y: [-2, 2, -2] }}
                            transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                          />
                        ))}
                      </div>
                      <span className="font-body text-caption text-on-surface-variant">Thinking...</span>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 bg-surface-container-lowest border-t border-surface-container">
                <form
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="flex items-center gap-3 bg-surface-container-high rounded-full p-2 pl-4"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a legal question..."
                    className="flex-1 bg-transparent border-none outline-none font-body text-body-md text-on-surface"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary disabled:opacity-50 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-[20px]">send</span>
                  </button>
                </form>
                <p className="font-body text-caption text-on-surface-variant text-center mt-2 opacity-60">
                  AI provides general awareness only, not legal advice. Consult a lawyer for specific cases.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
