export interface Task {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description?: string;
  completed: boolean;
  hasReminder: boolean;
  reminderTime?: string; // e.g. "10:00 AM"
  showInNotification?: boolean; // Whether notification should show task details (default true)
  colorTag?: string; // color dot for calendar
  createdAt: number;
}

export interface DayNote {
  date: string; // YYYY-MM-DD
  content: string;
  updatedAt: number;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'purple';
  notificationsEnabled: boolean;
  appLockEnabled: boolean;
  lockType: 'pin' | 'biometric';
  pinCode?: string;
}

export type ViewScreen =
  | 'calendar'
  | 'day_detail'
  | 'add_task'
  | 'edit_task'
  | 'export_pdf'
  | 'settings'
  | 'app_lock_setup';

export interface CalendarDay {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  tasks: Task[];
  note?: DayNote;
}
