import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, Send, RefreshCw, HelpCircle, ShieldAlert, Bot, User,
  Mic, MicOff, Volume2, VolumeX, Play, Pause, Square, Volume1
} from "lucide-react";
import { ChatMessage } from "../types";
import { auth } from "../lib/firebase";
import { getChatHistory, saveChatMessage } from "../lib/firebaseService";
import { useTranslation } from "../lib/translations";
import MarkdownRenderer from "./MarkdownRenderer";

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

  // Voice Input (Speech-to-Text) States
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  // Voice Output (Text-to-Speech) States
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isSpeakingPaused, setIsSpeakingPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      
      // Map preferredLanguage to standard language code for local speech models
      let langCode = "en-IN";
      if (preferredLanguage) {
        const lang = preferredLanguage.toLowerCase();
        if (lang.includes("hindi") || lang.includes("हिन्दी")) langCode = "hi-IN";
        else if (lang.includes("marathi") || lang.includes("मराठी")) langCode = "mr-IN";
        else if (lang.includes("tamil") || lang.includes("தமிழ்")) langCode = "ta-IN";
        else if (lang.includes("telugu") || lang.includes("తెలుగు")) langCode = "te-IN";
        else if (lang.includes("bengali") || lang.includes("বাংলা")) langCode = "bn-IN";
      }
      rec.lang = langCode;

      rec.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        const currentText = finalTranscript || interimTranscript;
        if (currentText) {
          setVoiceTranscript(currentText);
          setInput(currentText);
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error !== "no-speech") {
          setIsListening(false);
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [preferredLanguage]);

  // Voice recording toggle controls
  const startListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert("Voice recognition is not supported or initialized in your browser.");
      return;
    }
    
    // Auto-stop any active reading to avoid overlap
    stopSpeaking();

    setVoiceTranscript("");
    setInput("");
    setIsListening(true);
    try {
      recognitionRef.current.start();
    } catch (err) {
      console.warn("Speech recognition start failed:", err);
    }
  };

  const stopListening = (shouldSubmit = true) => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (err) {
      console.warn("Speech recognition stop failed:", err);
    }
    setIsListening(false);
    
    if (shouldSubmit && voiceTranscript.trim()) {
      handleSendMessage(voiceTranscript);
      setVoiceTranscript("");
    }
  };

  // Speak response out loud (Text-to-Speech)
  const speakResponse = (messageId: string, text: string) => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech reading is not supported in this browser.");
      return;
    }

    if (speakingMessageId === messageId) {
      if (isSpeakingPaused) {
        window.speechSynthesis.resume();
        setIsSpeakingPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsSpeakingPaused(true);
      }
      return;
    }

    // Cancel active synthesis
    window.speechSynthesis.cancel();
    
    // Strip markdown formatting and disclaimers for clean natural voice reading
    const plainText = text
      .replace(/\*\*([^*]+)\*\*/g, "$1") // Bold markup removal
      .replace(/###?\s+/g, "")           // Subheaders removal
      .replace(/[\*\-•]\s*/g, "")        // Bullet points removal
      .replace(/Disclaimer:.*/i, "")     // Disclaimer voice skip
      .replace(/अस्वीकरण:.*/g, "")
      .replace(/दामित्याग:.*/g, "")
      .replace(/பொறுப்புத் துறப்பு:.*/g, "")
      .trim();

    const utterance = new SpeechSynthesisUtterance(plainText);
    
    let langCode = "en-IN";
    if (preferredLanguage) {
      const lang = preferredLanguage.toLowerCase();
      if (lang.includes("hindi") || lang.includes("हिन्दी")) langCode = "hi-IN";
      else if (lang.includes("marathi") || lang.includes("मराठी")) langCode = "mr-IN";
      else if (lang.includes("tamil") || lang.includes("தமிழ்")) langCode = "ta-IN";
      else if (lang.includes("telugu") || lang.includes("తెలుగు")) langCode = "te-IN";
      else if (lang.includes("bengali") || lang.includes("বাংলা")) langCode = "bn-IN";
    }
    utterance.lang = langCode;

    // Retrieve best possible local voice matching the accent
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(v => v.lang.startsWith(langCode.substring(0, 2)));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onend = () => {
      setSpeakingMessageId(null);
      setIsSpeakingPaused(false);
    };

    utterance.onerror = (e) => {
      console.warn("TTS playback issue:", e);
      setSpeakingMessageId(null);
      setIsSpeakingPaused(false);
    };

    utteranceRef.current = utterance;
    setSpeakingMessageId(messageId);
    setIsSpeakingPaused(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);
    setIsSpeakingPaused(false);
  };

  // Cancel sound on leaving screen
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, []);

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

    // Immediately stop reading previous messages
    stopSpeaking();

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
          history: historyPayload,
          preferredLanguage: preferredLanguage
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
    <div className="relative flex flex-col h-[600px] bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
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
              {msg.role === "user" ? (
                <div className="whitespace-pre-line font-medium">
                  {msg.parts[0].text}
                </div>
              ) : (
                <>
                  <MarkdownRenderer content={msg.parts[0].text} preferredLanguage={preferredLanguage} />
                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-semibold select-none">
                    <button
                      onClick={() => speakResponse(msg.id, msg.parts[0].text)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 hover:bg-[#004d99]/5 hover:text-[#004d99] rounded-xl transition-all border border-gray-100 cursor-pointer text-gray-600 font-bold text-[10px]"
                    >
                      {speakingMessageId === msg.id ? (
                        isSpeakingPaused ? (
                          <>
                            <Play className="w-3.5 h-3.5 text-[#004d99]" />
                            <span>
                              {preferredLanguage === "Hindi" || preferredLanguage === "हिन्दी (Hindi)" ? "पढ़ना फिर शुरू करें" :
                               preferredLanguage === "Marathi" || preferredLanguage === "मराठी (Marathi)" ? "पुन्हा सुरू करा" :
                               preferredLanguage === "Tamil" || preferredLanguage === "தமிழ் (Tamil)" ? "தொடரவும்" :
                               preferredLanguage === "Telugu" || preferredLanguage === "తెలుగు (Telugu)" ? "మళ్ళీ ప్రారంభించు" :
                               "Resume Reading"}
                            </span>
                          </>
                        ) : (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                            <span className="text-red-600 font-extrabold">
                              {preferredLanguage === "Hindi" || preferredLanguage === "हिन्दी (Hindi)" ? "आवाज़ बंद करें" :
                               preferredLanguage === "Marathi" || preferredLanguage === "मराठी (Marathi)" ? "आवाज बंद करा" :
                               preferredLanguage === "Tamil" || preferredLanguage === "தமிழ் (Tamil)" ? "ஒலியை நிறுத்து" :
                               preferredLanguage === "Telugu" || preferredLanguage === "తెలుగు (Telugu)" ? "ఆపండి" :
                               "Stop Speaking"}
                            </span>
                          </>
                        )
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-[#006b5f]" />
                          <span>
                            {preferredLanguage === "Hindi" || preferredLanguage === "हिन्दी (Hindi)" ? "विवरण सुनें (Listen)" :
                             preferredLanguage === "Marathi" || preferredLanguage === "मराठी (Marathi)" ? "तपशील ऐका (Listen)" :
                             preferredLanguage === "Tamil" || preferredLanguage === "தமிழ் (Tamil)" ? "விவரங்களைக் கேளுங்கள்" :
                             preferredLanguage === "Telugu" || preferredLanguage === "తెలుగు (Telugu)" ? "వివరాలు వినండి (Listen)" :
                             "Listen scheme details"}
                          </span>
                        </>
                      )}
                    </button>
                    {speakingMessageId === msg.id && !isSpeakingPaused && (
                      <span className="flex gap-1 items-center px-2 py-0.5 bg-teal-50 text-teal-700 text-[9px] rounded-md border border-teal-100 font-bold">
                        <span className="w-1 h-1 bg-teal-500 rounded-full animate-ping"></span>
                        <span>Playing Voice</span>
                      </span>
                    )}
                  </div>
                </>
              )}
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
        {speechSupported && (
          <button
            type="button"
            onClick={isListening ? () => stopListening(true) : startListening}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 border ${
              isListening
                ? "bg-red-500 text-white border-red-500 shadow-md animate-pulse"
                : "bg-teal-50 hover:bg-teal-100/80 text-[#006b5f] border-teal-100 hover:border-teal-200"
            }`}
            title="Ask by Voice (ChatGPT style)"
          >
            {isListening ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
          </button>
        )}
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

      {/* ChatGPT-style Voice Recognition Immersive Overlay */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-40 flex flex-col items-center justify-between p-8 text-white select-none"
          >
            {/* Header: Selected Language Context */}
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">
                  JanSathi Voice Assistant
                </span>
              </div>
              <div className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                {preferredLanguage || "English"}
              </div>
            </div>

            {/* Middle: Pulsating Ambient Voice Orb & Waves */}
            <div className="flex flex-col items-center justify-center space-y-6 my-auto">
              <div className="relative flex items-center justify-center w-40 h-40">
                {/* Concentric waves */}
                <div className="absolute inset-0 rounded-full bg-teal-500/10 animate-ping duration-1000" />
                <div className="absolute inset-4 rounded-full bg-teal-500/20 animate-pulse duration-700" />
                <div className="absolute inset-8 rounded-full bg-[#004d99]/30 animate-pulse" />
                
                {/* Core Microphone Button */}
                <button
                  onClick={() => stopListening(true)}
                  className="absolute w-24 h-24 bg-gradient-to-tr from-teal-500 to-[#004d99] rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-transform border border-white/20 cursor-pointer"
                >
                  <Mic className="w-10 h-10 text-white animate-bounce" />
                </button>
              </div>

              {/* Status prompt */}
              <div className="text-center space-y-1">
                <h3 className="text-lg font-extrabold tracking-tight text-white animate-pulse">
                  {preferredLanguage === "Hindi" || preferredLanguage === "हिन्दी (Hindi)" ? "बोलिए, मैं सुन रहा हूँ..." :
                   preferredLanguage === "Marathi" || preferredLanguage === "मराठी (Marathi)" ? "बोला, मी ऐकत आहे..." :
                   preferredLanguage === "Tamil" || preferredLanguage === "தமிழ் (Tamil)" ? "பேசுங்கள், நான் கேட்டுக்கொண்டிருக்கிறேன்..." :
                   preferredLanguage === "Telugu" || preferredLanguage === "తెలుగు (Telugu)" ? "మాట్లాడండి, నేను వింటున్నాను..." :
                   "Listening, please speak..."}
                </h3>
                <p className="text-xs text-gray-400 font-medium">
                  {preferredLanguage === "Hindi" || preferredLanguage === "हिन्दी (Hindi)" ? "जब आप बोलना समाप्त कर लें तो 'पूरा हुआ' पर क्लिक करें" :
                   preferredLanguage === "Marathi" || preferredLanguage === "मराठी (Marathi)" ? "तुम्ही बोलणे पूर्ण केल्यावर 'झाले' वर क्लिक करा" :
                   preferredLanguage === "Tamil" || preferredLanguage === "தமிழ் (Tamil)" ? "நீங்கள் பேசி முடித்ததும் 'முடிந்தது' என்பதை கிளிக் செய்யவும்" :
                   preferredLanguage === "Telugu" || preferredLanguage === "తెలుగు (Telugu)" ? "మీరు మాట్లాడటం ముగించినప్పుడు 'పూర్తయింది' క్లిక్ చేయండి" :
                   "Click 'Done' when you have finished speaking"}
                </p>
              </div>
            </div>

            {/* Transcript Area */}
            <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-4 min-h-[100px] flex flex-col justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">
                Live Transcription
              </span>
              <p className="text-sm font-medium leading-relaxed text-gray-200 italic">
                {voiceTranscript ? `"${voiceTranscript}"` : "..."}
              </p>
              <div className="h-2" />
            </div>

            {/* Bottom Actions */}
            <div className="w-full max-w-md flex gap-4 mt-6">
              <button
                type="button"
                onClick={() => stopListening(false)}
                className="flex-1 h-12 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors cursor-pointer border border-white/10"
              >
                {preferredLanguage === "Hindi" || preferredLanguage === "हिन्दी (Hindi)" ? "रद्द करें" :
                 preferredLanguage === "Marathi" || preferredLanguage === "मराठी (Marathi)" ? "रद्द करा" :
                 preferredLanguage === "Tamil" || preferredLanguage === "தமிழ் (Tamil)" ? "ரத்துசெய்" :
                 preferredLanguage === "Telugu" || preferredLanguage === "తెలుగు (Telugu)" ? "రద్దు చేయి" :
                 "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => stopListening(true)}
                disabled={!voiceTranscript.trim()}
                className="flex-1 h-12 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:bg-teal-500/40 text-slate-950 font-black text-sm shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>
                  {preferredLanguage === "Hindi" || preferredLanguage === "हिन्दी (Hindi)" ? "पूरा हुआ" :
                   preferredLanguage === "Marathi" || preferredLanguage === "मराठी (Marathi)" ? "झाले" :
                   preferredLanguage === "Tamil" || preferredLanguage === "தமிழ் (Tamil)" ? "முடிந்தது" :
                   preferredLanguage === "Telugu" || preferredLanguage === "తెలుగు (Telugu)" ? "పూర్తయింది" :
                   "Done"}
                </span>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
