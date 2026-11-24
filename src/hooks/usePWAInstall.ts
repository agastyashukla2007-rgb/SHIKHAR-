import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const APK_CONFIG_KEY = 'sankalp_apk_release_config_v1';

export interface ApkReleaseConfig {
  githubRepo: string;
  directApkUrl: string;
}

export function sanitizeHttpsUrl(raw: string): string {
  const trimmed = (raw || '').trim();
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString();
    }
    return '';
  } catch {
    return '';
  }
}

export function getApkReleaseConfig(): ApkReleaseConfig {
  const envUrl = sanitizeHttpsUrl(import.meta.env.VITE_APK_DOWNLOAD_URL || '');
  try {
    const raw = localStorage.getItem(APK_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ApkReleaseConfig>;
      return {
        githubRepo: (parsed.githubRepo || '').trim(),
        directApkUrl: sanitizeHttpsUrl(parsed.directApkUrl || '') || envUrl,
      };
    }
  } catch {
    // Fallback to env config
  }
  return {
    githubRepo: '',
    directApkUrl: envUrl,
  };
}

export function saveApkReleaseConfig(config: ApkReleaseConfig): ApkReleaseConfig {
  const cleanRepo = config.githubRepo
    .trim()
    .replace(/^https?:\/\/github\.com\//i, '')
    .replace(/\.git$/i, '')
    .replace(/^\/+|\/+$/g, '');

  const cleanDirectUrl = sanitizeHttpsUrl(config.directApkUrl);
  const resolvedDirectUrl =
    cleanDirectUrl ||
    (cleanRepo && /^[\w.-]+\/[\w.-]+$/.test(cleanRepo)
      ? `https://github.com/${cleanRepo}/releases/latest/download/SankalpPrep-debug.apk`
      : '');

  const next: ApkReleaseConfig = {
    githubRepo: cleanRepo,
    directApkUrl: resolvedDirectUrl,
  };
  try {
    localStorage.setItem(APK_CONFIG_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage quota issues
  }
  return next;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));
    setIsAndroid(/android/.test(ua));

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async (): Promise<boolean> => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    isAndroid,
    install,
  };
}

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
