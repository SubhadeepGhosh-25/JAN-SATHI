import React, { useState } from "react";
import { motion } from "motion/react";
import { ClipboardCheck, Sparkles, Sliders, Check, HelpCircle } from "lucide-react";
import { Scheme, UserProfile } from "../types";
import { useTranslation } from "../lib/translations";

interface EligibilityCheckerProps {
  userProfile: UserProfile;
  schemes: Scheme[];
  onApplyProfile: (profile: UserProfile) => void;
  onViewSchemeDetails: (scheme: Scheme) => void;
}

export default function EligibilityChecker({
  userProfile,
  schemes,
  onApplyProfile,
  onViewSchemeDetails
}: EligibilityCheckerProps) {
  const { t } = useTranslation(userProfile.preferredLanguage);
  const [age, setAge] = useState<number | "">(userProfile.age || "");
  const [state, setState] = useState<string>(userProfile.state || "");
  const [occupation, setOccupation] = useState<string>(userProfile.occupation || "");
  const [income, setIncome] = useState<number | "">(userProfile.income !== undefined ? userProfile.income : "");
  const [gender, setGender] = useState<string>(userProfile.gender || "");
  const [category, setCategory] = useState<string>(userProfile.category || "");
  const [education, setEducation] = useState<string>(userProfile.education || "");
  const [disability, setDisability] = useState<boolean>(userProfile.disability || false);

  const [matches, setMatches] = useState<Scheme[]>([]);
  const [isCalculated, setIsCalculated] = useState(false);

  // Helper for localized gender options
  const getLocalizedGender = (g: string) => {
    if (g === "Male") return userProfile.preferredLanguage === "Hindi" || userProfile.preferredLanguage === "हिन्दी (Hindi)" ? "पुरुष" : userProfile.preferredLanguage === "Marathi" || userProfile.preferredLanguage === "मराठी (Marathi)" ? "पुरुष" : userProfile.preferredLanguage === "Tamil" || userProfile.preferredLanguage === "தமிழ் (Tamil)" ? "ஆண்" : userProfile.preferredLanguage === "Telugu" || userProfile.preferredLanguage === "తెలుగు (Telugu)" ? "పురుషుడు" : "Male";
    if (g === "Female") return userProfile.preferredLanguage === "Hindi" || userProfile.preferredLanguage === "हिन्दी (Hindi)" ? "महिला" : userProfile.preferredLanguage === "Marathi" || userProfile.preferredLanguage === "मराठी (Marathi)" ? "महिला" : userProfile.preferredLanguage === "Tamil" || userProfile.preferredLanguage === "தமிழ் (Tamil)" ? "பெண்" : userProfile.preferredLanguage === "Telugu" || userProfile.preferredLanguage === "తెలుగు (Telugu)" ? "స్త్రీ" : "Female";
    return userProfile.preferredLanguage === "Hindi" || userProfile.preferredLanguage === "हिन्दी (Hindi)" ? "अन्य" : userProfile.preferredLanguage === "Marathi" || userProfile.preferredLanguage === "मराठी (Marathi)" ? "इतर" : userProfile.preferredLanguage === "Tamil" || userProfile.preferredLanguage === "தமிழ் (Tamil)" ? "மற்றவை" : userProfile.preferredLanguage === "Telugu" || userProfile.preferredLanguage === "తెలుగు (Telugu)" ? "ఇతర" : "Other";
  };

  const statesList = [
    "All States", "Andhra Pradesh", "Assam", "Bihar", "Delhi", "Gujarat", 
    "Karnataka", "Maharashtra", "Punjab", "Tamil Nadu", "Uttar Pradesh", "West Bengal"
  ];

  const occupationsList = [
    "Student", "Farmer", "Unemployed", "Self-Employed", "Private Sector Employee", "Govt Sector Employee", "Retired"
  ];

  const educationList = [
    "Below 10th", "Secondary", "Higher Secondary", "Graduate", "Post Graduate", "None"
  ];

  const categoriesList = [
    "Gen", "OBC", "SC", "ST", "EWS"
  ];

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedAge = age === "" ? 0 : Number(age);
    const parsedIncome = income === "" ? 0 : Number(income);

    if (!parsedAge || !state || !category || !gender || !occupation || !education) {
      alert(userProfile.preferredLanguage === "Hindi" || userProfile.preferredLanguage === "हिन्दी (Hindi)" ? "पात्रता की गणना करने के लिए कृपया सभी विवरण (आयु, राज्य, लिंग, श्रेणी, व्यवसाय, शिक्षा) निर्दिष्ट करें।" :
            userProfile.preferredLanguage === "Marathi" || userProfile.preferredLanguage === "मराठी (Marathi)" ? "पात्रता मोजण्यासाठी कृपया सर्व तपशील (वय, राज्य, लिंग, प्रवर्ग, व्यवसाय, शिक्षण) निवडा." :
            userProfile.preferredLanguage === "Tamil" || userProfile.preferredLanguage === "தமிழ் (Tamil)" ? "தகுதியைக் கணக்கிட அனைத்து விவரங்களையும் (வயது, மாநிலம், பாலினம், பிரிவு, தொழில், கல்வி) குறிப்பிடவும்." :
            userProfile.preferredLanguage === "Telugu" || userProfile.preferredLanguage === "తెలుగు (Telugu)" ? "అర్హతను లెక్కించడానికి దయచేసి అన్ని వివరాలను (వయస్సు, రాష్ట్రం, లింగం, వర్గం, వృత్తి, విద్య) పేర్కొనండి." :
            "Please specify all details (Age, State, Gender, Category, Occupation, Education) to calculate eligibility.");
      return;
    }

    // Check scheme eligibility matching algorithm
    const eligible = schemes.filter(scheme => {
      const rule = scheme.eligibility;

      // Age Check
      if (rule.minAge && parsedAge < rule.minAge) return false;
      if (rule.maxAge && parsedAge > rule.maxAge) return false;

      // Income Check
      if (rule.maxIncome && parsedIncome > rule.maxIncome) return false;

      // Gender Check
      if (rule.genders && rule.genders.length > 0 && !rule.genders.includes(gender)) return false;

      // Disability Check
      if (rule.disabilityRequired && !disability) return false;

      // Occupation Check
      if (rule.occupations && rule.occupations.length > 0 && !rule.occupations.includes(occupation)) return false;

      return true;
    });

    setMatches(eligible);
    setIsCalculated(true);

    // Sync state back to main app
    onApplyProfile({
      ...userProfile,
      age: parsedAge,
      state,
      occupation,
      income: parsedIncome,
      gender,
      category,
      education,
      disability
    });
  };

  return (
    <div className="space-y-8">
      {/* Introduction Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <Sliders className="text-[#004d99] w-6 h-6" />
          <span>{t("eligibility.title")}</span>
        </h2>
        <p className="text-gray-500 mt-1">
          {t("eligibility.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Eligibility Questionnaire Card */}
        <div className="lg:col-span-1 bg-white border border-gray-100 rounded-2xl shadow-sm p-6 h-fit">
          <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-50 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500 fill-current" />
            <span>{t("eligibility.profile")}</span>
          </h3>

          <form onSubmit={handleCheck} className="space-y-4">
            {/* Age */}
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">{t("eligibility.age")}</label>
              <input
                type="number"
                min={1}
                max={120}
                required
                value={age}
                onChange={(e) => setAge(e.target.value === "" ? "" : parseInt(e.target.value) || 0)}
                placeholder="e.g. 25"
                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#004d99] focus:ring-1 focus:ring-[#004d99]/20 outline-none"
              />
            </div>

            {/* State */}
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">{t("eligibility.state")}</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#004d99] focus:ring-1 focus:ring-[#004d99]/20 outline-none"
              >
                <option value="">{userProfile.preferredLanguage === "Hindi" || userProfile.preferredLanguage === "हिन्दी (Hindi)" ? "राज्य चुनें" : userProfile.preferredLanguage === "Marathi" || userProfile.preferredLanguage === "मराठी (Marathi)" ? "राज्य निवडा" : userProfile.preferredLanguage === "Tamil" || userProfile.preferredLanguage === "தமிழ் (Tamil)" ? "மாநிலத்தைத் தேர்ந்தெடுக்கவும்" : userProfile.preferredLanguage === "Telugu" || userProfile.preferredLanguage === "తెలుగు (Telugu)" ? "రాష్ట్రం ఎంచుకోండి" : "Select Resident State"}</option>
                {statesList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Occupation */}
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">{t("eligibility.occupation")}</label>
              <select
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                required
                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#004d99] focus:ring-1 focus:ring-[#004d99]/20 outline-none"
              >
                <option value="">{userProfile.preferredLanguage === "Hindi" || userProfile.preferredLanguage === "हिन्दी (Hindi)" ? "व्यवसाय चुनें" : userProfile.preferredLanguage === "Marathi" || userProfile.preferredLanguage === "मराठी (Marathi)" ? "व्यवसाय निवडा" : userProfile.preferredLanguage === "Tamil" || userProfile.preferredLanguage === "தமிழ் (Tamil)" ? "தொழிலைத் தேர்ந்தெடுக்கவும்" : userProfile.preferredLanguage === "Telugu" || userProfile.preferredLanguage === "తెలుగు (Telugu)" ? "వృత్తిని ఎంచుకోండి" : "Select Occupation"}</option>
                {occupationsList.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            {/* Annual Income */}
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">{t("eligibility.income")}</label>
              <input
                type="number"
                min={0}
                required
                value={income}
                onChange={(e) => setIncome(e.target.value === "" ? "" : parseInt(e.target.value) || 0)}
                placeholder="e.g. 150000"
                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#004d99] focus:ring-1 focus:ring-[#004d99]/20 outline-none"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">{t("eligibility.gender")}</label>
              <div className="grid grid-cols-3 gap-2">
                {["Male", "Female", "Other"].map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`h-10 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      gender === g 
                        ? "bg-[#004d99] text-white border-[#004d99]" 
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {getLocalizedGender(g)}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">{t("eligibility.category")}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#004d99] focus:ring-1 focus:ring-[#004d99]/20 outline-none"
              >
                <option value="">{userProfile.preferredLanguage === "Hindi" || userProfile.preferredLanguage === "हिन्दी (Hindi)" ? "श्रेणी चुनें" : userProfile.preferredLanguage === "Marathi" || userProfile.preferredLanguage === "मराठी (Marathi)" ? "प्रवर्ग निवडा" : userProfile.preferredLanguage === "Tamil" || userProfile.preferredLanguage === "தமிழ் (Tamil)" ? "பிரிவைத் தேர்ந்தெடுக்கவும்" : userProfile.preferredLanguage === "Telugu" || userProfile.preferredLanguage === "తెలుగు (Telugu)" ? "వర్గాన్ని ఎంచుకోండి" : "Select Social Category"}</option>
                {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Education */}
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">{t("eligibility.education")}</label>
              <select
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                required
                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#004d99] focus:ring-1 focus:ring-[#004d99]/20 outline-none"
              >
                <option value="">{userProfile.preferredLanguage === "Hindi" || userProfile.preferredLanguage === "हिन्दी (Hindi)" ? "शिक्षा स्तर चुनें" : userProfile.preferredLanguage === "Marathi" || userProfile.preferredLanguage === "मराठी (Marathi)" ? "शिक्षण पातळी निवडा" : userProfile.preferredLanguage === "Tamil" || userProfile.preferredLanguage === "தமிழ் (Tamil)" ? "கல்வித் தகுதியைத் தேர்ந்தெடுக்கவும்" : userProfile.preferredLanguage === "Telugu" || userProfile.preferredLanguage === "తెలుగు (Telugu)" ? "విద్యా స్థాయిని ఎంచుకోండి" : "Select Education Level"}</option>
                {educationList.map(ed => <option key={ed} value={ed}>{ed}</option>)}
              </select>
            </div>

            {/* Disability Toggle */}
            <div className="flex items-center justify-between py-2 border-t border-gray-50">
              <span className="text-xs font-bold text-gray-600">{t("eligibility.disabled")}</span>
              <button
                type="button"
                onClick={() => setDisability(!disability)}
                className={`w-12 h-6 rounded-full p-0.5 transition-colors relative cursor-pointer outline-none ${
                  disability ? "bg-green-500" : "bg-gray-200"
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${
                  disability ? "translate-x-6" : "translate-x-0"
                }`} />
              </button>
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-[#004d99] hover:bg-[#00366c] text-white rounded-lg text-sm font-semibold transition-colors mt-4 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <ClipboardCheck className="w-5 h-5" />
              <span>{t("eligibility.check_btn")}</span>
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-4">
          {!isCalculated ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center text-gray-400 flex flex-col items-center justify-center min-h-[350px]">
              <HelpCircle className="w-12 h-12 text-gray-300 mb-4 animate-bounce" />
              <h4 className="text-lg font-bold text-gray-700">{t("eligibility.awaiting")}</h4>
              <p className="text-sm text-gray-400 mt-1 max-w-[320px]">
                {t("eligibility.awaiting_desc")}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 text-green-800 p-4 rounded-2xl flex items-center gap-3">
                <Check className="w-6 h-6 text-green-600 bg-white rounded-full p-1 border border-green-200 shadow-sm shrink-0" />
                <p className="text-sm font-medium">
                  {t("eligibility.found_msg", { count: matches.length })}
                </p>
              </div>

              {matches.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-gray-500">
                  <p className="font-semibold text-lg">{t("eligibility.no_matches")}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {t("eligibility.no_matches_desc")}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matches.map(scheme => (
                    <motion.div
                      key={scheme.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div>
                        <span className="inline-block px-2 py-0.5 bg-blue-50 text-[#004d99] text-[10px] font-bold rounded uppercase tracking-wider mb-3">
                          {scheme.category}
                        </span>
                        <h4 className="text-base font-bold text-gray-900 mb-1 leading-snug">
                          {scheme.schemeName}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-3 mb-4">
                          {scheme.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-gray-50 flex items-center justify-between text-xs">
                        <span className="font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                          {t("eligibility.match_rate_100")}
                        </span>
                        <button
                          onClick={() => onViewSchemeDetails(scheme)}
                          className="text-[#004d99] font-bold hover:underline bg-transparent border-none cursor-pointer"
                        >
                          {t("eligibility.view_apply")}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
