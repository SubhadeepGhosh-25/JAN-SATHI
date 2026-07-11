import React, { useState } from "react";
import { motion } from "motion/react";
import { Users, Plus, Trash2, Heart, Award, Sparkles, CheckCircle } from "lucide-react";
import { FamilyMember, Scheme } from "../types";
import { useTranslation } from "../lib/translations";

interface FamilyProfilesProps {
  familyMembers: FamilyMember[];
  onAddFamilyMember: (member: FamilyMember) => void;
  onDeleteFamilyMember: (memberId: string) => void;
  allSchemes: Scheme[];
  onViewSchemeDetails: (scheme: Scheme) => void;
  preferredLanguage?: string;
}

export default function FamilyProfiles({
  familyMembers,
  onAddFamilyMember,
  onDeleteFamilyMember,
  allSchemes,
  onViewSchemeDetails,
  preferredLanguage
}: FamilyProfilesProps) {
  const { t } = useTranslation(preferredLanguage);
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("Parent");
  const [age, setAge] = useState(62);
  const [gender, setGender] = useState("Male");
  const [occupation, setOccupation] = useState("Retired");
  const [income, setIncome] = useState(50000);
  const [category, setCategory] = useState("OBC");
  const [education, setEducation] = useState("Secondary");
  const [disability, setDisability] = useState(false);

  const relationships = ["Parent", "Grandparent", "Child", "Spouse", "Sibling"];
  const occupations = ["Student", "Farmer", "Unemployed", "Self-Employed", "Retired", "Private Sector Employee"];
  const educations = ["Secondary", "Higher Secondary", "Graduate", "Below 10th", "None"];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newMember: FamilyMember = {
      id: `fam-${Date.now()}`,
      name,
      relationship,
      age,
      gender,
      occupation,
      income,
      category,
      education,
      disability,
      state: "Delhi"
    };

    onAddFamilyMember(newMember);
    setName("");
    setShowAddForm(false);
  };

  // Helper to calculate eligible schemes for a specific family member
  const getEligibleSchemesForMember = (member: FamilyMember) => {
    return allSchemes.filter(scheme => {
      const rule = scheme.eligibility;
      if (rule.minAge && member.age < rule.minAge) return false;
      if (rule.maxAge && member.age > rule.maxAge) return false;
      if (rule.maxIncome && member.income > rule.maxIncome) return false;
      if (rule.genders && rule.genders.length > 0 && !rule.genders.includes(member.gender)) return false;
      if (rule.disabilityRequired && !member.disability) return false;
      return true;
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-[#004d99] w-6 h-6" />
            <span>{t("family.title")}</span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {t("family.subtitle")}
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="h-10 px-4 bg-[#004d99] hover:bg-[#00366c] text-white rounded-full flex items-center gap-1.5 text-sm font-semibold transition-colors shadow-sm cursor-pointer bg-transparent"
        >
          <Plus className="w-4 h-4" />
          <span>{t("family.add_btn")}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left add member form */}
        {showAddForm && (
          <div className="lg:col-span-1 bg-white border border-gray-100 p-6 rounded-2xl shadow-sm h-fit space-y-4">
            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-50 pb-2 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#004d99]" />
              <span>{t("family.configure")}</span>
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              {/* Name */}
              <div>
                <label className="font-bold text-gray-600 block mb-1">{t("family.name")}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:border-[#004d99] outline-none"
                />
              </div>

              {/* Relationship */}
              <div>
                <label className="font-bold text-gray-600 block mb-1">{t("family.relationship")}</label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:border-[#004d99] outline-none"
                >
                  {relationships.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {/* Age */}
              <div>
                <label className="font-bold text-gray-600 block mb-1">{t("family.age")}</label>
                <input
                  type="number"
                  required
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                  className="w-full h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:border-[#004d99] outline-none"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="font-bold text-gray-600 block mb-1">{t("family.gender")}</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:border-[#004d99] outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Occupation */}
              <div>
                <label className="font-bold text-gray-600 block mb-1">{t("family.occupation")}</label>
                <select
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:border-[#004d99] outline-none"
                >
                  {occupations.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              {/* Income */}
              <div>
                <label className="font-bold text-gray-600 block mb-1">{t("family.income")}</label>
                <input
                  type="number"
                  required
                  value={income}
                  onChange={(e) => setIncome(parseInt(e.target.value) || 0)}
                  className="w-full h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:border-[#004d99] outline-none"
                />
              </div>

              {/* Disability */}
              <div className="flex items-center justify-between py-2">
                <span className="font-bold text-gray-600">{t("family.disability")}</span>
                <input
                  type="checkbox"
                  checked={disability}
                  onChange={(e) => setDisability(e.target.checked)}
                  className="rounded text-[#004d99] focus:ring-[#004d99] cursor-pointer"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 h-9 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 text-gray-700 cursor-pointer bg-transparent"
                >
                  {t("family.cancel")}
                </button>
                <button
                  type="submit"
                  className="flex-1 h-9 bg-[#004d99] hover:bg-[#00366c] text-white rounded-lg font-semibold cursor-pointer bg-transparent"
                >
                  {t("family.save")}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Profiles list */}
        <div className={`${showAddForm ? "lg:col-span-2" : "lg:col-span-3"} grid grid-cols-1 md:grid-cols-2 gap-6`}>
          {familyMembers.length === 0 ? (
            <div className="md:col-span-2 bg-white border border-gray-100 p-12 rounded-2xl text-center text-gray-400 flex flex-col items-center justify-center min-h-[300px]">
              <Users className="w-12 h-12 text-gray-300 mb-3 animate-pulse" />
              <p className="font-bold text-gray-700">{t("family.no_profiles")}</p>
              <p className="text-xs text-gray-400 max-w-[280px] mt-1">
                {t("family.no_profiles_desc")}
              </p>
            </div>
          ) : (
            familyMembers.map((member) => {
              const eligibleSchemes = getEligibleSchemesForMember(member);
              return (
                <div
                  key={member.id}
                  className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="px-2.5 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-lg flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 fill-current" />
                        <span>{member.relationship}</span>
                      </span>
                      <button
                        onClick={() => onDeleteFamilyMember(member.id)}
                        className="text-gray-400 hover:text-red-500 p-1 cursor-pointer bg-transparent border-none"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 leading-tight">{member.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {preferredLanguage === "Hindi" || preferredLanguage === "हिन्दी (Hindi)" ? "आयु:" : preferredLanguage === "Marathi" || preferredLanguage === "मराठी (Marathi)" ? "वय:" : preferredLanguage === "Tamil" || preferredLanguage === "தமிழ் (Tamil)" ? "வயது:" : preferredLanguage === "Telugu" || preferredLanguage === "తెలుగు (Telugu)" ? "వయస్సు:" : "Age:"} <span className="text-gray-700 font-semibold">{member.age}</span> • {preferredLanguage === "Hindi" || preferredLanguage === "हिन्दी (Hindi)" ? "लिंग:" : preferredLanguage === "Marathi" || preferredLanguage === "मराठी (Marathi)" ? "लिंग:" : preferredLanguage === "Tamil" || preferredLanguage === "தமிழ் (Tamil)" ? "பாலினம்:" : preferredLanguage === "Telugu" || preferredLanguage === "తెలుగు (Telugu)" ? "లింగం:" : "Gender:"} <span className="text-gray-700 font-semibold">{member.gender}</span> • {preferredLanguage === "Hindi" || preferredLanguage === "हिन्दी (Hindi)" ? "आय:" : preferredLanguage === "Marathi" || preferredLanguage === "मराठी (Marathi)" ? "उत्पन्न:" : preferredLanguage === "Tamil" || preferredLanguage === "தமிழ் (Tamil)" ? "வருமானம்:" : preferredLanguage === "Telugu" || preferredLanguage === "తెలుగు (Telugu)" ? "ఆదాయం:" : "Income:"} <span className="text-gray-700 font-semibold">₹ {member.income.toLocaleString()}</span>
                    </p>

                    <div className="mt-4 pt-4 border-t border-gray-50">
                      <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1 mb-2">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span>{t("family.eligible_schemes")} ({eligibleSchemes.length})</span>
                      </h4>

                      {eligibleSchemes.length === 0 ? (
                        <p className="text-[11px] text-gray-400 italic">No matches found for this profile.</p>
                      ) : (
                        <div className="space-y-1.5">
                          {eligibleSchemes.slice(0, 3).map(sch => (
                            <div
                              key={sch.id}
                              onClick={() => onViewSchemeDetails(sch)}
                              className="bg-gray-50 border border-gray-100 rounded-lg p-2 flex justify-between items-center hover:bg-blue-50 transition-colors cursor-pointer text-[11px]"
                            >
                              <span className="font-bold text-gray-700 truncate max-w-[150px]">{sch.schemeName}</span>
                              <span className="text-[#004d99] font-semibold text-[10px] flex items-center gap-0.5 shrink-0">
                                <span>{t("family.details")}</span>
                                <Plus className="w-3 h-3" />
                              </span>
                            </div>
                          ))}
                          {eligibleSchemes.length > 3 && (
                            <p className="text-[10px] text-[#004d99] font-bold pl-1">
                              + {eligibleSchemes.length - 3} more eligible schemes
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[10px] text-gray-400 font-semibold">
                    <span>Category: {member.category}</span>
                    <span className="text-green-600 flex items-center gap-0.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{t("family.sync")}</span>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
