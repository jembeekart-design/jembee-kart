"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/config";
import { APKUpdateService } from "@/firestore/services/APKUpdateService";
import { APKUpdateConfig } from "@/types/apkModels";
import { Loader2 } from "lucide-react";
import { App } from '@capacitor/app';
import { APP_ID, WEB_FALLBACK_VERSION } from "@/lib/mobile-config";
import { BUILD_TARGET } from "@/lib/build-target";

const apkService = new APKUpdateService();

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [updateConfig, setUpdateConfig] = useState<APKUpdateConfig | null>(null);
  const [appVersion, setAppVersion] = useState(WEB_FALLBACK_VERSION);
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState<any>(null);

  const router = useRouter();
  const pathname = usePathname();
  const isInitialLaunch = useRef(true);

  useEffect(() => {
    if (BUILD_TARGET === 'video') {
      // 1. Fresh launch redirect (one-time on mount)
      if (isInitialLaunch.current) {
        isInitialLaunch.current = false;
        if (pathname !== '/mlm/watch-earn') {
          router.replace('/mlm/watch-earn');
        }
      }

      // 2. Single back button listener
      const listenerPromise = App.addListener('backButton', () => {
        if (window.location.pathname === '/mlm/watch-earn') {
          App.exitApp();
        } else {
          router.replace('/mlm/watch-earn');
        }
      });

      return () => {
        listenerPromise.then(handle => handle.remove());
      };
    }
  }, [router, pathname]);

  useEffect(() => {
    const init = async () => {
      // 1. Get native version
      try {
        const info = await App.getInfo();
        setAppVersion(info.version);
      } catch (e) {
        console.warn("Could not get native version, using fallback", e);
        setAppVersion(WEB_FALLBACK_VERSION);
      }

      // 2. Splash / Config Init / Auth Check
      const splashPromise = new Promise(resolve => setTimeout(resolve, 3000));
      
      try {
        const [config] = await Promise.all([
          apkService.getConfig(APP_ID),
          new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
              setUser(user);
              setAuthChecked(true);
              unsubscribe();
              resolve(user);
            });
          }),
          splashPromise
        ]);
        setUpdateConfig(config);
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-page-background)]">
        <div className="flex flex-col items-center">
          <div className="text-4xl font-black mb-4">JembeeKart Video</div>
          <Loader2 className="animate-spin text-[var(--color-primary-button)]" size={48} />
        </div>
      </div>
    );
  }

  // 2. Check for Forced Updates or Maintenance
  if (updateConfig) {
    if (updateConfig.maintenanceMode) {
      return <div className="p-6 text-center min-h-screen flex items-center justify-center">App is under maintenance. Please try later.</div>;
    }
    
    // Simple version comparison
    if (updateConfig.forceUpdate && updateConfig.minimumSupportedVersion > appVersion) {
      return (
        <div className="p-6 text-center min-h-screen flex flex-col items-center justify-center">
          <h2 className="text-xl font-bold">Update Required</h2>
          <p>{updateConfig.updateMessage}</p>
          <a href={updateConfig.updateUrl} className="mt-4 block bg-[var(--color-primary-button)] p-3 rounded-lg text-white font-bold">Update Now</a>
        </div>
      );
    }
  }

  return <>{children}</>;
}
