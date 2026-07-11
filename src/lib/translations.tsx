import React, { createContext, useContext } from "react";

export type LanguageCode = "English" | "Hindi" | "Marathi" | "Tamil" | "Telugu";

// Translation dictionary for all 5 supported languages
export const translations: Record<LanguageCode, Record<string, string>> = {
  English: {
    // Navbar/Global Navigation
    "nav.home": "Home",
    "nav.schemes": "Schemes",
    "nav.eligibility": "Check Eligibility",
    "nav.vault": "Document Vault",
    "nav.chat": "Chat Assistant",
    "nav.family": "Family Profiles",
    "nav.reminders": "Deadlines",
    "nav.profile": "Profile",
    "app.name": "JanSathi",
    "app.tagline": "Gov Scheme Assistant",

    // Home / Greeting
    "home.hello": "Hello",
    "home.daily_update": "Here is your daily update.",
    "home.profile_strength": "Profile Strength",
    "home.incomplete_banner_title": "Citizen Parameters Not Setup",
    "home.incomplete_banner_desc": "You have not yet specified your age, state, or social category. Please provide this data so JanSathi can accurately find matching government benefits for you.",
    "home.setup_profile_now": "Setup Profile Now",
    "home.eligibility_status": "Eligibility Status",
    "home.schemes_count": "{count} Schemes",
    "home.schemes_count_desc": "You qualify for these schemes based on your age, state, and profile criteria. Keep your documents updated to apply immediately.",
    "home.view_eligible_schemes": "View Eligible Schemes",
    "home.active_applications": "{count} Active",
    "home.applications_processing": "Applications processing",
    "home.track_status": "Track Application Status",
    "home.quick_actions": "Quick Actions",
    "home.recommended": "Recommended for You",
    "home.see_all": "See all",
    "home.match_rate": "Match Rate: {rate}%",
    "home.view_details": "View Details",
    "home.recent_updates": "Recent Updates",

    // Quick Actions buttons
    "action.check_eligibility": "Check Eligibility",
    "action.ask_ai": "Ask AI Assistant",
    "action.upload_docs": "Upload Documents",
    "action.view_deadlines": "View Deadlines",
    "action.new_schemes": "New Schemes",
    "action.nearby_offices": "Nearby Offices",

    // Explore Schemes Page
    "schemes.title": "Explore Government Schemes",
    "schemes.subtitle": "Browse through centrally launched and state-supported schemes categorized for simple discovery.",
    "schemes.search_placeholder": "Search schemes...",
    "schemes.deadline": "Deadline",
    "schemes.view_full_details": "View Full Details",
    "schemes.back": "Back to Schemes",
    "schemes.overview": "Scheme Overview",
    "schemes.benefits": "Scheme Benefits & Financial Incentives",
    "schemes.eligibility_req": "Eligibility Requirements",
    "schemes.min_age": "Minimum Age",
    "schemes.max_age": "Maximum Age",
    "schemes.income_limit": "Annual Family Income Limit",
    "schemes.target_genders": "Target Genders",
    "schemes.domicile_states": "Domicile States",
    "schemes.required_docs": "Required Documents Checkbox",
    "schemes.official_website": "Official Website",
    "schemes.apply_ai": "Apply with AI Assistant",

    // Eligibility Checker
    "eligibility.title": "Personalized Eligibility Checker",
    "eligibility.subtitle": "Complete your citizen parameters below. Our algorithm matches your profile against centrally and state-stored scheme rules.",
    "eligibility.profile": "Citizen Profile",
    "eligibility.age": "Age (Years)",
    "eligibility.state": "State of Residence",
    "eligibility.occupation": "Occupation",
    "eligibility.income": "Annual Family Income (INR)",
    "eligibility.gender": "Gender",
    "eligibility.category": "Social Category",
    "eligibility.education": "Highest Education Level",
    "eligibility.disabled": "Differently Abled (PwD)",
    "eligibility.check_btn": "Check Eligible Schemes",
    "eligibility.awaiting": "Awaiting Profile Selection",
    "eligibility.awaiting_desc": "Configure your citizen details on the left panel and click \"Check Eligible Schemes\" to query the database.",
    "eligibility.found_msg": "We found {count} schemes matched exactly to your citizen parameters.",
    "eligibility.no_matches": "No Exact Matches Found",
    "eligibility.no_matches_desc": "Try adjusting your parameters (such as increasing the income limit or exploring options in different education roles).",
    "eligibility.match_rate_100": "Eligible 100%",
    "eligibility.view_apply": "View Criteria & Apply",

    // Document Vault
    "vault.title": "Digital Document Vault",
    "vault.subtitle": "Upload and manage your eligibility credentials. Uploaded certificates can be automatically parsed with Gemini AI OCR.",
    "vault.uploaded_docs": "Uploaded Certificates",
    "vault.verified": "VERIFIED OCR",
    "vault.id_num": "ID Number",
    "vault.expiry": "Expiry Date",
    "vault.holder": "Holder Name",
    "vault.details": "Parsed Details",
    "vault.dob": "DOB",
    "vault.gender_label": "Gender",
    "vault.state_label": "State",
    "vault.extra": "Additional Info",
    "vault.delete": "Delete Document",
    "vault.upload_area_title": "Secure Vault Upload",
    "vault.upload_area_desc": "Drag and drop your document here, or click to browse local files",
    "vault.upload_area_sub": "Supports JPG, PNG images. Processing handled with client-private encrypted sandbox.",
    "vault.demo_button": "Quick Demo Upload",

    // AI Chat
    "chat.title": "JanSathi AI Assistance Companion",
    "chat.subtitle": "AI-powered companion to help understand Indian government policies, calculate micro-eligibilities, and assist with application logic.",
    "chat.welcome": "Hello! I am your JanSathi AI scheme companion. How can I help you today?",
    "chat.placeholder": "Type your query here...",
    "chat.starter_1": "What are the benefits of PM-KISAN?",
    "chat.starter_2": "Am I eligible for PM Vidyalakshmi loan scheme?",
    "chat.starter_3": "Which housing schemes are available for West Bengal?",
    "chat.starter_4": "What documents do I need for Ayushman Bharat?",

    // Family Profiles
    "family.title": "Family Profile Directory",
    "family.subtitle": "Add and manage parameters of your dependents to analyze cross-family welfare eligibilities instantly.",
    "family.members_count": "Family Members ({count})",
    "family.relationship": "Relationship",
    "family.age_years": "{age} years",
    "family.income_inr": "Income: ₹ {income} / yr",
    "family.occupation_label": "Occupation",
    "family.edu_label": "Education",
    "family.category_label": "Category",
    "family.disabled_label": "PwD",
    "family.check_eligibility_for": "Check Schemes for {name}",
    "family.add_member": "Add Family Member",
    "family.full_name": "Full Name",
    "family.select_rel": "Select Relationship",
    "family.delete_btn": "Delete",

    // Deadlines / Reminders
    "reminders.title": "Government Deadlines & Reminders",
    "reminders.subtitle": "Never miss application cut-off dates or critical certificate renewals.",
    "reminders.active_deadlines": "Active Deadlines ({count})",
    "reminders.add_title": "Schedule Custom Renewal Reminder",
    "reminders.input_title": "Reminder Title",
    "reminders.input_scheme": "Associated Government Scheme",
    "reminders.input_date": "Due Date",
    "reminders.input_type": "Reminder Type",
    "reminders.btn_add": "Add Reminder Timeline",
    "reminders.completed": "Completed",

    // Profile View
    "profile.header_title": "Citizen Profile Settings",
    "profile.language_title": "Preferred Language Selector",
    "profile.sync_title": "Supabase Backend Sync",
    "profile.connected": "CONNECTED",
    "profile.project_id": "Project ID",
    "profile.project_url": "Project URL",
    "profile.auto_sync": "Automatic Synchronization:",
    "profile.test_connection": "Test Connection Status",
    "profile.about_title": "About JanSathi Platform",
    "profile.sign_out": "Sign Out"
  },
  Hindi: {
    // Navbar/Global Navigation
    "nav.home": "होम",
    "nav.schemes": "योजनाएं",
    "nav.eligibility": "पात्रता जांचें",
    "nav.vault": "दस्तावेज़ तिजोरी",
    "nav.chat": "चैट सहायक",
    "nav.family": "पारिवारिक प्रोफ़ाइल",
    "nav.reminders": "समय सीमा",
    "nav.profile": "प्रोफ़ाइल",
    "app.name": "जनसाथी",
    "app.tagline": "सरकारी योजना सहायक",

    // Home / Greeting
    "home.hello": "नमस्ते",
    "home.daily_update": "यहाँ आपका दैनिक अपडेट है।",
    "home.profile_strength": "प्रोफ़ाइल पूर्णता",
    "home.incomplete_banner_title": "नागरिक विवरण पूर्ण नहीं है",
    "home.incomplete_banner_desc": "आपने अभी तक अपनी आयु, राज्य या सामाजिक श्रेणी निर्दिष्ट नहीं की है। कृपया यह विवरण प्रदान करें ताकि जनसाथी आपके लिए सटीक सरकारी योजनाओं का पता लगा सके।",
    "home.setup_profile_now": "अभी प्रोफ़ाइल सेट करें",
    "home.eligibility_status": "पात्रता की स्थिति",
    "home.schemes_count": "{count} योजनाएं",
    "home.schemes_count_desc": "आप अपनी आयु, राज्य और प्रोफ़ाइल मानदंडों के आधार पर इन योजनाओं के लिए पात्र हैं। तुरंत आवेदन करने के लिए अपने दस्तावेज़ अद्यतित रखें।",
    "home.view_eligible_schemes": "पात्र योजनाएं देखें",
    "home.active_applications": "{count} सक्रिय",
    "home.applications_processing": "प्रक्रियाधीन आवेदन",
    "home.track_status": "आवेदन की स्थिति ट्रैक करें",
    "home.quick_actions": "त्वरित विकल्प",
    "home.recommended": "आपके लिए अनुशंसित योजनाएं",
    "home.see_all": "सभी देखें",
    "home.match_rate": "सटीकता दर: {rate}%",
    "home.view_details": "विवरण देखें",
    "home.recent_updates": "हाल के अपडेट",

    // Quick Actions
    "action.check_eligibility": "पात्रता जांचें",
    "action.ask_ai": "AI सहायक से पूछें",
    "action.upload_docs": "दस्तावेज़ अपलोड करें",
    "action.view_deadlines": "समय सीमा देखें",
    "action.new_schemes": "नई योजनाएं",
    "action.nearby_offices": "नज़दीकी कार्यालय",

    // Explore Schemes Page
    "schemes.title": "सरकारी योजनाएं देखें",
    "schemes.subtitle": "केंद्रीय और राज्य विभागों में उपलब्ध योजनाओं को आसानी से खोजें और ब्राउज़ करें।",
    "schemes.search_placeholder": "योजनाएं खोजें...",
    "schemes.deadline": "अंतिम तिथि",
    "schemes.view_full_details": "पूर्ण विवरण देखें",
    "schemes.back": "योजनाओं पर वापस जाएं",
    "schemes.overview": "योजना का विवरण",
    "schemes.benefits": "योजना के लाभ और वित्तीय सहायता",
    "schemes.eligibility_req": "पात्रता की आवश्यकताएं",
    "schemes.min_age": "न्यूनतम आयु",
    "schemes.max_age": "अधिकतम आयु",
    "schemes.income_limit": "वार्षिक पारिवारिक आय सीमा",
    "schemes.target_genders": "लक्षित लिंग",
    "schemes.domicile_states": "मूल निवासी राज्य",
    "schemes.required_docs": "आवश्यक दस्तावेज़",
    "schemes.official_website": "आधिकारिक वेबसाइट",
    "schemes.apply_ai": "AI सहायक के साथ आवेदन करें",

    // Eligibility Checker
    "eligibility.title": "व्यक्तिगत पात्रता चेकर",
    "eligibility.subtitle": "नीचे अपने नागरिक पैरामीटर भरें। हमारा एल्गोरिदम केंद्रीय और राज्य स्तर की योजनाओं के नियमों के साथ आपकी प्रोफ़ाइल का मिलान करता है।",
    "eligibility.profile": "नागरिक प्रोफ़ाइल",
    "eligibility.age": "आयु (वर्ष)",
    "eligibility.state": "निवास का राज्य",
    "eligibility.occupation": "व्यवसाय",
    "eligibility.income": "वार्षिक पारिवारिक आय (INR)",
    "eligibility.gender": "लिंग",
    "eligibility.category": "सामाजिक श्रेणी",
    "eligibility.education": "उच्चतम शिक्षा स्तर",
    "eligibility.disabled": "दिव्यांगजन (PwD)",
    "eligibility.check_btn": "पात्र योजनाओं की जांच करें",
    "eligibility.awaiting": "प्रोफ़ाइल चयन की प्रतीक्षा है",
    "eligibility.awaiting_desc": "बाएं पैनल पर अपना नागरिक विवरण सेट करें और डेटाबेस में खोजने के लिए \"पात्र योजनाओं की जांच करें\" पर क्लिक करें।",
    "eligibility.found_msg": "हमें आपके नागरिक मापदंडों से बिल्कुल मेल खाती हुई {count} योजनाएं मिली हैं।",
    "eligibility.no_matches": "कोई सटीक मिलान नहीं मिला",
    "eligibility.no_matches_desc": "अपने मापदंडों को समायोजित करने का प्रयास करें (जैसे कि आय सीमा बढ़ाना या विभिन्न शैक्षिक भूमिकाओं में विकल्पों की खोज करना)।",
    "eligibility.match_rate_100": "पात्र 100%",
    "eligibility.view_apply": "पात्रता देखें और आवेदन करें",

    // Document Vault
    "vault.title": "डिजिटल दस्तावेज़ तिजोरी",
    "vault.subtitle": "अपनी पात्रता क्रेडेंशियल अपलोड और प्रबंधित करें। अपलोड किए गए प्रमाणपत्रों को जेमिनी AI OCR के साथ स्वचालित रूप से पार्स किया जा सकता है।",
    "vault.uploaded_docs": "अपलोड किए गए प्रमाणपत्र",
    "vault.verified": "सत्यापित OCR",
    "vault.id_num": "पहचान संख्या",
    "vault.expiry": "अंतिम तिथि",
    "vault.holder": "धारक का नाम",
    "vault.details": "पार्स किए गए विवरण",
    "vault.dob": "जन्म तिथि",
    "vault.gender_label": "लिंग",
    "vault.state_label": "राज्य",
    "vault.extra": "अतिरिक्त जानकारी",
    "vault.delete": "दस्तावेज़ हटाएं",
    "vault.upload_area_title": "सुरक्षित तिजोरी अपलोड",
    "vault.upload_area_desc": "अपने दस्तावेज़ को यहाँ खींचें और छोड़ें, या स्थानीय फ़ाइलों को ब्राउज़ करने के लिए क्लिक करें",
    "vault.upload_area_sub": "JPG, PNG छवियों का समर्थन करता है। ग्राहक-निजी सुरक्षित सैंडबॉक्स के साथ संसाधित।",
    "vault.demo_button": "त्वरित डेमो अपलोड",

    // AI Chat
    "chat.title": "जनसाथी AI सहायता सहयोगी",
    "chat.subtitle": "भारतीय सरकारी नीतियों को समझने, पात्रता की गणना करने और आवेदन प्रक्रिया में सहायता के लिए AI-संचालित सहयोगी।",
    "chat.welcome": "नमस्ते! मैं आपका जनसाथी AI योजना सहयोगी हूँ। आज मैं आपकी क्या सहायता कर सकता हूँ?",
    "chat.placeholder": "अपनी शंका यहाँ लिखें...",
    "chat.starter_1": "पीएम-किसान के क्या लाभ हैं?",
    "chat.starter_2": "क्या मैं पीएम विद्यालक्ष्मी ऋण योजना के लिए पात्र हूँ?",
    "chat.starter_3": "पश्चिम बंगाल के लिए कौन सी आवास योजनाएं उपलब्ध हैं?",
    "chat.starter_4": "आयुष्मान भारत के लिए मुझे किन दस्तावेज़ों की आवश्यकता है?",

    // Family Profiles
    "family.title": "पारिवारिक प्रोफ़ाइल निर्देशिका",
    "family.subtitle": "तत्काल संपूर्ण परिवार कल्याण पात्रता का विश्लेषण करने के लिए अपने आश्रितों के विवरण जोड़ें और प्रबंधित करें।",
    "family.members_count": "परिवार के सदस्य ({count})",
    "family.relationship": "संबंध",
    "family.age_years": "{age} वर्ष",
    "family.income_inr": "आय: ₹ {income} / वर्ष",
    "family.occupation_label": "व्यवसाय",
    "family.edu_label": "शिक्षा",
    "family.category_label": "श्रेणी",
    "family.disabled_label": "दिव्यांग",
    "family.check_eligibility_for": "{name} के लिए योजनाएं जांचें",
    "family.add_member": "परिवार का सदस्य जोड़ें",
    "family.full_name": "पूरा नाम",
    "family.select_rel": "संबंध चुनें",
    "family.delete_btn": "हटाएं",

    // Deadlines / Reminders
    "reminders.title": "सरकारी समय सीमा और अनुस्मारक",
    "reminders.subtitle": "आवेदन की अंतिम तिथियों या महत्वपूर्ण प्रमाणपत्र नवीनीकरण से कभी न चूकें।",
    "reminders.active_deadlines": "सक्रिय समय सीमा ({count})",
    "reminders.add_title": "कस्टम नवीनीकरण अनुस्मारक शेड्यूल करें",
    "reminders.input_title": "अनुस्मारक शीर्षक",
    "reminders.input_scheme": "संबद्ध सरकारी योजना",
    "reminders.input_date": "नियत तारीख",
    "reminders.input_type": "अनुस्मारक प्रकार",
    "reminders.btn_add": "समय सीमा जोड़ें",
    "reminders.completed": "पूर्ण",

    // Profile View
    "profile.header_title": "नागरिक प्रोफ़ाइल सेटिंग्स",
    "profile.language_title": "पसंदीदा भाषा चयन",
    "profile.sync_title": "सुपाबेस बैकएंड सिंक",
    "profile.connected": "संबद्ध",
    "profile.project_id": "परियोजना ID",
    "profile.project_url": "परियोजना URL",
    "profile.auto_sync": "स्वचालित तुल्यकालन (सिंक):",
    "profile.test_connection": "कनेक्शन की स्थिति का परीक्षण करें",
    "profile.about_title": "जनसाथी मंच के बारे में",
    "profile.sign_out": "साइन आउट"
  },
  Marathi: {
    // Navbar/Global Navigation
    "nav.home": "होम",
    "nav.schemes": "योजना",
    "nav.eligibility": "पात्रता तपासा",
    "nav.vault": "कागदपत्र तिजोरी",
    "nav.chat": "चॅट सहाय्यक",
    "nav.family": "कौटुंबिक प्रोफाइल",
    "nav.reminders": "मुदत तारीख",
    "nav.profile": "प्रोफाइल",
    "app.name": "जनसाथी",
    "app.tagline": "शासकीय योजना सहाय्यक",

    // Home / Greeting
    "home.hello": "नमस्कार",
    "home.daily_update": "येथे आपले दैनिक अपडेट आहे.",
    "home.profile_strength": "प्रोफाइल पूर्णता",
    "home.incomplete_banner_title": "नागरिक तपशील अपूर्ण आहे",
    "home.incomplete_banner_desc": "तुम्ही अद्याप तुमचे वय, राज्य किंवा सामाजिक प्रवर्ग निवडलेला नाही. कृपया ही माहिती द्या जेणेकरून जनसाथी तुमच्यासाठी अचूक शासकीय योजना शोधू शकेल.",
    "home.setup_profile_now": "आता प्रोफाइल सेट करा",
    "home.eligibility_status": "पात्रतेची स्थिती",
    "home.schemes_count": "{count} योजना",
    "home.schemes_count_desc": "तुम्ही तुमच्या वय, राज्य आणि प्रोफाइल निकषांवर आधारित या योजनांसाठी पात्र आहात. त्वरित अर्ज करण्यासाठी तुमची कागदपत्रे अद्ययावत ठेवा.",
    "home.view_eligible_schemes": "पात्र योजना पहा",
    "home.active_applications": "{count} सक्रिय",
    "home.applications_processing": "प्रक्रियाधीन अर्ज",
    "home.track_status": "अर्जाची स्थिती ट्रॅक करा",
    "home.quick_actions": "जलद पर्याय",
    "home.recommended": "तुमच्यासाठी शिफारस केलेल्या योजना",
    "home.see_all": "सर्व पहा",
    "home.match_rate": "पात्रता दर: {rate}%",
    "home.view_details": "तपशील पहा",
    "home.recent_updates": "नवीन अपडेट्स",

    // Quick Actions
    "action.check_eligibility": "पात्रता तपासा",
    "action.ask_ai": "AI सहाय्यकाला विचारा",
    "action.upload_docs": "कागदपत्रे अपलोड करा",
    "action.view_deadlines": "मुदत पहा",
    "action.new_schemes": "नवीन योजना",
    "action.nearby_offices": "जवळपासची कार्यालये",

    // Explore Schemes Page
    "schemes.title": "शासकीय योजना शोधा",
    "schemes.subtitle": "केंद्रीय आणि राज्य विभागांमध्ये उपलब्ध असलेल्या योजना सहजपणे शोधा आणि ब्राउझ करा.",
    "schemes.search_placeholder": "योजना शोधा...",
    "schemes.deadline": "अंतिम तारीख",
    "schemes.view_full_details": "पूर्ण तपशील पहा",
    "schemes.back": "योजनांवर परत जा",
    "schemes.overview": "योजनेचे विहंगावलोकन",
    "schemes.benefits": "योजनेचे फायदे आणि आर्थिक सहाय्य",
    "schemes.eligibility_req": "पात्रतेची आवश्यकता",
    "schemes.min_age": "किमान वय",
    "schemes.max_age": "कमाल वय",
    "schemes.income_limit": "वार्षिक कौटुंबिक उत्पन्न मर्यादा",
    "schemes.target_genders": "लक्षित लिंग",
    "schemes.domicile_states": "रहिवासी राज्य",
    "schemes.required_docs": "आवश्यक कागदपत्रे",
    "schemes.official_website": "अधिकृत संकेतस्थळ",
    "schemes.apply_ai": "AI सहाय्यकासह अर्ज करा",

    // Eligibility Checker
    "eligibility.title": "वैयक्तिकृत पात्रता तपासक",
    "eligibility.subtitle": "खाली आपले नागरिक मापदंड पूर्ण करा. आमचे अल्गोरिदम आपल्या प्रोफाइलचे केंद्रीय आणि राज्य-स्तरीय योजनेच्या नियमांशी जुळवून घेते.",
    "eligibility.profile": "नागरिक प्रोफाइल",
    "eligibility.age": "वय (वर्षे)",
    "eligibility.state": "रहिवासी राज्य",
    "eligibility.occupation": "व्यवसाय",
    "eligibility.income": "वार्षिक कौटुंबिक उत्पन्न (INR)",
    "eligibility.gender": "लिंग",
    "eligibility.category": "सामाजिक प्रवर्ग",
    "eligibility.education": "उच्चतम शिक्षण पातळी",
    "eligibility.disabled": "दिव्यांग व्यक्ती (PwD)",
    "eligibility.check_btn": "पात्र योजना तपासा",
    "eligibility.awaiting": "प्रोफाइल निवडीची प्रतीक्षा आहे",
    "eligibility.awaiting_desc": "डाव्या पॅनेलवर आपले नागरिक तपशील सेट करा आणि डेटाबेसमध्ये शोधण्यासाठी \"पात्र योजना तपासा\" वर क्लिक करा.",
    "eligibility.found_msg": "आम्हाला आपल्या नागरिक मापदंडांशी तंतोतंत जुळणाऱ्या {count} योजना सापडल्या आहेत.",
    "eligibility.no_matches": "तंतोतंत जुळणी सापडली नाही",
    "eligibility.no_matches_desc": "आपले मापदंड समायोजित करण्याचा प्रयत्न करा (उदा. उत्पन्न मर्यादा वाढवणे किंवा वेगवेगळ्या शैक्षणिक भूमिकांमध्ये पर्यायांचा शोध घेणे).",
    "eligibility.match_rate_100": "पात्र १००%",
    "eligibility.view_apply": "पात्रता पहा आणि अर्ज करा",

    // Document Vault
    "vault.title": "डिजिटल कागदपत्र तिजोरी",
    "vault.subtitle": "आपल्या पात्रतेची कागदपत्रे अपलोड आणि व्यवस्थापित करा. अपलोड केलेली प्रमाणपत्रे जेमिनी AI OCR द्वारे स्वयंचलितपणे तपासली जाऊ शकतात.",
    "vault.uploaded_docs": "अपलोड केलेली प्रमाणपत्रे",
    "vault.verified": "प्रमाणित OCR",
    "vault.id_num": "ओळख क्रमांक",
    "vault.expiry": "मुदत संपण्याची तारीख",
    "vault.holder": "धारकाचे नाव",
    "vault.details": "पार्स केलेले तपशील",
    "vault.dob": "जन्म तारीख",
    "vault.gender_label": "लिंग",
    "vault.state_label": "राज्य",
    "vault.extra": "अतिरिक्त माहिती",
    "vault.delete": "कागदपत्र काढा",
    "vault.upload_area_title": "सुरक्षित तिजोरी अपलोड",
    "vault.upload_area_desc": "आपले कागदपत्र येथे खेचा आणि सोडा, किंवा स्थानिक फाइल्स शोधण्यासाठी क्लिक करा",
    "vault.upload_area_sub": "JPG, PNG प्रतिमांना समर्थन देते. क्लायंट-प्रायव्हेट सुरक्षित सँडबॉक्ससह प्रक्रिया केली जाते.",
    "vault.demo_button": "त्वरित डेमो अपलोड",

    // AI Chat
    "chat.title": "जनसाथी AI मदतनीस",
    "chat.subtitle": "भारतीय सरकारी धोरणे समजून घेण्यासाठी, पात्रतेची गणना करण्यासाठी आणि अर्जाच्या प्रक्रियेत मदतीसाठी AI-आधारित सहाय्यक.",
    "chat.welcome": "नमस्कार! मी तुमचा जनसाथी AI योजना सहाय्यक आहे. आज मी तुम्हाला कशी मदत करू शकतो?",
    "chat.placeholder": "आपली शंका येथे लिहा...",
    "chat.starter_1": "पीएम-किसान योजनेचे काय फायदे आहेत?",
    "chat.starter_2": "मी पीएम विद्यालक्ष्मी शैक्षणिक कर्ज योजनेसाठी पात्र आहे का?",
    "chat.starter_3": "पश्चिम बंगालसाठी कोणत्या गृहनिर्माण योजना उपलब्ध आहेत?",
    "chat.starter_4": "आयुष्मान भारत योजनेसाठी मला कोणत्या कागदपत्रांची आवश्यकता आहे?",

    // Family Profiles
    "family.title": "कौटुंबिक प्रोफाइल डिरेक्टरी",
    "family.subtitle": "कौटुंबिक कल्याणकारी योजनांच्या पात्रतेचे त्वरित विश्लेषण करण्यासाठी आपल्या अवलंबितांचे तपशील जोडा आणि व्यवस्थापित करा.",
    "family.members_count": "कुटुंबातील सदस्य ({count})",
    "family.relationship": "नाते",
    "family.age_years": "{age} वर्षे",
    "family.income_inr": "उत्पन्न: ₹ {income} / वर्ष",
    "family.occupation_label": "व्यवसाय",
    "family.edu_label": "शिक्षण",
    "family.category_label": "प्रवर्ग",
    "family.disabled_label": "दिव्यांग",
    "family.check_eligibility_for": "{name} साठी योजना तपासा",
    "family.add_member": "कुटुंबातील सदस्य जोडा",
    "family.full_name": "पूर्ण नाव",
    "family.select_rel": "नाते निवडा",
    "family.delete_btn": "काढून टाका",

    // Deadlines / Reminders
    "reminders.title": "शासकीय अंतिम मुदती आणि स्मरणपत्रे",
    "reminders.subtitle": "अर्जाच्या अंतिम तारखा किंवा महत्त्वाच्या प्रमाणपत्रांच्या नूतनीकरणाची मुदत कधीही चुकवू नका.",
    "reminders.active_deadlines": "सक्रिय स्मरणपत्रे ({count})",
    "reminders.add_title": "सानुकूल नूतनीकरण स्मरणपत्र शेड्यूल करा",
    "reminders.input_title": "स्मरणपत्राचे नाव",
    "reminders.input_scheme": "संबंधित शासकीय योजना",
    "reminders.input_date": "मुदत तारीख",
    "reminders.input_type": "स्मरणपत्राचा प्रकार",
    "reminders.btn_add": "स्मरणपत्र जोडा",
    "reminders.completed": "पूर्ण",

    // Profile View
    "profile.header_title": "नागरिक प्रोफाइल सेटिंग्ज",
    "profile.language_title": "पसंतीची भाषा निवडा",
    "profile.sync_title": "सुपाबेस बॅकएंड सिंक",
    "profile.connected": "जोडलेले",
    "profile.project_id": "प्रकल्प ID",
    "profile.project_url": "प्रकल्प URL",
    "profile.auto_sync": "स्वयंचलित समक्रमण (सिंक):",
    "profile.test_connection": "कनेक्शन स्थिती तपासा",
    "profile.about_title": "जनसाथी प्लॅटफॉर्मबद्दल",
    "profile.sign_out": "साइन आउट"
  },
  Tamil: {
    // Navbar/Global Navigation
    "nav.home": "முகப்பு",
    "nav.schemes": "திட்டங்கள்",
    "nav.eligibility": "தகுதியைச் சரிபார்",
    "nav.vault": "ஆவண பெட்டகம்",
    "nav.chat": "அரட்டை உதவியாளர்",
    "nav.family": "குடும்ப விவரங்கள்",
    "nav.reminders": "காலக்கெடு",
    "nav.profile": "சுயவிவரம்",
    "app.name": "ஜன்சாதி",
    "app.tagline": "அரசு திட்ட உதவியாளர்",

    // Home / Greeting
    "home.hello": "வணக்கம்",
    "home.daily_update": "இதோ உங்களுக்கான இன்றைய தினசரி தகவல்.",
    "home.profile_strength": "சுயவிவரத்தின் முழுமை",
    "home.incomplete_banner_title": "குடிமகன் விவரங்கள் முழுமையடையவில்லை",
    "home.incomplete_banner_desc": "உங்கள் வயது, மாநிலம் அல்லது சமூகப் பிரிவை நீங்கள் இன்னும் குறிப்பிடவில்லை. தயவுசெய்து இந்தத் தகவல்களை வழங்கவும், அப்போதுதான் ஜன்சாதி உங்களுக்குப் பொருந்தும் அரசு திட்டங்களை துல்லியமாகக் கண்டறிய முடியும்.",
    "home.setup_profile_now": "சுயவிவரத்தை இப்போது அமை",
    "home.eligibility_status": "தகுதி நிலை",
    "home.schemes_count": "{count} திட்டங்கள்",
    "home.schemes_count_desc": "உங்கள் வயது, மாநிலம் மற்றும் சுயவிவர அளவுகோல்களின் அடிப்படையில் இந்தத் திட்டங்களுக்கு நீங்கள் தகுதி பெற்றுள்ளீர்கள். உடனடியாக விண்ணப்பிக்க உங்கள் ஆவணங்களை புதுப்பித்து வைத்திருங்கள்.",
    "home.view_eligible_schemes": "தகுதியுள்ள திட்டங்களைக் காண்க",
    "home.active_applications": "{count} செயல்பாட்டில் உள்ளவை",
    "home.applications_processing": "விண்ணப்பங்கள் பரிசீலனையில் உள்ளன",
    "home.track_status": "விண்ணப்ப நிலையைக் கண்காணிக்கவும்",
    "home.quick_actions": "விரைவுச் செயல்பாடுகள்",
    "home.recommended": "உங்களுக்குப் பரிந்துரைக்கப்படுபவை",
    "home.see_all": "அனைத்தையும் காண்க",
    "home.match_rate": "பொருத்த வீதம்: {rate}%",
    "home.view_details": "விவரங்களைக் காண்க",
    "home.recent_updates": "சமீபத்திய அறிவிப்புகள்",

    // Quick Actions
    "action.check_eligibility": "தகுதியைச் சரிபார்",
    "action.ask_ai": "AI உதவியாளரிடம் கேள்",
    "action.upload_docs": "ஆவணங்களைப் பதிவேற்று",
    "action.view_deadlines": "காலக்கெடுகளைக் காண்க",
    "action.new_schemes": "புதிய திட்டங்கள்",
    "action.nearby_offices": "அருகிலுள்ள அலுவலகங்கள்",

    // Explore Schemes Page
    "schemes.title": "அரசு திட்டங்களை ஆராயுங்கள்",
    "schemes.subtitle": "மத்திய மற்றும் மாநிலத் துறைகளில் கிடைக்கும் திட்டங்களை எளிய முறையில் கண்டறிந்து உலாவுக.",
    "schemes.search_placeholder": "திட்டங்களைத் தேடுங்கள்...",
    "schemes.deadline": "காலக்கெடு",
    "schemes.view_full_details": "முழு விவரங்களையும் காண்க",
    "schemes.back": "திட்டங்களுக்குத் திரும்பு",
    "schemes.overview": "திட்டப் பார்வை",
    "schemes.benefits": "திட்டப் பலன்கள் மற்றும் நிதி உதவி",
    "schemes.eligibility_req": "தகுதித் தேவைகள்",
    "schemes.min_age": "குறைந்தபட்ச வயது",
    "schemes.max_age": "அதிகபட்ச வயது",
    "schemes.income_limit": "ஆண்டு குடும்ப வருமான வரம்பு",
    "schemes.target_genders": "இலக்கு பாலினங்கள்",
    "schemes.domicile_states": "இருப்பிட மாநிலங்கள்",
    "schemes.required_docs": "தேவையான ஆவணங்கள்",
    "schemes.official_website": "அதிகாரப்பூர்வ இணையதளம்",
    "schemes.apply_ai": "AI உதவியாளருடன் விண்ணப்பிக்கவும்",

    // Eligibility Checker
    "eligibility.title": "தனிப்பயனாக்கப்பட்ட தகுதி சரிபார்ப்பு",
    "eligibility.subtitle": "கீழே உங்கள் விவரங்களை நிரப்பவும். மத்திய மற்றும் மாநில அரசுத் திட்டங்களின் விதிகளுடன் உங்கள் சுயவிவரத்தை எங்கள் அல்காரிதம் ஒப்பிட்டுப் பார்க்கும்.",
    "eligibility.profile": "குடிமகன் சுயவிவரம்",
    "eligibility.age": "வயது (ஆண்டுகள்)",
    "eligibility.state": "வசிக்கும் மாநிலம்",
    "eligibility.occupation": "தொழில்",
    "eligibility.income": "ஆண்டு குடும்ப வருமானம் (INR)",
    "eligibility.gender": "பாலினம்",
    "eligibility.category": "சமூகப் பிரிவு",
    "eligibility.education": "அதிகபட்ச கல்வித் தகுதி",
    "eligibility.disabled": "மாற்றுத்திறனாளி (PwD)",
    "eligibility.check_btn": "தகுதியுள்ள திட்டங்களைச் சரிபார்",
    "eligibility.awaiting": "சுயவிவரத் தேர்விற்காக காத்திருக்கிறது",
    "eligibility.awaiting_desc": "இடது பேனலில் உங்கள் விவரங்களை அமைத்து, தரவுத்தளத்தில் தேட \"தகுதியுள்ள திட்டங்களைச் சரிபார்\" என்பதைக் கிளிக் செய்க.",
    "eligibility.found_msg": "உங்கள் விவரங்களுடன் சரியாகப் பொருந்தும் {count} திட்டங்களைக் கண்டறிந்துள்ளோம்.",
    "eligibility.no_matches": "சரியான பொருத்தங்கள் எதுவும் காணப்படவில்லை",
    "eligibility.no_matches_desc": "உங்கள் அளவுகோல்களை மாற்றியமைக்க முயற்சிக்கவும் (உதாரணமாக வருமான வரம்பை அதிகரிப்பது அல்லது பிற கல்விப் பிரிவுகளை ஆராய்வது).",
    "eligibility.match_rate_100": "தகுதி 100%",
    "eligibility.view_apply": "தகுதியைக் கண்டு விண்ணப்பி",

    // Document Vault
    "vault.title": "டிஜிட்டல் ஆவண பெட்டகம்",
    "vault.subtitle": "உங்கள் ஆவணங்களைப் பதிவேற்றி நிர்வகியுங்கள். பதிவேற்றப்பட்ட சான்றிதழ்களை ஜெமினி AI OCR மூலம் தானாகவே பகுப்பாய்வு செய்ய முடியும்.",
    "vault.uploaded_docs": "பதிவேற்றப்பட்ட சான்றிதழ்கள்",
    "vault.verified": "சரிபார்க்கப்பட்ட OCR",
    "vault.id_num": "அடையாள எண்",
    "vault.expiry": "காலாவதி தேதி",
    "vault.holder": "உரிமையாளர் பெயர்",
    "vault.details": "பகுப்பாய்வு விவரங்கள்",
    "vault.dob": "பிறந்த தேதி",
    "vault.gender_label": "பாலினம்",
    "vault.state_label": "மாநிலம்",
    "vault.extra": "கூடுதல் தகவல்",
    "vault.delete": "ஆவணத்தை நீக்கு",
    "vault.upload_area_title": "பாதுகாப்பான பதிவேற்றம்",
    "vault.upload_area_desc": "உங்கள் ஆவணத்தை இங்கே இழுத்து விடவும் அல்லது உள்ளூர் கோப்புகளைத் தேட கிளிக் செய்யவும்",
    "vault.upload_area_sub": "JPG, PNG படங்களை ஆதரிக்கிறது. பாதுகாப்பான முறையில் செயலாக்கப்படும்.",
    "vault.demo_button": "விரைவு டெமோ பதிவேற்றம்",

    // AI Chat
    "chat.title": "ஜன்சாதி AI உதவித் துணைவன்",
    "chat.subtitle": "இந்திய அரசு கொள்கைகளைப் புரிந்து கொள்ளவும், தகுதிகளைக் கணக்கிடவும், விண்ணப்பங்களுக்கு உதவவும் AI-ஆல் இயக்கப்படும் துணைவன்.",
    "chat.welcome": "வணக்கம்! நான் உங்கள் ஜன்சாதி AI திட்டத் துணைவன். இன்று உங்களுக்கு எவ்வாறு உதவ முடியும்?",
    "chat.placeholder": "உங்கள் கேள்வியை இங்கே தட்டச்சு செய்யவும்...",
    "chat.starter_1": "PM-KISAN திட்டத்தின் நன்மைகள் என்ன?",
    "chat.starter_2": "PM வித்யாலக்ஷ்மி கடன் திட்டத்திற்கு எனக்கு தகுதி உள்ளதா?",
    "chat.starter_3": "மேற்கு வங்காளத்திற்கு என்ன வீட்டுவசதி திட்டங்கள் உள்ளன?",
    "chat.starter_4": "ஆயுஷ்மான் பாரத் திட்டத்திற்கு எனக்கு என்னென்ன ஆவணங்கள் தேவை?",

    // Family Profiles
    "family.title": "குடும்ப சுயவிவரக் கோப்பகம்",
    "family.subtitle": "முழு குடும்ப நலத் திட்டங்களின் தகுதிகளை உடனடியாக பகுப்பாய்வு செய்ய உங்கள் குடும்ப உறுப்பினர்களைச் சேர்த்து நிர்வகியுங்கள்.",
    "family.members_count": "குடும்ப உறுப்பினர்கள் ({count})",
    "family.relationship": "உறவுமுறை",
    "family.age_years": "{age} ஆண்டுகள்",
    "family.income_inr": "வருமானம்: ₹ {income} / ஆண்டு",
    "family.occupation_label": "தொழில்",
    "family.edu_label": "கல்வி",
    "family.category_label": "பிரிவு",
    "family.disabled_label": "மாற்றுத்திறனாளி",
    "family.check_eligibility_for": "{name}-க்கான திட்டங்களைச் சரிபார்",
    "family.add_member": "குடும்ப உறுப்பினரைச் சேர்",
    "family.full_name": "முழுப் பெயர்",
    "family.select_rel": "உறவுமுறையைத் தேர்ந்தெடு",
    "family.delete_btn": "நீக்கு",

    // Deadlines / Reminders
    "reminders.title": "அரசு காலக்கெடு மற்றும் நினைவூட்டல்கள்",
    "reminders.subtitle": "விண்ணப்ப இறுதி தேதிகள் அல்லது சான்றிதழ் புதுப்பிப்புகளைத் தவறவிடாதீர்கள்.",
    "reminders.active_deadlines": "செயலில் உள்ள நினைவூட்டல்கள் ({count})",
    "reminders.add_title": "நினைவூட்டலை உருவாக்குங்கள்",
    "reminders.input_title": "நினைவூட்டல் தலைப்பு",
    "reminders.input_scheme": "தொடர்புடைய அரசு திட்டம்",
    "reminders.input_date": "இறுதி தேதி",
    "reminders.input_type": "நினைவூட்டல் வகை",
    "reminders.btn_add": "நினைவூட்டலைச் சேர்",
    "reminders.completed": "முடிக்கப்பட்டது",

    // Profile View
    "profile.header_title": "சுயவிவர அமைப்புகள்",
    "profile.language_title": "விரும்பும் மொழித் தேர்வு",
    "profile.sync_title": "Supabase பின்புல ஒத்திசைவு",
    "profile.connected": "இணைக்கப்பட்டுள்ளது",
    "profile.project_id": "திட்ட ஐடி",
    "profile.project_url": "திட்ட URL",
    "profile.auto_sync": "தானியங்கி ஒத்திசைவு:",
    "profile.test_connection": "இணைப்பு நிலையைச் சோதி",
    "profile.about_title": "ஜன்சாதி தளத்தைப் பற்றி",
    "profile.sign_out": "வெளியேறு"
  },
  Telugu: {
    // Navbar/Global Navigation
    "nav.home": "హోమ్",
    "nav.schemes": "పథకాలు",
    "nav.eligibility": "అర్హతను తనిఖీ చేయండి",
    "nav.vault": "పత్రాల భండాగారం",
    "nav.chat": "చాట్ అసిస్టెంట్",
    "nav.family": "కుటుంబ ప్రొఫైల్",
    "nav.reminders": "గడువు తేదీలు",
    "nav.profile": "ప్రొఫైల్",
    "app.name": "జనసాతీ",
    "app.tagline": "ప్రభుత్వ పథకాల సహాయకుడు",

    // Home / Greeting
    "home.hello": "నమస్కారం",
    "home.daily_update": "ఇది మీ రోజువారీ అప్‌డేట్.",
    "home.profile_strength": "ప్రొఫైల్ పూర్తి స్థాయి",
    "home.incomplete_banner_title": "పౌరుల వివరాలు పూర్తి కాలేదు",
    "home.incomplete_banner_desc": "మీరు ఇంకా మీ వయస్సు, రాష్ట్రం లేదా సామాజిక వర్గాన్ని పేర్కొనలేదు. దయచేసి ఈ సమాచారాన్ని అందించండి, తద్వారా జనసాతీ మీకు సరిపోయే ప్రభుత్వ పథకాలను ఖచ్చితంగా కనుగొనగలదు.",
    "home.setup_profile_now": "ప్రొఫైల్‌ను ఇప్పుడే సెట్ చేయండి",
    "home.eligibility_status": "అర్హత స్థితి",
    "home.schemes_count": "{count} పథకాలు",
    "home.schemes_count_desc": "మీ వయస్సు, రాష్ట్రం మరియు ప్రొఫైల్ ప్రమాణాల ఆధారంగా మీరు ఈ పథకాలకు అర్హత పొందారు. వెంటనే దరఖాస్తు చేసుకోవడానికి మీ పత్రాలను సిద్ధంగా ఉంచుకోండి.",
    "home.view_eligible_schemes": "అర్హత ఉన్న పథకాలను చూడండి",
    "home.active_applications": "{count} యాక్టివ్",
    "home.applications_processing": "పరిశీలనలో ఉన్న దరఖాస్తులు",
    "home.track_status": "దరఖాస్తు స్థితిని ట్రాక్ చేయండి",
    "home.quick_actions": "త్వరిత చర్యలు",
    "home.recommended": "మీ కోసం సిఫార్సు చేయబడినవి",
    "home.see_all": "అన్నీ చూడండి",
    "home.match_rate": "సరిపోలిక రేటు: {rate}%",
    "home.view_details": "వివరాలు చూడండి",
    "home.recent_updates": "ఇటీవలి అప్‌డేట్లు",

    // Quick Actions
    "action.check_eligibility": "అర్హతను తనిఖీ చేయండి",
    "action.ask_ai": "AI అసిస్టెంట్‌ని అడగండి",
    "action.upload_docs": "పత్రాలను అప్‌లోడ్ చేయండి",
    "action.view_deadlines": "గడువులను చూడండి",
    "action.new_schemes": "కొత్త పథకాలు",
    "action.nearby_offices": "సమీప కార్యాలయాలు",

    // Explore Schemes Page
    "schemes.title": "ప్రభుత్వ పథకాలను అన్వేషించండి",
    "schemes.subtitle": "కేంద్ర మరియు రాష్ట్ర ప్రభుత్వ శాఖలలో అందుబాటులో ఉన్న పథకాలను సులభంగా శోధించండి మరియు బ్రౌజ్ చేయండి.",
    "schemes.search_placeholder": "పథకాలను శోధించండి...",
    "schemes.deadline": "చివరి తేదీ",
    "schemes.view_full_details": "పూర్తి వివరాలను చూడండి",
    "schemes.back": "పథకాలకు తిరిగి వెళ్ళండి",
    "schemes.overview": "పథకం అవలోకనం",
    "schemes.benefits": "పథకం ప్రయోజనాలు & ఆర్థిక సహాయం",
    "schemes.eligibility_req": "అర్హత అవసరాలు",
    "schemes.min_age": "కనిష్ట వయస్సు",
    "schemes.max_age": "గరిష్ట వయస్సు",
    "schemes.income_limit": "వార్షిక కుటుంబ ఆదాయ పరిమితి",
    "schemes.target_genders": "లక్ష్య లింగాలు",
    "schemes.domicile_states": "నివాస రాష్ట్రాలు",
    "schemes.required_docs": "అవసరమైన పత్రాలు",
    "schemes.official_website": "అధికారిక వెబ్‌సైట్",
    "schemes.apply_ai": "AI అసిస్టెంట్‌తో దరఖాస్తు చేయండి",

    // Eligibility Checker
    "eligibility.title": "వ్యక్తిగతీకరించిన అర్హత తనిఖీ",
    "eligibility.subtitle": "క్రింద మీ పౌర పారామితులను పూర్తి చేయండి. మా అల్గారిథమ్ మీ ప్రొఫైల్‌ను కేంద్ర మరియు రాష్ట్ర పథకాల నిబంధనలతో సరిపోల్చుతుంది.",
    "eligibility.profile": "పౌర ప్రొఫైల్",
    "eligibility.age": "వయస్సు (సంవత్సరాలు)",
    "eligibility.state": "నివాస రాష్ట్రం",
    "eligibility.occupation": "వృత్తి",
    "eligibility.income": "వార్షిక కుటుంబ ఆదాయం (INR)",
    "eligibility.gender": "లింగం",
    "eligibility.category": "సామాజిక వర్గం",
    "eligibility.education": "అత్యున్నత విద్యా స్థాయి",
    "eligibility.disabled": "వికలాంగులు (PwD)",
    "eligibility.check_btn": "అర్హత ఉన్న పథకాలను తనిఖీ చేయండి",
    "eligibility.awaiting": "ప్రొఫైల్ ఎంపిక కోసం వేచి ఉంది",
    "eligibility.awaiting_desc": "ఎడమ ప్యానెల్‌లో మీ వివరాలను సెట్ చేయండి మరియు శోధించడానికి \"అర్హత ఉన్న పథకాలను తనిఖీ చేయండి\" క్లిక్ చేయండి.",
    "eligibility.found_msg": "మీ పారామితులకు సరిగ్గా సరిపోయే {count} పథకాలను మేము కనుగొన్నాము.",
    "eligibility.no_matches": "సరిగ్గా సరిపోయే పథకాలేవీ కనుగొనబడలేదు",
    "eligibility.no_matches_desc": "మీ పారామితులను మార్చడానికి ప్రయత్నించండి (ఉదాహరణకు కుటుంబ ఆదాయ పరిమితిని పెంచడం లేదా ఇతర విద్యా విభాగాలను అన్వేషించడం).",
    "eligibility.match_rate_100": "అర్హత 100%",
    "eligibility.view_apply": "అర్హతను చూసి దరఖాస్తు చేయండి",

    // Document Vault
    "vault.title": "డిజిటల్ పత్రాల భండాగారం",
    "vault.subtitle": "మీ అర్హత పత్రాలను అప్‌లోడ్ చేయండి మరియు నిర్వహించండి. అప్‌లోడ్ చేసిన ధృవీకరణ పత్రాలను జెమిని AI OCR ద్వారా స్వయంచాలకంగా విశ్లేషించవచ్చు.",
    "vault.uploaded_docs": "అప్‌లోడ్ చేసిన ధృవీకరణ పత్రాలు",
    "vault.verified": "ధృవీకరించబడిన OCR",
    "vault.id_num": "గుర్తింపు సంఖ్య",
    "vault.expiry": "గడువు తేదీ",
    "vault.holder": "యజమాని పేరు",
    "vault.details": "విశ్లేషించబడిన వివరాలు",
    "vault.dob": "పుట్టిన తేదీ",
    "vault.gender_label": "లింగం",
    "vault.state_label": "రాష్ట్రం",
    "vault.extra": "అదనపు సమాచారం",
    "vault.delete": "పత్రాన్ని తొలగించండి",
    "vault.upload_area_title": "సురక్షితమైన అప్‌లోడ్",
    "vault.upload_area_desc": "మీ పత్రాన్ని ఇక్కడ లాగి వదలండి లేదా స్థానిక ఫైళ్ళను వెతకడానికి క్లిక్ చేయండి",
    "vault.upload_area_sub": "JPG, PNG చిత్రాలకు మద్దతు ఇస్తుంది. సురక్షితమైన పద్ధతిలో విశ్లేషించబడుతుంది.",
    "vault.demo_button": "త్వరిత డెమో అప్‌లోడ్",

    // AI Chat
    "chat.title": "జనసాతీ AI సహాయక సహచరుడు",
    "chat.subtitle": "భారత ప్రభుత్వ విధానాలను అర్థం చేసుకోవడానికి, అర్హతలను లెక్కించడానికి మరియు దరఖాస్తులకు సహాయం చేయడానికి AI-ఆధారిత సహచరుడు.",
    "chat.welcome": "నమస్కారం! నేను మీ జనసాతీ AI పథకాల సహచరుడిని. ఈ రోజు మీకు ఎలా సహాయపడగలను?",
    "chat.placeholder": "మీ ప్రశ్నను ఇక్కడ టైప్ చేయండి...",
    "chat.starter_1": "PM-KISAN పథకం ప్రయోజనాలు ఏమిటి?",
    "chat.starter_2": "PM విద్యా లక్ష్మి రుణ పథకానికి నాకు అర్హత ఉందా?",
    "chat.starter_3": "పశ్చిమ బెంగాల్ కోసం ఏ గృహనిర్మాణ పథకాలు అందుబాటులో ఉన్నాయి?",
    "chat.starter_4": "ఆయుష్మాన్ భారత్ పథకానికి నాకు ఏయే పత్రాలు అవసరం?",

    // Family Profiles
    "family.title": "కుటుంబ ప్రొఫైల్స్ డైరెక్టరీ",
    "family.subtitle": "కుటుంబ సంక్షేమ పథకాల అర్హతలను తక్షణమే విశ్లేషించడానికి మీ కుటుంబ సభ్యుల వివరాలను చేర్చండి మరియు నిర్వహించండి.",
    "family.members_count": "కుటుంబ సభ్యులు ({count})",
    "family.relationship": "సంబంధం",
    "family.age_years": "{age} సంవత్సరాలు",
    "family.income_inr": "ఆదాయం: ₹ {income} / సంవత్సరం",
    "family.occupation_label": "వృత్తి",
    "family.edu_label": "విద్య",
    "family.category_label": "వర్గం",
    "family.disabled_label": "వికలాంగుడు",
    "family.check_eligibility_for": "{name} కోసం పథకాలను తనిఖీ చేయండి",
    "family.add_member": "కుటుంబ సభ్యుడిని చేర్చండి",
    "family.full_name": "పూర్తి పేరు",
    "family.select_rel": "సంబంధాన్ని ఎంచుకోండి",
    "family.delete_btn": "తొలగించు",

    // Deadlines / Reminders
    "reminders.title": "ప్రభుత్వ గడువులు మరియు రిమైండర్లు",
    "reminders.subtitle": "దరఖాస్తు గడువు తేదీలు లేదా ధృవీకరణ పత్రాల పునరుద్ధరణలను ఎప్పటికీ కోల్పోకండి.",
    "reminders.active_deadlines": "యాక్టివ్ గడువులు ({count})",
    "reminders.add_title": "రిమైండర్‌ను సృష్టించండి",
    "reminders.input_title": "రిమైండర్ శీర్షిక",
    "reminders.input_scheme": "సంబంధిత ప్రభుత్వ పథకం",
    "reminders.input_date": "గడువు తేదీ",
    "reminders.input_type": "రిమైండర్ రకం",
    "reminders.btn_add": "రిమైండర్‌ను జోడించు",
    "reminders.completed": "పూర్తయింది",

    // Profile View
    "profile.header_title": "ప్రొఫైల్ సెట్టింగ్‌లు",
    "profile.language_title": "భాషా ఎంపిక",
    "profile.sync_title": "Supabase సింక్ స్థితి",
    "profile.connected": "కనెక్ట్ చేయబడింది",
    "profile.project_id": "ప్రాజెక్ట్ ఐడి",
    "profile.project_url": "ప్రాజెక్ట్ URL",
    "profile.auto_sync": "స్వయంచాలక సింక్:",
    "profile.test_connection": "కనెక్షన్ స్థితిని పరీక్షించండి",
    "profile.about_title": "జనసాతీ వేదిక గురించి",
    "profile.sign_out": "సైన్ అవుట్"
  }
};

