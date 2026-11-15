import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar } from './components/StatusBar';
import { BottomNav } from './components/BottomNav';
import { TaskActionModal } from './components/TaskActionModal';
import { ReminderToast } from './components/ReminderToast';
import { LockScreen } from './components/LockScreen';

import { CalendarScreen } from './screens/CalendarScreen';
import { DayDetailScreen } from './screens/DayDetailScreen';
import { AddTaskScreen } from './screens/AddTaskScreen';
import { EditTaskScreen } from './screens/EditTaskScreen';
import { ExportPdfScreen } from './screens/ExportPdfScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { AppLockScreen } from './screens/AppLockScreen';

import { storageService } from './services/storageService';
import { notificationService } from './services/notificationService';
import type { Task, DayNote, AppSettings, ViewScreen } from './types';

export const App: React.FC = () => {
  // State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<DayNote[]>([]);
  const [settings, setSettings] = useState<AppSettings>(storageService.getSettings());

  // Date selection (defaults to current date, zero dummy data)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Navigation
  const [currentScreen, setCurrentScreen] = useState<ViewScreen>('calendar');

  // Modals & Action Sheet state
  const [activeTaskForAction, setActiveTaskForAction] = useState<Task | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [activeReminderAlert, setActiveReminderAlert] = useState<Task | null>(null);

  // App Lock state
  const [isAppLocked, setIsAppLocked] = useState<boolean>(false);

  const currentTheme = settings.theme || 'light';
  const isDark = currentTheme === 'dark';
  const isPurple = currentTheme === 'purple';

  // Apply theme background
  const appContainerBg = isDark
    ? 'bg-[#12131C]'
    : isPurple
    ? 'bg-[#FAF8FF]'
    : 'bg-white';

  // Navigate forward with history push
  const navigateTo = useCallback((screen: ViewScreen) => {
    window.history.pushState({ screen }, '');
    setCurrentScreen(screen);
  }, []);

  // Handle Back Navigation (Mobile Hardware Back Button & Browser Back Button)
  const handleMobileBack = useCallback(() => {
    // 1. If Action Sheet Modal is open, close it
    if (activeTaskForAction) {
      setActiveTaskForAction(null);
      return;
    }

    // 2. Screen hierarchy navigation
    setCurrentScreen((prevScreen) => {
      switch (prevScreen) {
        case 'add_task':
        case 'edit_task':
          return 'day_detail';

        case 'day_detail':
        case 'export_pdf':
          return 'calendar';

        case 'app_lock_setup':
          return 'settings';

        case 'settings':
          return 'calendar';

        case 'calendar':
        default:
          // In root calendar, if on native Android, exit or minimize
          try {
            CapacitorApp.minimizeApp();
          } catch {
            // ignore
          }
          return 'calendar';
      }
    });
  }, [activeTaskForAction]);

  // Mobile Back Button Listeners (Capacitor Native Hardware + Browser Popstate)
  useEffect(() => {
    // Browser popstate / swipe back
    const handlePopState = () => {
      handleMobileBack();
    };
    window.addEventListener('popstate', handlePopState);

    // Capacitor Native Android Hardware Back Button
    let removeCapacitorListener: (() => void) | null = null;
    try {
      CapacitorApp.addListener('backButton', () => {
        handleMobileBack();
      }).then((handle) => {
        removeCapacitorListener = () => handle.remove();
      });
    } catch {
      // not on capacitor
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (removeCapacitorListener) {
        removeCapacitorListener();
      }
    };
  }, [handleMobileBack]);

  // Load initial data
  useEffect(() => {
    const loadedTasks = storageService.getTasks();
    const loadedNotes = storageService.getNotes();
    const loadedSettings = storageService.getSettings();

    setTasks(loadedTasks);
    setNotes(loadedNotes);
    setSettings(loadedSettings);

    if (loadedSettings.appLockEnabled) {
      setIsAppLocked(true);
    }

    // Subscribe to exact time reminder triggers
    const unsubscribe = notificationService.subscribe((dueTask) => {
      setActiveReminderAlert(dueTask);
    });

    // Request notification permission and schedule exact alarms with Android AlarmManager
    notificationService.requestPermission().then(() => {
      loadedTasks.forEach((t) => {
        if (t.hasReminder && !t.completed && t.showInNotification !== false) {
          notificationService.scheduleTaskReminder(t);
        }
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Apply dark class to document root for seamless dark mode styling
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Handlers
  const handleToggleTaskDone = (task: Task) => {
    const isNowDone = storageService.toggleTaskCompleted(task.id);
    setTasks(storageService.getTasks());

    if (isNowDone) {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#6C47FF', '#10B981', '#F59E0B', '#EC4899'],
      });
      notificationService.cancelTaskReminder(task);
    } else {
      if (task.hasReminder && task.showInNotification !== false) {
        notificationService.scheduleTaskReminder(task);
      }
    }
  };

  const handleAddTask = (newTask: Task) => {
    storageService.addTask(newTask);
    setTasks(storageService.getTasks());
    if (newTask.hasReminder && newTask.showInNotification !== false) {
      notificationService.scheduleTaskReminder(newTask);
    }
    setCurrentScreen('day_detail');
  };

  const handleUpdateTask = (updatedTask: Task) => {
    storageService.updateTask(updatedTask);
    setTasks(storageService.getTasks());
    if (updatedTask.hasReminder && !updatedTask.completed && updatedTask.showInNotification !== false) {
      notificationService.scheduleTaskReminder(updatedTask);
    } else {
      notificationService.cancelTaskReminder(updatedTask);
    }
    setTaskToEdit(null);
    setCurrentScreen('day_detail');
  };

  const handleDeleteTask = (taskId: string) => {
    const target = tasks.find((t) => t.id === taskId);
    if (target) {
      notificationService.cancelTaskReminder(target);
    }
    storageService.deleteTask(taskId);
    setTasks(storageService.getTasks());
    setTaskToEdit(null);
    setActiveTaskForAction(null);
  };

  const handleDuplicateTask = (task: Task) => {
    const dup = storageService.duplicateTask(task.id);
    if (dup) {
      setTasks(storageService.getTasks());
      if (dup.hasReminder && dup.showInNotification !== false) {
        notificationService.scheduleTaskReminder(dup);
      }
    }
  };

  const handleSaveNote = (dateStr: string, content: string) => {
    storageService.saveNoteForDate(dateStr, content);
    setNotes(storageService.getNotes());
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    storageService.saveSettings(newSettings);
    setSettings(newSettings);
  };

  // Counts for Pending vs Completed tasks
  const pendingCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  // Render active screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'calendar':
        return (
          <CalendarScreen
            currentDate={selectedDate}
            onSelectDate={(date) => setSelectedDate(date)}
            tasks={tasks}
            notes={notes}
            isDark={isDark}
            onNavigate={navigateTo}
            onToggleTaskDone={handleToggleTaskDone}
            onOpenTaskDetail={() => navigateTo('day_detail')}
          />
        );

      case 'day_detail':
        return (
          <DayDetailScreen
            selectedDate={selectedDate}
            tasks={tasks}
            notes={notes}
            isDark={isDark}
            onNavigate={navigateTo}
            onToggleTaskDone={handleToggleTaskDone}
            onOpenTaskActions={(task) => setActiveTaskForAction(task)}
            onSaveNote={handleSaveNote}
          />
        );

      case 'add_task':
        return (
          <AddTaskScreen
            selectedDate={selectedDate}
            isDark={isDark}
            onSave={handleAddTask}
          />
        );

      case 'edit_task':
        if (!taskToEdit) {
          setCurrentScreen('day_detail');
          return null;
        }
        return (
          <EditTaskScreen
            task={taskToEdit}
            isDark={isDark}
            onUpdate={handleUpdateTask}
            onDelete={(id) => {
              handleDeleteTask(id);
              setCurrentScreen('day_detail');
            }}
          />
        );

      case 'export_pdf':
        return (
          <ExportPdfScreen
            tasks={tasks}
            notes={notes}
            isDark={isDark}
          />
        );

      case 'settings':
        return (
          <SettingsScreen
            settings={settings}
            isDark={isDark}
            onUpdateSettings={handleSaveSettings}
            onNavigate={navigateTo}
            taskCount={tasks.length}
            pendingCount={pendingCount}
            completedCount={completedCount}
            notesCount={notes.length}
          />
        );

      case 'app_lock_setup':
        return (
          <AppLockScreen
            settings={settings}
            isDark={isDark}
            onSaveSettings={handleSaveSettings}
          />
        );

      default:
        return null;
    }
  };

  const showBottomNav =
    currentScreen === 'calendar' ||
    currentScreen === 'day_detail' ||
    currentScreen === 'settings';

  return (
    <div className={`w-full min-h-[100dvh] h-[100dvh] flex items-center justify-center font-sans transition-colors overflow-hidden ${
      isDark ? 'bg-black' : 'bg-slate-100'
    }`}>
      {/* Responsive Smartphone Container: Edge-to-edge on any mobile screen, centered device frame on desktop */}
      <div className={`w-full max-w-full sm:max-w-[420px] h-[100dvh] sm:h-[860px] sm:max-h-[95vh] sm:rounded-[44px] shadow-2xl flex flex-col relative overflow-hidden sm:border-[8px] transition-colors ${appContainerBg} ${
        isDark ? 'sm:border-gray-800' : isPurple ? 'sm:border-purple-950' : 'sm:border-gray-900'
      }`}>
        {/* Status Bar */}
        <StatusBar isDark={isDark} />

        {/* Real-time Reminder Alert Toast */}
        <ReminderToast
          task={activeReminderAlert}
          onDismiss={() => setActiveReminderAlert(null)}
          onMarkDone={(t) => {
            handleToggleTaskDone(t);
            setActiveReminderAlert(null);
          }}
        />

        {/* Main Screen Body */}
        <div className="flex-1 flex flex-col overflow-hidden relative min-h-0">
          {renderScreen()}
        </div>

        {/* Bottom Navigation */}
        {showBottomNav && (
          <BottomNav
            currentScreen={currentScreen}
            isDark={isDark}
            onNavigate={navigateTo}
          />
        )}

        {/* Task Context Actions Bottom Sheet */}
        <TaskActionModal
          task={activeTaskForAction}
          isOpen={!!activeTaskForAction}
          isDark={isDark}
          onClose={() => setActiveTaskForAction(null)}
          onToggleDone={(t) => handleToggleTaskDone(t)}
          onEdit={(t) => {
            setTaskToEdit(t);
            navigateTo('edit_task');
          }}
          onDuplicate={(t) => handleDuplicateTask(t)}
          onDelete={(t) => handleDeleteTask(t.id)}
        />

        {/* App Lock Overlay */}
        {isAppLocked && (
          <LockScreen
            correctPin={settings.pinCode || ''}
            isDark={isDark}
            onUnlock={() => setIsAppLocked(false)}
          />
        )}
      </div>
    </div>
  );
};

export default App;
