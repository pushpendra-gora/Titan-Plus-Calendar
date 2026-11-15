import React, { useState } from 'react';
import { Fingerprint, Delete } from 'lucide-react';

interface LockScreenProps {
  correctPin: string;
  isDark?: boolean;
  onUnlock: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ correctPin, isDark = false, onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);

      if (newPin.length === 4) {
        if (newPin === correctPin || correctPin === '') {
          setTimeout(() => onUnlock(), 100);
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 600);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleBiometric = () => {
    // If WebAuthn or simulated biometrics
    onUnlock();
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-8 transition-colors ${
      isDark ? 'bg-[#12131C] text-white' : 'bg-white text-gray-900'
    }`}>
      {/* Top Header */}
      <div className="flex flex-col items-center mt-12">
        <img
          src="/logo.png"
          alt="Titan Plus Calendar"
          className="w-20 h-20 rounded-3xl object-cover shadow-xl mb-4 ring-2 ring-[#6C47FF]/30"
        />
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Titan Plus Calendar</h2>
        <p className="text-xs text-gray-400 mt-1">Enter PIN to unlock your calendar</p>

        {/* PIN Dots */}
        <div className={`flex items-center gap-4 mt-8 ${error ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full transition-all duration-200 ${
                pin.length > index
                  ? 'bg-[#6C47FF] scale-110'
                  : isDark
                  ? 'bg-gray-800 border-2 border-gray-700'
                  : 'bg-gray-200 border-2 border-gray-300'
              }`}
            />
          ))}
        </div>
        {error && (
          <p className="text-xs text-red-500 font-semibold mt-3 animate-fade-in">
            Incorrect PIN. Try again.
          </p>
        )}
      </div>

      {/* Keypad */}
      <div className="w-full max-w-xs mb-8">
        <div className="grid grid-cols-3 gap-y-4 gap-x-6 text-center">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleKeyPress(digit)}
              className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center text-xl font-bold active:scale-95 transition cursor-pointer ${
                isDark
                  ? 'bg-[#1C1D2A] text-white hover:bg-gray-800'
                  : 'bg-gray-50 text-gray-800 hover:bg-gray-100'
              }`}
            >
              {digit}
            </button>
          ))}

          {/* Biometrics button */}
          <button
            onClick={handleBiometric}
            className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center text-[#6C47FF] active:scale-95 transition cursor-pointer ${
              isDark ? 'hover:bg-purple-950/40' : 'hover:bg-purple-50'
            }`}
          >
            <Fingerprint className="w-7 h-7" />
          </button>

          {/* Zero */}
          <button
            onClick={() => handleKeyPress('0')}
            className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center text-xl font-bold active:scale-95 transition cursor-pointer ${
              isDark
                ? 'bg-[#1C1D2A] text-white hover:bg-gray-800'
                : 'bg-gray-50 text-gray-800 hover:bg-gray-100'
            }`}
          >
            0
          </button>

          {/* Delete backspace */}
          <button
            onClick={handleDelete}
            className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center active:scale-95 transition cursor-pointer ${
              isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};