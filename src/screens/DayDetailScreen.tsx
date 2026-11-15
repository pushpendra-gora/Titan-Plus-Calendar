import React, { useState } from 'react';
import {
  FileText,
  Bell,
  Check,
  MoreVertical,
  Edit2,
  Plus,
  Lock,
} from 'lucide-react';
import type { Task, DayNote, ViewScreen } from '../types';
import { NoteEditModal } from '../components/NoteEditModal';

interface DayDetailScreenProps {
  selectedDate: Date;
  tasks: Task[];
  notes: DayNote[];
  isDark: boolean;
  onNavigate: (screen: ViewScreen) => void;
  onToggleTaskDone: (task: Task) => void;
  onOpenTaskActions: (task: Task) => void;
  onSaveNote: (dateStr: string, content: string) => void;
}

export const DayDetailScreen: React.FC<DayDetailScreenProps> = ({
  selectedDate,
  tasks,
  notes,
  isDark,
  onNavigate,
  onToggleTaskDone,
  onOpenTaskActions,
  onSaveNote,
}) => {
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'completed'>('all');

  // Check if date is in past or today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDateMidnight = new Date(selectedDate);
  selectedDateMidnight.setHours(0, 0, 0, 0);
  const isPast = selectedDateMidnight < today;

  const formattedDateStr = `${selectedDate.getFullYear()}-${String(
    selectedDate.getMonth() + 1
  ).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

  const dayTasks = tasks.filter((t) => t.date === formattedDateStr);
  const currentNote = notes.find((n) => n.date === formattedDateStr);

  const pendingTasks = dayTasks.filter((t) => !t.completed);
  const completedTasks = dayTasks.filter((t) => t.completed);

  const displayedTasks =
    filterTab === 'pending'
      ? pendingTasks
      : filterTab === 'completed'
      ? completedTasks
      : dayTasks;

  const displayDateText = selectedDate.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const now = new Date();
  const isToday =
    now.getFullYear() === selectedDate.getFullYear() &&
    now.getMonth() === selectedDate.getMonth() &&
    now.getDate() === selectedDate.getDate();

  return (
    <div className={`flex-1 flex flex-col transition-colors min-h-0 overflow-hidden ${isDark ? 'bg-[#12131C] text-white' : 'bg-white text-gray-900'}`}>
      {/* Top Header */}
      <div className={`px-4 sm:px-5 pt-3 sm:pt-4 pb-3 flex items-center justify-between border-b shrink-0 ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
        <h2 className={`text-sm sm:text-base font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {displayDateText}
        </h2>

        <div className="flex items-center gap-1.5">
          {isToday ? (
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              isDark ? 'bg-purple-950/70 text-purple-300' : 'bg-[#F3E8FF] text-[#6C47FF]'
            }`}>
              Today
            </span>
          ) : isPast ? (
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border flex items-center gap-1 ${
              isDark ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-500'
            }`}>
              <Lock className="w-3 h-3" /> Past Date
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-5 py-3 sm:py-4 overflow-y-auto min-h-0 space-y-4 sm:space-y-5">
        {/* Past Date Alert Notice */}
        {isPast && (
          <div className={`border rounded-2xl p-3 flex items-center gap-2.5 text-xs animate-fade-in ${
            isDark ? 'bg-gray-800/60 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'
          }`}>
            <Lock className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="font-medium">
              Past dates are read-only. Tasks can only be added for today & future dates.
            </span>
          </div>
        )}

        {/* Section: Tasks Header + Clean Filter Tabs */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className={`w-4 h-4 stroke-[2.2] ${isDark ? 'text-gray-300' : 'text-gray-800'}`} />
              <h3 className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Tasks ({dayTasks.length})
              </h3>
            </div>

            {/* Filter Pills */}
            {dayTasks.length > 0 && (
              <div className={`flex items-center gap-1 p-1 rounded-full shadow-xs border ${
                isDark ? 'bg-[#1C1D2A] border-gray-800' : 'bg-white border-gray-200'
              }`}>
                <button
                  type="button"
                  onClick={() => setFilterTab('all')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                    filterTab === 'all'
                      ? 'bg-[#6C47FF] text-white shadow-xs'
                      : isDark
                      ? 'text-gray-400 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  All ({dayTasks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('pending')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                    filterTab === 'pending'
                      ? 'bg-[#6C47FF] text-white shadow-xs'
                      : isDark
                      ? 'text-gray-400 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Pending ({pendingTasks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('completed')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                    filterTab === 'completed'
                      ? 'bg-[#6C47FF] text-white shadow-xs'
                      : isDark
                      ? 'text-gray-400 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Done ({completedTasks.length})
                </button>
              </div>
            )}
          </div>

          {/* Tasks List */}
          <div className="space-y-2.5">
            {displayedTasks.length === 0 ? (
              <div className={`border border-dashed rounded-2xl p-6 text-center shadow-xs ${
                isDark ? 'bg-[#1C1D2A] border-gray-800' : 'bg-white border-gray-200'
              }`}>
                <p className="text-xs text-gray-500 font-medium">
                  {filterTab === 'pending'
                    ? 'No pending tasks! All caught up.'
                    : filterTab === 'completed'
                    ? 'No completed tasks yet.'
                    : `No tasks recorded for ${displayDateText}.`}
                </p>
                {!isPast && filterTab === 'all' && (
                  <p className="text-[11px] text-gray-400 mt-1">
                    Tap '+ Add Task' below to schedule one with a reminder.
                  </p>
                )}
              </div>
            ) : (
              displayedTasks.map((task) => (
                <div
                  key={task.id}
                  className={`rounded-2xl p-3.5 border shadow-xs flex items-center justify-between transition ${
                    isDark
                      ? 'bg-[#1C1D2A] border-gray-800 hover:border-purple-800'
                      : 'bg-white border-gray-200 hover:border-purple-200'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                    <button
                      onClick={() => onToggleTaskDone(task)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition shrink-0 cursor-pointer ${
                        task.completed
                          ? 'bg-[#6C47FF] border-[#6C47FF] text-white'
                          : isDark
                          ? 'border-gray-600 hover:border-[#6C47FF]'
                          : 'border-gray-300 hover:border-[#6C47FF]'
                      }`}
                    >
                      {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="min-w-0">
                      <span
                        className={`text-sm font-bold block truncate ${
                          task.completed
                            ? 'line-through text-gray-500 font-normal'
                            : isDark
                            ? 'text-white'
                            : 'text-gray-900'
                        }`}
                      >
                        {task.title}
                      </span>

                      {task.description && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {task.hasReminder && task.reminderTime && (
                      <div className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                        isDark ? 'bg-purple-950/60 text-purple-300' : 'bg-[#F3E8FF] text-[#6C47FF]'
                      }`}>
                        <Bell className="w-3 h-3 stroke-[2.5]" />
                        <span>{task.reminderTime}</span>
                      </div>
                    )}

                    <button
                      onClick={() => onOpenTaskActions(task)}
                      className={`p-1 rounded-full transition cursor-pointer ${
                        isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section: Notes */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText className={`w-4 h-4 stroke-[2.2] ${isDark ? 'text-gray-300' : 'text-gray-800'}`} />
              <h3 className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>Notes</h3>
            </div>
            {!currentNote && !isPast && (
              <button
                onClick={() => setIsEditingNote(true)}
                className="text-xs text-[#6C47FF] font-bold hover:underline cursor-pointer"
              >
                + Add Note
              </button>
            )}
          </div>

          <div
            onClick={() => !isPast && setIsEditingNote(true)}
            className={`border rounded-2xl p-4 relative group cursor-pointer transition shadow-xs ${
              isDark
                ? 'bg-[#1C1D2A] border-gray-800 hover:border-purple-800'
                : 'bg-[#F8F5FF] border-[#EDE9FE] hover:border-[#6C47FF]/40'
            }`}
          >
            {!isPast && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingNote(true);
                }}
                className="absolute top-3.5 right-3.5 p-1 text-[#6C47FF] hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-lg transition"
                title="Edit Note"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}

            <p className={`text-sm font-medium leading-relaxed pr-8 whitespace-pre-wrap ${
              isDark ? 'text-gray-200' : 'text-gray-800'
            }`}>
              {currentNote?.content ||
                (isPast
                  ? 'No notes were recorded on this past date.'
                  : 'Tap here to write notes for today...')}
            </p>
          </div>
        </div>
      </div>

      {/* Floating Add Task Button */}
      <div className={`px-4 sm:px-5 py-3 border-t shrink-0 ${isDark ? 'bg-[#12131C] border-gray-800' : 'bg-white border-gray-100'}`}>
        {isPast ? (
          <div className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed ${
            isDark ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 text-gray-400'
          }`}>
            <Lock className="w-4 h-4" />
            Cannot Add Tasks to Past Dates
          </div>
        ) : (
          <button
            onClick={() => onNavigate('add_task')}
            className="w-full py-3.5 bg-[#6C47FF] hover:bg-[#5a38db] active:scale-[0.99] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-200 dark:shadow-none transition cursor-pointer"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            Add Task
          </button>
        )}
      </div>

      {/* Edit Note Modal */}
      <NoteEditModal
        isOpen={isEditingNote}
        dateStr={displayDateText}
        initialContent={currentNote?.content || ''}
        isDark={isDark}
        onClose={() => setIsEditingNote(false)}
        onSave={(content) => onSaveNote(formattedDateStr, content)}
      />
    </div>
  );
};
