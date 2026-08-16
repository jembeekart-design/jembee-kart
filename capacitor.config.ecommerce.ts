import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jembeekart.app',
  appName: 'JembeeKart',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    url: 'https://jembee-kart.vercel.app/'
  }
};

export default config;
