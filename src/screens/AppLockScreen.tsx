import React, { useState } from 'react';
import {
  Lock,
  Grid,
  Fingerprint,
  Delete,
  CheckCircle2,
} from 'lucide-react';
import type { AppSettings } from '../types';

interface AppLockScreenProps {
  settings: AppSettings;
  isDark?: boolean;
  onSaveSettings: (settings: AppSettings) => void;
}

export const AppLockScreen: React.FC<AppLockScreenProps> = ({
  settings,
  isDark = false,
  onSaveSettings,
}) => {
  const [lockType, setLockType] = useState<'pin' | 'biometric'>(settings.lockType || 'pin');
  const [pin, setPin] = useState(settings.pinCode || '');
  const [isLocked, setIsLocked] = useState(settings.appLockEnabled);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleDigit = (digit: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + digit);
      setErrorMessage('');
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  const handleToggleLock = () => {
    if (!isLocked) {
      // Enabling lock
      if (lockType === 'pin' && pin.length < 4) {
        setErrorMessage('Please enter at least 4 digits for PIN');
        return;
      }
      const newSettings: AppSettings = {
        ...settings,
        appLockEnabled: true,
        lockType,
        pinCode: pin,
      };
      onSaveSettings(newSettings);
      setIsLocked(true);
      setSuccessMessage('App Lock enabled successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      // Disabling lock
      const newSettings: AppSettings = {
        ...settings,
        appLockEnabled: false,
      };
      onSaveSettings(newSettings);
      setIsLocked(false);
      setPin('');
      setSuccessMessage('App Lock disabled');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  return (
    <div className={`flex-1 flex flex-col transition-colors min-h-0 overflow-hidden ${
      isDark ? 'bg-[#12131C] text-white' : 'bg-white text-gray-900'
    }`}>
      {/* Top Header */}
      <div className={`px-4 sm:px-5 pt-3 sm:pt-4 pb-3 flex items-center justify-between border-b shrink-0 ${
        isDark ? 'border-gray-800' : 'border-gray-100'
      }`}>
        <h2 className={`text-base font-extrabold tracking-tight ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          App Lock
        </h2>
      </div>

      <div className="flex-1 p-4 sm:p-5 overflow-y-auto min-h-0 space-y-5 sm:space-y-6">
        {/* Lock Graphic */}
        <div className="flex flex-col items-center text-center pt-2">
          <div className="w-20 h-20 rounded-full bg-[#F3E8FF] flex items-center justify-center text-[#6C47FF] shadow-inner mb-3">
            <Lock className="w-9 h-9 stroke-[2.2]" />
          </div>
          <h3 className={`text-lg font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Set App Lock
          </h3>
          <p className="text-xs text-gray-400 max-w-xs mt-1 leading-relaxed">
            अपने कैलेंडर को सुरक्षित रखें
          </p>
        </div>

        {/* Feedback messages */}
        {successMessage && (
          <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-2xl flex items-center gap-2 text-xs font-semibold animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl text-xs font-semibold animate-fade-in">
            {errorMessage}
          </div>
        )}

        {/* Lock Type Radios */}
        <div className="space-y-3">
          {/* PIN Lock Option */}
          <div
            onClick={() => setLockType('pin')}
            className={`flex items-center justify-between p-3.5 rounded-2xl border transition cursor-pointer ${
              lockType === 'pin'
                ? isDark
                  ? 'bg-purple-950/40 border-[#6C47FF]'
                  : 'bg-purple-50/50 border-[#6C47FF]'
                : isDark
                ? 'bg-[#1C1D2A] border-gray-800 hover:border-purple-800'
                : 'bg-white border-gray-200 hover:border-purple-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <Grid className="w-5 h-5 text-gray-400" />
              <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                PIN Lock
              </span>
            </div>
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                lockType === 'pin' ? 'border-[#6C47FF]' : isDark ? 'border-gray-600' : 'border-gray-300'
              }`}
            >
              {lockType === 'pin' && (
                <div className="w-2.5 h-2.5 rounded-full bg-[#6C47FF]" />
              )}
            </div>
          </div>

          {/* Biometric Lock Option */}
          <div
            onClick={() => setLockType('biometric')}
            className={`flex items-center justify-between p-3.5 rounded-2xl border transition cursor-pointer ${
              lockType === 'biometric'
                ? isDark
                  ? 'bg-purple-950/40 border-[#6C47FF]'
                  : 'bg-purple-50/50 border-[#6C47FF]'
                : isDark
                ? 'bg-[#1C1D2A] border-gray-800 hover:border-purple-800'
                : 'bg-white border-gray-200 hover:border-purple-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <Fingerprint className="w-5 h-5 text-gray-400" />
              <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Biometric Lock
              </span>
            </div>
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                lockType === 'biometric' ? 'border-[#6C47FF]' : isDark ? 'border-gray-600' : 'border-gray-300'
              }`}
            >
              {lockType === 'biometric' && (
                <div className="w-2.5 h-2.5 rounded-full bg-[#6C47FF]" />
              )}
            </div>
          </div>
        </div>

        {/* PIN Input Section */}
        {lockType === 'pin' && (
          <div className="pt-2 flex flex-col items-center">
            <p className="text-xs font-semibold text-gray-400 mb-4">
              Enter 4–6 digit PIN
            </p>

            {/* 4 to 6 PIN Dots */}
            <div className="flex items-center gap-3 mb-6">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                    pin.length > idx
                      ? 'bg-[#6C47FF] scale-110'
                      : isDark
                      ? 'bg-gray-800 border-2 border-gray-700'
                      : 'bg-gray-200 border-2 border-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Keypad */}
            <div className="w-full max-w-xs grid grid-cols-3 gap-y-3 gap-x-4 text-center">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleDigit(digit)}
                  className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center text-lg font-bold active:scale-95 transition cursor-pointer ${
                    isDark
                      ? 'bg-[#1C1D2A] text-white hover:bg-gray-800'
                      : 'bg-gray-50 text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  {digit}
                </button>
              ))}
              <div />
              <button
                type="button"
                onClick={() => handleDigit('0')}
                className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center text-lg font-bold active:scale-95 transition cursor-pointer ${
                  isDark
                    ? 'bg-[#1C1D2A] text-white hover:bg-gray-800'
                    : 'bg-gray-50 text-gray-800 hover:bg-gray-100'
                }`}
              >
                0
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center active:scale-95 transition cursor-pointer ${
                  isDark
                    ? 'text-gray-400 hover:bg-gray-800'
                    : 'text-gray-400 hover:bg-gray-100'
                }`}
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Enable / Disable Button */}
      <div className={`p-4 sm:p-5 border-t pb-[max(1rem,env(safe-area-inset-bottom))] shrink-0 ${isDark ? 'border-gray-800 bg-[#12131C]' : 'border-gray-100 bg-white'}`}>
        <button
          onClick={handleToggleLock}
          className={`w-full py-3.5 sm:py-4 text-white rounded-2xl font-bold text-sm shadow-lg transition cursor-pointer ${
            isLocked
              ? 'bg-red-500 hover:bg-red-600 shadow-red-200 dark:shadow-none'
              : 'bg-[#6C47FF] hover:bg-[#5a38db] shadow-purple-200 dark:shadow-none'
          }`}
        >
          {isLocked ? 'Disable Lock' : 'Enable Lock'}
        </button>
      </div>
    </div>
  );
};