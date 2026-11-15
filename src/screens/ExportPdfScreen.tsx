import React, { useState } from 'react';
import {
  FileText,
  Download,
  ChevronDown,
  CheckSquare,
  Square,
  CheckCircle2,
} from 'lucide-react';
import type { Task, DayNote } from '../types';
import { generateAndDownloadMonthlyPDF } from '../services/pdfService';

interface ExportPdfScreenProps {
  tasks: Task[];
  notes: DayNote[];
  isDark?: boolean;
}

export const ExportPdfScreen: React.FC<ExportPdfScreenProps> = ({
  tasks,
  notes,
  isDark = false,
}) => {
  const now = new Date();
  const currentMonthValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonthValue);
  const [includeTasks, setIncludeTasks] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(true);
  const [includeReminderTime, setIncludeReminderTime] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Dynamically generate months around current date (-3 to +6 months)
  const months: { value: string; label: string }[] = [];
  for (let i = -3; i <= 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
    months.push({ value, label });
  }

  const currentLabel =
    months.find((m) => m.value === selectedMonth)?.label ||
    now.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });

  const handleDownload = async () => {
    setIsExporting(true);
    setSuccessMessage('');

    try {
      await generateAndDownloadMonthlyPDF({
        monthStr: selectedMonth,
        monthDisplay: currentLabel,
        includeTasks,
        includeNotes,
        includeReminderTime,
        tasks,
        notes,
      });

      setSuccessMessage('PDF saved successfully to device storage!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('PDF error:', err);
    } finally {
      setIsExporting(false);
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
          Export to PDF
        </h2>
      </div>

      <div className="flex-1 p-4 sm:p-5 overflow-y-auto min-h-0 space-y-5 sm:space-y-6">
        {/* PDF Hero Graphic */}
        <div className="flex flex-col items-center text-center pt-3 pb-2">
          <div className="w-20 h-20 rounded-full bg-[#F3E8FF] flex items-center justify-center text-[#6C47FF] shadow-inner mb-3">
            <div className="flex flex-col items-center">
              <FileText className="w-8 h-8 stroke-[2.2]" />
              <span className="text-[10px] font-extrabold tracking-wider mt-0.5">PDF</span>
            </div>
          </div>
          <h3 className={`text-lg font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Monthly Report (PDF)
          </h3>
          <p className="text-xs text-gray-400 max-w-xs mt-1 leading-relaxed">
            पूरे महीने के Tasks, Notes और Reminder का PDF बनाएं।
          </p>
        </div>

        {/* Success toast */}
        {successMessage && (
          <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-2xl flex items-center gap-2 text-xs font-semibold animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Select Month Dropdown */}
        <div className="relative">
          <label className={`block text-xs font-bold mb-1.5 flex items-center gap-1.5 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            <FileText className="w-3.5 h-3.5 text-[#6C47FF]" />
            <span>Select Month</span>
          </label>
          <div
            onClick={() => setShowDropdown(!showDropdown)}
            className={`w-full p-3.5 border rounded-2xl flex items-center justify-between text-sm cursor-pointer hover:border-[#6C47FF] transition ${
              isDark
                ? 'bg-[#1C1D2A] border-gray-800 text-white'
                : 'bg-gray-50 border-gray-200 text-gray-800'
            }`}
          >
            <span className="font-semibold">{currentLabel}</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>

          {showDropdown && (
            <div className={`absolute top-full left-0 right-0 mt-1 border rounded-2xl shadow-xl py-1 z-30 animate-fade-in max-h-60 overflow-y-auto ${
              isDark
                ? 'bg-[#1C1D2A] border-gray-800 text-white'
                : 'bg-white border-gray-100 text-gray-800'
            }`}>
              {months.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => {
                    setSelectedMonth(m.value);
                    setShowDropdown(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-xs font-semibold transition cursor-pointer ${
                    selectedMonth === m.value
                      ? isDark
                        ? 'bg-purple-950/60 text-purple-300'
                        : 'bg-[#F3E8FF] text-[#6C47FF]'
                      : isDark
                      ? 'text-gray-300 hover:bg-gray-800'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Include in PDF Checkboxes */}
        <div className="space-y-3">
          <label className={`block text-xs font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Include in PDF
          </label>

          {/* Option: Tasks */}
          <div
            onClick={() => setIncludeTasks(!includeTasks)}
            className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition ${
              isDark
                ? 'bg-[#1C1D2A] border-gray-800 hover:bg-purple-950/20'
                : 'bg-[#FAF9FD] border-gray-100 hover:bg-purple-50/40'
            }`}
          >
            {includeTasks ? (
              <CheckSquare className="w-5 h-5 text-[#6C47FF]" />
            ) : (
              <Square className="w-5 h-5 text-gray-400" />
            )}
            <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Tasks
            </span>
          </div>

          {/* Option: Notes */}
          <div
            onClick={() => setIncludeNotes(!includeNotes)}
            className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition ${
              isDark
                ? 'bg-[#1C1D2A] border-gray-800 hover:bg-purple-950/20'
                : 'bg-[#FAF9FD] border-gray-100 hover:bg-purple-50/40'
            }`}
          >
            {includeNotes ? (
              <CheckSquare className="w-5 h-5 text-[#6C47FF]" />
            ) : (
              <Square className="w-5 h-5 text-gray-400" />
            )}
            <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Notes
            </span>
          </div>

          {/* Option: Reminder Time */}
          <div
            onClick={() => setIncludeReminderTime(!includeReminderTime)}
            className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition ${
              isDark
                ? 'bg-[#1C1D2A] border-gray-800 hover:bg-purple-950/20'
                : 'bg-[#FAF9FD] border-gray-100 hover:bg-purple-50/40'
            }`}
          >
            {includeReminderTime ? (
              <CheckSquare className="w-5 h-5 text-[#6C47FF]" />
            ) : (
              <Square className="w-5 h-5 text-gray-400" />
            )}
            <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Reminder Time
            </span>
          </div>
        </div>
      </div>

      {/* Download PDF Button */}
      <div className={`p-4 sm:p-5 border-t pb-[max(1rem,env(safe-area-inset-bottom))] shrink-0 ${isDark ? 'border-gray-800 bg-[#12131C]' : 'border-gray-100 bg-white'}`}>
        <button
          onClick={handleDownload}
          disabled={isExporting}
          className="w-full py-3.5 sm:py-4 bg-[#6C47FF] hover:bg-[#5a38db] active:scale-[0.99] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-200 dark:shadow-none transition cursor-pointer disabled:opacity-70"
        >
          <Download className="w-5 h-5 stroke-[2.5]" />
          {isExporting ? 'Generating PDF...' : 'Download PDF'}
        </button>
      </div>
    </div>
  );
};