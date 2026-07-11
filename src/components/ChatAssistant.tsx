import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Sparkles, Send, RefreshCw, HelpCircle, ShieldAlert, Bot, User } from "lucide-react";
import { ChatMessage } from "../types";
import { auth } from "../lib/firebase";
import { getChatHistory, saveChatMessage } from "../lib/firebaseService";
import { useTranslation } from "../lib/translations";

interface ChatAssistantProps {
  initialPrompt?: string;
  onClearPrompt?: () => void;
  preferredLanguage?: string;
}

export default function ChatAssistant({ initialPrompt, onClearPrompt, preferredLanguage }: ChatAssistantProps) {
  const { t } = useTranslation(preferredLanguage);

  const getWelcomeMessageText = () => {
    return t("chat.welcome") + "\n\n" + (preferredLanguage === "Hindi" || preferredLanguage === "हिन्दी (Hindi)" ? "*नोट: कृपया आवेदन करने से पहले आधिकारिक सरकारी पोर्टलों पर सभी विवरण सत्यापित करें।*" :
            preferredLanguage === "Marathi" || preferredLanguage === "मराठी (Marathi)" ? "*टीप: कृपया अर्ज करण्यापूर्वी अधिकृत सरकारी पोर्टलवरील सर्व तपशील तपासा.*" :
            preferredLanguage === "Tamil" || preferredLanguage === "தமிழ் (Tamil)" ? "*குறிப்பு: விண்ணப்பிக்கும் முன் அதிகாரப்பூர்வ அரசு இணையதளங்களில் அனைத்து விவரங்களையும் சரிபார்க்கவும்.*" :
            preferredLanguage === "Telugu" || preferredLanguage === "తెలుగు (Telugu)" ? "*గమనిక: దయచేసి దరఖాస్తు చేయడానికి ముందు అధికారిక ప్రభుత్వ పోర్టల్‌లలో అన్ని వివరాలను ధృవీకరించండి.*" :
            "*Note: Please verify all details on official government portals before applying.*");
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "model",
      parts: [
        {
          text: getWelcomeMessageText()
        }
      ]
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const presetPrompts = [
    t("chat.starter_1"),
    t("chat.starter_2"),
    t("chat.starter_3"),
    t("chat.starter_4")
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
                    text: getWelcomeMessageText()
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
  }, [preferredLanguage]);

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
              <span>{t("chat.title")}</span>
              <span className="text-[10px] font-bold text-[#006b5f] bg-[#8df5e4]/30 px-1.5 py-0.5 rounded">
                Gemini Active
              </span>
            </h3>
            <p className="text-[10px] text-gray-400">{t("chat.subtitle")}</p>
          </div>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          className="p-1.5 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors text-xs flex items-center gap-1 cursor-pointer bg-transparent"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{preferredLanguage === "Hindi" || preferredLanguage === "हिन्दी (Hindi)" ? "चैट रीसेट करें" : preferredLanguage === "Marathi" || preferredLanguage === "मराठी (Marathi)" ? "चॅट रीसेट करा" : preferredLanguage === "Tamil" || preferredLanguage === "தமிழ் (Tamil)" ? "அரட்டையை மீட்டமை" : preferredLanguage === "Telugu" || preferredLanguage === "తెలుగు (Telugu)" ? "చాట్ రీసెట్ చేయండి" : "Reset Chat"}</span>
        </button>
      </div>

      {/* Warning Disclaimer Box */}
      <div className="bg-amber-50 text-amber-800 px-6 py-3 border-b border-amber-100 flex items-start gap-2.5 text-xs select-none shrink-0">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-normal font-medium">
          <strong>{preferredLanguage === "Hindi" || preferredLanguage === "हिन्दी (Hindi)" ? "आधिकारिक सत्यापन अस्वीकरण:" : preferredLanguage === "Marathi" || preferredLanguage === "मराठी (Marathi)" ? "अधिकृत पडताळणी अस्वीकरण:" : preferredLanguage === "Tamil" || preferredLanguage === "தமிழ் (Tamil)" ? "அதிகாரப்பூர்வ சரிபார்ப்பு மறுப்பு:" : preferredLanguage === "Telugu" || preferredLanguage === "తెలుగు (Telugu)" ? "అధికారిక ధృవీకరణ నిరాకరణ:" : "Official Verification Disclaimer:"}</strong> {preferredLanguage === "Hindi" || preferredLanguage === "हिन्दी (Hindi)" ? "एआई प्रतिक्रियाएं सूचनात्मक हैं। दस्तावेज़ जमा करने से पहले हमेशा आधिकारिक पोर्टल (.gov.in) पर पात्रता, समय सीमा और आवश्यकताओं को सत्यापित करें।" : preferredLanguage === "Marathi" || preferredLanguage === "मराठी (Marathi)" ? "एआय प्रतिसाद केवळ माहितीसाठी आहेत. कागदपत्रे सादर करण्यापूर्वी नेहमी अधिकृत पोर्टलवर पात्रता, अंतिम मुदत आणि आवश्यकता पडताळून पहा." : preferredLanguage === "Tamil" || preferredLanguage === "தமிழ் (Tamil)" ? "AI பதில்கள் தகவல் நோக்கங்களுக்கானவை. ஆவணங்களை சமர்ப்பிக்கும் முன் எப்போதும் அதிகாரப்பூர்வ இணையதளங்களில் தகுதி, காலக்கெடு மற்றும் தேவைகளை சரிபார்க்கவும்." : preferredLanguage === "Telugu" || preferredLanguage === "తెలుగు (Telugu)" ? "AI సమాధానాలు సమాచారం కొరకే. పత్రాలను సమర్పించే ముందు ఎల్లప్పుడూ అధికారిక పోర్టల్స్‌లో అర్హత, గడువు మరియు అవసరాలను ధృవీకరించుకోండి." : "AI responses are informational. Always verify eligibility, deadlines, and requirements on official portals (.gov.in) before submitting documents."}
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
            <span>{preferredLanguage === "Hindi" || preferredLanguage === "हिन्दी (Hindi)" ? "अक्सर पूछे जाने वाले प्रश्न" : preferredLanguage === "Marathi" || preferredLanguage === "मराठी (Marathi)" ? "नेहमी विचारले जाणारे प्रश्न" : preferredLanguage === "Tamil" || preferredLanguage === "தமிழ் (Tamil)" ? "அடிக்கடி கேட்கப்படும் கேள்விகள்" : preferredLanguage === "Telugu" || preferredLanguage === "తెలుగు (Telugu)" ? "తరచుగా అడిగే ప్రశ్నలు" : "Frequently Asked Questions"}</span>
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
          placeholder={t("chat.placeholder")}
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
