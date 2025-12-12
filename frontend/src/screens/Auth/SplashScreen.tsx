import * as React from 'react';
import { useEffect, useState } from 'react';

const SplashScreen: React.FC = () => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out after 2.5 seconds for better visibility
    const timer = setTimeout(() => {
      setFadeOut(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white transition-opacity duration-700 ease-in-out ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center animate-fadeIn px-6">
        {/* Logo - Centered and Clean */}
        <div className="mb-6 relative">
          <img
            src="/logo.png"
            alt="ProSpine Logo"
            className="w-32 h-32 object-contain filter drop-shadow-sm"
          />
        </div>

        {/* App Name - Google Sans/Inter Style */}
        <h1 className="text-4xl font-normal text-gray-900 mb-2 tracking-tight">
          ProSpine
        </h1>

        {/* Tagline - Subtle Gray */}
        <p className="text-lg text-gray-500 font-light tracking-wide">
          Advanced Clinic Management
        </p>
      </div>

      {/* Google-style Loader - Bottom Positioned */}
      <div className="absolute bottom-16 flex flex-col items-center">
        {/* Minimal teal spinner */}
        <div className="w-8 h-8 border-4 border-gray-100 border-t-teal-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-medium text-gray-400 uppercase tracking-widest">
          Version 1.0.0
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
