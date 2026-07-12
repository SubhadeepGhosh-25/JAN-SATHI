import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Home as HomeIcon, Award, ClipboardCheck, ShieldCheck, 
  Sparkles, Users, Calendar, User, Bell, Landmark 
} from "lucide-react";
import { onAuthStateChanged, signOut, signInAnonymously } from "firebase/auth";
import { auth } from "./lib/firebase";
import { supabase } from "./supabaseClient";
import {
  seedSchemesIfEmpty,
  getUserProfile,
  saveUserProfile,
  getSchemes,
  getSavedSchemeIds,
  saveScheme,
  unsaveScheme,
  getApplications,
  submitApplication,
  getUserDocuments,
  uploadDocumentFile,
  deleteDocument,
  getFamilyMembers,
  saveFamilyMember,
  deleteFamilyMember,
  getReminders,
  saveReminder,
  toggleReminderCompleted,
  deleteReminder,
  getNotifications,
  saveNotification,
  markNotificationRead,
  deleteNotification
} from "./lib/firebaseService";

// Types & Seed Data
import { 
  Scheme, UserProfile, FamilyMember, DocumentFile, 
  Application, Reminder, NotificationItem, SEED_SCHEMES 
} from "./types";

import { useTranslation } from "./lib/translations";

// Sub Components
import Splash from "./components/Splash";
import Onboarding from "./components/Onboarding";
import Login from "./components/Login";
import Home from "./components/Home";
import EligibilityChecker from "./components/EligibilityChecker";
import ExploreSchemes from "./components/ExploreSchemes";
import DocumentVault from "./components/DocumentVault";
import ChatAssistant from "./components/ChatAssistant";
import FamilyProfiles from "./components/FamilyProfiles";
import FormAssistance from "./components/FormAssistance";
import RemindersList from "./components/RemindersList";
import ProfileView from "./components/ProfileView";
import NearbyOffices from "./components/NearbyOffices";

