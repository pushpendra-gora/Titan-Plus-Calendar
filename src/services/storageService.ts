import type { Task, DayNote, AppSettings } from '../types';

const TASKS_STORAGE_KEY = 'titan_tasks_v2';
const NOTES_STORAGE_KEY = 'titan_notes_v2';
const SETTINGS_STORAGE_KEY = 'titan_settings_v2';

const defaultSettings: AppSettings = {
  theme: 'light',
  notificationsEnabled: true,
  appLockEnabled: false,
  lockType: 'pin',
  pinCode: '',
};

class StorageService {
  constructor() {
    // Clean up any old dummy storage keys if present
    try {
      localStorage.removeItem('titan_tasks');
      localStorage.removeItem('titan_notes');
      localStorage.removeItem('titan_settings');
    } catch {
      // ignore
    }
  }

  // Tasks (Starts 100% empty, zero dummy data)
  getTasks(): Task[] {
    try {
      const stored = localStorage.getItem(TASKS_STORAGE_KEY);
      if (!stored) {
        return [];
      }
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks', e);
    }
  }

  addTask(task: Task): void {
    const tasks = this.getTasks();
    tasks.unshift(task);
    this.saveTasks(tasks);
  }

  updateTask(updatedTask: Task): void {
    const tasks = this.getTasks().map((t) => (t.id === updatedTask.id ? updatedTask : t));
    this.saveTasks(tasks);
  }

  deleteTask(taskId: string): void {
    const tasks = this.getTasks().filter((t) => t.id !== taskId);
    this.saveTasks(tasks);
  }

  duplicateTask(taskId: string): Task | null {
    const tasks = this.getTasks();
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return null;

    const duplicated: Task = {
      ...target,
      id: 'task-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      title: `${target.title} (Copy)`,
      completed: false,
      createdAt: Date.now(),
    };

    tasks.unshift(duplicated);
    this.saveTasks(tasks);
    return duplicated;
  }

  toggleTaskCompleted(taskId: string): boolean {
    let newState = false;
    const tasks = this.getTasks().map((t) => {
      if (t.id === taskId) {
        newState = !t.completed;
        return { ...t, completed: newState };
      }
      return t;
    });
    this.saveTasks(tasks);
    return newState;
  }

  // Notes (Starts 100% empty, zero dummy data)
  getNotes(): DayNote[] {
    try {
      const stored = localStorage.getItem(NOTES_STORAGE_KEY);
      if (!stored) {
        return [];
      }
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  saveNotes(notes: DayNote[]): void {
    try {
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
    } catch (e) {
      console.error('Failed to save notes', e);
    }
  }

  getNoteForDate(dateStr: string): DayNote | undefined {
    return this.getNotes().find((n) => n.date === dateStr);
  }

  saveNoteForDate(dateStr: string, content: string): void {
    const notes = this.getNotes().filter((n) => n.date !== dateStr);
    if (content.trim()) {
      notes.push({
        date: dateStr,
        content: content.trim(),
        updatedAt: Date.now(),
      });
    }
    this.saveNotes(notes);
  }

  // Settings
  getSettings(): AppSettings {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!stored) {
        this.saveSettings(defaultSettings);
        return defaultSettings;
      }
      return { ...defaultSettings, ...JSON.parse(stored) };
    } catch {
      return defaultSettings;
    }
  }

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  }

  clearAllData(): void {
    localStorage.removeItem(TASKS_STORAGE_KEY);
    localStorage.removeItem(NOTES_STORAGE_KEY);
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
  }
}

export const storageService = new StorageService();
