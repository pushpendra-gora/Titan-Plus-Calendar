import React, { useState } from 'react';
import {
  Calendar,
  Bell,
  Clock,
  ChevronDown,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { Task } from '../types';

interface EditTaskScreenProps {
  task: Task;
  isDark: boolean;
  onUpdate: (updatedTask: Task) => void;
  onDelete: (taskId: string) => void;
}

export const EditTaskScreen: React.FC<EditTaskScreenProps> = ({
  task,
  isDark,
  onUpdate,
  onDelete,
}) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [hasReminder, setHasReminder] = useState(task.hasReminder);
  const [showInNotification, setShowInNotification] = useState(
    task.showInNotification !== false
  );
  const [reminderTime, setReminderTime] = useState(task.reminderTime || '10:00 AM');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [error, setError] = useState('');

  const [year, month, day] = task.date.split('-').map(Number);
  const taskDate = new Date(year, month - 1, day);
  const displayDateText = taskDate.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const quickTimes = [
    '08:00 AM',
    '09:00 AM',
    '10:00 AM',
    '11:30 AM',
    '02:00 PM',
    '04:00 PM',
    '06:00 PM',
    '08:00 PM',
    '10:00 PM',
  ];

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    const updated: Task = {
      ...task,
      title: title.trim(),
      description: description.trim() || undefined,
      hasReminder,
      reminderTime: hasReminder ? reminderTime : undefined,
      showInNotification: hasReminder ? showInNotification : false,
    };

    onUpdate(updated);
  };

  return (
    <div className={`flex-1 flex flex-col transition-colors min-h-0 overflow-hidden ${isDark ? 'bg-[#12131C] text-white' : 'bg-white text-gray-900'}`}>
      {/* Top Header */}
      <div className={`px-4 sm:px-5 pt-3 sm:pt-4 pb-3 flex items-center justify-between border-b shrink-0 ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
        <h2 className={`text-base font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Edit Task
        </h2>
      </div>

      <form onSubmit={handleUpdate} className="flex-1 flex flex-col p-4 sm:p-5 overflow-y-auto min-h-0 space-y-4">
        {/* Date Banner */}
        <div className={`border rounded-2xl p-3 flex items-center gap-2.5 ${
          isDark ? 'bg-[#1C1D2A] border-gray-800' : 'border-[#EDE9FE] bg-[#F8F5FF]'
        }`}>
          <Calendar className="w-4 h-4 text-[#6C47FF]" />
          <span className={`text-xs font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
            For: {displayDateText}
          </span>
        </div>

        {/* Title Field */}
        <div>
          <label className={`block text-xs font-bold mb-1.5 flex items-center gap-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <span>Title</span>
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError('');
            }}
            placeholder="Task title (e.g. DSA Practice)"
            className={`w-full p-3.5 border text-sm rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/20 focus:border-[#6C47FF] transition ${
              isDark
                ? 'bg-[#1C1D2A] border-gray-800 text-white placeholder-gray-500'
                : 'border-gray-200 bg-white text-gray-900 placeholder-gray-400'
            } ${error ? 'border-red-500' : ''}`}
          />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        {/* Description Field */}
        <div>
          <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Details (optional)"
            rows={2}
            className={`w-full p-3.5 border text-sm rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/20 focus:border-[#6C47FF] transition resize-none ${
              isDark
                ? 'bg-[#1C1D2A] border-gray-800 text-white placeholder-gray-500'
                : 'border-gray-200 bg-white text-gray-900 placeholder-gray-400'
            }`}
          />
        </div>

        {/* Reminder & Notification Section */}
        <div className={`border rounded-2xl p-4 space-y-3.5 ${
          isDark ? 'bg-[#1C1D2A] border-gray-800' : 'border-gray-100 bg-[#FAF9FD]'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#F3E8FF] text-[#6C47FF] flex items-center justify-center">
                <Bell className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <span className={`text-xs font-bold block ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Alarm & Notification Reminder
                </span>
                <span className="text-[10px] text-gray-400">
                  Alerts on time even if app is closed
                </span>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              onClick={() => setHasReminder(!hasReminder)}
              className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${
                hasReminder ? 'bg-[#6C47FF]' : isDark ? 'bg-gray-700' : 'bg-gray-200'
              }`}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${
                  hasReminder ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {hasReminder && (
            <div className={`space-y-3 pt-1 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'} animate-fade-in`}>
              {/* Exact Time Selector */}
              <div>
                <label className={`text-[11px] font-bold block mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Alarm Time:
                </label>
                <div
                  onClick={() => setShowTimePicker(!showTimePicker)}
                  className={`w-full p-3 border rounded-xl flex items-center justify-between text-xs cursor-pointer hover:border-[#6C47FF] transition ${
                    isDark ? 'bg-[#12131C] border-gray-700 text-white' : 'border-gray-200 bg-white text-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-[#6C47FF]" />
                    <span>{reminderTime}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>

                {showTimePicker && (
                  <div className={`mt-2 p-3 border rounded-xl shadow-md animate-fade-in ${
                    isDark ? 'bg-[#161722] border-gray-700' : 'border-purple-100 bg-white'
                  }`}>
                    <div className="grid grid-cols-3 gap-1.5 mb-2.5">
                      {quickTimes.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => {
                            setReminderTime(time);
                            setShowTimePicker(false);
                          }}
                          className={`py-1.5 px-1 text-[11px] font-bold rounded-lg border transition cursor-pointer ${
                            reminderTime === time
                              ? 'bg-[#6C47FF] text-white border-[#6C47FF]'
                              : isDark
                              ? 'bg-gray-800 text-gray-300 border-gray-700 hover:border-[#6C47FF]'
                              : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-[#6C47FF]'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                    <div className={`pt-2 border-t flex items-center gap-2 ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                      <span className="text-[11px] text-gray-400 font-medium">Exact Time:</span>
                      <input
                        type="time"
                        onChange={(e) => {
                          if (!e.target.value) return;
                          const [hStr, mStr] = e.target.value.split(':');
                          let h = parseInt(hStr, 10);
                          const period = h >= 12 ? 'PM' : 'AM';
                          if (h > 12) h -= 12;
                          if (h === 0) h = 12;
                          const formatted = `${String(h).padStart(2, '0')}:${mStr} ${period}`;
                          setReminderTime(formatted);
                          setShowTimePicker(false);
                        }}
                        className={`text-xs border rounded-md p-1 ${
                          isDark ? 'bg-gray-800 border-gray-700 text-white' : 'border-gray-200 bg-gray-50 text-gray-700'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Show Task in Notification Toggle */}
              <div className={`pt-2 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {showInNotification ? (
                      <Eye className="w-4 h-4 text-[#6C47FF]" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                    <div>
                      <span className={`text-xs font-bold block ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Show Task in Notification
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {showInNotification
                          ? 'Task title will be shown in notification'
                          : 'Task details hidden in notification'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowInNotification(!showInNotification)}
                    className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${
                      showInNotification ? 'bg-[#6C47FF]' : isDark ? 'bg-gray-700' : 'bg-gray-200'
                    }`}
                  >
                    <div
                      className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${
                        showInNotification ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Preview */}
                {showInNotification && (
                  <div className={`mt-2.5 p-2.5 border rounded-xl text-xs ${
                    isDark ? 'bg-purple-950/40 border-purple-900/60' : 'border-purple-100 bg-purple-50/70'
                  }`}>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#6C47FF] block mb-0.5">
                      Notification Preview:
                    </span>
                    <p className={`font-bold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      ⏰ {title.trim() || 'Task Title'}
                    </p>
                    <p className={`text-[11px] truncate ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                      {description.trim() || `Scheduled at ${reminderTime}`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1" />

        {/* Delete & Update Action Buttons */}
        <div className="pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center gap-3">
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            className="flex-1 py-3.5 sm:py-4 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4 stroke-[2.2]" />
            Delete
          </button>

          <button
            type="submit"
            className="flex-2 py-3.5 sm:py-4 bg-[#6C47FF] hover:bg-[#5a38db] active:scale-[0.99] text-white rounded-2xl font-bold text-sm shadow-lg shadow-purple-200 dark:shadow-none transition cursor-pointer"
          >
            Update
          </button>
        </div>
      </form>
    </div>
  );
};