export default function App() {
  // Navigation State
  const [appStep, setAppStep] = useState<"SPLASH" | "ONBOARDING" | "LOGIN" | "DASHBOARD">("SPLASH");
  const [activeTab, setActiveTab] = useState<string>("home");
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Dynamic Schemes state (starts with SEED_SCHEMES, populated from DB if online)
  const [schemes, setSchemes] = useState<Scheme[]>(SEED_SCHEMES);

  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
    state: "",
    district: "",
    occupation: "",
    income: 0,
    gender: "",
    age: 0,
    education: "",
    category: "", // Gen, OBC, SC, ST, EWS
    disability: false,
    preferredLanguage: "English"
  });

  const { t } = useTranslation(userProfile.preferredLanguage);

  // Stored Data Lists
  const [documents, setDocuments] = useState<DocumentFile[]>([]);

  const [reminders, setReminders] = useState<Reminder[]>([]);

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  const [applications, setApplications] = useState<Application[]>([]);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "not-1",
      title: "Scheme System Online",
      body: "JanSathi eligibility index and Central databases loaded successfully.",
      time: "Just now",
      type: "new_releases",
      unread: true
    }
  ]);

  const [savedSchemeIds, setSavedSchemeIds] = useState<string[]>([]);

  // Active form application flow
  const [activeApplyScheme, setActiveApplyScheme] = useState<Scheme | null>(null);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string>("");

  // 1. Initial Supabase session protection & routing
  useEffect(() => {
    seedSchemesIfEmpty();

    const protectRouteAndSync = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // If no session exists, redirect to login
          window.history.pushState({}, "", "/login");
          setAppStep("LOGIN");
          setLoading(false);
        } else {
          // If session exists, sync with Firebase
          if (!auth.currentUser) {
            try {
              await signInAnonymously(auth);
            } catch (anonErr) {
              console.warn("Could not sign in anonymously to Firebase on session restoration:", anonErr);
            }
          }
        }
      } catch (err) {
        console.error("Error during session restoration:", err);
        setLoading(false);
      }
    };

    protectRouteAndSync();

    // 2. Continuous Supabase session state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session) {
        window.history.pushState({}, "", "/login");
        setAppStep("LOGIN");
      } else {
        if (!auth.currentUser) {
          try {
            await signInAnonymously(auth);
          } catch (anonErr) {
            console.warn("Could not sign in anonymously to Firebase on session change:", anonErr);
          }
        }
        setAppStep("DASHBOARD");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 3. Keep existing data-loading useEffect bound to Firebase user state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        // Only load data if we actually have a Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setAppStep("LOGIN");
          setLoading(false);
          return;
        }

        setLoading(true);
        try {
          // Load all dynamic user and scheme assets in parallel to optimize startup time and handle connection states robustly
          const [
            dbSchemes,
            profile,
            savedIds,
            docs,
            apps,
            fam,
            rems,
            nots
          ] = await Promise.all([
            getSchemes().catch((err) => { console.warn("Could not load schemes:", err); return null; }),
            getUserProfile(user.uid).catch((err) => { console.warn("Could not load profile:", err); return null; }),
            getSavedSchemeIds(user.uid).catch((err) => { console.warn("Could not load saved scheme IDs:", err); return []; }),
            getUserDocuments(user.uid).catch((err) => { console.warn("Could not load documents:", err); return []; }),
            getApplications(user.uid).catch((err) => { console.warn("Could not load applications:", err); return []; }),
            getFamilyMembers(user.uid).catch((err) => { console.warn("Could not load family members:", err); return []; }),
            getReminders(user.uid).catch((err) => { console.warn("Could not load reminders:", err); return []; }),
            getNotifications(user.uid).catch((err) => { console.warn("Could not load notifications:", err); return []; })
          ]);

          // 1. Load dynamic government schemes
          if (dbSchemes && dbSchemes.length > 0) {
            setSchemes(dbSchemes);
          }

          // 2. Load or create user profile
          let finalProfile = profile;
          if (!finalProfile) {
            finalProfile = {
              name: session.user?.user_metadata?.full_name || user.displayName || "Citizen",
              email: session.user?.email || user.email || "",
              phone: session.user?.user_metadata?.phone || user.phoneNumber || "",
              state: "",
              district: "",
              occupation: "",
              income: 0,
              gender: "",
              age: 0,
              education: "",
              category: "",
              disability: false,
              preferredLanguage: "English"
            };
            // Try saving in the background; do not block startup
            saveUserProfile(user.uid, finalProfile).catch(err => {
              console.warn("Could not persist initial user profile to Firestore:", err);
            });
          }
          setUserProfile(finalProfile);

          // 3. Load saved/bookmarked schemes
          if (savedIds && savedIds.length > 0) {
            setSavedSchemeIds(savedIds);
          }

          // 4. Load uploaded documents from vault
          if (docs && docs.length > 0) {
            setDocuments(docs);
          }

          // 5. Load submitted applications
          if (apps && apps.length > 0) {
            setApplications(apps);
          }

          // 6. Load family members
          if (fam && fam.length > 0) {
            setFamilyMembers(fam);
          }

          // 7. Load reminders
          if (rems && rems.length > 0) {
            setReminders(rems);
          }

          // 8. Load notifications
          if (nots && nots.length > 0) {
            setNotifications(nots);
          }

          setAppStep("DASHBOARD");
        } catch (error) {
          console.error("Error fetching user session from Firebase:", error);
          setAppStep("DASHBOARD");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync helpers with Firestore
  const saveProfile = async (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    localStorage.setItem("jansathi_profile", JSON.stringify(newProfile));
    if (auth.currentUser) {
      await saveUserProfile(auth.currentUser.uid, newProfile);
    }
  };

  const saveDocs = (newDocs: DocumentFile[]) => {
    setDocuments(newDocs);
    localStorage.setItem("jansathi_docs", JSON.stringify(newDocs));
  };

  // Navigations & Callbacks
  const handleLoginSuccess = async (info: { name: string; phone: string; email: string }) => {
    const updatedProfile: UserProfile = {
      ...userProfile,
      name: info.name,
      phone: info.phone,
      email: info.email
    };
    setUserProfile(updatedProfile);
    
    if (auth.currentUser) {
      await saveUserProfile(auth.currentUser.uid, updatedProfile);
    }
    setAppStep("DASHBOARD");
  };

  const handleApplyProfile = async (updated: UserProfile) => {
    await saveProfile(updated);
    // Add positive notification feedback
    const id = `not-${Date.now()}`;
    const newNotif: NotificationItem = {
      id,
      title: "Citizen Profile Synced",
      body: "Your parameters have been safely optimized for scheme eligibility checkers.",
      time: "Just now",
      type: "task_alt",
      unread: true
    };
    setNotifications(prev => [newNotif, ...prev]);
    if (auth.currentUser) {
      await saveNotification(auth.currentUser.uid, newNotif);
    }
  };

  const handleUploadDocument = async (doc: DocumentFile) => {
    setDocuments(prev => [doc, ...prev]);
    if (auth.currentUser) {
      try {
        await uploadDocumentFile(
          auth.currentUser.uid,
          doc.documentType,
          doc.documentId,
          doc.holderName,
          doc.fileUrl || "",
          "image/jpeg",
          {
            dob: doc.dob,
            gender: doc.gender,
            state: doc.state,
            additionalInfo: doc.additionalInfo,
            expiryDate: doc.expiryDate
          }
        );
        // Refresh docs to pick up storage download URLs
        const updatedDocs = await getUserDocuments(auth.currentUser.uid);
        setDocuments(updatedDocs);
      } catch (err) {
        console.error("Error syncing document to Cloud Storage:", err);
      }
    }
  };

  const handleDeleteDocument = async (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    if (auth.currentUser) {
      await deleteDocument(id);
    }
  };

  const handleToggleSaveScheme = async (schemeId: string) => {
    const isSaved = savedSchemeIds.includes(schemeId);
    if (isSaved) {
      setSavedSchemeIds(prev => prev.filter(id => id !== schemeId));
      if (auth.currentUser) {
        await unsaveScheme(auth.currentUser.uid, schemeId);
      }
    } else {
      setSavedSchemeIds(prev => [...prev, schemeId]);
      if (auth.currentUser) {
        await saveScheme(auth.currentUser.uid, schemeId);
      }
    }
  };

  const handleViewSchemeDetails = (scheme: Scheme) => {
    // Navigates directly to Explore Schemes and sets details modal
    setActiveTab("schemes");
  };

  const handleApplyForScheme = (scheme: Scheme) => {
    setActiveApplyScheme(scheme);
  };

  const handleSubmitApplication = async (app: Application) => {
    setApplications(prev => [app, ...prev]);
    setActiveApplyScheme(null);
    setActiveTab("home");

    if (auth.currentUser) {
      await submitApplication(auth.currentUser.uid, app);
    }

    // Push notification success
    const newNotif: NotificationItem = {
      id: `not-${Date.now()}`,
      title: "Application Submitted Successfully",
      body: `Your form for ${app.schemeName} has been successfully added to tracking dashboard.`,
      time: "Just now",
      type: "task_alt",
      unread: true
    };
    setNotifications(prev => [newNotif, ...prev]);
    if (auth.currentUser) {
      await saveNotification(auth.currentUser.uid, newNotif);
    }
  };

  const handleAddFamilyMember = async (member: FamilyMember) => {
    setFamilyMembers(prev => [...prev, member]);
    if (auth.currentUser) {
      await saveFamilyMember(auth.currentUser.uid, member);
    }
  };

  const handleDeleteFamilyMember = async (id: string) => {
    setFamilyMembers(prev => prev.filter(m => m.id !== id));
    if (auth.currentUser) {
      await deleteFamilyMember(id);
    }
  };

  const handleToggleReminder = async (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;
    const completed = !reminder.completed;
    setReminders(prev => prev.map(r => r.id === id ? { ...r, completed } : r));
    if (auth.currentUser) {
      await toggleReminderCompleted(id, completed);
    }
  };

  const handleAddReminder = async (rem: Reminder) => {
    setReminders(prev => [rem, ...prev]);
    if (auth.currentUser) {
      await saveReminder(auth.currentUser.uid, rem);
    }
  };

  const handleDeleteReminder = async (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
    if (auth.currentUser) {
      await deleteReminder(id);
    }
  };

  // Switch tabs
  const handleTabNavigation = (tab: string) => {
    setActiveTab(tab);
    // If they were in active application, close it safely
    setActiveApplyScheme(null);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
    }
    setFirebaseUser(null);
    setAppStep("LOGIN");
    handleTabNavigation("home");
  };

  return (
    <div className="bg-[#f7f9fb] min-h-screen font-sans text-slate-800">
      <AnimatePresence mode="wait">
        {/* Step 1: Splash Screen */}
        {appStep === "SPLASH" && (
          <motion.div key="splash" exit={{ opacity: 0 }}>
            <Splash onComplete={async () => {
              const { data: { session } } = await supabase.auth.getSession();
              if (session) {
                setAppStep("DASHBOARD");
              } else {
                const onboarded = localStorage.getItem("jansathi_onboarded") === "true";
                setAppStep(onboarded ? "LOGIN" : "ONBOARDING");
              }
            }} />
          </motion.div>
        )}

        {/* Step 2: Onboarding walkthrough */}
        {appStep === "ONBOARDING" && (
          <motion.div key="onboarding" exit={{ opacity: 0 }}>
            <Onboarding onComplete={() => {
              localStorage.setItem("jansathi_onboarded", "true");
              setAppStep("LOGIN");
            }} />
          </motion.div>
        )}

        {/* Step 3: Login sequence */}
        {appStep === "LOGIN" && (
          <motion.div key="login" exit={{ opacity: 0 }}>
            <Login onLoginSuccess={handleLoginSuccess} />
          </motion.div>
        )}

        {/* Step 4: Primary Dashboard Ingress */}
        {appStep === "DASHBOARD" && (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col min-h-screen"
          >
            {/* Navigation Header */}
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm h-16 shrink-0">
              <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
                {/* Branding */}
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-[#004d99] text-white rounded-xl flex items-center justify-center shadow-sm">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-[#004d99] tracking-tight">{t("app.name")}</h1>
                    <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest -mt-1">
                      {t("app.tagline")}
                    </p>
                  </div>
                </div>

                {/* Desktop Tabs */}
                <nav className="hidden lg:flex items-center gap-1.5 text-sm font-semibold">
                  <button 
                    onClick={() => handleTabNavigation("home")}
                    className={`h-10 px-4 rounded-xl transition-colors cursor-pointer ${
                      activeTab === "home" ? "bg-[#004d99]/5 text-[#004d99]" : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {t("nav.home")}
                  </button>
                  <button 
                    onClick={() => handleTabNavigation("schemes")}
                    className={`h-10 px-4 rounded-xl transition-colors cursor-pointer ${
                      activeTab === "schemes" ? "bg-[#004d99]/5 text-[#004d99]" : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {t("nav.schemes")}
                  </button>
                  <button 
                    onClick={() => handleTabNavigation("eligibility")}
                    className={`h-10 px-4 rounded-xl transition-colors cursor-pointer ${
                      activeTab === "eligibility" ? "bg-[#004d99]/5 text-[#004d99]" : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {t("nav.eligibility")}
                  </button>
                  <button 
                    onClick={() => handleTabNavigation("documents")}
                    className={`h-10 px-4 rounded-xl transition-colors cursor-pointer ${
                      activeTab === "documents" ? "bg-[#004d99]/5 text-[#004d99]" : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {t("nav.vault")}
                  </button>
                  <button 
                    onClick={() => handleTabNavigation("chat")}
                    className={`h-10 px-4 rounded-xl transition-colors cursor-pointer ${
                      activeTab === "chat" ? "bg-[#004d99]/5 text-[#004d99]" : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {t("nav.chat")}
                  </button>
                  <button 
                    onClick={() => handleTabNavigation("family")}
                    className={`h-10 px-4 rounded-xl transition-colors cursor-pointer ${
                      activeTab === "family" ? "bg-[#004d99]/5 text-[#004d99]" : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {t("nav.family")}
                  </button>
                  <button 
                    onClick={() => handleTabNavigation("offices")}
                    className={`h-10 px-4 rounded-xl transition-colors cursor-pointer ${
                      activeTab === "offices" ? "bg-[#004d99]/5 text-[#004d99]" : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {t("action.nearby_offices")}
                  </button>
                </nav>

                {/* Right utility items */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <button 
                      onClick={() => handleTabNavigation("profile")}
                      className="p-2 border border-gray-100 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors relative cursor-pointer"
                    >
                      <Bell className="w-5 h-5 text-gray-600" />
                      {notifications.some(n => n.unread) && (
                        <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
                      )}
                    </button>
                  </div>

                  <button 
                    onClick={() => handleTabNavigation("profile")}
                    className="flex items-center gap-2 text-left bg-transparent border-none cursor-pointer"
                  >
                    <div className="w-9 h-9 bg-teal-50 text-[#006b5f] rounded-xl font-bold text-sm flex items-center justify-center border border-teal-100 shadow-sm shrink-0">
                      {userProfile.name ? userProfile.name.charAt(0) : "R"}
                    </div>
                    <span className="hidden md:inline text-sm font-bold text-gray-700 truncate max-w-[100px]">
                      {userProfile.name ? userProfile.name.split(" ")[0] : "Rahul"}
                    </span>
                  </button>
                </div>
              </div>
            </header>

            {/* Main scrollable body */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 pb-24">
              <AnimatePresence mode="wait">
                {activeApplyScheme ? (
                  <motion.div
                    key="form-assistance"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <FormAssistance
                      scheme={activeApplyScheme}
                      uploadedDocuments={documents}
                      onBackToSchemes={() => setActiveApplyScheme(null)}
                      onSubmitApplication={handleSubmitApplication}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                  >
                    {activeTab === "home" && (
                      <Home
                        userProfile={userProfile}
                        eligibleSchemesCount={schemes.length}
                        activeApplicationsCount={applications.filter(a => a.status === "Submitted" || a.status === "Under Review").length}
                        recommendedSchemes={schemes.slice(0, 3)}
                        notifications={notifications}
                        savedSchemeIds={savedSchemeIds}
                        onNavigate={handleTabNavigation}
                        onViewSchemeDetails={handleViewSchemeDetails}
                        onToggleSaveScheme={handleToggleSaveScheme}
                      />
                    )}

                    {activeTab === "schemes" && (
                      <ExploreSchemes
                        schemes={schemes}
                        savedSchemeIds={savedSchemeIds}
                        onToggleSaveScheme={handleToggleSaveScheme}
                        onApplyForScheme={handleApplyForScheme}
                        preferredLanguage={userProfile.preferredLanguage}
                      />
                    )}

                    {activeTab === "eligibility" && (
                      <EligibilityChecker
                        userProfile={userProfile}
                        schemes={schemes}
                        onApplyProfile={handleApplyProfile}
                        onViewSchemeDetails={handleViewSchemeDetails}
                      />
                    )}

                    {activeTab === "documents" && (
                      <DocumentVault
                        documents={documents}
                        onUploadDocument={handleUploadDocument}
                        onDeleteDocument={handleDeleteDocument}
                        preferredLanguage={userProfile.preferredLanguage}
                      />
                    )}

                    {activeTab === "chat" && (
                      <ChatAssistant
                        initialPrompt={chatInitialPrompt}
                        onClearPrompt={() => setChatInitialPrompt("")}
                        preferredLanguage={userProfile.preferredLanguage}
                      />
                    )}

                    {activeTab === "family" && (
                      <FamilyProfiles
                        familyMembers={familyMembers}
                        onAddFamilyMember={handleAddFamilyMember}
                        onDeleteFamilyMember={handleDeleteFamilyMember}
                        allSchemes={schemes}
                        onViewSchemeDetails={handleViewSchemeDetails}
                        preferredLanguage={userProfile.preferredLanguage}
                      />
                    )}

                    {activeTab === "reminders" && (
                      <RemindersList
                        reminders={reminders}
                        onToggleReminder={handleToggleReminder}
                        onAddReminder={handleAddReminder}
                        onDeleteReminder={handleDeleteReminder}
                        preferredLanguage={userProfile.preferredLanguage}
                      />
                    )}

                    {activeTab === "profile" && (
                      <ProfileView
                        userProfile={userProfile}
                        onUpdateLanguage={(lang) => saveProfile({ ...userProfile, preferredLanguage: lang })}
                        onLogout={handleLogout}
                      />
                    )}

                    {activeTab === "offices" && (
                      <NearbyOffices preferredLanguage={userProfile.preferredLanguage} />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </main>

            {/* Floating bottom tab bar on mobile/tablet */}
            <div className="lg:hidden fixed bottom-0 left-0 w-full z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 px-2 py-1 flex justify-around items-center h-16 shadow-lg">
              <button 
                onClick={() => handleTabNavigation("home")}
                className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-transparent border-none transition-all cursor-pointer ${
                  activeTab === "home" ? "text-[#004d99]" : "text-gray-400"
                }`}
              >
                <HomeIcon className="w-5 h-5" />
                <span className="text-[9px] font-bold mt-1">{t("nav.home")}</span>
              </button>

              <button 
                onClick={() => handleTabNavigation("schemes")}
                className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-transparent border-none transition-all cursor-pointer ${
                  activeTab === "schemes" ? "text-[#004d99]" : "text-gray-400"
                }`}
              >
                <Award className="w-5 h-5" />
                <span className="text-[9px] font-bold mt-1">{t("nav.schemes")}</span>
              </button>

              <button 
                onClick={() => handleTabNavigation("eligibility")}
                className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-transparent border-none transition-all cursor-pointer ${
                  activeTab === "eligibility" ? "text-[#004d99]" : "text-gray-400"
                }`}
              >
                <ClipboardCheck className="w-5 h-5" />
                <span className="text-[9px] font-bold mt-1">{t("nav.eligibility")}</span>
              </button>

              <button 
                onClick={() => handleTabNavigation("documents")}
                className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-transparent border-none transition-all cursor-pointer ${
                  activeTab === "documents" ? "text-[#004d99]" : "text-gray-400"
                }`}
              >
                <ShieldCheck className="w-5 h-5" />
                <span className="text-[9px] font-bold mt-1">{t("nav.vault")}</span>
              </button>

              <button 
                onClick={() => handleTabNavigation("chat")}
                className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-transparent border-none transition-all cursor-pointer ${
                  activeTab === "chat" ? "text-[#004d99]" : "text-gray-400"
                }`}
              >
                <Sparkles className="w-5 h-5" />
                <span className="text-[9px] font-bold mt-1">{t("nav.chat")}</span>
              </button>

              <button 
                onClick={() => handleTabNavigation("family")}
                className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-transparent border-none transition-all cursor-pointer ${
                  activeTab === "family" ? "text-[#004d99]" : "text-gray-400"
                }`}
              >
                <Users className="w-5 h-5" />
                <span className="text-[9px] font-bold mt-1">{t("nav.family")}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
