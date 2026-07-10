import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldAlert, ArrowLeft, Smartphone, Key, Lock, Mail, User, Eye, EyeOff, AlertCircle, Sparkles } from "lucide-react";
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithPhoneNumber, 
  RecaptchaVerifier, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signInAnonymously
} from "firebase/auth";
import { auth } from "../lib/firebase";

interface LoginProps {
  onLoginSuccess: (userInfo: { name: string; phone: string; email: string }) => void;
}

type AuthMethod = "PHONE" | "EMAIL";

export default function Login({ onLoginSuccess }: LoginProps) {
  // Navigation & General Auth State
  const [authMethod, setAuthMethod] = useState<AuthMethod>("PHONE");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Phone Auth State
  const [mobileNumber, setMobileNumber] = useState("");
  const [isOtpView, setIsOtpView] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Email Auth State
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Initialize Recaptcha Verifier on mount/method change
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (authMethod === "PHONE" && !isOtpView) {
      try {
        if (!recaptchaVerifierRef.current) {
          recaptchaVerifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
            size: "invisible",
            callback: () => {
              // recaptcha solved, proceed
            },
          });
        }
      } catch (err) {
        console.error("Recaptcha error:", err);
      }
    }
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (e) {
          console.error("Error clearing Recaptcha:", e);
        }
        recaptchaVerifierRef.current = null;
      }
    };
  }, [authMethod, isOtpView]);

  // -------- PHONE OTP AUTH FLOW --------
  const handleGetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mobileNumber.length !== 10 || !/^\d+$/.test(mobileNumber)) {
      setError("Please enter a valid 10-digit mobile number.");
      setLoading(false);
      return;
    }

    try {
      const formattedPhone = `+91${mobileNumber}`;
      
      // Ensure we have recaptcha verifier
      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
        });
      }

      const confirmation = await signInWithPhoneNumber(
        auth, 
        formattedPhone, 
        recaptchaVerifierRef.current
      );
      
      setConfirmationResult(confirmation);
      setIsOtpView(true);
    } catch (err: any) {
      console.error("Phone sign-in SMS send error:", err);
      
      // Sandbox fallback if Recaptcha fails or phone SMS quotas exceeded
      setError("SMS sending failed or Recaptcha blocked. Authenticating in demo mode...");
      setTimeout(() => {
        setIsOtpView(true);
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (val: string, index: number) => {
    if (val.length > 1) {
      val = val.slice(-1);
    }
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Focus next input if value entered
    if (val && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter a 6-digit OTP.");
      setLoading(false);
      return;
    }

    try {
      if (confirmationResult) {
        const result = await confirmationResult.confirm(otpCode);
        const user = result.user;
        onLoginSuccess({
          name: user.displayName || "Rahul Sharma",
          phone: user.phoneNumber || `+91 ${mobileNumber}`,
          email: user.email || `${mobileNumber}@jansathi.gov.in`
        });
      } else {
        // Fallback for demo mode: Sign in anonymously first to get a valid user UID
        try {
          await signInAnonymously(auth);
        } catch (anonErr) {
          console.warn("Could not sign in anonymously in demo mode:", anonErr);
        }
        onLoginSuccess({
          name: "Rahul Sharma (Demo)",
          phone: `+91 ${mobileNumber}`,
          email: `demo_${mobileNumber}@jansathi.gov.in`
        });
      }
    } catch (err: any) {
      console.error("OTP verification error:", err);
      setError("Invalid verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // -------- EMAIL & PASSWORD FLOW --------
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // Sign Up
        if (!fullName) {
          setError("Full name is required for registration.");
          setLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: fullName });
        onLoginSuccess({
          name: fullName,
          phone: "+91 9876543210",
          email: email
        });
      } else {
        // Sign In
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onLoginSuccess({
          name: userCredential.user.displayName || "Rahul Sharma",
          phone: userCredential.user.phoneNumber || "+91 9876543210",
          email: email
        });
      }
    } catch (err: any) {
      console.error("Email auth error:", err);
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("Invalid email or password combination.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else {
        setError(err.message || "Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError("Please enter your email address to reset password.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 5000);
    } catch (err: any) {
      console.error("Reset password error:", err);
      setError(err.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  // -------- GOOGLE SIGN IN FLOW --------
  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      onLoginSuccess({
        name: user.displayName || "Rahul Sharma",
        phone: user.phoneNumber || "+91 9876543210",
        email: user.email || "rahul.sharma@gmail.com"
      });
    } catch (err: any) {
      console.error("Google sign in error:", err);
      
      // If popup is blocked/error occurs in sandboxed iframe, fallback to anonymous or mock
      if (err.code === "auth/popup-blocked" || err.code === "auth/popup-closed-by-user") {
        setError("Google authentication popup blocked. Trying quick demo login...");
        try {
          const userCredential = await signInAnonymously(auth);
          onLoginSuccess({
            name: "Rahul Sharma (Guest)",
            phone: "+91 9876543210",
            email: "guest@jansathi.gov.in"
          });
        } catch (anonErr) {
          onLoginSuccess({
            name: "Rahul Sharma",
            phone: "+91 9876543210",
            email: "rahul.sharma@gmail.com"
          });
        }
      } else {
        setError("Could not complete Google Login. Authenticating in local guest mode.");
        setTimeout(() => {
          onLoginSuccess({
            name: "Rahul Sharma",
            phone: "+91 9876543210",
            email: "rahul.sharma@gmail.com"
          });
        }, 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  // -------- DEMO BYPASS SIGN IN FLOW --------
  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      // Sign in anonymously first to get a valid user UID for Firebase Firestore operations
      try {
        await signInAnonymously(auth);
      } catch (anonErr) {
        console.warn("Could not sign in anonymously for sandbox bypass:", anonErr);
      }
      onLoginSuccess({
        name: "Rahul Sharma (Demo)",
        phone: "+91 9876543210",
        email: "demo@jansathi.gov.in"
      });
    } catch (err: any) {
      console.error("Demo login error:", err);
      setError("Demo login failed. Trying quick local guest mode...");
      setTimeout(() => {
        onLoginSuccess({
          name: "Rahul Sharma (Guest)",
          phone: "+91 9876543210",
          email: "guest@jansathi.gov.in"
        });
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f7f9fb] min-h-screen flex flex-col md:justify-center items-center relative overflow-hidden font-sans text-[#191c1e] p-4">
      {/* Invisible Recaptcha anchor */}
      <div id="recaptcha-container"></div>

      {/* Abstract Background Elements */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-gradient-to-tr from-[#004d99] to-[#006b5f]" />

      <main className="w-full max-w-md z-10 bg-white md:rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col justify-between mt-12 md:mt-0">
        {/* Header Branding */}
        <div className="px-6 pt-10 pb-4 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-[#1565c0] text-white rounded-2xl flex items-center justify-center mb-3 shadow-md">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold text-[#004d99] mb-1">JanSathi</h1>
          <p className="text-sm text-gray-500">Secure citizen service gateway</p>
        </div>

        {/* Tab Selector - ONLY show if not in OTP confirmation view */}
        {!isOtpView && (
          <div className="px-6 mb-4">
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => { setAuthMethod("PHONE"); setError(null); }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  authMethod === "PHONE" 
                    ? "bg-white text-[#004d99] shadow-sm" 
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Mobile Number OTP
              </button>
              <button
                type="button"
                onClick={() => { setAuthMethod("EMAIL"); setError(null); }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  authMethod === "EMAIL" 
                    ? "bg-white text-[#004d99] shadow-sm" 
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Email & Password
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Transition Container */}
        <div className="px-6 pb-8 flex-grow relative overflow-hidden min-h-[340px]">
          {/* Error Banner */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="font-semibold">{error}</span>
            </motion.div>
          )}

          {resetSent && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl flex items-start gap-2"
            >
              <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="font-semibold">Password reset email sent successfully!</span>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {/* VIEW A: PHONE OTP REQUEST */}
            {authMethod === "PHONE" && !isOtpView && (
              <motion.div
                key="phone-input"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
                className="w-full flex flex-col gap-6"
              >
                <form onSubmit={handleGetOtp} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700" htmlFor="mobile-input">
                      Mobile Number
                    </label>
                    <div className="flex relative rounded-xl border border-gray-300 focus-within:border-[#004d99] focus-within:ring-2 focus-within:ring-[#004d99]/20 bg-white transition-all overflow-hidden">
                      <div className="flex items-center px-4 border-r border-gray-200 bg-gray-50 text-gray-600 font-semibold text-sm">
                        +91
                      </div>
                      <input
                        id="mobile-input"
                        type="tel"
                        maxLength={10}
                        pattern="[0-9]{10}"
                        placeholder="Enter 10-digit number"
                        required
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                        className="flex-1 h-12 px-4 bg-transparent border-none text-base text-[#191c1e] placeholder-gray-400 outline-none focus:outline-none"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Smartphone className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-[#004d99] hover:bg-[#003c78] active:bg-[#002e5c] disabled:opacity-50 text-white rounded-full flex items-center justify-center font-semibold shadow-md transition-all cursor-pointer"
                  >
                    {loading ? "Sending..." : "Get OTP"}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:from-emerald-800 active:to-teal-800 text-white rounded-full flex items-center justify-center gap-2.5 font-semibold shadow-md transition-all cursor-pointer"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Instant Sandbox Bypass</span>
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 my-1">
                  <div className="h-px bg-gray-200 flex-1"></div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">or</span>
                  <div className="h-px bg-gray-200 flex-1"></div>
                </div>

                {/* Google Sign-in option */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full h-12 border border-gray-300 hover:bg-gray-50 active:bg-gray-100 text-gray-700 rounded-full flex items-center justify-center gap-3 font-semibold transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </motion.div>
            )}

            {/* VIEW B: PHONE OTP VERIFICATION */}
            {authMethod === "PHONE" && isOtpView && (
              <motion.div
                key="otp-input"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                className="w-full flex flex-col"
              >
                {/* Back button */}
                <button
                  type="button"
                  onClick={() => setIsOtpView(false)}
                  className="self-start flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-[#004d99] mb-4 -ml-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <div className="mb-6">
                  <h2 className="text-xl font-bold text-[#191c1e] mb-1">Verify your number</h2>
                  <p className="text-sm text-gray-500">
                    Enter the 6-digit verification code sent to <br />
                    <span className="font-semibold text-gray-800">+91 {mobileNumber.slice(0, 5)} {mobileNumber.slice(5)}</span>
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6">
                  {/* OTP Inputs */}
                  <div className="flex justify-between gap-2">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { otpRefs.current[idx] = el; }}
                        type="text"
                        pattern="\d*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(e.target.value, idx)}
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                        className="w-12 h-14 md:w-14 md:h-16 text-center text-xl font-bold text-[#191c1e] bg-gray-50 border border-gray-300 rounded-xl focus:border-[#004d99] focus:ring-2 focus:ring-[#004d99]/20 outline-none transition-all"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-[#004d99] hover:bg-[#003c78] active:bg-[#002e5c] disabled:opacity-50 text-white rounded-full flex items-center justify-center font-semibold shadow-md transition-all cursor-pointer"
                  >
                    {loading ? "Verifying..." : "Verify Code"}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500">
                    Didn't receive the code?{" "}
                    <button
                      type="button"
                      onClick={() => setOtp(["", "", "", "", "", ""])}
                      className="text-sm font-semibold text-[#004d99] hover:underline ml-1 cursor-pointer"
                    >
                      Resend OTP
                    </button>
                  </p>
                </div>
              </motion.div>
            )}

            {/* VIEW C: EMAIL & PASSWORD AUTH */}
            {authMethod === "EMAIL" && (
              <motion.div
                key="email-input"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                className="w-full flex flex-col gap-4"
              >
                <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
                  {isSignUp && (
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-gray-600">Full Name</label>
                      <div className="flex relative rounded-xl border border-gray-300 focus-within:border-[#004d99] focus-within:ring-2 focus-within:ring-[#004d99]/20 bg-white transition-all overflow-hidden">
                        <input
                          type="text"
                          placeholder="Your full name"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="flex-1 h-11 px-4 text-sm text-[#191c1e] outline-none"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                          <User className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-600">Email Address</label>
                    <div className="flex relative rounded-xl border border-gray-300 focus-within:border-[#004d99] focus-within:ring-2 focus-within:ring-[#004d99]/20 bg-white transition-all overflow-hidden">
                      <input
                        type="email"
                        placeholder="name@gmail.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 h-11 px-4 text-sm text-[#191c1e] outline-none"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Mail className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-gray-600">Password</label>
                      {!isSignUp && (
                        <button
                          type="button"
                          onClick={handlePasswordReset}
                          className="text-[11px] font-bold text-[#004d99] hover:underline cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="flex relative rounded-xl border border-gray-300 focus-within:border-[#004d99] focus-within:ring-2 focus-within:ring-[#004d99]/20 bg-white transition-all overflow-hidden">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="flex-1 h-11 px-4 text-sm text-[#191c1e] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 bg-[#004d99] hover:bg-[#003c78] active:bg-[#002e5c] disabled:opacity-50 text-white rounded-full flex items-center justify-center font-bold shadow-sm transition-all cursor-pointer text-sm mt-2"
                  >
                    {loading ? "Please wait..." : isSignUp ? "Create Citizen Account" : "Login"}
                  </button>
                </form>

                <div className="text-center mt-1">
                  <button
                    type="button"
                    onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                    className="text-xs font-bold text-[#004d99] hover:underline cursor-pointer"
                  >
                    {isSignUp ? "Already have an account? Sign In" : "New to JanSathi? Create an Account"}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={loading}
                  className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:from-emerald-800 active:to-teal-800 text-white rounded-full flex items-center justify-center gap-2.5 font-semibold shadow-md transition-all cursor-pointer text-sm"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Instant Sandbox Bypass</span>
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 my-1">
                  <div className="h-px bg-gray-200 flex-1"></div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">or</span>
                  <div className="h-px bg-gray-200 flex-1"></div>
                </div>

                {/* Google Sign-in option */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full h-11 border border-gray-300 hover:bg-gray-50 active:bg-gray-100 text-gray-700 rounded-full flex items-center justify-center gap-3 font-semibold transition-colors cursor-pointer text-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer legal */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-center gap-4 text-xs text-gray-400">
          <a href="#terms" className="hover:text-[#004d99] transition-colors">Terms of Service</a>
          <span>•</span>
          <a href="#privacy" className="hover:text-[#004d99] transition-colors">Privacy Policy</a>
        </div>
      </main>
    </div>
  );
}
