import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useChild } from '../contexts/ChildContext';
import { groqService } from '../services/groqService';
import { EMERGENCY_NUMBERS } from '../constants';
import type { LegalAIChatMessage } from '../types';
import toast from 'react-hot-toast';

const QUICK_PROMPTS = [
  { label: '😔 I feel sad today', prompt: 'I feel sad today.' },
  { label: '😠 Someone is being mean', prompt: 'Someone is being mean to me.' },
  { label: '📖 Tell me a safety story', prompt: 'Can you tell me a short story about staying safe?' },
  { label: '❓ I have a question', prompt: 'I have a question about my rights.' },
];

export default function ChildChatBot() {
  const { user } = useAuth();
  const { activeChild } = useChild();
  const navigate = useNavigate();
  const { childId } = useParams();

  const [messages, setMessages] = useState<LegalAIChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  // Ensure voices are loaded
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (text?: string) => {
    const question = text || input.trim();
    if (!question || isLoading || !user) return;

    const userMsg: LegalAIChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: question,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await groqService.chatWithChild(question, history);

      const content = response.answer;

      const assistantMsg: LegalAIChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: content,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Speak response
      if (isVoiceEnabled && 'speechSynthesis' in window) {
        const cleanText = content.replace(/[#*`_]/g, '').replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'hi-IN';
        utterance.rate = 0.95; 
        utterance.pitch = 1.0; // Keep pitch normal for a realistic voice
        
        const voices = window.speechSynthesis.getVoices();
        const indianVoices = voices.filter(v => v.lang.includes('IN') || v.lang.includes('hi'));
        
        // Try to find a high-quality female/online voice
        const femaleNames = ['online', 'natural', 'swara', 'neerja', 'aditi', 'kavya', 'isha', 'zira', 'samantha', 'female'];
        let sweetVoice = indianVoices.find(v => femaleNames.some(name => v.name.toLowerCase().includes(name)));
        
        if (!sweetVoice && indianVoices.length > 0) sweetVoice = indianVoices[0]; // fallback
        if (sweetVoice) utterance.voice = sweetVoice;
        
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error('AI chat error:', err);
      toast.error("Oops! Aegis is resting right now. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Your browser doesn't support voice recording.");
      return;
    }
    
    // If already listening, stop it manually
    if (isListening && recognitionRef.current) {
       recognitionRef.current.stop();
       return;
    }
    
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'hi-IN'; // Allows Hindi/Hinglish/English
    
    let finalTranscript = '';

    recognition.onstart = () => {
      setIsListening(true);
      setInput(''); // Clear input for new speech
      // Stop any ongoing speech so they can talk
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
    
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      const currentText = finalTranscript + interimTranscript;
      setInput(currentText);

      // Clear previous timeout
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }

      // Set new timeout for 2 seconds of silence
      speechTimeoutRef.current = setTimeout(() => {
        if (currentText.trim()) {
          recognition.stop();
          handleSend(currentText.trim());
        }
      }, 2000);
    };
    
    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
         toast.error("Couldn't hear clearly. Please try again.");
      }
    };
    
    recognition.onend = () => {
      setIsListening(false);
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
    };
    
    recognition.start();
  };

  const toggleVoice = () => {
    if (isVoiceEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsVoiceEnabled(!isVoiceEnabled);
  };

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-140px)] md:h-[calc(100vh-120px)] flex flex-col bg-surface-container-lowest rounded-[32px] shadow-card-hover border border-outline-variant/30 overflow-hidden relative">
      
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary-container/10 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-surface-container bg-white/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/play/${childId}/map`)}
            className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[28px]">shield</span>
            </div>
            <div>
              <h1 className="font-headline text-title-lg text-on-surface">Aegis 🛡️</h1>
              <p className="font-body text-caption text-on-surface-variant flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#4ECDC4] animate-pulse" />
                Your AI Safety Guardian
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={toggleVoice}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            isVoiceEnabled ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high text-on-surface-variant'
          }`}
          title={isVoiceEnabled ? "Mute Voice" : "Unmute Voice"}
        >
          <span className="material-symbols-outlined">
            {isVoiceEnabled ? 'volume_up' : 'volume_off'}
          </span>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 z-10">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center mb-6"
            >
              <span className="material-symbols-outlined text-[48px] text-secondary">shield</span>
            </motion.div>
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="font-headline text-headline-sm text-on-surface mb-3"
            >
              Hi {activeChild?.displayName || 'Explorer'}! 👋
            </motion.h2>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="font-body text-body-lg text-on-surface-variant mb-8"
            >
              I'm Aegis, your Safety Guardian. I'll help you learn your rights, stay safe, and become a Safety Hero! What's on your mind?
            </motion.p>
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-3"
            >
              {QUICK_PROMPTS.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(qp.prompt)}
                  className="px-4 py-2 rounded-full bg-surface-bright border border-outline-variant hover:border-secondary hover:bg-secondary/5 text-on-surface font-body text-label-md transition-all shadow-sm"
                >
                  {qp.label}
                </button>
              ))}
            </motion.div>
          </div>
        )}

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0 mr-3 mt-auto mb-1">
                <span className="material-symbols-outlined text-[16px]">shield</span>
              </div>
            )}
            
            <div className={`max-w-[80%] ${
              msg.role === 'user'
                ? 'bg-primary text-on-primary rounded-[24px] rounded-br-sm px-5 py-3 shadow-sm'
                : 'bg-surface-container text-on-surface rounded-[24px] rounded-bl-sm px-5 py-4 shadow-sm border border-outline-variant/30'
            }`}>
              <p className="font-body text-body-lg whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
          </motion.div>
        ))}

        {/* Typing Indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0 mr-3 mt-auto mb-1">
              <span className="material-symbols-outlined text-[16px]">shield</span>
            </div>
            <div className="bg-surface-container rounded-[24px] rounded-bl-sm px-5 py-4 flex items-center gap-2 shadow-sm border border-outline-variant/30">
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full bg-secondary/60"
                    animate={{ y: [-3, 3, -3] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-white/50 backdrop-blur-md border-t border-outline-variant/30 z-10">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center gap-3 bg-surface-container-highest rounded-full p-2 pl-6 shadow-sm focus-within:ring-2 focus-within:ring-primary/50 transition-all"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 bg-transparent border-none outline-none font-body text-body-lg text-on-surface placeholder:text-on-surface-variant/60"
            disabled={isLoading || isListening}
          />
          <button
            type="button"
            onClick={startListening}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isListening 
                ? 'bg-error text-white animate-pulse shadow-[0_0_15px_rgba(186,26,26,0.5)]' 
                : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
            } disabled:opacity-50`}
          >
            <span className="material-symbols-outlined text-[24px]">
              {isListening ? 'stop' : 'mic'}
            </span>
          </button>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary disabled:opacity-50 disabled:bg-surface-container-high disabled:text-on-surface-variant transition-all hover:scale-105 active:scale-95"
          >
            <span className="material-symbols-outlined text-[24px] ml-1">send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
