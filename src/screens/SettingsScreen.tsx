import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ChevronRight,
  Layers,
  Bell,
  FileText,
  Palette,
  Lock,
  Info,
  Check,
  Volume2,
  RefreshCw,
  HardDrive,
  Sun,
  Moon,
  Sparkles,
  Heart,
} from 'lucide-react';
import type { AppSettings, ViewScreen } from '../types';
import { notificationService } from '../services/notificationService';
import { soundService } from '../services/soundService';
import { saveAndShareFile } from '../services/fileSaveService';

interface SettingsScreenProps {
  settings: AppSettings;
  isDark: boolean;
  onUpdateSettings: (settings: AppSettings) => void;
  onNavigate: (screen: ViewScreen) => void;
  taskCount: number;
  pendingCount: number;
  completedCount: number;
  notesCount: number;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  isDark,
  onUpdateSettings,
  onNavigate,
  taskCount,
  pendingCount,
  completedCount,
  notesCount,
}) => {
  const [notificationTestMessage, setNotificationTestMessage] = useState('');
  const [storageDetailOpen, setStorageDetailOpen] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  const currentTheme = settings.theme || 'light';

  const handleTestNotification = async () => {
    soundService.playReminderChime();
    const granted = await notificationService.requestPermission();

    const mockTask = {
      id: 'test-reminder',
      date: '2026-11-15',
      title: 'Titan Plus Calendar Reminder Test',
      description: 'Your offline notifications are working perfectly at exact set times!',
      completed: false,
      hasReminder: true,
      reminderTime: 'Now',
      showInNotification: true,
      createdAt: Date.now(),
    };

    notificationService.triggerNotification(mockTask);

    if (granted) {
      setNotificationTestMessage('Chime played & push notification sent!');
    } else {
      setNotificationTestMessage('Chime played! (Enable notifications for push banner)');
    }

    setTimeout(() => setNotificationTestMessage(''), 4000);
  };

  const handleBackupData = async () => {
    const data = {
      tasks: localStorage.getItem('titan_tasks_v2'),
      notes: localStorage.getItem('titan_notes_v2'),
      settings: localStorage.getItem('titan_settings_v2'),
      exportedAt: new Date().toISOString(),
    };
    const jsonString = JSON.stringify(data, null, 2);
    const base64Data = btoa(unescape(encodeURIComponent(jsonString)));
    const fileName = `titan_plus_backup_${Date.now()}.json`;

    const res = await saveAndShareFile(fileName, base64Data, 'application/json');
    if (res.success) {
      setNotificationTestMessage('Backup file saved to device storage!');
      setTimeout(() => setNotificationTestMessage(''), 4000);
    }
  };

  const handleSelectTheme = (theme: 'light' | 'dark' | 'purple') => {
    onUpdateSettings({
      ...settings,
      theme,
    });
    setShowThemeModal(false);
  };

  const getThemeDisplayName = () => {
    switch (currentTheme) {
      case 'dark':
        return 'Dark (Night Mode)';
      case 'purple':
        return 'Titan Purple (Soft Violet)';
      case 'light':
      default:
        return 'Light (White Card Premium)';
    }
  };

  const handleOpenAbout = () => {
    setShowAboutModal(true);
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#6C47FF', '#EC4899', '#10B981', '#F59E0B'],
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className={`flex-1 flex flex-col transition-colors min-h-0 overflow-hidden ${isDark ? 'bg-[#12131C] text-white' : 'bg-white text-gray-900'}`}>
      {/* Top Header */}
      <div className={`px-4 sm:px-5 pt-3 sm:pt-4 pb-3 flex items-center justify-between border-b shrink-0 ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
        <h2 className={`text-base font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Settings
        </h2>
      </div>

      <div className="flex-1 p-4 sm:p-5 overflow-y-auto min-h-0 space-y-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {notificationTestMessage && (
          <div className="p-3 bg-purple-50 border border-purple-200 text-[#6C47FF] rounded-2xl flex items-center gap-2 text-xs font-semibold animate-fade-in">
            <Check className="w-4 h-4 shrink-0" />
            <span>{notificationTestMessage}</span>
          </div>
        )}

        {/* 1. Data & Storage */}
        <div className={`rounded-2xl border overflow-hidden transition-colors ${
          isDark ? 'bg-[#1C1D2A] border-gray-800' : 'bg-[#FAF9FD] border-gray-100'
        }`}>
          <div
            onClick={() => setStorageDetailOpen(!storageDetailOpen)}
            className={`p-3.5 flex items-center justify-between cursor-pointer transition ${
              isDark ? 'hover:bg-purple-950/30' : 'hover:bg-purple-50/40'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#F3E8FF] text-[#6C47FF] flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Data & Storage</h4>
                <p className="text-xs text-gray-400">Offline data (Device only)</p>
              </div>
            </div>
            <ChevronRight
              className={`w-4 h-4 text-gray-400 transform transition-transform ${
                storageDetailOpen ? 'rotate-90' : ''
              }`}
            />
          </div>

          {storageDetailOpen && (
            <div className={`px-4 pb-4 pt-1 border-t space-y-2 text-xs animate-fade-in ${
              isDark ? 'border-gray-800 text-gray-300' : 'border-purple-50 text-gray-600'
            }`}>
              <div className="flex justify-between py-1">
                <span className="flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-[#6C47FF]" /> Total Tasks:
                </span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{taskCount}</span>
              </div>
              <div className="flex justify-between py-1 font-medium">
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Pending Tasks:</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{pendingCount}</span>
              </div>
              <div className="flex justify-between py-1 font-medium">
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Completed Tasks:</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{completedCount}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Daily Notes:</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{notesCount}</span>
              </div>
              <div className="pt-2 flex gap-2">
                <button
                  onClick={handleBackupData}
                  className={`flex-1 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition ${
                    isDark
                      ? 'bg-[#252738] border border-gray-700 text-purple-300 hover:bg-gray-800'
                      : 'bg-white border border-purple-200 text-[#6C47FF] hover:bg-purple-50'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Backup Data
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 2. Notifications */}
        <div
          onClick={handleTestNotification}
          className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
            isDark
              ? 'bg-[#1C1D2A] border-gray-800 hover:bg-purple-950/30'
              : 'bg-[#FAF9FD] border-gray-100 hover:bg-purple-50/40'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#F3E8FF] text-[#6C47FF] flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Notifications</h4>
              <p className="text-xs text-gray-400">Manage task reminders (Tap to test)</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[#6C47FF]">
            <Volume2 className="w-4 h-4" />
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* 3. Export to PDF */}
        <div
          onClick={() => onNavigate('export_pdf')}
          className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
            isDark
              ? 'bg-[#1C1D2A] border-gray-800 hover:bg-purple-950/30'
              : 'bg-[#FAF9FD] border-gray-100 hover:bg-purple-50/40'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#F3E8FF] text-[#6C47FF] flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Export to PDF</h4>
              <p className="text-xs text-gray-400">Download monthly report</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>

        {/* 4. Theme - Interactive Switcher */}
        <div
          onClick={() => setShowThemeModal(true)}
          className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
            isDark
              ? 'bg-[#1C1D2A] border-gray-800 hover:bg-purple-950/30'
              : 'bg-[#FAF9FD] border-gray-100 hover:bg-purple-50/40'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#F3E8FF] text-[#6C47FF] flex items-center justify-center shrink-0">
              <Palette className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Theme</h4>
              <p className="text-xs text-gray-400">
                {getThemeDisplayName()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
              isDark ? 'bg-purple-950/70 text-purple-300' : 'bg-purple-50 text-[#6C47FF]'
            }`}>
              {currentTheme === 'dark' ? (
                <Moon className="w-3 h-3" />
              ) : currentTheme === 'purple' ? (
                <Sparkles className="w-3 h-3" />
              ) : (
                <Sun className="w-3 h-3" />
              )}
              Change
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* 5. App Lock */}
        <div
          onClick={() => onNavigate('app_lock_setup')}
          className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
            isDark
              ? 'bg-[#1C1D2A] border-gray-800 hover:bg-purple-950/30'
              : 'bg-[#FAF9FD] border-gray-100 hover:bg-purple-50/40'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#F3E8FF] text-[#6C47FF] flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>App Lock</h4>
              <p className="text-xs text-gray-400">
                {settings.appLockEnabled ? 'Protected with PIN' : 'PIN / Biometric'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {settings.appLockEnabled && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Enabled
              </span>
            )}
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* 6. About (Clickable -> Opens "Made by Pushpendra" Modal) */}
        <div
          onClick={handleOpenAbout}
          className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition active:scale-[0.99] ${
            isDark
              ? 'bg-[#1C1D2A] border-gray-800 hover:bg-purple-950/30'
              : 'bg-[#FAF9FD] border-gray-100 hover:bg-purple-50/40'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#F3E8FF] text-[#6C47FF] flex items-center justify-center shrink-0">
              <Info className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>About</h4>
              <p className="text-xs text-gray-400">Titan Plus Calendar v1.0.0</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* About Modal ("Made by Pushpendra") */}
      {showAboutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setShowAboutModal(false)}
        >
          <div
            className={`w-full max-w-xs rounded-3xl p-6 shadow-2xl border animate-fade-in text-center transition-colors ${
              isDark ? 'bg-[#1C1D2A] border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* App Logo */}
            <img
              src="/logo.png"
              alt="Titan Plus Calendar"
              className="w-16 h-16 rounded-2xl object-cover shadow-lg shadow-purple-500/30 mx-auto mb-3.5 ring-2 ring-[#6C47FF]/40"
            />

            {/* App Title */}
            <h3 className={`text-lg font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Titan Plus Calendar
            </h3>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              Version 1.0.0 • Offline Edition
            </p>

            {/* Prominent "Made by Pushpendra" Badge */}
            <div className={`my-4 py-2.5 px-4 rounded-2xl flex items-center justify-center gap-2 border ${
              isDark
                ? 'bg-purple-950/50 border-purple-800/60'
                : 'bg-purple-50/80 border-purple-200'
            }`}>
              <Heart className="w-4 h-4 text-pink-500 fill-pink-500 animate-pulse" />
              <span className="text-sm font-extrabold text-[#6C47FF] tracking-wide">
                Made by Pushpendra
              </span>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed mb-5">
              Developed and designed with care by <span className="font-bold text-gray-700 dark:text-gray-200">Pushpendra</span>. 100% offline, exact alarm reminders, and local PDF export.
            </p>

            {/* Close Button */}
            <button
              onClick={() => setShowAboutModal(false)}
              className="w-full py-3.5 bg-[#6C47FF] hover:bg-[#5a38db] active:scale-[0.99] text-white rounded-2xl font-bold text-sm shadow-lg shadow-purple-200 dark:shadow-none transition cursor-pointer"
            >
              Awesome! (ठीक है)
            </button>
          </div>
        </div>
      )}

      {/* Theme Selection Modal */}
      {showThemeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4">
          <div
            className={`w-full max-w-xs rounded-3xl p-5 shadow-2xl border animate-fade-in ${
              isDark ? 'bg-[#1C1D2A] border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center gap-2.5 mb-4 pb-2 border-b ${
              isDark ? 'border-gray-800' : 'border-gray-100'
            }`}>
              <Palette className="w-5 h-5 text-[#6C47FF]" />
              <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Select Theme (थीम चुनें)
              </h3>
            </div>

            <div className="space-y-2.5">
              {/* Option 1: Light (White Card) */}
              <div
                onClick={() => handleSelectTheme('light')}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                  currentTheme === 'light'
                    ? 'border-[#6C47FF] bg-purple-50/50'
                    : isDark
                    ? 'border-gray-800 bg-[#12131C] hover:border-purple-600'
                    : 'border-gray-200 hover:border-purple-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <span className={`text-xs font-bold block ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Light Theme
                    </span>
                    <span className="text-[10px] text-gray-400">Pure White Cards (Recommended)</span>
                  </div>
                </div>
                {currentTheme === 'light' && (
                  <div className="w-5 h-5 rounded-full bg-[#6C47FF] flex items-center justify-center text-white">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Option 2: Titan Purple */}
              <div
                onClick={() => handleSelectTheme('purple')}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                  currentTheme === 'purple'
                    ? 'border-[#6C47FF] bg-purple-50/50'
                    : isDark
                    ? 'border-gray-800 bg-[#12131C] hover:border-purple-600'
                    : 'border-gray-200 hover:border-purple-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#6C47FF] flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className={`text-xs font-bold block ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Titan Purple
                    </span>
                    <span className="text-[10px] text-gray-400">Soft Lavender & Royal Violet</span>
                  </div>
                </div>
                {currentTheme === 'purple' && (
                  <div className="w-5 h-5 rounded-full bg-[#6C47FF] flex items-center justify-center text-white">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Option 3: Dark Mode */}
              <div
                onClick={() => handleSelectTheme('dark')}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                  currentTheme === 'dark'
                    ? 'border-[#6C47FF] bg-purple-950/40'
                    : isDark
                    ? 'border-gray-800 bg-[#12131C] hover:border-purple-600'
                    : 'border-gray-200 hover:border-purple-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gray-900 text-gray-100 flex items-center justify-center border border-gray-700">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className={`text-xs font-bold block ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Dark Night
                    </span>
                    <span className="text-[10px] text-gray-400">Night Mode</span>
                  </div>
                </div>
                {currentTheme === 'dark' && (
                  <div className="w-5 h-5 rounded-full bg-[#6C47FF] flex items-center justify-center text-white">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowThemeModal(false)}
              className={`w-full mt-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition ${
                isDark
                  ? 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};