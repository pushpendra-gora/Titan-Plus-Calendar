import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.titanplus.calendar',
  appName: 'Titan Plus Calendar',
  webDir: 'dist',
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_name',
      iconColor: '#6C47FF',
      sound: 'alarm.wav',
    },
  },
};

export default config;
