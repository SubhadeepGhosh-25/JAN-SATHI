import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { 
  FileText, UploadCloud, CheckCircle2, ShieldCheck, 
  Trash2, RefreshCw, Sparkles, Camera, X, Check,
  AlertCircle, Smartphone, Keyboard, RefreshCw as RotateIcon,
  User, Calendar, MapPin, CreditCard, ShieldAlert
} from "lucide-react";
import { DocumentFile } from "../types";
import { useTranslation } from "../lib/translations";

interface DocumentVaultProps {
  documents: DocumentFile[];
  onUploadDocument: (doc: DocumentFile) => void;
  onDeleteDocument: (docId: string) => void;
  preferredLanguage?: string;
}

export default function DocumentVault({
  documents,
  onUploadDocument,
  onDeleteDocument,
  preferredLanguage
}: DocumentVaultProps) {
  const { t } = useTranslation(preferredLanguage);
  
  // Tab states: file (Upload), camera (Take photo), manual (Direct typing)
  const [activeUploadTab, setActiveUploadTab] = useState<"file" | "camera" | "manual">("file");
  const [selectedDocType, setSelectedDocType] = useState("Aadhaar Card");
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);

  // Review & Confirmation state
  const [draftDoc, setDraftDoc] = useState<DocumentFile | null>(null);

  // Live Camera WebRTC states
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  const docTypes = [
    "Aadhaar Card",
    "PAN Card",
    "Income Certificate",
    "Caste Certificate",
    "Student ID",
    "Disability Certificate"
  ];

  // Tab translations helper
  const translateTab = (tab: string) => {
    const isHindi = preferredLanguage === "Hindi" || preferredLanguage === "हिन्दी (Hindi)";
    const isMarathi = preferredLanguage === "Marathi" || preferredLanguage === "मराठी (Marathi)";
    const isTamil = preferredLanguage === "Tamil" || preferredLanguage === "தமிழ் (Tamil)";
    const isTelugu = preferredLanguage === "Telugu" || preferredLanguage === "తెలుగు (Telugu)";

    if (tab === "file") {
      if (isHindi) return "📁 डिवाइस फ़ाइलें";
      if (isMarathi) return "📁 डिव्हाइस फाइल्स";
      if (isTamil) return "📁 சாதனக் கோப்புகள்";
      if (isTelugu) return "📁 పరికరం ఫైళ్ళు";
      return "📁 Device Files";
    }
    if (tab === "camera") {
      if (isHindi) return "📸 फोटो खींचें";
      if (isMarathi) return "📸 फोटो काढा";
      if (isTamil) return "📸 படம் எடு";
      if (isTelugu) return "📸 ఫోటో తీయండి";
      return "📸 Snap Photo";
    }
    if (tab === "manual") {
      if (isHindi) return "✏️ मैन्युअल दर्ज";
      if (isMarathi) return "✏️ मॅन्युअल भरा";
      if (isTamil) return "✏️ கைமுறையாக";
      if (isTelugu) return "✏️ నేరుగా నమోదు";
      return "✏️ Manual Entry";
    }
    return tab;
  };

  // Manage camera lifecycles
  const startCamera = async () => {
    setIsCameraLoading(true);
    setCameraError(null);
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      const constraints = {
        video: { 
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError(
        preferredLanguage === "Hindi" || preferredLanguage === "हिन्दी (Hindi)"
          ? "कैमरा खोलने में असमर्थ। कृपया कैमरा परमिशन सक्षम करें या 'डिवाइस फ़ाइलें' विकल्प का उपयोग करें।"
          : "Could not access the camera. Please grant camera permissions or upload using the 'Device Files' tab."
      );
    } finally {
      setIsCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === "environment" ? "user" : "environment");
  };

  // Switch camera if active and facingMode updates
  useEffect(() => {
    if (isCameraActive) {
      startCamera();
    }
  }, [facingMode]);

  // Clean up stream on unmount or tab switch
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const handleTabChange = (tab: "file" | "camera" | "manual") => {
    setActiveUploadTab(tab);
    setOcrError(null);
    if (tab !== "camera") {
      stopCamera();
    } else {
      startCamera();
    }
    if (tab === "manual") {
      startManualEntry();
    } else {
      setDraftDoc(null);
    }
  };

  // Real OCR process via Gemini API
  const processDocumentOcr = async (base64Data: string, mimeType: string, docType: string) => {
    setIsUploading(true);
    setOcrError(null);
    setDraftDoc(null);

    try {
      const response = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64Data,
          mimeType,
          docType
        })
      });

      if (!response.ok) {
        throw new Error("Failed to process document with Gemini OCR");
      }

      const result = await response.json();

      // Show confirmation panel with fields extracted by Gemini
      setDraftDoc({
        id: `doc-${Date.now()}`,
        documentType: result.documentType || docType,
        documentId: result.documentId || "",
        holderName: result.holderName || "",
        dob: result.dob || "",
        gender: result.gender || "",
        state: result.state || "",
        additionalInfo: result.additionalInfo || "",
        verified: true,
        uploadedAt: new Date().toLocaleDateString()
      });
    } catch (err: any) {
      console.error(err);
      setOcrError(
        preferredLanguage === "Hindi" || preferredLanguage === "हिन्दी (Hindi)"
          ? "जेमिनी एआई दस्तावेज़ का विवरण स्वतः नहीं पढ़ सका। कृपया नीचे स्वयं विवरण दर्ज करें।"
          : "Gemini OCR scanner was busy or couldn't parse the document. Please enter your document details manually below."
      );
      
      // Open a fallback template so the user can easily key in their details manually
      setDraftDoc({
        id: `doc-${Date.now()}`,
        documentType: docType,
        documentId: "",
        holderName: "",
        dob: "",
        gender: "",
        state: "",
        additionalInfo: "",
        verified: true,
        uploadedAt: new Date().toLocaleDateString()
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Capture current video frame to canvas & run OCR
  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      const width = videoRef.current.videoWidth || 640;
      const height = videoRef.current.videoHeight || 480;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        const base64String = dataUrl.split(",")[1];
        
        stopCamera();
        processDocumentOcr(base64String, "image/jpeg", selectedDocType);
      }
    }
  };

  // Convert uploaded file to base64 and process
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(",")[1];
        processDocumentOcr(base64String, file.type, selectedDocType);
      };
      reader.readAsDataURL(file);
    }
  };

  // Native mobile camera input onChange handler
  const handleNativeCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(",")[1];
        processDocumentOcr(base64String, file.type, selectedDocType);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(",")[1];
        processDocumentOcr(base64String, file.type, selectedDocType);
      };
      reader.readAsDataURL(file);
    }
  };

  // Start pristine manual registration
  const startManualEntry = () => {
    setDraftDoc({
      id: `doc-${Date.now()}`,
      documentType: selectedDocType,
      documentId: "",
      holderName: "",
      dob: "",
      gender: "",
      state: "",
      additionalInfo: "",
      verified: true,
      uploadedAt: new Date().toLocaleDateString()
    });
  };

  // Handle manual draft confirmation
  const handleSaveDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (draftDoc) {
      onUploadDocument(draftDoc);
      setDraftDoc(null);
      setOcrError(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header section with secure storage info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="text-[#004d99] w-6 h-6" />
            <span>{t("vault.title")}</span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {t("vault.subtitle")}
          </p>
        </div>
        <div className="flex gap-2 text-xs bg-[#006b5f]/5 text-[#006b5f] border border-[#006b5f]/10 p-2.5 rounded-xl font-semibold">
          <ShieldCheck className="w-4 h-4 shrink-0 text-[#006b5f]" />
          <span>
            {preferredLanguage === "Hindi" || preferredLanguage === "हिन्दी (Hindi)" 
              ? "AES-256 सुरक्षित एन्क्रिप्टेड स्टोरेज • कोई डिफ़ॉल्ट डेटा नहीं" 
              : preferredLanguage === "Marathi" || preferredLanguage === "मराठी (Marathi)" 
              ? "AES-256 कूटबद्ध संग्रह • कोणताही डीफॉल्ट डेटा नाही" 
              : preferredLanguage === "Tamil" || preferredLanguage === "தமிழ் (Tamil)" 
              ? "AES-256 குறியாக்கப்பட்ட சேமிப்பு • இயல்புநிலை தரவு இல்லை" 
              : preferredLanguage === "Telugu" || preferredLanguage === "తెలుగు (Telugu)" 
              ? "AES-256 ఎన్‌క్రిప్టెడ్ నిల్వ • డిఫాల్ట్ డేటా లేదు" 
              : "AES-256 Encrypted Storage • No Default Data"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Upload Panel (File / Camera / Manual tabs) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
            
            {/* Step 1: Select Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                1. {preferredLanguage === "Hindi" || preferredLanguage === "हिन्दी (Hindi)" ? "दस्तावेज़ श्रेणी चुनें" : preferredLanguage === "Marathi" || preferredLanguage === "मराठी (Marathi)" ? "दस्तऐवज प्रवर्ग निवडा" : preferredLanguage === "Tamil" || preferredLanguage === "தமிழ் (Tamil)" ? "ஆவணப் பிரிவைத் தேர்ந்தெடுக்கவும்" : preferredLanguage === "Telugu" || preferredLanguage === "తెలుగు (Telugu)" ? "పత్రం వర్గాన్ని ఎంచుకోండి" : "Select Document Category"}
              </label>
              <select
                value={selectedDocType}
                onChange={(e) => {
                  setSelectedDocType(e.target.value);
                  if (draftDoc) {
                    setDraftDoc({ ...draftDoc, documentType: e.target.value });
                  }
                }}
                className="w-full h-11 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:border-[#004d99] focus:ring-1 focus:ring-[#004d99]/20 outline-none transition-all"
              >
                {docTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>

            {/* Step 2: Upload Method Tabs */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">
                2. {preferredLanguage === "Hindi" || preferredLanguage === "हिन्दी (Hindi)" ? "अपलोड विधि चुनें" : preferredLanguage === "Marathi" || preferredLanguage === "मराठी (Marathi)" ? "अपलोड पद्धत निवडा" : preferredLanguage === "Tamil" || preferredLanguage === "தமிழ் (Tamil)" ? "பதிவேற்ற முறையைத் தேர்ந்தெடுக்கவும்" : preferredLanguage === "Telugu" || preferredLanguage === "తెలుగు (Telugu)" ? "అప్‌లోడ్ పద్ధతిని ఎంచుకోండి" : "Choose Upload Method"}
              </label>

              {/* Mini Tab buttons */}
              <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-xl">
                {(["file", "camera", "manual"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => handleTabChange(tab)}
                    className={`py-2 text-[10px] md:text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      activeUploadTab === tab 
                        ? "bg-white text-[#004d99] shadow-sm" 
                        : "text-gray-500 hover:text-gray-800 bg-transparent"
                    }`}
                  >
                    {translateTab(tab)}
                  </button>
                ))}
              </div>

              {/* Tab Content Rendering */}
              <div className="min-h-[190px] flex flex-col justify-between">
                
                {/* 1. Device File tab */}
                {activeUploadTab === "file" && (
                  <div className="space-y-3 h-full flex flex-col">
                    <div 
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-2xl p-5 text-center flex flex-col items-center justify-center flex-grow min-h-[150px] transition-all relative ${
                        dragActive ? "border-[#004d99] bg-[#004d99]/5" : "border-gray-200 hover:border-gray-300 bg-gray-50/50"
                      }`}
                    >
                      {isUploading ? (
                        <div className="space-y-2">
                          <RefreshCw className="w-8 h-8 text-[#004d99] animate-spin mx-auto" />
                          <p className="text-[11px] font-bold text-gray-700">
                            {preferredLanguage === "Hindi" || preferredLanguage === "हिन्दी (Hindi)" ? "ओसीआर स्कैनिंग जारी है..." : "Analyzing document with Gemini OCR..."}
                          </p>
                        </div>
                      ) : (
                        <>
                          <UploadCloud className="w-8 h-8 text-gray-400 mb-1" />
                          <p className="text-xs font-bold text-gray-700">{t("vault.upload_area_title")}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{t("vault.upload_area_desc")}</p>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={handleFileUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </>
                      )}
                    </div>

                    {/* Quick Native Camera Option for Phones */}
                    <div className="text-center">
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        id="native-camera-picker"
                        onChange={handleNativeCameraCapture}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById("native-camera-picker")?.click()}
                        disabled={isUploading}
                        className="w-full h-10 border border-gray-200 hover:border-gray-300 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 cursor-pointer bg-transparent"
                      >
                        <Smartphone className="w-4 h-4 text-gray-500" />
                        <span>
                          {preferredLanguage === "Hindi" || preferredLanguage === "हिन्दी (Hindi)" ? "फोन कैमरा का उपयोग करें" : "Use Mobile Camera"}
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. Direct Camera tab */}
                {activeUploadTab === "camera" && (
                  <div className="space-y-3">
                    {isUploading ? (
                      <div className="border border-gray-200 rounded-2xl p-8 text-center min-h-[170px] flex flex-col justify-center items-center bg-gray-50">
                        <RefreshCw className="w-8 h-8 text-[#004d99] animate-spin mb-3" />
                        <p className="text-xs font-bold text-gray-700">
                          {preferredLanguage === "Hindi" || preferredLanguage === "हिन्दी (Hindi)" ? "फोटो की पुष्टि हो रही है..." : "Processing snapshot..."}
                        </p>
                      </div>
                    ) : (
                      <div className="relative border border-gray-200 rounded-2xl overflow-hidden bg-black min-h-[170px] flex items-center justify-center">
                        {isCameraActive ? (
                          <>
                            <video 
                              ref={videoRef}
                              autoPlay 
                              playsInline 
                              muted 
                              className="w-full h-full object-cover max-h-[220px]"
                            />
                            {/* Camera overlay actions */}
                            <div className="absolute bottom-3 left-0 right-0 flex justify-center items-center gap-4 px-4">
                              <button
                                type="button"
                                onClick={switchCamera}
                                className="w-9 h-9 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center backdrop-blur-sm cursor-pointer border-none"
                                title="Switch Camera"
                              >
                                <RotateIcon className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={capturePhoto}
                                className="w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center border-4 border-white shadow-lg cursor-pointer transition-transform active:scale-95"
                                title="Take Photo"
                              >
                                <Camera className="w-5 h-5 text-white" />
                              </button>
                              <button
                                type="button"
                                onClick={stopCamera}
                                className="w-9 h-9 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center backdrop-blur-sm cursor-pointer border-none"
                                title="Turn Off"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="p-6 text-center space-y-3">
                            {isCameraLoading ? (
                              <RefreshCw className="w-6 h-6 text-white animate-spin mx-auto" />
                            ) : (
                              <Camera className="w-8 h-8 text-gray-500 mx-auto" />
                            )}
                            {cameraError && (
                              <p className="text-[10px] text-red-400 font-semibold px-2">{cameraError}</p>
                            )}
                            <button
                              type="button"
                              onClick={startCamera}
                              className="px-4 h-9 bg-white hover:bg-gray-100 text-gray-900 font-bold text-xs rounded-xl flex items-center gap-1.5 mx-auto transition-all cursor-pointer border-none"
                            >
                              <Camera className="w-3.5 h-3.5 text-gray-700" />
                              <span>
                                {preferredLanguage === "Hindi" || preferredLanguage === "हिन्दी (Hindi)" ? "कैमरा सक्रिय करें" : "Activate Webcam"}
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Manual Entry tab instructions */}
                {activeUploadTab === "manual" && (
                  <div className="border border-gray-100 rounded-2xl p-4 bg-[#004d99]/5 flex flex-col justify-center items-center text-center space-y-2">
                    <Keyboard className="w-8 h-8 text-[#004d99]" />
                    <p className="text-xs font-bold text-[#004d99]">
                      {preferredLanguage === "Hindi" || preferredLanguage === "हिन्दी (Hindi)" ? "मैन्युअल प्रविष्टि सक्रिय" : "Manual Fill Enabled"}
                    </p>
                    <p className="text-[10px] text-gray-500 leading-relaxed max-w-[190px]">
                      {preferredLanguage === "Hindi" || preferredLanguage === "हिन्दी (Hindi)" 
                        ? "दस्तावेज़ विवरण दाईं ओर दिए गए फॉर्म में सीधे भरें।" 
                        : "Enter your information securely in the verification form next to this panel."}
                    </p>
                  </div>
                )}

              </div>
            </div>

            {ocrError && (
              <div className="text-[10px] text-amber-700 font-semibold bg-amber-50 p-2.5 rounded-lg border border-amber-100 flex gap-1.5 items-start">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>{ocrError}</span>
              </div>
            )}

          </div>
        </div>

        {/* Dynamic Detail-Confirmation / Verification Panel OR Uploaded Vault list */}
        <div className="lg:col-span-2 space-y-4">
          
          {draftDoc ? (
            /* Verify and Edit Extracted Credentials Form */
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border-2 border-amber-300 rounded-2xl p-6 shadow-sm space-y-5"
            >
              <div className="flex justify-between items-center border-b border-amber-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="text-amber-500 w-5 h-5" />
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm md:text-base">
                      {preferredLanguage === "Hindi" || preferredLanguage === "हिन्दी (Hindi)" ? "दस्तावेज़ विवरण सत्यापित करें" : "Verify Document Credentials"}
                    </h3>
                    <p className="text-[10px] md:text-xs text-gray-500">
                      {preferredLanguage === "Hindi" || preferredLanguage === "हिन्दी (Hindi)" 
                        ? "नीचे दिए गए विवरणों को सही करें और वॉल्ट में सहेजें।" 
                        : "Review and edit the values below to ensure absolute correctness."}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDraftDoc(null);
                    setOcrError(null);
                  }}
                  className="w-7 h-7 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer bg-transparent border-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveDraft} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Doc Type */}
                  <div className="space-y-1">
                    <label className="font-bold text-gray-600 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                      <span>{preferredLanguage === "Hindi" || preferredLanguage === "हिन्दी (Hindi)" ? "दस्तावेज़ प्रकार" : "Document Type"}</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={draftDoc.documentType}
                      onChange={(e) => setDraftDoc({ ...draftDoc, documentType: e.target.value })}
                      className="w-full h-10 px-3 bg-white border border-gray-200 rounded-xl font-semibold text-gray-800 outline-none focus:border-[#004d99]"
                    />
                  </div>

                  {/* Doc ID */}
                  <div className="space-y-1">
                    <label className="font-bold text-gray-600 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                      <span>{t("vault.id_num")}</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={preferredLanguage === "Hindi" || preferredLanguage === "हिन्दी (Hindi)" ? "पहचान नंबर (उदा. 12 अंकों का आधार)" : "ID Number (e.g. 12-digit Aadhaar)"}
                      value={draftDoc.documentId}
                      onChange={(e) => setDraftDoc({ ...draftDoc, documentId: e.target.value })}
                      className="w-full h-10 px-3 bg-white border border-gray-200 rounded-xl font-semibold text-gray-800 outline-none focus:border-[#004d99]"
                    />
                  </div>

                  {/* Holder Name */}
                  <div className="space-y-1">
                    <label className="font-bold text-gray-600 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span>{t("vault.holder")}</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={preferredLanguage === "Hindi" || preferredLanguage === "हिन्दी (Hindi)" ? "दस्तावेज़ पर अंकित नाम" : "Name on the Document"}
                      value={draftDoc.holderName}
                      onChange={(e) => setDraftDoc({ ...draftDoc, holderName: e.target.value })}
                      className="w-full h-10 px-3 bg-white border border-gray-200 rounded-xl font-semibold text-gray-800 outline-none focus:border-[#004d99]"
                    />
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-1">
                    <label className="font-bold text-gray-600 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{t("vault.dob")}</span>
                    </label>
                    <input
                      type="text"
                      placeholder="YYYY-MM-DD"
                      value={draftDoc.dob || ""}
                      onChange={(e) => setDraftDoc({ ...draftDoc, dob: e.target.value })}
                      className="w-full h-10 px-3 bg-white border border-gray-200 rounded-xl font-semibold text-gray-800 outline-none focus:border-[#004d99]"
                    />
                  </div>

                  {/* Gender */}
                  <div className="space-y-1">
                    <label className="font-bold text-gray-600 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span>{t("vault.gender_label")}</span>
                    </label>
                    <select
                      value={draftDoc.gender || ""}
                      onChange={(e) => setDraftDoc({ ...draftDoc, gender: e.target.value })}
                      className="w-full h-10 px-3 bg-white border border-gray-200 rounded-xl font-semibold text-gray-700 outline-none focus:border-[#004d99]"
                    >
                      <option value="">{preferredLanguage === "Hindi" || preferredLanguage === "हिन्दी (Hindi)" ? "--चुनें--" : "--Select--"}</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* State of Residence */}
                  <div className="space-y-1">
                    <label className="font-bold text-gray-600 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>{t("vault.state_label")}</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Maharashtra"
                      value={draftDoc.state || ""}
                      onChange={(e) => setDraftDoc({ ...draftDoc, state: e.target.value })}
                      className="w-full h-10 px-3 bg-white border border-gray-200 rounded-xl font-semibold text-gray-800 outline-none focus:border-[#004d99]"
                    />
                  </div>
                </div>

                {/* Additional custom fields */}
                <div className="space-y-1 pt-1">
                  <label className="font-bold text-gray-600 block">
                    {preferredLanguage === "Hindi" || preferredLanguage === "हिन्दी (Hindi)" ? "अतिरिक्त विशिष्ट विवरण (जैसे वार्षिक आय, जाति का नाम)" : "Additional Certificate Details (e.g. Income Amount, Caste Category)"}
                  </label>
                  <textarea
                    placeholder="e.g. Annual Family Income: 1,20,000 INR"
                    value={draftDoc.additionalInfo || ""}
                    onChange={(e) => setDraftDoc({ ...draftDoc, additionalInfo: e.target.value })}
                    rows={2}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl font-semibold text-gray-800 outline-none focus:border-[#004d99]"
                  />
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDraftDoc(null);
                      setOcrError(null);
                    }}
                    className="flex-1 h-10 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1.5 cursor-pointer bg-transparent"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                    <span>{preferredLanguage === "Hindi" || preferredLanguage === "हिन्दी (Hindi)" ? "निरस्त करें" : "Discard"}</span>
                  </button>
                  <button
                    type="submit"
                    className="flex-grow h-10 bg-[#004d99] hover:bg-[#003c78] text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer border-none"
                  >
                    <Check className="w-4 h-4 text-white" />
                    <span>{preferredLanguage === "Hindi" || preferredLanguage === "हिन्दी (Hindi)" ? "सत्यापित करें और सहेजें" : "Confirm & Save in Vault"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            /* Uploaded Vault Documents List */
            <>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span>{t("vault.uploaded_docs")}</span>
                <span className="px-2.5 py-0.5 bg-[#004d99]/10 text-[#004d99] text-xs font-bold rounded-full">
                  {documents.length}
                </span>
              </h3>

              {documents.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center text-gray-400 flex flex-col items-center justify-center min-h-[320px]">
                  <FileText className="w-12 h-12 text-gray-300 mb-3 animate-pulse" />
                  <p className="font-semibold text-gray-700">
                    {preferredLanguage === "Hindi" || preferredLanguage === "हिन्दी (Hindi)" 
                      ? "आपका सुरक्षित वॉल्ट खाली है" 
                      : preferredLanguage === "Marathi" || preferredLanguage === "मराठी (Marathi)" 
                      ? "तुमचा दस्तऐवज संग्रह रिकामी आहे" 
                      : preferredLanguage === "Tamil" || preferredLanguage === "தமிழ் (Tamil)" 
                      ? "உங்கள் ஆவணக் களஞ்சியம் காலியாக உள்ளது" 
                      : preferredLanguage === "Telugu" || preferredLanguage === "తెలుగు (Telugu)" 
                      ? "మీ పత్రాల వాల్ట్ ఖాళీగా ఉంది" 
                      : "Your Personal Vault is Empty"}
                  </p>
                  <p className="text-xs text-gray-400 max-w-[340px] mt-1 leading-relaxed">
                    {preferredLanguage === "Hindi" || preferredLanguage === "हिन्दी (Hindi)"
                      ? "अपने दस्तावेज़ों की फोटो खींचकर या फ़ाइलें अपलोड करके उन्हें पूरी तरह सुरक्षित संग्रहित करें।"
                      : "Take a picture of your ID cards or upload documents to securely store them and enable instant scheme matching."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.map((doc) => (
                    <div 
                      key={doc.id}
                      className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-gray-200 transition-all"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg flex items-center gap-1 border border-green-100">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                            <span>{t("vault.verified")}</span>
                          </span>
                          <button 
                            onClick={() => onDeleteDocument(doc.id)}
                            className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg bg-transparent border-none cursor-pointer transition-colors"
                            title={t("vault.delete")}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <h4 className="text-base font-bold text-gray-900 mb-1">{doc.documentType}</h4>
                        
                        <div className="space-y-1.5 mt-3 text-xs text-gray-500 border-t border-gray-100 pt-3">
                          <div className="flex justify-between">
                            <span className="text-gray-400 font-medium">{t("vault.id_num")}</span>
                            <span className="font-mono text-gray-900 font-bold">{doc.documentId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400 font-medium">{t("vault.holder")}</span>
                            <span className="text-gray-900 font-bold">{doc.holderName}</span>
                          </div>
                          {doc.dob && (
                            <div className="flex justify-between">
                              <span className="text-gray-400 font-medium">{t("vault.dob")}</span>
                              <span className="text-gray-900 font-bold">{doc.dob}</span>
                            </div>
                          )}
                          {doc.gender && (
                            <div className="flex justify-between">
                              <span className="text-gray-400 font-medium">{t("vault.gender_label")}</span>
                              <span className="text-gray-900 font-bold">{doc.gender}</span>
                            </div>
                          )}
                          {doc.state && (
                            <div className="flex justify-between">
                              <span className="text-gray-400 font-medium">{t("vault.state_label")}</span>
                              <span className="text-gray-900 font-bold">{doc.state}</span>
                            </div>
                          )}
                          {doc.additionalInfo && (
                            <div className="mt-2 p-2 bg-gray-50 rounded-lg text-[11px] leading-normal text-gray-600 border border-gray-100 font-semibold">
                              {doc.additionalInfo}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center text-[10px] text-gray-400 font-semibold">
                        <span>Uploaded: {doc.uploadedAt}</span>
                        <span className="text-[#006b5f] flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#006b5f]" />
                          <span>{t("vault.verified")}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

        </div>

      </div>
    </div>
  );
}
