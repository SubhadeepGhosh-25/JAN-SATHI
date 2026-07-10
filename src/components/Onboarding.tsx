import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ChevronRight, Sparkles } from "lucide-react";

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Discover schemes personalized for you",
      description: "Answer a few quick questions to find government benefits tailored to your unique profile.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXu_tdh8P9GuPWSND1vzklBXkNP36cs3ekWJL2D9ZKe5DgLpp9lXABdbGfb3u1hqVvOvyHtlnIY5N-j1exgXjnvH9QVgj3VukNw1naSwIWLdTzYRF_AL-uGVyMv8xGdLvX2vm3ZfD521O83Dsdxp7Li8h7DCzmI3ThdUkdS9hm68CiWaHbrpYK9JLGw5jT0y3FWB71JTsFtYlE4DT7jcgUCI67wDN5CX1tyM9CuH_uHY2ik_O0fymYsT",
      bgColor: "bg-white",
    },
    {
      title: "Secure Document Vault & OCR",
      description: "Keep all your certificates secure in one place. Use Gemini-powered OCR to instantly verify and extract key details.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCWMQpm1XLAR08o1w6qkEXkr6VAMVdzKkthO3F-8JljrOPw74HTcNng5SlAULeey8qRqk1oIsuXQR7rsMRB5jeMoiPJ0iUHak7k-Hd0m-eau59p3MD8RqQ3H0Sju8-lQMuP3sEjHyKCja4Sb-DtVV1Fq6RcshFjHHHG8tKRAopzy3TsPn0R0ttJEW4Ni5EOLc3AH4aGhHOyCCZyxPxKw1urdhDIP45RStJ_LOujEaJqd6QfR29N2-8r",
      bgColor: "bg-[#f2f4f6]",
    },
    {
      title: "Apply with AI assistance",
      description: "Our smart assistant helps you fill out forms correctly the first time, ensuring your applications are processed smoothly.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBQp07ov0vZ39aYB6P_vpB1p-r66twrrFsc-bX3hBFjlWOai4LWM9xfle3c1FGK8wTw0Av-UTHTSgxlHfLSC6aoafC9mTvTXKqGFDAxtMdCgvqp_05kNMytq85b8wBip6qTY_-jrr7qzLfRhKgUjYuGVjUq8K8Oo2mMsk8IPU5nJ1uDDR1mZSy5lQKYPWWx-HDzFqgd2e3K09DoGT1hkQYUmLkukJ0AMszqiOqh9ybO76q3y2QhPuLo",
      bgColor: "bg-white",
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className={`min-h-screen ${steps[step].bgColor} text-[#191c1e] flex flex-col font-sans transition-colors duration-500`}>
      {/* Top Header */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Sparkles className="text-[#004d99] w-6 h-6 fill-current" />
          <span className="text-xl font-bold text-[#004d99] tracking-tight">JanSathi</span>
        </div>
        <button 
          onClick={onComplete}
          className="text-gray-500 font-semibold text-sm hover:text-[#004d99] transition-colors cursor-pointer"
        >
          Skip
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto px-6 pt-20 pb-10 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, cubicBezier: [0.16, 1, 0.3, 1] }}
            className="w-full flex flex-col items-center flex-grow justify-center py-6"
          >
            {/* Illustration */}
            <div className="w-full aspect-square max-w-[280px] mb-8 relative flex items-center justify-center">
              <div className="absolute inset-0 bg-[#004d99]/5 rounded-full blur-3xl -z-10"></div>
              <img 
                alt={steps[step].title} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain drop-shadow-xl rounded-2xl" 
                src={steps[step].image}
              />
            </div>

            {/* Text Content */}
            <div className="text-center w-full px-4 mb-8">
              <h1 className="text-2xl font-bold text-[#191c1e] mb-3 leading-tight tracking-tight">
                {steps[step].title}
              </h1>
              <p className="text-sm text-gray-500 leading-relaxed max-w-[300px] mx-auto">
                {steps[step].description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Action Bar */}
        <div className="w-full flex items-center justify-between mt-auto">
          {/* Progress Indicators */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step ? "w-6 bg-[#004d99]" : "w-2 bg-gray-200"
                }`}
              />
            ))}
          </div>

          {/* Action Button */}
          <button
            onClick={handleNext}
            className="h-12 px-6 bg-[#004d99] text-white font-semibold rounded-full shadow-md hover:bg-[#00366c] hover:shadow-lg transition-all flex items-center justify-center gap-2 group active:scale-95 cursor-pointer"
          >
            <span>{step === steps.length - 1 ? "Get Started" : "Next"}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </main>
    </div>
  );
}
