import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface WelcomePopupProps {
  isOpen: boolean;
  onContinue: () => void;
}

export function WelcomePopup({ isOpen, onContinue }: WelcomePopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto transform transition-all duration-300 scale-100">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-t-2xl p-8 text-center relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 opacity-30 animate-pulse"></div>
          <div className="absolute top-2 left-2 w-4 h-4 bg-white rounded-full opacity-20 animate-bounce"></div>
          <div className="absolute top-4 right-4 w-3 h-3 bg-white rounded-full opacity-30 animate-bounce delay-100"></div>
          <div className="absolute bottom-3 left-6 w-2 h-2 bg-white rounded-full opacity-25 animate-bounce delay-200"></div>
          
          {/* Main content */}
          <div className="relative z-10">
            <div className="mb-4">
              <Sparkles className="h-12 w-12 text-white mx-auto animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-wide">
              pashammm
            </h1>
            <div className="w-16 h-1 bg-white rounded-full mx-auto opacity-80"></div>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to Your Trading Journey
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Get ready to transform your trading experience with our comprehensive journal. 
            Track, analyze, and optimize your trades like never before.
          </p>
          
          {/* Decorative elements */}
          <div className="flex justify-center space-x-2 mb-8">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-75"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-150"></div>
          </div>

          {/* Continue button */}
          <button
            onClick={onContinue}
            className="group w-full inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-semibold rounded-xl shadow-lg text-white bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 transform hover:scale-105"
          >
            <span className="mr-3">Continue</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>

        {/* Footer decoration */}
        <div className="h-2 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-b-2xl"></div>
      </div>
    </div>
  );
}