import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Sparkles, FileText, CheckCircle, ShieldAlert, ArrowLeft, Info, HelpCircle } from "lucide-react";
import { Scheme, DocumentFile, Application } from "../types";

interface FormAssistanceProps {
  scheme: Scheme;
  uploadedDocuments: DocumentFile[];
  onBackToSchemes: () => void;
  onSubmitApplication: (app: Application) => void;
}

export default function FormAssistance({
  scheme,
  uploadedDocuments,
  onBackToSchemes,
  onSubmitApplication
}: FormAssistanceProps) {
  const [fullName, setFullName] = useState("");
  const [aadhaarNum, setAadhaarNum] = useState("");
  const [panNum, setPANNum] = useState("");
  const [annualIncome, setAnnualIncome] = useState("");
  const [state, setState] = useState("Delhi");
  const [declaration, setDeclaration] = useState(false);

  const [activeFieldHelp, setActiveDetailsFieldHelp] = useState<string | null>(null);
  const [ocrSuggestions, setOcrSuggestions] = useState<{ field: string; value: string; source: string }[]>([]);

  // Scan uploaded documents and suggest values
  useEffect(() => {
    const suggestions: { field: string; value: string; source: string }[] = [];

    const aadhaarDoc = uploadedDocuments.find(d => d.documentType.toLowerCase().includes("aadhaar"));
    if (aadhaarDoc) {
      suggestions.push({ field: "fullName", value: aadhaarDoc.holderName, source: "Aadhaar Card Vault" });
      suggestions.push({ field: "aadhaarNum", value: aadhaarDoc.documentId, source: "Aadhaar Card Vault" });
    }

    const panDoc = uploadedDocuments.find(d => d.documentType.toLowerCase().includes("pan"));
    if (panDoc) {
      if (!suggestions.some(s => s.field === "fullName")) {
        suggestions.push({ field: "fullName", value: panDoc.holderName, source: "PAN Card Vault" });
      }
      suggestions.push({ field: "panNum", value: panDoc.documentId, source: "PAN Card Vault" });
    }

    const incomeDoc = uploadedDocuments.find(d => d.documentType.toLowerCase().includes("income"));
    if (incomeDoc && incomeDoc.additionalInfo) {
      // Regex or parse numbers
      const match = incomeDoc.additionalInfo.match(/\d+[,0-9]*/);
      if (match) {
        suggestions.push({ field: "annualIncome", value: match[0].replace(/,/g, ""), source: "Income Certificate Vault" });
      }
    }

    setOcrSuggestions(suggestions);
  }, [uploadedDocuments]);

  const applyOcrValue = (field: string, value: string) => {
    if (field === "fullName") setFullName(value);
    if (field === "aadhaarNum") setAadhaarNum(value);
    if (field === "panNum") setPANNum(value);
    if (field === "annualIncome") setAnnualIncome(value);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!declaration) return;

    const newApp: Application = {
      id: `app-${Date.now()}`,
      schemeId: scheme.id,
      schemeName: scheme.schemeName,
      applicantName: fullName,
      status: "Submitted",
      submittedAt: new Date().toLocaleDateString(),
      documentsAttached: scheme.requiredDocuments.slice(0, 2),
      formValues: {
        fullName,
        aadhaarNum,
        panNum,
        annualIncome,
        state
      }
    };

    onSubmitApplication(newApp);
  };

  // Missing documents warnings
  const missingRequiredDocs = scheme.requiredDocuments.filter(reqDocName => {
    // Check if user has corresponding document uploaded
    const normalizedReq = reqDocName.toLowerCase();
    return !uploadedDocuments.some(uploaded => {
      const normalizedUploaded = uploaded.documentType.toLowerCase();
      if (normalizedReq.includes("aadhaar") && normalizedUploaded.includes("aadhaar")) return true;
      if (normalizedReq.includes("pan") && normalizedUploaded.includes("pan")) return true;
      if (normalizedReq.includes("income") && normalizedUploaded.includes("income")) return true;
      if (normalizedReq.includes("caste") && normalizedUploaded.includes("caste")) return true;
      return false;
    });
  });

  return (
    <div className="space-y-8">
      {/* Header Back button */}
      <div>
        <button
          onClick={onBackToSchemes}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 mb-4 cursor-pointer outline-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Schemes</span>
        </button>

        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="text-[#004d99] w-6 h-6 fill-current" />
          <span>AI Assisted Form Completer</span>
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Apply to <strong>{scheme.schemeName}</strong>. Our AI reads metadata from your Document Vault to automatically fill values.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left main application form */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-6">
          <div className="border-b border-gray-50 pb-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Official Indian Government Form</span>
            <h3 className="text-base font-bold text-gray-800 mt-1">Scheme Registration Fields</h3>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
            {/* Applicant Full Name */}
            <div className="space-y-1 relative">
              <label className="font-bold text-gray-600 flex justify-between">
                <span>Applicant Full Name (As per Documents)</span>
                <button
                  type="button"
                  onClick={() => setActiveDetailsFieldHelp("Your full legal name exactly as printed on your Aadhaar card or PAN card to ensure verification match.")}
                  className="text-gray-400 hover:text-[#004d99]"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </label>
              <input
                type="text"
                required
                placeholder="Enter legal name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-[#004d99] outline-none"
              />
            </div>

            {/* Aadhaar Number */}
            <div className="space-y-1 relative">
              <label className="font-bold text-gray-600 flex justify-between">
                <span>12-Digit Aadhaar Card Number</span>
                <button
                  type="button"
                  onClick={() => setActiveDetailsFieldHelp("Unique 12-digit Indian Identification Number. Required for Direct Benefit Transfer (DBT) scheme payouts.")}
                  className="text-gray-400 hover:text-[#004d99]"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </label>
              <input
                type="text"
                maxLength={12}
                placeholder="XXXX XXXX XXXX"
                value={aadhaarNum}
                onChange={(e) => setAadhaarNum(e.target.value.replace(/\s/g, ""))}
                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-[#004d99] outline-none"
              />
            </div>

            {/* PAN Card Number */}
            <div className="space-y-1 relative">
              <label className="font-bold text-gray-600 flex justify-between">
                <span>Permanent Account Number (PAN Card)</span>
                <button
                  type="button"
                  onClick={() => setActiveDetailsFieldHelp("10-character alphanumeric ID issued by Income Tax Department. Optional for some, required for educational loan schemes.")}
                  className="text-gray-400 hover:text-[#004d99]"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </label>
              <input
                type="text"
                maxLength={10}
                placeholder="ABCDE1234F"
                value={panNum}
                onChange={(e) => setPANNum(e.target.value.toUpperCase())}
                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-[#004d99] outline-none"
              />
            </div>

            {/* Annual Income */}
            <div className="space-y-1 relative">
              <label className="font-bold text-gray-600 flex justify-between">
                <span>Annual Family Income (INR)</span>
                <button
                  type="button"
                  onClick={() => setActiveDetailsFieldHelp("Total yearly earnings of all members in your household. Used to verify the sub-₹8L interest subvention cap.")}
                  className="text-gray-400 hover:text-[#004d99]"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </label>
              <input
                type="number"
                required
                placeholder="Annual income amount in rupees"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(e.target.value)}
                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-[#004d99] outline-none"
              />
            </div>

            {/* Declaration check */}
            <div className="py-2 border-t border-gray-50 space-y-2">
              <label className="flex gap-2.5 items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={declaration}
                  onChange={(e) => setDeclaration(e.target.checked)}
                  className="mt-0.5 rounded text-[#004d99] focus:ring-[#004d99]"
                />
                <span className="text-gray-500 leading-normal">
                  I hereby declare that all values entered above are accurate and match the certificates in my secure Document Vault. I verify that JanSathi has advised me to double-check information on official portals.
                </span>
              </label>
            </div>

            {/* Submit application handles */}
            <div className="pt-4 flex gap-4">
              <button
                type="button"
                onClick={onBackToSchemes}
                className="flex-1 h-11 border border-gray-300 font-semibold rounded-full hover:bg-gray-50 text-gray-700 text-xs transition-colors"
              >
                Save as Draft
              </button>
              <button
                type="submit"
                disabled={!declaration}
                className="flex-1 h-11 bg-[#004d99] hover:bg-[#00366c] disabled:opacity-40 font-semibold rounded-full text-white text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Submit to JanSathi Tracking</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right helper info sidepanel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Suggestion Values scan box */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-600 fill-current" />
              <span>Vault Suggestions</span>
            </h4>
            
            {ocrSuggestions.length === 0 ? (
              <p className="text-xs text-gray-400">
                No verified certificates detected. Go to **Document Vault** and upload your Aadhaar/PAN to trigger auto-fill suggestions.
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-[11px] text-gray-500">Click to instantly populate fields using OCR scanned metadata:</p>
                <div className="space-y-1.5">
                  {ocrSuggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyOcrValue(s.field, s.value)}
                      className="w-full text-left bg-teal-50/50 hover:bg-teal-50 border border-teal-100 p-2.5 rounded-xl transition-all flex justify-between items-center text-xs text-teal-800"
                    >
                      <div className="truncate">
                        <span className="font-bold block capitalize text-[10px] text-teal-600">{s.field.replace("Num", " Number")}</span>
                        <span className="font-semibold font-mono">{s.value}</span>
                      </div>
                      <span className="text-[9px] font-bold text-teal-600 shrink-0 bg-white px-1.5 py-0.5 rounded shadow-sm">
                        Apply
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Missing document notifications */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>Missing Required Documents</span>
            </h4>

            {missingRequiredDocs.length === 0 ? (
              <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>All documents present in vault!</span>
              </p>
            ) : (
              <div className="space-y-2 text-xs">
                <p className="text-gray-500 text-[11px]">We could not match these scheme checklist requirements with your vault files:</p>
                <ul className="space-y-1.5 text-gray-700 font-semibold">
                  {missingRequiredDocs.map((docName, idx) => (
                    <li key={idx} className="flex gap-2 items-center bg-amber-50/50 p-2 rounded-lg border border-amber-100/50">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0"></span>
                      <span>{docName}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Context help popups */}
          {activeFieldHelp && (
            <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-5 text-xs text-blue-800 space-y-2">
              <h4 className="font-bold flex items-center gap-1">
                <Info className="w-4 h-4 text-blue-600" />
                <span>AI Field Guidance</span>
              </h4>
              <p className="leading-relaxed">{activeFieldHelp}</p>
              <button
                type="button"
                onClick={() => setActiveDetailsFieldHelp(null)}
                className="text-[10px] font-bold text-[#004d99] hover:underline"
              >
                Dismiss Help
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
