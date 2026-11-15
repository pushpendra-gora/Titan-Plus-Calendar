import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { soundService } from './soundService';
import type { Task } from '../types';

export interface DueReminderListener {
  (task: Task): void;
}

class NotificationService {
  private isCapacitor = false;
  private notifiedTaskIds = new Set<string>();
  private listeners: DueReminderListener[] = [];
  private checkInterval: number | null = null;
  private channelCreated = false;

  constructor() {
    this.checkPlatform();
    this.startWatcher();
  }

  private async checkPlatform() {
    try {
      this.isCapacitor = Capacitor.isNativePlatform();
      if (this.isCapacitor) {
        await this.initAlarmChannel();
        await this.requestPermission();
        this.setupNotificationListeners();
      }
    } catch {
      this.isCapacitor = false;
    }
  }

  // Setup click listener when user taps the notification
  private setupNotificationListeners() {
    try {
      LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction) => {
        const taskId = notificationAction.notification?.extra?.taskId;
        if (taskId) {
          console.log('[NotificationService] Notification tapped for task:', taskId);
        }
      });
    } catch (e) {
      console.warn('Could not attach notification action listener:', e);
    }
  }

  // Create High-Priority Alarm Channel for exact alarms (works when app is killed/in background)
  async initAlarmChannel() {
    if (this.channelCreated) return;
    try {
      await LocalNotifications.createChannel({
        id: 'titan_calendar_alarms',
        name: 'Task Alarm Reminders',
        description: 'Critical exact-time alarms for your calendar tasks',
        importance: 5, // MAX IMPORTANCE: Heads-up pop-up banner, rings loud, shows on lock screen
        visibility: 1, // VISIBILITY_PUBLIC: Show content on lock screen
        vibration: true,
        lights: true,
        lightColor: '#6C47FF',
        sound: 'alarm.wav',
      });
      this.channelCreated = true;
    } catch (e) {
      console.warn('Could not create notification channel:', e);
    }
  }

  // Request Android 13+ POST_NOTIFICATIONS permission
  async requestPermission(): Promise<boolean> {
    try {
      if (this.isCapacitor) {
        await this.initAlarmChannel();
        const perm = await LocalNotifications.requestPermissions();
        return perm.display === 'granted';
      } else if (typeof window !== 'undefined' && 'Notification' in window) {
        const result = await Notification.requestPermission();
        return result === 'granted';
      }
    } catch (e) {
      console.warn('Notification permission error:', e);
    }
    return false;
  }

  // Schedule exact time notification alarm via Android AlarmManager
  // Fires on time even when the app is killed / closed / device is locked
  async scheduleTaskReminder(task: Task) {
    if (!task.hasReminder || !task.reminderTime || task.showInNotification === false) {
      await this.cancelTaskReminder(task);
      return;
    }

    const [hourStr, minuteAndPeriod] = task.reminderTime.split(':');
    if (!hourStr || !minuteAndPeriod) return;

    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteAndPeriod.substring(0, 2), 10);
    const isPM = minuteAndPeriod.toUpperCase().includes('PM');
    const isAM = minuteAndPeriod.toUpperCase().includes('AM');

    if (isPM && hour < 12) hour += 12;
    if (isAM && hour === 12) hour = 0;

    const [year, month, day] = task.date.split('-').map(Number);
    const scheduledDate = new Date(year, month - 1, day, hour, minute, 0, 0);

    // Only schedule if in future
    if (scheduledDate.getTime() <= Date.now()) {
      return;
    }

    if (this.isCapacitor) {
      try {
        await this.initAlarmChannel();
        const id = (Math.abs(this.hashCode(task.id)) % 2147483640) + 1;

        // Cancel previous notification with this id
        try {
          await LocalNotifications.cancel({ notifications: [{ id }] });
        } catch {
          // ignore
        }

        // Schedule exact alarm with allowWhileIdle: true
        await LocalNotifications.schedule({
          notifications: [
            {
              id,
              title: `⏰ ${task.title}`,
              body: task.description ? `${task.description}` : `Reminder for ${task.reminderTime}`,
              channelId: 'titan_calendar_alarms',
              schedule: {
                at: scheduledDate,
                allowWhileIdle: true,
              },
              sound: 'alarm.wav',
              smallIcon: 'ic_stat_name',
              autoCancel: true,
              extra: { taskId: task.id },
            },
          ],
        });

        console.log(`[NotificationService] Scheduled exact alarm #${id} at ${scheduledDate.toISOString()} for task: ${task.title}`);
      } catch (err) {
        console.warn('LocalNotifications schedule error:', err);
      }
    }
  }

  async cancelTaskReminder(task: Task) {
    if (this.isCapacitor) {
      try {
        const id = (Math.abs(this.hashCode(task.id)) % 2147483640) + 1;
        await LocalNotifications.cancel({ notifications: [{ id }] });
      } catch (err) {
        console.warn('LocalNotifications cancel error:', err);
      }
    }
    this.notifiedTaskIds.delete(`${task.id}_${task.date}`);
  }

  subscribe(listener: DueReminderListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  // Periodic check that runs in-app every 10 seconds while app is foregrounded
  startWatcher() {
    if (this.checkInterval) return;

    this.checkInterval = window.setInterval(() => {
      this.checkDueReminders();
    }, 10000);
  }

  private checkDueReminders() {
    try {
      const stored = localStorage.getItem('titan_tasks_v2');
      if (!stored) return;
      const tasks: Task[] = JSON.parse(stored);

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
      const currentDay = String(now.getDate()).padStart(2, '0');
      const todayStr = `${currentYear}-${currentMonth}-${currentDay}`;

      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();

      tasks.forEach((task) => {
        if (!task.hasReminder || !task.reminderTime || task.completed) return;
        if (task.showInNotification === false) return;
        if (task.date !== todayStr) return;

        const [hourStr, minuteAndPeriod] = task.reminderTime.split(':');
        let taskHour = parseInt(hourStr, 10);
        const taskMinute = parseInt(minuteAndPeriod.substring(0, 2), 10);
        const isPM = minuteAndPeriod.toUpperCase().includes('PM');
        const isAM = minuteAndPeriod.toUpperCase().includes('AM');

        if (isPM && taskHour < 12) taskHour += 12;
        if (isAM && taskHour === 12) taskHour = 0;

        if (taskHour === currentHours && taskMinute === currentMinutes) {
          const key = `${task.id}_${task.date}_${currentHours}:${currentMinutes}`;
          if (!this.notifiedTaskIds.has(key)) {
            this.notifiedTaskIds.add(key);
            this.triggerNotification(task);
          }
        }
      });
    } catch (e) {
      console.warn('Error checking due reminders:', e);
    }
  }

  triggerNotification(task: Task) {
    if (task.showInNotification === false) return;

    // 1. Play offline audio chime
    soundService.playReminderChime();

    // 2. Vibrate device like an alarm
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([300, 150, 300, 150, 500]);
    }

    // 3. Web Notification API with task title and details
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`⏰ ${task.title}`, {
          body: task.description || `Task scheduled for ${task.reminderTime}`,
          icon: '/logo.png',
          badge: '/logo.png',
          tag: task.id,
          requireInteraction: true,
        });
      } catch (err) {
        console.warn('Web notification error:', err);
      }
    }

    // 4. Notify in-app listeners for floating toast
    this.listeners.forEach((listener) => {
      try {
        listener(task);
      } catch (err) {
        console.error(err);
      }
    });
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
}

export const notificationService = new NotificationService();
