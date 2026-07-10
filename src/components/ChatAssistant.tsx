import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Sparkles, Send, RefreshCw, HelpCircle, ShieldAlert, Bot, User } from "lucide-react";
import { ChatMessage } from "../types";
import { auth } from "../lib/firebase";
import { getChatHistory, saveChatMessage } from "../lib/firebaseService";

interface ChatAssistantProps {
  initialPrompt?: string;
  onClearPrompt?: () => void;
}

export default function ChatAssistant({ initialPrompt, onClearPrompt }: ChatAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "model",
      parts: [
        {
          text: "Namaste! I am your JanSathi AI Assistant. I can help you discover Indian government schemes, understand complex eligibility rules, checklists of required documents, and guide you through form application steps in simple English or regional languages. How can I assist you today?\n\n*Note: Please verify all details on official government portals before applying.*"
        }
      ]
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const presetPrompts = [
    "What is the PM Vidyalakshmi Scheme?",
    "What documents do I need for PM-KISAN?",
    "How do I apply for Ayushman Bharat health insurance?",
    "Tell me about housing subsidies under PMAY."
  ];

  // Load previous chat history from Firebase
  useEffect(() => {
    async function loadHistory() {
      if (auth.currentUser) {
        try {
          const history = await getChatHistory(auth.currentUser.uid);
          if (history && history.length > 0) {
            setMessages([
              {
                id: "welcome",
                role: "model",
                parts: [
                  {
                    text: "Namaste! I am your JanSathi AI Assistant. I can help you discover Indian government schemes, understand complex eligibility rules, checklists of required documents, and guide you through form application steps in simple English or regional languages. How can I assist you today?\n\n*Note: Please verify all details on official government portals before applying.*"
                  }
                ]
              },
              ...history
            ]);
          }
        } catch (error) {
          console.error("Error loading chat history:", error);
        }
      }
    }
    loadHistory();
  }, []);

  // Load initial prompt if navigated from other screen (like Apply with AI Assistant)
  useEffect(() => {
    if (initialPrompt) {
      handleSendMessage(initialPrompt);
      if (onClearPrompt) onClearPrompt();
    }
  }, [initialPrompt]);

  // Scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      parts: [{ text: textToSend }]
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Save user message to Firebase
    if (auth.currentUser) {
      await saveChatMessage(auth.currentUser.uid, "user", textToSend);
    }

    try {
      // Reconstruct conversation history formatted for Gemini SDK in server.ts
      const historyPayload = messages.map(msg => ({
        role: msg.role,
        parts: msg.parts
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload
        })
      });

      if (!response.ok) {
        throw new Error("Chat request failed");
      }

      const result = await response.json();

      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: "model",
        parts: [{ text: result.text }]
      };

      setMessages(prev => [...prev, modelMsg]);

      // Save model reply to Firebase
      if (auth.currentUser) {
        await saveChatMessage(auth.currentUser.uid, "model", result.text);
      }
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "model",
        parts: [
          {
            text: "My apologies, I am having trouble connecting to the security server. Please verify you have configured your **GEMINI_API_KEY** in the AI Studio Secrets panel.\n\n*Disclaimer: Please verify details on official government portals before applying.*"
          }
        ]
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetClick = (promptText: string) => {
    handleSendMessage(promptText);
  };

  return (
    <div className="flex flex-col h-[600px] bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      {/* Top Title Bar */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center text-[#006b5f]">
            <Sparkles className="w-5 h-5 fill-current text-[#006b5f] animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
              <span>JanSathi AI Scheme Expert</span>
              <span className="text-[10px] font-bold text-[#006b5f] bg-[#8df5e4]/30 px-1.5 py-0.5 rounded">
                Gemini Active
              </span>
            </h3>
            <p className="text-[10px] text-gray-400">Supporting English, Hindi, and regional languages</p>
          </div>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          className="p-1.5 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors text-xs flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Chat</span>
        </button>
      </div>

      {/* Warning Disclaimer Box */}
      <div className="bg-amber-50 text-amber-800 px-6 py-3 border-b border-amber-100 flex items-start gap-2.5 text-xs select-none shrink-0">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-normal font-medium">
          <strong>Official Verification Disclaimer:</strong> AI responses are informational. Always verify eligibility, deadlines, and requirements on official portals (<span className="underline">.gov.in</span>) before submitting documents.
        </p>
      </div>

      {/* Messages Scrolling Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[85%] ${
              msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            }`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
              msg.role === "user" ? "bg-[#004d99] text-white" : "bg-teal-50 text-[#006b5f]"
            }`}>
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm border ${
              msg.role === "user"
                ? "bg-[#004d99] text-white border-[#004d99]"
                : "bg-white text-gray-800 border-gray-100"
            }`}>
              <div className="whitespace-pre-line font-medium">
                {msg.parts[0].text}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 max-w-[80%] mr-auto">
            <div className="w-8 h-8 rounded-full bg-teal-50 text-[#006b5f] flex items-center justify-center shrink-0 shadow-sm animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm text-sm text-gray-500 flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
              </div>
              <span className="text-xs">JanSathi checking guidelines...</span>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Preset prompt helper chips (only shown when conversation is thin) */}
      {messages.length <= 2 && (
        <div className="p-4 bg-white border-t border-gray-50 shrink-0">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Frequently Asked Questions</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {presetPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePresetClick(p)}
                className="text-xs font-semibold px-3 py-1.5 bg-gray-50 hover:bg-[#004d99]/5 hover:text-[#004d99] border border-gray-100 rounded-lg text-gray-600 transition-colors cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input Box */}
      <div className="p-4 bg-white border-t border-gray-100 flex gap-2 shrink-0">
        <input
          type="text"
          placeholder="Ask anything about schemes, eligibility, or application steps..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage(input)}
          className="flex-1 h-12 px-4 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:border-[#004d99] focus:bg-white focus:ring-1 focus:ring-[#004d99]/20 outline-none transition-all"
        />
        <button
          onClick={() => handleSendMessage(input)}
          disabled={!input.trim() || isLoading}
          className="w-12 h-12 bg-[#004d99] text-white rounded-xl flex items-center justify-center shadow-md hover:bg-[#00366c] disabled:opacity-40 transition-all cursor-pointer shrink-0"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
