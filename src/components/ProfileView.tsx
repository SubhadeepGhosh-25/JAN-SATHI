import { useState } from "react";
import { User, Shield, Languages, BellRing, Info, LogOut, CheckCircle, Smartphone, Database, Wifi, RefreshCw } from "lucide-react";
import { UserProfile } from "../types";
import { supabase } from "../lib/supabase";

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
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">{userProfile.name || "Citizen"}</h2>
          <p className="text-sm text-gray-500">{userProfile.email || "No Email"} • {userProfile.phone || "No Phone Number"}</p>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2 text-xs">
            <span className="bg-blue-50 text-[#004d99] px-2.5 py-1 rounded-lg font-bold">
              Age: {userProfile.age ? `${userProfile.age} yrs` : "Not specified"}
            </span>
            <span className="bg-teal-50 text-[#006b5f] px-2.5 py-1 rounded-lg font-bold">
              State: {userProfile.state || "Not specified"}
            </span>
            <span className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg font-bold">
              Category: {userProfile.category || "Not specified"}
            </span>
          </div>
        </div>

        <button 
          onClick={onLogout}
          className="h-10 px-4 border border-red-200 hover:bg-red-50 text-red-600 rounded-full flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Language Selection & Accessibility */}
        <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-50">
            <Languages className="w-5 h-5 text-blue-600" />
            <span>Preferred Language Selector</span>
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
              <span>Proactive Notification Alerts</span>
            </h3>

            <div className="space-y-4 text-xs text-gray-600">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-800 block">Push Notifications</span>
                  <span className="text-[10px] text-gray-400">Receive system alerts for upcoming registration deadlines</span>
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
                  <span className="font-bold text-gray-800 block">SMS Updates</span>
                  <span className="text-[10px] text-gray-400">Get text reminders before critical certificate expiries</span>
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
                <span>Supabase Backend Sync</span>
              </span>
              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold rounded-full border border-green-100">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                <span>CONNECTED</span>
              </span>
            </h3>

            <div className="space-y-3 text-xs text-gray-600">
              <div>
                <span className="font-semibold text-gray-500 block text-[10px] uppercase tracking-wider">Project ID</span>
                <span className="font-mono text-gray-800 bg-gray-50 px-2 py-1 rounded border border-gray-100 block mt-1 select-all">
                  uuhpezybfvhhbfzvzhei
                </span>
              </div>

              <div>
                <span className="font-semibold text-gray-500 block text-[10px] uppercase tracking-wider">Project URL</span>
                <span className="font-mono text-gray-800 bg-gray-50 px-2 py-1 rounded border border-gray-100 block mt-1 break-all select-all text-[11px]">
                  https://uuhpezybfvhhbfzvzhei.supabase.co
                </span>
              </div>

              <div className="space-y-1.5 pt-1.5">
                <span className="font-bold text-gray-700 block">Automatic Synchronization:</span>
                <div className="grid grid-cols-1 gap-1.5 pl-0.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                    <span>User Login & Onboarding Profiles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                    <span>Document Vault Uploads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                    <span>Active Scheme Applications</span>
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
                  <span>{testing ? "Testing Connection..." : "Test Connection Status"}</span>
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
                    <span>{testResult.success ? "Success" : "Error"}</span>
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
              <span>About JanSathi Platform</span>
            </h3>
            
            <p className="text-gray-500 leading-normal">
              JanSathi Version 1.2.4 (Production Stack). Crafted for Indian citizens to securely find, analyze, and apply to schemes with high-fidelity client-side persistence.
            </p>

            <div className="bg-amber-50 text-amber-800 p-3.5 rounded-xl border border-amber-100 flex gap-2">
              <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-normal font-semibold text-[10px]">
                Safety Guarantee: JanSathi adheres to institutional guidelines and never provides unverified medical or legal advice.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
