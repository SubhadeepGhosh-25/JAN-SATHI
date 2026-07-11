import { useState } from "react";
import { User, Shield, Languages, BellRing, Info, LogOut, CheckCircle, Smartphone, Database, Wifi, RefreshCw } from "lucide-react";
import { UserProfile } from "../types";
import { supabase } from "../lib/supabase";
import { useTranslation } from "../lib/translations";

interface ProfileViewProps {
  userProfile: UserProfile;
  onUpdateLanguage: (lang: string) => void;
  onLogout: () => void;
}

export default function ProfileView({
  userProfile,
  onUpdateLanguage,
  onLogout
}: ProfileViewProps) {
  const { t } = useTranslation(userProfile.preferredLanguage);
  const [selectedLanguage, setSelectedLanguage] = useState(userProfile.preferredLanguage || "English");
  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);

  // Supabase test connection state
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const testSupabaseConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const start = Date.now();
      const { error } = await supabase.from("profiles").select("id").limit(1);
      const duration = Date.now() - start;

      // PGRST116 (no row found) or relation missing table means the database/client/URL/anon_key are fine!
      if (error && error.code !== "PGRST116" && !error.message.includes("relation") && !error.message.includes("does not exist")) {
        setTestResult({
          success: false,
          message: `Error: ${error.message} (Code: ${error.code})`
        });
      } else {
        setTestResult({
          success: true,
          message: `Active! Handshake completed with Supabase endpoint successfully in ${duration}ms.`
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Failed to connect: ${err?.message || "Unknown error"}`
      });
    } finally {
      setTesting(false);
    }
  };

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    onUpdateLanguage(lang);
  };

  const languagesList = [
    { code: "English", nativeName: "English" },
    { code: "Hindi", nativeName: "हिन्दी (Hindi)" },
    { code: "Marathi", nativeName: "मराठी (Marathi)" },
    { code: "Tamil", nativeName: "தமிழ் (Tamil)" },
    { code: "Telugu", nativeName: "తెలుగు (Telugu)" }
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      {/* Header and User profile summaries */}
      <section className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-bl-full pointer-events-none"></div>
        
        {/* User avatar mockup */}
        <div className="w-20 h-20 bg-[#004d99] rounded-2xl flex items-center justify-center text-white text-3xl font-bold shrink-0 shadow-md">
          {userProfile.name ? userProfile.name.charAt(0) : "C"}
        </div>

        <div className="flex-1 text-center md:text-left space-y-1">
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">{userProfile.name || (userProfile.preferredLanguage === "Hindi" || userProfile.preferredLanguage === "हिन्दी (Hindi)" ? "नागरिक" : userProfile.preferredLanguage === "Marathi" || userProfile.preferredLanguage === "मराठी (Marathi)" ? "नागरिक" : userProfile.preferredLanguage === "Tamil" || userProfile.preferredLanguage === "தமிழ் (Tamil)" ? "குடிமகன்" : userProfile.preferredLanguage === "Telugu" || userProfile.preferredLanguage === "తెలుగు (Telugu)" ? "పౌరుడు" : "Citizen")}</h2>
          <p className="text-sm text-gray-500">{userProfile.email || "No Email"} • {userProfile.phone || "No Phone Number"}</p>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2 text-xs">
            <span className="bg-blue-50 text-[#004d99] px-2.5 py-1 rounded-lg font-bold">
              {userProfile.preferredLanguage === "Hindi" || userProfile.preferredLanguage === "हिन्दी (Hindi)" ? `आयु: ${userProfile.age || "निर्दिष्ट नहीं"} वर्ष` :
               userProfile.preferredLanguage === "Marathi" || userProfile.preferredLanguage === "मराठी (Marathi)" ? `वय: ${userProfile.age || "निवडलेले नाही"} वर्षे` :
               userProfile.preferredLanguage === "Tamil" || userProfile.preferredLanguage === "தமிழ் (Tamil)" ? `வயது: ${userProfile.age || "குறிப்பிடப்படவில்லை"}` :
               userProfile.preferredLanguage === "Telugu" || userProfile.preferredLanguage === "తెలుగు (Telugu)" ? `వయస్సు: ${userProfile.age || "పేర్కొనలేదు"} సం.` :
               `Age: ${userProfile.age ? `${userProfile.age} yrs` : "Not specified"}`}
            </span>
            <span className="bg-teal-50 text-[#006b5f] px-2.5 py-1 rounded-lg font-bold">
              {userProfile.preferredLanguage === "Hindi" || userProfile.preferredLanguage === "हिन्दी (Hindi)" ? `राज्य: ${userProfile.state || "निर्दिष्ट नहीं"}` :
               userProfile.preferredLanguage === "Marathi" || userProfile.preferredLanguage === "मराठी (Marathi)" ? `राज्य: ${userProfile.state || "निवडलेले नाही"}` :
               userProfile.preferredLanguage === "Tamil" || userProfile.preferredLanguage === "தமிழ் (Tamil)" ? `மாநிலம்: ${userProfile.state || "குறிப்பிடப்படவில்லை"}` :
               userProfile.preferredLanguage === "Telugu" || userProfile.preferredLanguage === "తెలుగు (Telugu)" ? `రాష్ట్రం: ${userProfile.state || "పేర్కొనలేదు"}` :
               `State: ${userProfile.state || "Not specified"}`}
            </span>
            <span className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg font-bold">
              {userProfile.preferredLanguage === "Hindi" || userProfile.preferredLanguage === "हिन्दी (Hindi)" ? `श्रेणी: ${userProfile.category || "निर्दिष्ट नहीं"}` :
               userProfile.preferredLanguage === "Marathi" || userProfile.preferredLanguage === "मराठी (Marathi)" ? `प्रवर्ग: ${userProfile.category || "निवडलेले नाही"}` :
               userProfile.preferredLanguage === "Tamil" || userProfile.preferredLanguage === "தமிழ் (Tamil)" ? `பிரிவு: ${userProfile.category || "குறிப்பிடப்படவில்லை"}` :
               userProfile.preferredLanguage === "Telugu" || userProfile.preferredLanguage === "తెలుగు (Telugu)" ? `వర్గం: ${userProfile.category || "పేర్కొనలేదు"}` :
               `Category: ${userProfile.category || "Not specified"}`}
            </span>
          </div>
        </div>

        <button 
          onClick={onLogout}
          className="h-10 px-4 border border-red-200 hover:bg-red-50 text-red-600 rounded-full flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer bg-transparent"
        >
          <LogOut className="w-4 h-4" />
          <span>{t("profile.sign_out")}</span>
        </button>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Language Selection & Accessibility */}
        <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-50">
            <Languages className="w-5 h-5 text-blue-600" />
            <span>{t("profile.language_title")}</span>
          </h3>

          <div className="grid grid-cols-1 gap-2 text-xs">
            {languagesList.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full h-11 px-4 border rounded-xl flex items-center justify-between font-semibold transition-all cursor-pointer ${
                  selectedLanguage === lang.code
                    ? "bg-blue-50 border-[#004d99] text-[#004d99]"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>{lang.nativeName}</span>
                {selectedLanguage === lang.code && <CheckCircle className="w-4 h-4 text-[#004d99]" />}
              </button>
            ))}
          </div>
        </section>

        {/* Notifications and Safety Warnings settings */}
        <div className="space-y-6">
          {/* Notifications Preferences */}
          <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-50">
              <BellRing className="w-5 h-5 text-teal-600" />
              <span>{userProfile.preferredLanguage === "Hindi" || userProfile.preferredLanguage === "हिन्दी (Hindi)" ? "सक्रिय सूचना अलर्ट" :
                    userProfile.preferredLanguage === "Marathi" || userProfile.preferredLanguage === "मराठी (Marathi)" ? "सक्रिय सूचना अलर्ट" :
                    userProfile.preferredLanguage === "Tamil" || userProfile.preferredLanguage === "தமிழ் (Tamil)" ? "செயலில் உள்ள அறிவிப்புகள்" :
                    userProfile.preferredLanguage === "Telugu" || userProfile.preferredLanguage === "తెలుగు (Telugu)" ? "యాక్టివ్ నోటిఫికేషన్ హెచ్చరికలు" :
                    "Proactive Notification Alerts"}</span>
            </h3>

            <div className="space-y-4 text-xs text-gray-600">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-800 block">
                    {userProfile.preferredLanguage === "Hindi" || userProfile.preferredLanguage === "हिन्दी (Hindi)" ? "पुश नोटिफिकेशन" :
                     userProfile.preferredLanguage === "Marathi" || userProfile.preferredLanguage === "मराठी (Marathi)" ? "पुश नोटिफिकेशन" :
                     userProfile.preferredLanguage === "Tamil" || userProfile.preferredLanguage === "தமிழ் (Tamil)" ? "புஷ் அறிவிப்புகள்" :
                     userProfile.preferredLanguage === "Telugu" || userProfile.preferredLanguage === "తెలుగు (Telugu)" ? "పుష్ నోటిఫికేషన్లు" :
                     "Push Notifications"}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {userProfile.preferredLanguage === "Hindi" || userProfile.preferredLanguage === "हिन्दी (Hindi)" ? "आगामी पंजीकरण समय सीमा के लिए सिस्टम अलर्ट प्राप्त करें" :
                     userProfile.preferredLanguage === "Marathi" || userProfile.preferredLanguage === "मराठी (Marathi)" ? "आगामी नोंदणी अंतिम मुदतीसाठी सिस्टम अलर्ट मिळवा" :
                     userProfile.preferredLanguage === "Tamil" || userProfile.preferredLanguage === "தமிழ் (Tamil)" ? "வரவிருக்கும் பதிவு காலக்கெடுவுக்கான அறிவிப்புகளைப் பெறுங்கள்" :
                     userProfile.preferredLanguage === "Telugu" || userProfile.preferredLanguage === "తెలుగు (Telugu)" ? "రాబోయే రిజిస్ట్రేషన్ గడువుల కోసం సిస్టమ్ హెచ్చరికలను పొందండి" :
                     "Receive system alerts for upcoming registration deadlines"}
                  </span>
                </div>
                <button
                  onClick={() => setPushEnabled(!pushEnabled)}
                  className={`w-11 h-6 rounded-full p-0.5 relative transition-colors ${
                    pushEnabled ? "bg-green-500" : "bg-gray-200"
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${
                    pushEnabled ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-800 block">
                    {userProfile.preferredLanguage === "Hindi" || userProfile.preferredLanguage === "हिन्दी (Hindi)" ? "SMS अपडेट" :
                     userProfile.preferredLanguage === "Marathi" || userProfile.preferredLanguage === "मराठी (Marathi)" ? "SMS अपडेट" :
                     userProfile.preferredLanguage === "Tamil" || userProfile.preferredLanguage === "தமிழ் (Tamil)" ? "SMS செய்திகள்" :
                     userProfile.preferredLanguage === "Telugu" || userProfile.preferredLanguage === "తెలుగు (Telugu)" ? "SMS అప్‌డేట్లు" :
                     "SMS Updates"}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {userProfile.preferredLanguage === "Hindi" || userProfile.preferredLanguage === "हिन्दी (Hindi)" ? "महत्वपूर्ण प्रमाणपत्र समाप्ति से पहले अनुस्मारक प्राप्त करें" :
                     userProfile.preferredLanguage === "Marathi" || userProfile.preferredLanguage === "मराठी (Marathi)" ? "महत्त्वाच्या प्रमाणपत्रांच्या मुदत संपण्यापूर्वी स्मरणपत्र मिळवा" :
                     userProfile.preferredLanguage === "Tamil" || userProfile.preferredLanguage === "தமிழ் (Tamil)" ? "சான்றிதழ் காலாவதியாகும் முன் குறுஞ்செய்தி நினைவூட்டல்களைப் பெறுங்கள்" :
                     userProfile.preferredLanguage === "Telugu" || userProfile.preferredLanguage === "తెలుగు (Telugu)" ? "ముఖ్యమైన ధృవీకరణ పత్రాలు ముగిసే లోపు వచన రిమైండర్‌లను పొందండి" :
                     "Get text reminders before critical certificate expiries"}
                  </span>
                </div>
                <button
                  onClick={() => setSmsEnabled(!smsEnabled)}
                  className={`w-11 h-6 rounded-full p-0.5 relative transition-colors ${
                    smsEnabled ? "bg-green-500" : "bg-gray-200"
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${
                    smsEnabled ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
              </div>
            </div>
          </section>

          {/* Supabase Connection Status Card */}
          <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center justify-between pb-2 border-b border-gray-50">
              <span className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600 animate-pulse" />
                <span>{t("profile.sync_title")}</span>
              </span>
              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold rounded-full border border-green-100">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                <span>{t("profile.connected")}</span>
              </span>
            </h3>

            <div className="space-y-3 text-xs text-gray-600">
              <div>
                <span className="font-semibold text-gray-500 block text-[10px] uppercase tracking-wider">{t("profile.project_id")}</span>
                <span className="font-mono text-gray-800 bg-gray-50 px-2 py-1 rounded border border-gray-100 block mt-1 select-all">
                  uuhpezybfvhhbfzvzhei
                </span>
              </div>

              <div>
                <span className="font-semibold text-gray-500 block text-[10px] uppercase tracking-wider">{t("profile.project_url")}</span>
                <span className="font-mono text-gray-800 bg-gray-50 px-2 py-1 rounded border border-gray-100 block mt-1 break-all select-all text-[11px]">
                  https://uuhpezybfvhhbfzvzhei.supabase.co
                </span>
              </div>

              <div className="space-y-1.5 pt-1.5">
                <span className="font-bold text-gray-700 block">{t("profile.auto_sync")}</span>
                <div className="grid grid-cols-1 gap-1.5 pl-0.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                    <span>
                      {userProfile.preferredLanguage === "Hindi" || userProfile.preferredLanguage === "हिन्दी (Hindi)" ? "उपयोगकर्ता लॉगिन और ऑनबोर्डिंग प्रोफ़ाइल" :
                       userProfile.preferredLanguage === "Marathi" || userProfile.preferredLanguage === "मराठी (Marathi)" ? "वापरकर्ता लॉगिन आणि ऑनबोर्डिंग प्रोफाइल" :
                       userProfile.preferredLanguage === "Tamil" || userProfile.preferredLanguage === "தமிழ் (Tamil)" ? "பயனர் உள்நுழைவு & சுயவிவரங்கள்" :
                       userProfile.preferredLanguage === "Telugu" || userProfile.preferredLanguage === "తెలుగు (Telugu)" ? "వినియోగదారు లాగిన్ & ఆన్‌బోర్డింగ్ ప్రొఫైల్స్" :
                       "User Login & Onboarding Profiles"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                    <span>
                      {userProfile.preferredLanguage === "Hindi" || userProfile.preferredLanguage === "हिन्दी (Hindi)" ? "दस्तावेज़ तिजोरी अपलोड" :
                       userProfile.preferredLanguage === "Marathi" || userProfile.preferredLanguage === "मराठी (Marathi)" ? "कागदपत्र तिजोरी अपलोड" :
                       userProfile.preferredLanguage === "Tamil" || userProfile.preferredLanguage === "தமிழ் (Tamil)" ? "ஆவண பதிவேற்றங்கள்" :
                       userProfile.preferredLanguage === "Telugu" || userProfile.preferredLanguage === "తెలుగు (Telugu)" ? "పత్రాల భండాగారం అప్‌లోడ్లు" :
                       "Document Vault Uploads"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                    <span>
                      {userProfile.preferredLanguage === "Hindi" || userProfile.preferredLanguage === "हिन्दी (Hindi)" ? "सक्रिय योजना आवेदन" :
                       userProfile.preferredLanguage === "Marathi" || userProfile.preferredLanguage === "मराठी (Marathi)" ? "सक्रिय योजना अर्ज" :
                       userProfile.preferredLanguage === "Tamil" || userProfile.preferredLanguage === "தமிழ் (Tamil)" ? "செயலில் உள்ள திட்ட விண்ணப்பங்கள்" :
                       userProfile.preferredLanguage === "Telugu" || userProfile.preferredLanguage === "తెలుగు (Telugu)" ? "యాక్టివ్ పథకాల దరఖాస్తులు" :
                       "Active Scheme Applications"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={testSupabaseConnection}
                  disabled={testing}
                  className="w-full h-10 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 text-gray-500 ${testing ? "animate-spin" : ""}`} />
                  <span>{testing ? (userProfile.preferredLanguage === "Hindi" || userProfile.preferredLanguage === "हिन्दी (Hindi)" ? "कनेक्शन का परीक्षण किया जा रहा है..." : "Testing...") : t("profile.test_connection")}</span>
                </button>
              </div>

              {testResult && (
                <div className={`p-3 rounded-xl border text-[11px] leading-relaxed transition-all ${
                  testResult.success 
                    ? "bg-green-50/70 border-green-100 text-green-800" 
                    : "bg-red-50 border-red-100 text-red-800"
                }`}>
                  <div className="font-bold flex items-center gap-1.5 mb-0.5">
                    <Wifi className="w-3.5 h-3.5" />
                    <span>{testResult.success ? (userProfile.preferredLanguage === "Hindi" || userProfile.preferredLanguage === "हिन्दी (Hindi)" ? "सफलता" : "Success") : "Error"}</span>
                  </div>
                  <p>{testResult.message}</p>
                </div>
              )}
            </div>
          </section>

          {/* About JanSathi & Secure Information Disclaimer */}
          <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-3 text-xs">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 pb-1">
              <Info className="w-4 h-4 text-gray-400" />
              <span>{t("profile.about_title")}</span>
            </h3>
            
            <p className="text-gray-500 leading-normal">
              {userProfile.preferredLanguage === "Hindi" || userProfile.preferredLanguage === "हिन्दी (Hindi)" ? "जनसाथी संस्करण 1.2.4 (उत्पादन स्टैक)। भारतीय नागरिकों के लिए उच्च निष्ठा क्लाइंट-साइड दृढ़ता के साथ योजनाओं को सुरक्षित रूप से खोजने, विश्लेषण करने और आवेदन करने के लिए तैयार किया गया है।" :
               userProfile.preferredLanguage === "Marathi" || userProfile.preferredLanguage === "मराठी (Marathi)" ? "जनसाथी आवृत्ती १.२.४ (प्रॉडक्शन स्टॅक). भारतीय नागरिकांना योजना शोधणे, विश्लेषण करणे आणि सुरक्षितपणे अर्ज करण्यासाठी डिझाइन केलेले आहे." :
               userProfile.preferredLanguage === "Tamil" || userProfile.preferredLanguage === "தமிழ் (Tamil)" ? "ஜன்சாதி பதிப்பு 1.2.4 (தயாரிப்பு அடுக்கு). இந்திய குடிமக்கள் திட்டங்களை பாதுகாப்பாக கண்டறிய, பகுப்பாய்வு செய்ய மற்றும் விண்ணப்பிக்க வடிவமைக்கப்பட்டுள்ளது." :
               userProfile.preferredLanguage === "Telugu" || userProfile.preferredLanguage === "తెలుగు (Telugu)" ? "జనసాతీ వెర్షన్ 1.2.4 (ప్రొడక్షన్ స్టాక్). భారతీయ పౌరులు సురక్షితంగా పథకాలను కనుగొనడానికి, విశ్లేషించడానికి మరియు దరఖాస్తు చేసుకోవడానికి రూపొందించబడింది." :
               "JanSathi Version 1.2.4 (Production Stack). Crafted for Indian citizens to securely find, analyze, and apply to schemes with high-fidelity client-side persistence."}
            </p>

            <div className="bg-amber-50 text-amber-800 p-3.5 rounded-xl border border-amber-100 flex gap-2">
              <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-normal font-semibold text-[10px]">
                {userProfile.preferredLanguage === "Hindi" || userProfile.preferredLanguage === "हिन्दी (Hindi)" ? "सुरक्षा गारंटी: जनसाथी संस्थागत दिशानिर्देशों का पालन करता है और कभी भी असत्यापित चिकित्सा या कानूनी सलाह प्रदान नहीं करता है।" :
                 userProfile.preferredLanguage === "Marathi" || userProfile.preferredLanguage === "मराठी (Marathi)" ? "सुरक्षा हमी: जनसाथी संस्थात्मक मार्गदर्शक तत्त्वांचे पालन करते आणि कधीही असत्यापित वैद्यकीय किंवा कायदेशीर सल्ला देत नाही." :
                 userProfile.preferredLanguage === "Tamil" || userProfile.preferredLanguage === "தமிழ் (Tamil)" ? "பாதுகாப்பு உத்தரவாதம்: ஜன்சாதி நிறுவன வழிகாட்டுதல்களைப் பின்பற்றுகிறது மற்றும் ஒருபோதும் சரிபார்க்கப்படாத மருத்துவ அல்லது சட்ட ஆலோசனைகளை வழங்காது." :
                 userProfile.preferredLanguage === "Telugu" || userProfile.preferredLanguage === "తెలుగు (Telugu)" ? "భద్రతా హామీ: జనసాతీ సంస్థాగత మార్గదర్శకాలను అనుసరిస్తుంది మరియు ధృవీకరించబడని వైద్య లేదా చట్టపరమైన సలహాలను ఎప్పటికీ అందించదు." :
                 "Safety Guarantee: JanSathi adheres to institutional guidelines and never provides unverified medical or legal advice."}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
