import { useState } from "react";
import { User, Shield, Languages, BellRing, Info, LogOut, CheckCircle, Smartphone } from "lucide-react";
import { UserProfile } from "../types";

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
          {userProfile.name.charAt(0)}
        </div>

        <div className="flex-1 text-center md:text-left space-y-1">
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">{userProfile.name}</h2>
          <p className="text-sm text-gray-500">{userProfile.email} • {userProfile.phone}</p>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2 text-xs">
            <span className="bg-blue-50 text-[#004d99] px-2.5 py-1 rounded-lg font-bold">Age: {userProfile.age}</span>
            <span className="bg-teal-50 text-[#006b5f] px-2.5 py-1 rounded-lg font-bold">State: {userProfile.state}</span>
            <span className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg font-bold">Category: {userProfile.category}</span>
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
