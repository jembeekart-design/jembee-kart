import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jembeekart.video',
  appName: 'JembeeKart Video',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    url: 'https://jembee-kart-s3vokbc1v-jembee-kart-designs-projects.vercel.app/mlm/watch-earn'
  }
};

export default config;
