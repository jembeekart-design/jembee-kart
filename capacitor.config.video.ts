import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jembeekart.video',
  appName: 'JembeeKart Video',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    url: 'https://jembee-kart.vercel.app/mlm/watch-earn'
  }
};

export default config;
