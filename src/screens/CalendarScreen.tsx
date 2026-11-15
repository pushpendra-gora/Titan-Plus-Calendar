import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Bell,
  Check,
  Plus,
  FileDown,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import type { Task, DayNote, ViewScreen } from '../types';

interface CalendarScreenProps {
  currentDate: Date;
  onSelectDate: (date: Date) => void;
  tasks: Task[];
  notes: DayNote[];
  isDark: boolean;
  onNavigate: (screen: ViewScreen) => void;
  onToggleTaskDone: (task: Task) => void;
  onOpenTaskDetail: () => void;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({
  currentDate,
  onSelectDate,
  tasks,
  isDark,
  onNavigate,
  onToggleTaskDone,
  onOpenTaskDetail,
}) => {
  const [viewYear, setViewYear] = useState(currentDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(currentDate.getMonth()); // 0-indexed
  const [showMenu, setShowMenu] = useState(false);

  // Today reference (midnight)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Selected date reference (midnight)
  const selectedDateMidnight = new Date(currentDate);
  selectedDateMidnight.setHours(0, 0, 0, 0);
  const isSelectedDatePast = selectedDateMidnight < today;

  // Month Names
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  // Days of week
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Navigate months
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Calendar matrix calculation
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sunday
  const totalDaysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  // Selected date comparison
  const selectedYear = currentDate.getFullYear();
  const selectedMonth = currentDate.getMonth();
  const selectedDay = currentDate.getDate();

  const formattedDateStr = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1
  ).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

  // Filter tasks for selected date
  const selectedDateTasks = tasks.filter((t) => t.date === formattedDateStr);

  const daysGrid = [];
  // Blank days before first day
  for (let i = 0; i < firstDayOfMonth; i++) {
    daysGrid.push(null);
  }
  // Days of month
  for (let d = 1; d <= totalDaysInMonth; d++) {
    daysGrid.push(d);
  }

  // Get dots for a specific day in view month
  const getDayDots = (dayNum: number) => {
    const dStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(
      dayNum
    ).padStart(2, '0')}`;
    const dayTasks = tasks.filter((t) => t.date === dStr);
    return dayTasks.slice(0, 3).map((t) => t.colorTag || '#6C47FF');
  };

  return (
    <div className={`flex-1 flex flex-col transition-colors min-h-0 overflow-hidden ${isDark ? 'bg-[#12131C] text-white' : 'bg-white text-gray-900'}`}>
      {/* Top Header */}
      <div className={`px-4 sm:px-5 pt-3 pb-2 flex items-center justify-between border-b shrink-0 ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
        <div className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="Titan Plus Calendar"
            className="w-9 h-9 rounded-xl object-cover shadow-sm ring-1 ring-purple-500/30"
          />
          <div className="flex flex-col">
            <h1 className={`text-base font-bold tracking-tight leading-none ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Titan Plus
            </h1>
            <span className="text-xs font-semibold text-[#6C47FF] tracking-wide">
              Calendar
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={`p-2 rounded-full transition cursor-pointer ${
                isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />
                <div className={`absolute right-0 top-10 w-48 rounded-2xl shadow-xl border py-2 z-50 animate-fade-in ${
                  isDark ? 'bg-[#1C1D2A] border-gray-800 text-white' : 'border-gray-100 bg-white text-gray-900'
                }`}>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onNavigate('export_pdf');
                    }}
                    className={`w-full px-4 py-2.5 text-left text-xs font-medium flex items-center gap-2.5 cursor-pointer ${
                      isDark ? 'hover:bg-gray-800 text-gray-200' : 'hover:bg-purple-50 text-gray-700 hover:text-[#6C47FF]'
                    }`}
                  >
                    <FileDown className="w-4 h-4 text-[#6C47FF]" />
                    Export Monthly PDF
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onNavigate('app_lock_setup');
                    }}
                    className={`w-full px-4 py-2.5 text-left text-xs font-medium flex items-center gap-2.5 cursor-pointer ${
                      isDark ? 'hover:bg-gray-800 text-gray-200' : 'hover:bg-purple-50 text-gray-700 hover:text-[#6C47FF]'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-[#6C47FF]" />
                    Set App Lock
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      const now = new Date();
                      setViewYear(now.getFullYear());
                      setViewMonth(now.getMonth());
                      onSelectDate(now);
                    }}
                    className={`w-full px-4 py-2.5 text-left text-xs font-medium flex items-center gap-2.5 cursor-pointer ${
                      isDark ? 'hover:bg-gray-800 text-gray-200' : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    Go to Today
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Month Navigator */}
      <div className="px-4 sm:px-6 py-2 flex items-center justify-between shrink-0">
        <button
          onClick={handlePrevMonth}
          className={`p-1 rounded-full transition cursor-pointer active:scale-95 ${
            isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </button>

        <h2 className={`text-lg sm:text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {monthNames[viewMonth]} {viewYear}
        </h2>

        <button
          onClick={handleNextMonth}
          className={`p-1 rounded-full transition cursor-pointer active:scale-95 ${
            isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ChevronRight className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 text-center px-2 sm:px-4 py-1 text-xs font-semibold shrink-0">
        {daysOfWeek.map((day, idx) => (
          <div
            key={day}
            className={`py-0.5 ${
              idx === 0 ? 'text-[#6C47FF]' : idx === 6 ? 'text-[#6C47FF]' : isDark ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-y-1 sm:gap-y-1.5 px-2 sm:px-4 pb-2 sm:pb-3 text-center shrink-0">
        {daysGrid.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="h-8 sm:h-9" />;
          }

          const dayDate = new Date(viewYear, viewMonth, day);
          dayDate.setHours(0, 0, 0, 0);
          const isPast = dayDate < today;

          const isSelected =
            selectedYear === viewYear &&
            selectedMonth === viewMonth &&
            selectedDay === day;

          const isCurrentToday =
            today.getFullYear() === viewYear &&
            today.getMonth() === viewMonth &&
            today.getDate() === day;

          const dots = getDayDots(day);

          return (
            <div
              key={`day-${day}`}
              onClick={() => {
                const newDate = new Date(viewYear, viewMonth, day);
                onSelectDate(newDate);
              }}
              className="flex flex-col items-center justify-center cursor-pointer group active:scale-95 transition-transform"
            >
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm transition-all duration-150 relative ${
                  isSelected
                    ? isCurrentToday
                      ? 'bg-[#6C47FF] text-white font-extrabold shadow-md shadow-purple-500/30 scale-105 ring-2 ring-[#6C47FF] ring-offset-2 ring-offset-white dark:ring-offset-[#12131C]'
                      : 'bg-[#6C47FF] text-white font-semibold shadow-md shadow-purple-500/30 scale-105'
                    : isCurrentToday
                    ? isDark
                      ? 'ring-2 ring-[#6C47FF] font-extrabold text-white bg-[#6C47FF]/25 shadow-xs'
                      : 'ring-2 ring-[#6C47FF] font-extrabold text-[#6C47FF] bg-purple-50 shadow-xs'
                    : isPast
                    ? isDark
                      ? 'text-gray-600 hover:bg-gray-800'
                      : 'text-gray-400 hover:bg-gray-100'
                    : isDark
                    ? 'text-gray-200 hover:bg-gray-800 group-hover:text-[#6C47FF]'
                    : 'text-gray-800 hover:bg-purple-50 group-hover:text-[#6C47FF]'
                }`}
              >
                {day}
              </div>

              {/* Event Indicator Dots */}
              <div className="flex gap-1 mt-0.5 h-1.5 items-center justify-center">
                {dots.map((dotColor, dotIdx) => (
                  <span
                    key={dotIdx}
                    className="w-1.5 h-1.5 rounded-full inline-block"
                    style={{ backgroundColor: isSelected ? '#6C47FF' : dotColor }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Day Header & Quick Task List Preview */}
      <div className={`flex-1 px-4 sm:px-5 pt-3 pb-4 rounded-t-3xl border-t transition-colors overflow-y-auto min-h-0 ${
        isDark ? 'bg-[#181924] border-gray-800' : 'bg-[#FAF9FD] border-gray-100'
      }`}>
        <div
          onClick={onOpenTaskDetail}
          className="flex items-center justify-between pb-3 cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#6C47FF]" />
            <h3 className={`font-extrabold text-sm group-hover:text-[#6C47FF] transition ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {currentDate.toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </h3>
            {isSelectedDatePast && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                isDark ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-500'
              }`}>
                <Lock className="w-3 h-3" /> Past
              </span>
            )}
          </div>
          <span className="text-xs font-semibold text-[#6C47FF] flex items-center gap-0.5">
            View details
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Task List Items */}
        <div className="space-y-2.5">
          {selectedDateTasks.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-xs text-gray-400 font-medium">No tasks for this day.</p>
              {isSelectedDatePast ? (
                <p className="text-[11px] text-gray-500 mt-1 font-medium">
                  Past dates are read-only.
                </p>
              ) : (
                <button
                  onClick={() => onNavigate('add_task')}
                  className={`mt-2.5 px-4 py-1.5 border text-[#6C47FF] text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 shadow-xs transition cursor-pointer ${
                    isDark ? 'bg-[#1C1D2A] border-gray-700 hover:bg-gray-800' : 'bg-white border-purple-200 hover:bg-purple-50'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" /> Add Task
                </button>
              )}
            </div>
          ) : (
            selectedDateTasks.map((task) => (
              <div
                key={task.id}
                className={`rounded-2xl p-3.5 border shadow-xs flex items-center justify-between transition ${
                  isDark
                    ? 'bg-[#1C1D2A] border-gray-800 hover:border-purple-800'
                    : 'bg-white border-gray-100 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleTaskDone(task);
                    }}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition cursor-pointer ${
                      task.completed
                        ? 'bg-[#6C47FF] border-[#6C47FF] text-white'
                        : isDark
                        ? 'border-gray-600 hover:border-[#6C47FF]'
                        : 'border-gray-300 hover:border-[#6C47FF]'
                    }`}
                  >
                    {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <span
                    onClick={onOpenTaskDetail}
                    className={`text-sm font-bold cursor-pointer ${
                      task.completed
                        ? 'line-through text-gray-500 font-normal'
                        : isDark
                        ? 'text-white'
                        : 'text-gray-900'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>

                {task.hasReminder && task.reminderTime && (
                  <div className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                    isDark ? 'bg-purple-950/60 text-purple-300' : 'bg-[#F3E8FF] text-[#6C47FF]'
                  }`}>
                    <Bell className="w-3 h-3 stroke-[2.5]" />
                    <span>{task.reminderTime}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
