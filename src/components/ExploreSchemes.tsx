import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, Bookmark, ExternalLink, ArrowLeft, Check,
  Sparkles, Landmark, Award, BookOpen, UserCheck, CheckSquare, X
} from "lucide-react";
import { Scheme } from "../types";

interface ExploreSchemesProps {
  schemes: Scheme[];
  savedSchemeIds: string[];
  onToggleSaveScheme: (schemeId: string) => void;
  onApplyForScheme: (scheme: Scheme) => void;
}

export default function ExploreSchemes({
  schemes,
  savedSchemeIds,
  onToggleSaveScheme,
  onApplyForScheme
}: ExploreSchemesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeDetailsScheme, setActiveDetailsScheme] = useState<Scheme | null>(null);

  const categories = [
    "All",
    "Scholarships & Education",
    "Farmer Schemes",
    "Healthcare",
    "Housing",
    "Women's Welfare",
    "Business & Startup",
    "Senior Citizen",
    "Disability Support"
  ];

  // Filter schemes
  const filteredSchemes = schemes.filter(scheme => {
    const matchesCategory = selectedCategory === "All" || scheme.category === selectedCategory;
    const matchesSearch = scheme.schemeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          scheme.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Explore Government Schemes</h2>
          <p className="text-sm text-gray-500 mt-1">
            Browse through centrally launched and state-supported schemes categorized for simple discovery.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80 rounded-full border border-gray-200 bg-white focus-within:border-[#004d99] focus-within:ring-2 focus-within:ring-[#004d99]/10 overflow-hidden transition-all">
          <input
            type="text"
            placeholder="Search schemes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-transparent border-none text-sm outline-none focus:ring-0 placeholder-gray-400"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        </div>
      </div>

      {/* Category Horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
              selectedCategory === cat
                ? "bg-[#004d99] text-white border-[#004d99]"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchemes.map((scheme) => {
          const isSaved = savedSchemeIds.includes(scheme.id);
          return (
            <motion.div
              key={scheme.id}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
              onClick={() => setActiveDetailsScheme(scheme)}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2.5 py-0.5 bg-[#004d99]/5 text-[#004d99] text-[10px] font-bold rounded-lg uppercase tracking-wider">
                    {scheme.category.split(" ")[0]}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Avoid opening detail drawer
                      onToggleSaveScheme(scheme.id);
                    }}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  >
                    <Bookmark className={`w-5 h-5 ${isSaved ? "text-red-500 fill-current" : ""}`} />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-[#004d99] transition-colors leading-tight line-clamp-1">
                  {scheme.schemeName}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-4">
                  {scheme.description}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-xs mt-auto">
                <span className="text-gray-400 font-semibold">
                  Deadline: <span className="text-gray-700">{scheme.deadline}</span>
                </span>
                <span className="text-[#004d99] font-bold group-hover:underline flex items-center gap-1">
                  <span>View Full Details</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Detail Slideover Modal / Drawer */}
      <AnimatePresence>
        {activeDetailsScheme && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveDetailsScheme(null)}
              className="absolute inset-0 bg-black pointer-events-auto"
            />

            {/* Slideover content */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto pointer-events-auto"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <button
                  onClick={() => setActiveDetailsScheme(null)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 outline-none"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Schemes</span>
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => onToggleSaveScheme(activeDetailsScheme.id)}
                    className="p-2 border border-gray-200 rounded-full hover:bg-gray-50 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Bookmark 
                      className={`w-5 h-5 ${
                        savedSchemeIds.includes(activeDetailsScheme.id) ? "text-red-500 fill-current" : ""
                      }`} 
                    />
                  </button>
                  <button
                    onClick={() => setActiveDetailsScheme(null)}
                    className="p-2 border border-gray-200 rounded-full hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Main Info */}
              <div className="p-6 flex-1 space-y-6">
                <div>
                  <span className="px-3 py-1 bg-blue-50 text-[#004d99] text-xs font-bold rounded-lg uppercase tracking-wider mb-3 inline-block">
                    {activeDetailsScheme.category}
                  </span>
                  <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                    {activeDetailsScheme.schemeName}
                  </h2>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-gray-400" />
                    <span>Scheme Overview</span>
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {activeDetailsScheme.description}
                  </p>
                </div>

                {/* Benefits */}
                <div className="space-y-2 bg-green-50/50 border border-green-100 p-4 rounded-xl">
                  <h4 className="text-sm font-bold text-[#005b15] flex items-center gap-2">
                    <Award className="w-4 h-4 text-green-600" />
                    <span>Scheme Benefits & Financial Incentives</span>
                  </h4>
                  <div className="space-y-2 text-xs text-[#005b15] font-medium leading-relaxed">
                    {activeDetailsScheme.benefits.split("\n").map((b, idx) => (
                      <p key={idx}>{b}</p>
                    ))}
                  </div>
                </div>

                {/* Eligibility Criteria Checklist */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-gray-400" />
                    <span>Eligibility Requirements</span>
                  </h4>
                  <div className="border border-gray-100 rounded-xl p-4 divide-y divide-gray-50 space-y-2 text-xs text-gray-600">
                    <div className="flex justify-between py-1 items-center">
                      <span className="font-semibold">Minimum Age</span>
                      <span className="text-gray-900 font-bold">{activeDetailsScheme.eligibility.minAge || "Any Age"}</span>
                    </div>
                    {activeDetailsScheme.eligibility.maxAge && (
                      <div className="flex justify-between py-1.5 items-center">
                        <span className="font-semibold">Maximum Age</span>
                        <span className="text-gray-900 font-bold">{activeDetailsScheme.eligibility.maxAge} years</span>
                      </div>
                    )}
                    {activeDetailsScheme.eligibility.maxIncome && (
                      <div className="flex justify-between py-1.5 items-center">
                        <span className="font-semibold">Annual Family Income Limit</span>
                        <span className="text-gray-900 font-bold">₹ {activeDetailsScheme.eligibility.maxIncome.toLocaleString()}</span>
                      </div>
                    )}
                    {activeDetailsScheme.eligibility.genders && (
                      <div className="flex justify-between py-1.5 items-center">
                        <span className="font-semibold">Target Genders</span>
                        <span className="text-gray-900 font-bold">{activeDetailsScheme.eligibility.genders.join(", ")}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1.5 items-center">
                      <span className="font-semibold">Domicile States</span>
                      <span className="text-gray-900 font-bold">{activeDetailsScheme.statesApplicable}</span>
                    </div>
                  </div>
                </div>

                {/* Required Documents */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-gray-400" />
                    <span>Required Documents Checkbox</span>
                  </h4>
                  <ul className="grid grid-cols-1 gap-2 text-xs text-gray-600">
                    {activeDetailsScheme.requiredDocuments.map((doc, idx) => (
                      <li key={idx} className="flex gap-2 items-center bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                        <Check className="w-4 h-4 text-green-600 shrink-0" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sticky bottom bar with Apply controls */}
              <div className="p-6 border-t border-gray-100 sticky bottom-0 bg-white z-10 flex gap-4">
                <a
                  href={activeDetailsScheme.officialWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-12 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-full flex items-center justify-center gap-2 text-sm transition-colors cursor-pointer"
                >
                  <span>Official Website</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  onClick={() => {
                    onApplyForScheme(activeDetailsScheme);
                    setActiveDetailsScheme(null);
                  }}
                  className="flex-1 h-12 bg-[#004d99] hover:bg-[#00366c] text-white font-semibold rounded-full flex items-center justify-center gap-1.5 text-sm transition-all cursor-pointer shadow-sm"
                >
                  <span>Apply with AI Assistant</span>
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
