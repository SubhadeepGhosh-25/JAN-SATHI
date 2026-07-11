import { motion } from "motion/react";
import { 
  CheckCircle, Hourglass, ClipboardCheck, BookOpen, 
  Upload, Calendar, Award, MapPin, ArrowRight,
  Megaphone, CheckSquare, Bookmark, AlertCircle, Sparkles
} from "lucide-react";
import { Scheme, UserProfile, NotificationItem, Application } from "../types";
import { useTranslation } from "../lib/translations";

interface HomeProps {
  userProfile: UserProfile;
  eligibleSchemesCount: number;
  activeApplicationsCount: number;
  recommendedSchemes: Scheme[];
  notifications: NotificationItem[];
  savedSchemeIds: string[];
  onNavigate: (tab: string) => void;
  onViewSchemeDetails: (scheme: Scheme) => void;
  onToggleSaveScheme: (schemeId: string) => void;
}

export default function Home({
  userProfile,
  eligibleSchemesCount,
  activeApplicationsCount,
  recommendedSchemes,
  notifications,
  savedSchemeIds,
  onNavigate,
  onViewSchemeDetails,
  onToggleSaveScheme
}: HomeProps) {
  const { t } = useTranslation(userProfile.preferredLanguage);
  const isProfileIncomplete = !userProfile.age || !userProfile.state || !userProfile.category;
  
  // Localized profile strength string
  const strengthText = isProfileIncomplete 
    ? (userProfile.preferredLanguage === "Hindi" || userProfile.preferredLanguage === "हिन्दी (Hindi)" ? "ध्यान देने की आवश्यकता (20%)" : 
       userProfile.preferredLanguage === "Marathi" || userProfile.preferredLanguage === "मराठी (Marathi)" ? "लक्ष देण्याची गरज (२०%)" : 
       userProfile.preferredLanguage === "Tamil" || userProfile.preferredLanguage === "தமிழ் (Tamil)" ? "கவனம் தேவை (20%)" : 
       userProfile.preferredLanguage === "Telugu" || userProfile.preferredLanguage === "తెలుగు (Telugu)" ? "శ్రద్ధ అవసరం (20%)" : "Needs Attention (20%)")
    : (userProfile.preferredLanguage === "Hindi" || userProfile.preferredLanguage === "हिन्दी (Hindi)" ? "उत्कृष्ट (100%)" : 
       userProfile.preferredLanguage === "Marathi" || userProfile.preferredLanguage === "मराठी (Marathi)" ? "उत्कृष्ट (१००%)" : 
       userProfile.preferredLanguage === "Tamil" || userProfile.preferredLanguage === "தமிழ் (Tamil)" ? "மிக நன்று (100%)" : 
       userProfile.preferredLanguage === "Telugu" || userProfile.preferredLanguage === "తెలుగు (Telugu)" ? "అద్భుతం (100%)" : "Good (100%)");

  const profileStrength = strengthText;

  return (
    <div className="space-y-8 py-4">
      {/* Greeting Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            {t("home.hello")}, {userProfile.name ? userProfile.name.split(" ")[0] : (userProfile.preferredLanguage === "Hindi" || userProfile.preferredLanguage === "हिन्दी (Hindi)" ? "नागरिक" : userProfile.preferredLanguage === "Marathi" || userProfile.preferredLanguage === "मराठी (Marathi)" ? "नागरिक" : userProfile.preferredLanguage === "Tamil" || userProfile.preferredLanguage === "தமிழ் (Tamil)" ? "குடிமகன்" : userProfile.preferredLanguage === "Telugu" || userProfile.preferredLanguage === "తెలుగు (Telugu)" ? "పౌరుడు" : "Citizen")}
          </h2>
          <p className="text-gray-500 mt-1">{t("home.daily_update")}</p>
        </div>
        <div className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${
          isProfileIncomplete 
            ? "bg-amber-50 text-amber-700 border border-amber-100" 
            : "bg-[#004d99]/5 text-[#004d99]"
        }`}>
          <Sparkles className={`w-4 h-4 ${isProfileIncomplete ? "text-amber-600" : "text-[#004d99]"}`} />
          <span>{t("home.profile_strength")}: {profileStrength}</span>
        </div>
      </section>

      {/* Profile Incomplete Attention Banner */}
      {isProfileIncomplete && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 text-amber-800 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm"
        >
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-amber-600 animate-pulse" />
            <div>
              <h4 className="font-bold text-sm text-amber-900">{t("home.incomplete_banner_title")}</h4>
              <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                {t("home.incomplete_banner_desc")}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate("eligibility")}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer whitespace-nowrap shrink-0 self-end sm:self-center"
          >
            {t("home.setup_profile_now")}
          </button>
        </motion.div>
      )}

      {/* Eligibility & Application status Bento */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Eligibility Banner */}
        <div className="md:col-span-2 bg-[#004d99] text-white rounded-2xl p-6 relative overflow-hidden shadow-md flex flex-col justify-between min-h-[180px]">
          <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-bl-full -mr-8 -mt-8 pointer-events-none"></div>
          <div className="absolute bottom-0 right-16 w-20 h-20 bg-white/5 rounded-full -mb-4 pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="text-[#8df5e4] w-5 h-5 fill-current" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#d6e3ff]">
                {t("home.eligibility_status")}
              </span>
            </div>
            <h3 className="text-4xl md:text-5xl font-bold tracking-tight">
              {t("home.schemes_count", { count: eligibleSchemesCount })}
            </h3>
            <p className="text-[#a9c7ff] text-sm mt-2 max-w-[450px]">
              {t("home.schemes_count_desc")}
            </p>
          </div>

          <div className="relative z-10 mt-6 flex justify-end">
            <button 
              onClick={() => onNavigate("schemes")}
              className="bg-white text-[#004d99] font-bold text-sm px-5 py-3 rounded-full flex items-center gap-2 hover:bg-gray-100 transition-colors shadow-sm cursor-pointer"
            >
              <span>{t("home.view_eligible_schemes")}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Active Applications Status */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col justify-center items-center text-center shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-[#006b5f]/5 pointer-events-none"></div>
          <div className="w-14 h-14 bg-[#8df5e4]/20 text-[#007165] rounded-full flex items-center justify-center mb-4 relative z-10">
            <Hourglass className="w-7 h-7" />
          </div>
          <h4 className="text-xl font-bold text-gray-900 relative z-10">
            {t("home.active_applications", { count: activeApplicationsCount })}
          </h4>
          <p className="text-sm text-gray-500 mt-1 relative z-10">
            {t("home.applications_processing")}
          </p>
          <button 
            onClick={() => onNavigate("documents")}
            className="mt-5 text-[#004d99] font-bold text-sm hover:underline hover:text-[#00366c] relative z-10 cursor-pointer bg-transparent border-none"
          >
            {t("home.track_status")}
          </button>
        </div>
      </section>

      {/* Quick Actions Grid */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900">{t("home.quick_actions")}</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          <button 
            onClick={() => onNavigate("eligibility")}
            className="flex flex-col items-center p-4 bg-white rounded-2xl border border-gray-50 shadow-sm hover:bg-gray-50 transition-colors cursor-pointer group"
          >
            <div className="w-12 h-12 bg-blue-50 text-[#004d99] rounded-full flex items-center justify-center group-hover:bg-[#004d99] group-hover:text-white transition-colors">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-gray-600 mt-3 text-center leading-tight">
              {t("action.check_eligibility")}
            </span>
          </button>

          <button 
            onClick={() => onNavigate("chat")}
            className="flex flex-col items-center p-4 bg-white rounded-2xl border border-gray-50 shadow-sm hover:bg-gray-50 transition-colors cursor-pointer group relative"
          >
            <div className="w-12 h-12 bg-teal-50 text-[#006b5f] rounded-full flex items-center justify-center group-hover:bg-[#006b5f] group-hover:text-white transition-colors">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="absolute top-2 right-4 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
            <span className="text-xs font-semibold text-gray-600 mt-3 text-center leading-tight">
              {t("action.ask_ai")}
            </span>
          </button>

          <button 
            onClick={() => onNavigate("documents")}
            className="flex flex-col items-center p-4 bg-white rounded-2xl border border-gray-50 shadow-sm hover:bg-gray-50 transition-colors cursor-pointer group"
          >
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Upload className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-gray-600 mt-3 text-center leading-tight">
              {t("action.upload_docs")}
            </span>
          </button>

          <button 
            onClick={() => onNavigate("reminders")}
            className="flex flex-col items-center p-4 bg-white rounded-2xl border border-gray-50 shadow-sm hover:bg-gray-50 transition-colors cursor-pointer group relative"
          >
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-gray-600 mt-3 text-center leading-tight">
              {t("action.view_deadlines")}
            </span>
          </button>

          <button 
            onClick={() => onNavigate("schemes")}
            className="flex flex-col items-center p-4 bg-white rounded-2xl border border-gray-50 shadow-sm hover:bg-gray-50 transition-colors cursor-pointer group"
          >
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
              <Award className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-gray-600 mt-3 text-center leading-tight">
              {t("action.new_schemes")}
            </span>
          </button>

          <button 
            onClick={() => onNavigate("profile")}
            className="flex flex-col items-center p-4 bg-white rounded-2xl border border-gray-50 shadow-sm hover:bg-gray-50 transition-colors cursor-pointer group"
          >
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <MapPin className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-gray-600 mt-3 text-center leading-tight">
              {t("action.nearby_offices")}
            </span>
          </button>
        </div>
      </section>

      {/* Recommended Schemes Carousel */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <h3 className="text-xl font-bold text-gray-900">{t("home.recommended")}</h3>
          <button 
            onClick={() => onNavigate("schemes")}
            className="text-sm font-semibold text-[#004d99] hover:underline cursor-pointer bg-transparent border-none"
          >
            {t("home.see_all")}
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-200 snap-x">
          {recommendedSchemes.map((scheme) => {
            const isSaved = savedSchemeIds.includes(scheme.id);
            return (
              <div 
                key={scheme.id}
                className="min-w-[280px] md:min-w-[320px] bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between snap-start hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-2.5 py-1 bg-blue-50 text-[#004d99] text-xs font-bold rounded-lg uppercase tracking-wider">
                      {scheme.category.split(" ")[0]}
                    </span>
                    <button 
                      onClick={() => onToggleSaveScheme(scheme.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer bg-transparent border-none"
                    >
                      <Bookmark className={`w-5 h-5 ${isSaved ? "text-red-500 fill-current" : ""}`} />
                    </button>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                    {scheme.schemeName}
                  </h4>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                    {scheme.description}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                  <span className="text-xs font-bold text-[#006b5f]">{t("home.match_rate", { rate: 95 })}</span>
                  <button 
                    onClick={() => onViewSchemeDetails(scheme)}
                    className="text-[#004d99] font-bold text-sm hover:underline cursor-pointer bg-transparent border-none"
                  >
                    {t("home.view_details")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent Updates Notifications */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900">{t("home.recent_updates")}</h3>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
          {notifications.slice(0, 3).map((item) => (
            <div 
              key={item.id} 
              className={`p-4 flex gap-4 items-start hover:bg-gray-50/50 transition-colors cursor-pointer ${
                item.unread ? "bg-[#004d99]/5" : ""
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                item.type === 'campaign' ? "bg-blue-100 text-[#004d99]" :
                item.type === 'task_alt' ? "bg-green-100 text-green-600" :
                item.type === 'event' ? "bg-red-100 text-red-600" : "bg-purple-100 text-purple-600"
              }`}>
                {item.type === 'campaign' && <Megaphone className="w-5 h-5" />}
                {item.type === 'task_alt' && <CheckSquare className="w-5 h-5" />}
                {item.type === 'event' && <Calendar className="w-5 h-5" />}
                {item.type === 'new_releases' && <AlertCircle className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center gap-2 mb-1">
                  <h4 className="text-sm font-bold text-gray-900 truncate">
                    {item.title}
                  </h4>
                  <span className="text-xs text-gray-400 shrink-0">{item.time}</span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-1">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
