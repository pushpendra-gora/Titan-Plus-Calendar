import React, { useState, useEffect } from 'react';
import { X, FileText, Check } from 'lucide-react';

interface NoteEditModalProps {
  isOpen: boolean;
  dateStr: string;
  initialContent: string;
  isDark?: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
}

export const NoteEditModal: React.FC<NoteEditModalProps> = ({
  isOpen,
  dateStr,
  initialContent,
  isDark = false,
  onClose,
  onSave,
}) => {
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-[2px] p-4">
      <div
        className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-fade-in border transition-colors ${
          isDark ? 'bg-[#1C1D2A] border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between pb-3 mb-2 border-b ${
          isDark ? 'border-gray-800' : 'border-gray-100'
        }`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F3E8FF] text-[#6C47FF] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Edit Day Note
              </h3>
              <p className="text-[11px] text-gray-400">{dateStr}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-full transition cursor-pointer ${
              isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="आज के नोट्स यहाँ लिखें (Write daily notes here)..."
          rows={5}
          className={`w-full text-sm p-3.5 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/20 focus:border-[#6C47FF] resize-none transition ${
            isDark
              ? 'bg-[#12131C] border-gray-700 text-white placeholder-gray-500'
              : 'border-purple-100 bg-[#FAF9FF] text-gray-800 placeholder-gray-400'
          }`}
        />

        <div className="flex gap-2.5 mt-4">
          <button
            onClick={onClose}
            className={`flex-1 py-2.5 rounded-xl font-medium text-xs transition cursor-pointer ${
              isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(content);
              onClose();
            }}
            className="flex-1 py-2.5 bg-[#6C47FF] hover:bg-[#5b3adb] text-white rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-200 dark:shadow-none transition cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Save Note
          </button>
        </div>
      </div>
    </div>
  );
};