// Create translation context
interface TranslationContextType {
  language: LanguageCode;
  t: (key: string, variables?: Record<string, string | number>) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Provider Component
export function TranslationProvider({
  language,
  children
}: {
  language: string;
  children: React.ReactNode;
}) {
  // Normalize language name to supported language codes
  let normalizedLanguage: LanguageCode = "English";
  if (language === "Hindi" || language === "हिन्दी (Hindi)") normalizedLanguage = "Hindi";
  else if (language === "Marathi" || language === "मराठी (Marathi)") normalizedLanguage = "Marathi";
  else if (language === "Tamil" || language === "தமிழ் (Tamil)") normalizedLanguage = "Tamil";
  else if (language === "Telugu" || language === "తెలుగు (Telugu)") normalizedLanguage = "Telugu";

  // Translation Function
  const t = (key: string, variables?: Record<string, string | number>): string => {
    const langDict = translations[normalizedLanguage] || translations.English;
    let text = langDict[key] || translations.English[key] || key;

    // Replace variables if provided
    if (variables) {
      Object.entries(variables).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }

    return text;
  };

  return (
    <React.Fragment>
      <TranslationContext.Provider value={{ language: normalizedLanguage, t }}>
        {children}
      </TranslationContext.Provider>
    </React.Fragment>
  );
}

// Hook for using translations in components
export function useTranslation(lang?: string) {
  const context = useContext(TranslationContext);
  
  // If a specific language string is provided, use that directly
  if (lang) {
    let normalizedLanguage: LanguageCode = "English";
    if (lang === "Hindi" || lang === "हिन्दी (Hindi)") normalizedLanguage = "Hindi";
    else if (lang === "Marathi" || lang === "मराठी (Marathi)") normalizedLanguage = "Marathi";
    else if (lang === "Tamil" || lang === "தமிழ் (Tamil)") normalizedLanguage = "Tamil";
    else if (lang === "Telugu" || lang === "తెలుగు (Telugu)") normalizedLanguage = "Telugu";

    const t = (key: string, variables?: Record<string, string | number>): string => {
      const langDict = translations[normalizedLanguage] || translations.English;
      let text = langDict[key] || translations.English[key] || key;

      if (variables) {
        Object.entries(variables).forEach(([k, v]) => {
          text = text.replace(`{${k}}`, String(v));
        });
      }

      return text;
    };

    return { language: normalizedLanguage, t };
  }

  if (!context) {
    // Return fallback translation helper in case it is used outside provider
    return {
      language: "English" as LanguageCode,
      t: (key: string, variables?: Record<string, string | number>) => {
        let text = translations.English[key] || key;
        if (variables) {
          Object.entries(variables).forEach(([k, v]) => {
            text = text.replace(`{${k}}`, String(v));
          });
        }
        return text;
      }
    };
  }
  return context;
}
