import { motion } from "motion/react";
import { Landmark } from "lucide-react";

interface SplashProps {
  onComplete: () => void;
}

export default function Splash({ onComplete }: SplashProps) {
  return (
    <div className="bg-[#004d99] min-h-screen w-full flex flex-col items-center justify-center relative font-sans text-white overflow-hidden p-6">
      {/* Ambient background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#d6e3ff] rounded-full mix-blend-screen filter blur-[100px] opacity-10"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#8df5e4] rounded-full mix-blend-screen filter blur-[100px] opacity-10"></div>
      </div>

      <div className="z-10 flex flex-col items-center w-full max-w-md text-center">
        {/* Logo and Branding */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center mb-6">
            <Landmark className="text-[#004d99] w-12 h-12" />
          </div>
          <h1 className="text-4xl font-bold mb-1 tracking-tight">JanSathi</h1>
          <p className="text-lg text-[#d6e3ff] font-medium">Government Benefits Made Simple</p>
        </motion.div>

        {/* Dynamic Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="w-full max-w-xs mb-10 relative"
        >
          <div className="absolute inset-0 bg-[#d6e3ff]/10 rounded-full blur-2xl -z-10"></div>
          <img 
            alt="Secure digital connection illustration" 
            referrerPolicy="no-referrer"
            className="w-full h-auto drop-shadow-2xl rounded-2xl" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWMQpm1XLAR08o1w6qkEXkr6VAMVdzKkthO3F-8JljrOPw74HTcNng5SlAULeey8qRqk1oIsuXQR7rsMRB5jeMoiPJ0iUHak7k-Hd0m-eau59p3MD8RqQ3H0Sju8-lQMuP3sEjHyKCja4Sb-DtVV1Fq6RcshFjHHHG8tKRAopzy3TsPn0R0ttJEW4Ni5EOLc3AH4aGhHOyCCZyxPxKw1urdhDIP45RStJ_LOujEaJqd6QfR29N2-8r"
          />
        </motion.div>

        {/* Progress & Loading State */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col items-center"
        >
          <div className="w-12 h-12 border-4 border-[#d6e3ff]/30 border-t-[#8df5e4] rounded-full animate-spin mb-4"></div>
          <p className="text-xs font-semibold tracking-widest text-[#a9c7ff] uppercase">
            Initializing Secure Environment
          </p>
        </motion.div>

        {/* Auto skip / completion simulation */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 2 }}
          onClick={onComplete}
          className="mt-8 text-xs underline text-[#d6e3ff] hover:opacity-100 transition-opacity cursor-pointer"
        >
          Tap to proceed
        </motion.button>
      </div>

      {/* Auto trigger complete for nice demo flow */}
      <motion.div
        animate={{ scale: [1, 1] }}
        transition={{ duration: 3.5 }}
        onAnimationComplete={onComplete}
      />
    </div>
  );
}
