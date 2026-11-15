import React from 'react';
import { Check, Edit3, Copy, Trash2, X } from 'lucide-react';
import type { Task } from '../types';

interface TaskActionModalProps {
  task: Task | null;
  isOpen: boolean;
  isDark?: boolean;
  onClose: () => void;
  onToggleDone: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDuplicate: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export const TaskActionModal: React.FC<TaskActionModalProps> = ({
  task,
  isOpen,
  isDark = false,
  onClose,
  onToggleDone,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 backdrop-blur-[2px] transition-opacity">
      <div
        className={`w-full max-w-md rounded-t-3xl p-5 shadow-2xl animate-slide-up border-t transition-colors ${
          isDark ? 'bg-[#1C1D2A] border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between pb-3 border-b ${
          isDark ? 'border-gray-800' : 'border-gray-100'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-md border-2 border-[#6C47FF] bg-[#6C47FF] flex items-center justify-center text-white">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <h3 className={`font-bold text-base line-clamp-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {task.title}
            </h3>
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

        {/* Action List */}
        <div className={`py-2 divide-y ${isDark ? 'divide-gray-800' : 'divide-gray-50'}`}>
          <button
            onClick={() => {
              onToggleDone(task);
              onClose();
            }}
            className={`w-full py-3.5 px-2 flex items-center gap-3.5 text-left rounded-xl transition cursor-pointer ${
              isDark ? 'text-gray-200 hover:bg-gray-800' : 'text-gray-800 hover:bg-gray-50'
            }`}
          >
            <Check className={`w-5 h-5 stroke-[2.2] ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
            <span className="font-medium text-sm">
              {task.completed ? 'Mark as Incomplete' : 'Mark as Done'}
            </span>
          </button>

          <button
            onClick={() => {
              onEdit(task);
              onClose();
            }}
            className={`w-full py-3.5 px-2 flex items-center gap-3.5 text-left rounded-xl transition cursor-pointer ${
              isDark ? 'text-gray-200 hover:bg-gray-800' : 'text-gray-800 hover:bg-gray-50'
            }`}
          >
            <Edit3 className={`w-5 h-5 stroke-[2.2] ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
            <span className="font-medium text-sm">Edit Task</span>
          </button>

          <button
            onClick={() => {
              onDuplicate(task);
              onClose();
            }}
            className={`w-full py-3.5 px-2 flex items-center gap-3.5 text-left rounded-xl transition cursor-pointer ${
              isDark ? 'text-gray-200 hover:bg-gray-800' : 'text-gray-800 hover:bg-gray-50'
            }`}
          >
            <Copy className={`w-5 h-5 stroke-[2.2] ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
            <span className="font-medium text-sm">Duplicate Task</span>
          </button>

          <button
            onClick={() => {
              onDelete(task);
              onClose();
            }}
            className={`w-full py-3.5 px-2 flex items-center gap-3.5 text-left rounded-xl transition cursor-pointer ${
              isDark ? 'text-red-400 hover:bg-red-950/30' : 'text-red-600 hover:bg-red-50'
            }`}
          >
            <Trash2 className="w-5 h-5 stroke-[2.2]" />
            <span className="font-medium text-sm">Delete Task</span>
          </button>
        </div>

        {/* Cancel Button */}
        <div className="pt-3">
          <button
            onClick={onClose}
            className={`w-full py-3 rounded-2xl font-semibold text-sm transition cursor-pointer ${
              isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};