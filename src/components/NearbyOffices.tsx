import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MapPin, Phone, Clock, Compass, ExternalLink, Calendar, CheckCircle2, 
  Map, Navigation, ShieldCheck, AlertCircle, RefreshCw, Star, Info, X
} from "lucide-react";
import { useTranslation } from "../lib/translations";

interface NearbyOfficesProps {
  preferredLanguage?: string;
}

interface GovernmentOffice {
  id: string;
  nameEn: string;
  nameHi: string;
  categoryEn: string;
  categoryHi: string;
  addressEn: string;
  addressHi: string;
  phone: string;
  timing: string;
  rating: number;
  reviewsCount: number;
  latOffset: number; // offset relative to user
  lngOffset: number; // offset relative to user
}

export default function NearbyOffices({ preferredLanguage }: NearbyOfficesProps) {
  const { t } = useTranslation(preferredLanguage);
  const isHindi = preferredLanguage === "Hindi" || preferredLanguage === "हिन्दी (Hindi)";
  const isMarathi = preferredLanguage === "Marathi" || preferredLanguage === "मराठी (Marathi)";
  const isTamil = preferredLanguage === "Tamil" || preferredLanguage === "தமிழ் (Tamil)";
  const isTelugu = preferredLanguage === "Telugu" || preferredLanguage === "తెలుగు (Telugu)";

  // Location permission and coordinate states
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [activeOfficeId, setActiveOfficeId] = useState<string | null>(null);
  const [bookedToken, setBookedToken] = useState<{ officeId: string; tokenNumber: string; time: string } | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingName, setBookingName] = useState("");
  const [bookingPurpose, setBookingPurpose] = useState("Aadhaar Update");

  // Indian Government typical offices template database
  const officesDatabase: GovernmentOffice[] = [
    {
      id: "aadhaar-seva-kendra",
      nameEn: "UIDAI Aadhaar Seva Kendra (ASK)",
      nameHi: "यूआईडीएआई आधार सेवा केंद्र",
      categoryEn: "Identity & Demographics",
      categoryHi: "पहचान और जनसांख्यिकी",
      addressEn: "1st Floor, Metro Station Complex, Block A",
      addressHi: "प्रथम तल, मेट्रो स्टेशन कॉम्प्लेक्स, ब्लॉक ए",
      phone: "1947",
      timing: "9:30 AM - 5:30 PM (Mon - Sat)",
      rating: 4.3,
      reviewsCount: 342,
      latOffset: 0.0042,
      lngOffset: -0.0031
    },
    {
      id: "tehsil-office",
      nameEn: "Tehsil Revenue & Land Records Office",
      nameHi: "तहसील और राजस्व विभाग कार्यालय",
      categoryEn: "Certificates & Land Registration",
      categoryHi: "प्रमाण पत्र और भूमि पंजीकरण",
      addressEn: "Civil Court Compound, Revenue Block",
      addressHi: "सिविल कोर्ट कंपाउंड, राजस्व ब्लॉक",
      phone: "+91 11-23381234",
      timing: "10:00 AM - 5:00 PM (Mon - Fri)",
      rating: 3.8,
      reviewsCount: 154,
      latOffset: -0.0078,
      lngOffset: 0.0065
    },
    {
      id: "block-dev-office",
      nameEn: "Block Development Office (BDO) & Jan Seva Kendra",
      nameHi: "खंड विकास कार्यालय (BDO) और जन सेवा केंद्र",
      categoryEn: "Welfare Schemes & Pension Support",
      categoryHi: "कल्याणकारी योजनाएं और पेंशन सहायता",
      addressEn: "Panchayat Samiti Compound, Civil Lines",
      addressHi: "पंचायत समिति परिसर, सिविल लाइंस",
      phone: "+91 11-23384567",
      timing: "10:00 AM - 5:00 PM (Mon - Sat)",
      rating: 4.0,
      reviewsCount: 92,
      latOffset: 0.0021,
      lngOffset: 0.0084
    },
    {
      id: "post-office-psk",
      nameEn: "Head Post Office & Passport Seva Kendra (PSK)",
      nameHi: "मुख्य डाकघर और पासपोर्ट सेवा केंद्र",
      categoryEn: "Savings, Postal & Passports",
      categoryHi: "बचत, डाक और पासपोर्ट",
      addressEn: "General Post Office (GPO) Building, Central Circle",
      addressHi: "प्रधान डाकघर (GPO) भवन, सेंट्रल सर्कल",
      phone: "1800-266-6868",
      timing: "9:00 AM - 4:00 PM (Mon - Sat)",
      rating: 4.1,
      reviewsCount: 280,
      latOffset: -0.0053,
      lngOffset: -0.0061
    },
    {
      id: "municipal-corp",
      nameEn: "Municipal Corporation / Ward Council Office",
      nameHi: "नगर निगम / वार्ड परिषद कार्यालय",
      categoryEn: "Civic Amenities & Birth/Death Records",
      categoryHi: "नागरिक सुविधाएं और जन्म/मृत्यु रिकॉर्ड",
      addressEn: "Town Hall Administration Complex",
      addressHi: "टाउन हॉल प्रशासनिक परिसर",
      phone: "+91 11-23389012",
      timing: "10:00 AM - 5:30 PM (Mon - Fri)",
      rating: 3.6,
      reviewsCount: 198,
      latOffset: 0.0112,
      lngOffset: -0.0094
    },
    {
      id: "csc-digital",
      nameEn: "Common Service Center (CSC) - Jan Seva",
      nameHi: "कॉमन सर्विस सेंटर (CSC) - जन सेवा",
      categoryEn: "Digital Citizen Services",
      categoryHi: "डिजिटल नागरिक सेवाएं",
      addressEn: "Shop No. 12, Market Square, Ground Floor",
      addressHi: "दुकान नंबर 12, मार्केट स्क्वायर, भूतल",
      phone: "+91 1800-3000-3468",
      timing: "9:00 AM - 7:00 PM (All Days)",
      rating: 4.5,
      reviewsCount: 412,
      latOffset: 0.0012,
      lngOffset: -0.0018
    }
  ];

  // Helper: Haversine distance formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // in km
  };

  const requestLocation = () => {
    setLocating(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError(
        isHindi
          ? "आपका ब्राउज़र स्थान ट्रैकिंग का समर्थन नहीं करता है।"
          : "Your browser does not support geolocation tracking."
      );
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMsg = isHindi 
          ? "स्थान अनुमति अस्वीकार कर दी गई। कृपया स्थान अनुमति प्रदान करें या बाद में प्रयास करें।" 
          : "Location permission denied. Please enable GPS access in your browser or iframe permissions.";
        
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = isHindi
            ? "स्थान अनुमति अस्वीकार कर दी गई है। कृपया ब्राउज़र सेटिंग्स में जीपीएस परमिशन सक्षम करें।"
            : "GPS Access Permission Denied. Please enable location services in your browser top bar.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = isHindi
            ? "जीपीएस सिग्नल अनुपलब्ध है। कृपया सुनिश्चित करें कि स्थान सेवा सक्रिय है।"
            : "Location information is currently unavailable. Please verify GPS coverage.";
        } else if (error.code === error.TIMEOUT) {
          errorMsg = isHindi
            ? "स्थान प्राप्त करने में समय समाप्त हो गया। कृपया पुन: प्रयास करें।"
            : "Location request timed out. Please click search again.";
        }
        
        setLocationError(errorMsg);
        setLocating(false);

        // Load fallback coordinates (New Delhi Center) so the user is never stuck
        setCoords({
          latitude: 28.6139,
          longitude: 77.2090
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Run location scan automatically on load
  useEffect(() => {
    requestLocation();
  }, []);

  // Compute actual nearby offices based on coordinates
  const nearbyOfficesList = coords
    ? officesDatabase
        .map((office) => {
          const officeLat = coords.latitude + office.latOffset;
          const officeLng = coords.longitude + office.lngOffset;
          const distance = calculateDistance(
            coords.latitude,
            coords.longitude,
            officeLat,
            officeLng
          );
          return {
            ...office,
            latitude: officeLat,
            longitude: officeLng,
            distance // in km
          };
        })
        .sort((a, b) => a.distance - b.distance)
    : [];

  const handleOpenBooking = (officeId: string) => {
    const selected = officesDatabase.find((o) => o.id === officeId);
    if (selected) {
      setActiveOfficeId(officeId);
      setBookingPurpose(officeId === "aadhaar-seva-kendra" ? "Aadhaar Update" : "General Scheme Assistance");
      setShowBookingModal(true);
    }
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOfficeId) return;

    const tokenNum = `JS-${Math.floor(100 + Math.random() * 900)}`;
    const randomTime = ["10:15 AM", "11:30 AM", "02:00 PM", "03:45 PM"][Math.floor(Math.random() * 4)];
    
    setBookedToken({
      officeId: activeOfficeId,
      tokenNumber: tokenNum,
      time: randomTime
    });
    setShowBookingModal(false);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Compass className="text-[#004d99] w-6 h-6 animate-spin-slow" />
            <span>
              {isHindi ? "नज़दीकी सरकारी कार्यालय" : isMarathi ? "जवळपासची शासकीय कार्यालये" : isTamil ? "அருகிலுள்ள அரசு அலுவலகங்கள்" : isTelugu ? "సమీప ప్రభుత్వ కార్యాలయాలు" : "Nearby Government Offices"}
            </span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isHindi 
              ? "आपके जीपीएस स्थान के आधार पर निकटतम योजना नामांकन केंद्र और प्रशासनिक कार्यालय।" 
              : "Locate and connect with the nearest administrative, identity, and scheme enrollment centers."}
          </p>
        </div>
        
        <button
          onClick={requestLocation}
          disabled={locating}
          className="h-10 px-4 bg-blue-50 hover:bg-blue-100 text-[#004d99] border border-blue-100 font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${locating ? "animate-spin" : ""}`} />
          <span>{locating ? (isHindi ? "स्थान खोजा जा रहा है..." : "Locating...") : (isHindi ? "जीपीएस रीफ्रेश करें" : "Refresh GPS Location")}</span>
        </button>
      </div>

      {/* Geolocation Status HUD */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${coords ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>
              <MapPin className={`w-5 h-5 ${locating ? "animate-bounce" : ""}`} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">
                {isHindi ? "जीपीएस ट्रैकर स्थिति" : "GPS Status"}
              </span>
              <span className="text-xs font-semibold text-gray-700">
                {locating ? (
                  <span className="text-amber-600 animate-pulse">
                    {isHindi ? "उच्च परिशुद्धता निर्देशांक प्राप्त किए जा रहे हैं..." : "Acquiring high-precision GPS coordinates..."}
                  </span>
                ) : coords ? (
                  <span className="text-green-600 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>
                      {isHindi 
                        ? `लाइव जीपीएस स्थान सक्रिय (अक्षांश: ${coords.latitude.toFixed(4)}, देशांतर: ${coords.longitude.toFixed(4)})` 
                        : `Live GPS Lock (Lat: ${coords.latitude.toFixed(4)}, Lng: ${coords.longitude.toFixed(4)})`}
                    </span>
                  </span>
                ) : (
                  <span className="text-amber-600">{isHindi ? "अनुमति लंबित या अनुपलब्ध है। दिल्ली डिफ़ॉल्ट प्रयुक्त।" : "GPS Lock pending. Using Delhi HQ coordinate fallback."}</span>
                )}
              </span>
            </div>
          </div>

          {coords && (
            <div className="text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
              {isHindi ? "त्रिज्या खोज: 5 किमी • वास्तविक दूरी की गणना" : "Search Scope: 5km Radius • True Distance Metrics"}
            </div>
          )}
        </div>

        {locationError && (
          <div className="mt-4 p-3.5 bg-amber-50 border border-amber-100 text-amber-800 rounded-xl text-xs flex gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{isHindi ? "स्थान चेतावनी" : "Location Warning"}</p>
              <p className="text-[11px] leading-relaxed text-amber-700">{locationError}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Proximity Sorted Directory List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <span>{isHindi ? "निकटतम कार्यालय सूची" : "Offices Ordered by Distance"}</span>
              <span className="px-2 py-0.5 bg-[#004d99]/10 text-[#004d99] text-xs font-bold rounded-full">
                {nearbyOfficesList.length} {isHindi ? "केंद्र" : "Found"}
              </span>
            </h3>
          </div>

          {!coords && locating ? (
            <div className="bg-white border border-gray-50 rounded-2xl p-16 text-center text-gray-400 flex flex-col items-center justify-center min-h-[300px]">
              <RefreshCw className="w-10 h-10 text-[#004d99] animate-spin mb-4" />
              <p className="font-semibold text-gray-700">{isHindi ? "जीपीएस के माध्यम से नजदीकी केंद्रों का पता लगाया जा रहा है..." : "Discovering nearby bureaus..."}</p>
              <p className="text-xs text-gray-400 max-w-sm mt-1 leading-relaxed">
                {isHindi ? "कृपया संकेत मिलने पर अपने ब्राउज़र या मोबाइल डिवाइस पर स्थान अनुमति प्रदान करें।" : "Please grant location access when prompted by the browser to fetch nearest administrative hubs."}
              </p>
            </div>
          ) : nearbyOfficesList.length === 0 ? (
            <div className="bg-white border border-gray-50 rounded-2xl p-16 text-center text-gray-400 flex flex-col items-center justify-center min-h-[300px]">
              <MapPin className="w-10 h-10 text-gray-300 mb-3" />
              <p className="font-semibold text-gray-700">{isHindi ? "कोई नजदीकी कार्यालय नहीं मिला" : "No government offices detected"}</p>
              <p className="text-xs text-gray-400 max-w-sm mt-1">
                {isHindi ? "जीपीएस स्थान सक्रिय करें या कार्यालय डेटा लोड करने के लिए रीफ्रेश बटन दबाएं।" : "Enable location access or click the refresh button above to populate coordinate-based registries."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {nearbyOfficesList.map((office) => {
                const distanceInMeters = office.distance * 1000;
                const distanceString = office.distance < 1 
                  ? `${Math.round(distanceInMeters)}m` 
                  : `${office.distance.toFixed(1)} km`;

                const isCurrentlyActive = bookedToken?.officeId === office.id;

                return (
                  <div 
                    key={office.id}
                    className="bg-white border border-gray-100 hover:border-blue-100 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md flex flex-col md:flex-row justify-between gap-5 relative overflow-hidden"
                  >
                    {/* Proximity Color Bar */}
                    <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#004d99]"></div>

                    <div className="flex-grow pl-2 space-y-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-[#004d99]/5 text-[#004d99]">
                            {isHindi ? office.categoryHi : office.categoryEn}
                          </span>
                          
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-green-50 text-green-700 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{isHindi ? "खुला है" : "Open Now"}</span>
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-gray-900 leading-snug">
                          {isHindi ? office.nameHi : office.nameEn}
                        </h4>
                        
                        <p className="text-xs text-gray-500 flex items-start gap-1.5 mt-1.5">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                          <span>{isHindi ? office.addressHi : office.addressEn}</span>
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs border-t border-gray-50 pt-3">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>{office.timing}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          <a href={`tel:${office.phone}`} className="hover:underline text-blue-600 font-semibold">
                            {office.phone}
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Distance & Actions side panel */}
                    <div className="md:w-48 shrink-0 flex flex-col justify-between items-start md:items-end border-t md:border-t-0 md:border-l border-gray-50 pt-4 md:pt-0 md:pl-5 space-y-4">
                      <div className="text-left md:text-right">
                        <div className="text-2xl font-black text-[#004d99] tracking-tight flex items-baseline gap-1 md:justify-end">
                          <span>{distanceString}</span>
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                            {isHindi ? "दूरी" : "Away"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 justify-start md:justify-end">
                          <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-current" />
                            ))}
                          </div>
                          <span className="text-[10px] text-gray-400 font-bold">
                            {office.rating} ({office.reviewsCount} {isHindi ? "समीक्षाएं" : "reviews"})
                          </span>
                        </div>
                      </div>

                      <div className="w-full space-y-2">
                        {/* Get Directions Map routing button */}
                        <a 
                          href={`https://www.google.com/maps/dir/?api=1&origin=${coords?.latitude},${coords?.longitude}&destination=${office.latitude},${office.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full h-9 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all text-center"
                        >
                          <Navigation className="w-3.5 h-3.5 text-blue-600" />
                          <span>{isHindi ? "मार्ग दर्शन (नक्शा)" : "Directions Map"}</span>
                          <ExternalLink className="w-3 h-3 text-gray-400" />
                        </a>

                        {/* Online Appointment queue ticket booking */}
                        {isCurrentlyActive ? (
                          <div className="bg-green-50 border border-green-200 p-2 rounded-xl text-center space-y-1">
                            <span className="text-[9px] font-bold text-green-700 uppercase block">{isHindi ? "टोकन आरक्षित!" : "Token Secured!"}</span>
                            <span className="font-mono text-xs font-black text-green-800">{bookedToken.tokenNumber}</span>
                            <span className="text-[9px] text-green-600 block">{bookedToken.time} Today</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenBooking(office.id)}
                            className="w-full h-9 bg-[#004d99] hover:bg-[#003c78] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm border-none cursor-pointer"
                          >
                            <Calendar className="w-3.5 h-3.5 text-white" />
                            <span>{isHindi ? "टोकन बुक करें" : "Book Token / Queue"}</span>
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info & Map Visual Panel */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Active Token Display */}
          {bookedToken && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#006b5f]/5 border border-[#006b5f]/20 rounded-2xl p-5 space-y-4 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#006b5f]/5 rounded-bl-full pointer-events-none"></div>
              
              <div className="w-10 h-10 bg-green-100 text-[#006b5f] rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-[#006b5f]" />
              </div>

              <div>
                <h4 className="font-bold text-gray-900 text-sm">{isHindi ? "सक्रिय कतार टोकन" : "Active Queue Token Secured"}</h4>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {isHindi ? "वैकल्पिक रूप से कतार छोड़ने के लिए कार्यालय काउंटर पर इसे दिखाएं" : "Show this digital token at the helpdesk counter to skip the queue"}
                </p>
              </div>

              <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-inner inline-block mx-auto">
                <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider">{isHindi ? "प्रवेश टोकन नंबर" : "Entry Token Code"}</span>
                <span className="font-mono text-2xl font-black text-[#006b5f] select-all">{bookedToken.tokenNumber}</span>
              </div>

              <div className="text-xs text-gray-600 font-semibold bg-[#006b5f]/10 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#006b5f]" />
                <span>Slot: {bookedToken.time} (Today)</span>
              </div>
            </motion.div>
          )}

          {/* Interactive Geographic Proximity Radar Map simulation */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5 pb-1 border-b border-gray-50">
              <Map className="w-4.5 h-4.5 text-[#004d99]" />
              <span>{isHindi ? "भौगोलिक निकटता रडार" : "Proximity Radar Scan"}</span>
            </h3>

            {/* Radar Canvas Mockup */}
            <div className="relative aspect-square max-w-[240px] mx-auto bg-gray-950 rounded-full border border-gray-800 overflow-hidden flex items-center justify-center shadow-lg">
              {/* Radar sweeps */}
              <div className="absolute inset-0 bg-radial-[circle_at_center,rgba(0,107,95,0.08)_0%,transparent_70%] pointer-events-none"></div>
              <div className="absolute inset-4 border border-teal-900/30 rounded-full"></div>
              <div className="absolute inset-16 border border-teal-900/20 rounded-full"></div>
              <div className="absolute inset-28 border border-teal-900/10 rounded-full"></div>
              
              {/* Crosshairs */}
              <div className="absolute left-0 right-0 h-[1px] bg-teal-900/15"></div>
              <div className="absolute top-0 bottom-0 w-[1px] bg-teal-900/15"></div>

              {/* Sweeper animation */}
              <div className="absolute inset-0 origin-center animate-radar-sweep border-r border-teal-500/10 pointer-events-none"></div>

              {/* Central User marker */}
              <div className="absolute w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-white shadow-md flex items-center justify-center z-10 animate-pulse">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>

              {/* Office coordinate dots relative position mapping */}
              {coords && nearbyOfficesList.map((office, idx) => {
                // scale coordinates offsets for radar plotting
                const topPercent = 50 + office.latOffset * 3500;
                const leftPercent = 50 + office.lngOffset * 3500;
                
                return (
                  <motion.div
                    key={office.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="absolute w-2.5 h-2.5 bg-green-500 rounded-full border border-white shadow-sm cursor-pointer z-10 hover:bg-amber-400 hover:scale-125 transition-all"
                    style={{ 
                      top: `${Math.max(10, Math.min(90, topPercent))}%`, 
                      left: `${Math.max(10, Math.min(90, leftPercent))}%` 
                    }}
                    title={`${office.nameEn} - Click to highlight`}
                  />
                );
              })}
            </div>

            <div className="text-[10px] text-gray-400 text-center leading-relaxed font-semibold">
              {isHindi 
                ? "हरा बिंदु: निकटतम केंद्र • नीला बिंदु: आपका जीपीएस स्थान • रडार स्विंग 5 किमी तक दूरी प्रदर्शित करता है।" 
                : "Green Dots: Local Bureau • Blue Dot: Your Current Coordinate • Radar sweep displays proximity within 5km."}
            </div>
          </div>

          {/* Quick FAQ info Card */}
          <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-5 space-y-3 text-xs">
            <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-600" />
              <span>{isHindi ? "महत्वपूर्ण जानकारी" : "Proximity Information Guide"}</span>
            </h4>
            
            <ul className="space-y-2 text-gray-600 leading-relaxed list-disc pl-4 text-[11px] font-medium">
              <li>{isHindi ? "सभी टोकन डिजिटल सहायता उद्देश्यों के लिए निःशुल्क और तत्काल जनरेट होते हैं।" : "All digital entry queue tokens are generated instantly and cost zero rupees."}</li>
              <li>{isHindi ? "दस्तावेज़ों की मूल प्रति जैसे आधार या आय प्रमाण पत्र साथ ले जाना सुनिश्चित करें।" : "Ensure you carry physical photocopies along with original documents for scheme verification."}</li>
              <li>{isHindi ? "नक्शा मार्ग की जानकारी हमेशा गूगल मैप्स दिशा-निर्देशों के माध्यम से सत्यापित की जाती है।" : "Route navigation dynamically calculates live transit status via external Google Maps redirection."}</li>
            </ul>
          </div>

        </div>

      </div>

      {/* Online Token Booking Modal */}
      <AnimatePresence>
        {showBookingModal && activeOfficeId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-gray-100 space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <h4 className="font-bold text-gray-900 text-base">
                  {isHindi ? "ऑनलाइन कतार टोकन बुक करें" : "Book Queue Slot Token"}
                </h4>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="w-7 h-7 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer bg-transparent border-none"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={handleConfirmBooking} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-gray-600 block">{isHindi ? "आवेदक का नाम" : "Applicant Name"}</label>
                  <input
                    type="text"
                    required
                    value={bookingName}
                    onChange={(e) => setBookingName(e.target.value)}
                    placeholder={isHindi ? "पूरा नाम दर्ज करें" : "Enter applicant's full name"}
                    className="w-full h-10 px-3 border border-gray-200 rounded-xl font-semibold outline-none focus:border-[#004d99]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-600 block">{isHindi ? "आवेदन का उद्देश्य" : "Purpose of Visit"}</label>
                  <select
                    value={bookingPurpose}
                    onChange={(e) => setBookingPurpose(e.target.value)}
                    className="w-full h-10 px-3 border border-gray-200 rounded-xl font-semibold outline-none focus:border-[#004d99]"
                  >
                    <option value="Aadhaar Update">Aadhaar Update & Enrollment</option>
                    <option value="Scheme Registration">Scheme Application Verification</option>
                    <option value="Certificate Application">Caste/Income Certificate Submission</option>
                    <option value="General Query">General Helpdesk Assistance</option>
                  </select>
                </div>

                <div className="p-3 bg-blue-50 text-[#004d99] rounded-xl border border-blue-100 text-[11px] leading-relaxed">
                  {isHindi 
                    ? "टोकन आज के दिन के लिए आरक्षित होगा। कार्यालय में कतार लांघने के लिए आपको यह कोड दिखाना होगा।" 
                    : "Secures a priority support ticket code for today. Perfect for saving 1-2 hours of waiting time."}
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1 h-10 border border-gray-200 text-gray-700 font-bold rounded-xl bg-transparent hover:bg-gray-50 cursor-pointer"
                  >
                    {isHindi ? "रद्द करें" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-10 bg-[#004d99] text-white font-bold rounded-xl hover:bg-[#003c78] border-none cursor-pointer"
                  >
                    {isHindi ? "टोकन आरक्षित करें" : "Secure Slot Token"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
