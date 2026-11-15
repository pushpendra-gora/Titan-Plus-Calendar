import React from 'react';
import { Bell, Check, X } from 'lucide-react';
import type { Task } from '../types';

interface ReminderToastProps {
  task: Task | null;
  onDismiss: () => void;
  onMarkDone: (task: Task) => void;
}

export const ReminderToast: React.FC<ReminderToastProps> = ({
  task,
  onDismiss,
  onMarkDone,
}) => {
  if (!task) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-sm mx-auto animate-fade-in">
      <div className="bg-white rounded-2xl p-4 shadow-2xl border-2 border-[#6C47FF] flex flex-col gap-2.5 pulse-glow">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6C47FF] text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-200">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C47FF] bg-purple-50 px-2 py-0.5 rounded-full">
                  Reminder Alert
                </span>
                <span className="text-xs text-gray-500 font-medium">{task.reminderTime}</span>
              </div>
              <h4 className="font-bold text-gray-900 text-sm mt-0.5">{task.title}</h4>
              {task.description && (
                <p className="text-xs text-gray-500 line-clamp-1">{task.description}</p>
              )}
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2 pt-1 border-t border-gray-100">
          <button
            onClick={() => {
              onMarkDone(task);
              onDismiss();
            }}
            className="flex-1 py-1.5 bg-[#6C47FF] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Check className="w-3.5 h-3.5" />
            Mark as Done
          </button>
          <button
            onClick={onDismiss}
            className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
