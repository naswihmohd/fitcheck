import { useEffect, useRef, useState } from 'react';
import { FiDownload, FiShare, FiX } from 'react-icons/fi';
import { Constants } from '../../../../general/constants/constants';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'onrevv-pwa-install-dismissed';

const isStandaloneDisplay = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  // iOS Safari
  Boolean((navigator as Navigator & { standalone?: boolean }).standalone);

const isIosDevice = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

const isMobileViewport = () => window.matchMedia('(max-width: 768px)').matches;

const PwaInstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [iosHint, setIosHint] = useState(false);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed === '1' || isStandaloneDisplay()) return;

    const syncVisibility = () => {
      if (localStorage.getItem(DISMISS_KEY) === '1' || isStandaloneDisplay()) {
        setVisible(false);
        return;
      }

      if (!isMobileViewport()) {
        setVisible(false);
        return;
      }

      if (deferredPromptRef.current) {
        setIosHint(false);
        setVisible(true);
        return;
      }

      if (isIosDevice()) {
        setIosHint(true);
        setVisible(true);
        return;
      }

      setVisible(false);
    };

    syncVisibility();

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      const promptEvent = event as BeforeInstallPromptEvent;
      deferredPromptRef.current = promptEvent;
      setDeferredPrompt(promptEvent);
      setIosHint(false);
      if (isMobileViewport()) {
        setVisible(true);
      }
    };

    const onAppInstalled = () => {
      deferredPromptRef.current = null;
      setVisible(false);
      setDeferredPrompt(null);
      setIosHint(false);
      localStorage.setItem(DISMISS_KEY, '1');
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);
    window.addEventListener('resize', syncVisibility);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
      window.removeEventListener('resize', syncVisibility);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, '1');
  };

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      localStorage.setItem(DISMISS_KEY, '1');
    }
    deferredPromptRef.current = null;
    setDeferredPrompt(null);
    setVisible(false);
  };

  if (!visible || (!deferredPrompt && !iosHint)) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
      <div className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl border border-primary/15 bg-white/95 p-3 shadow-[0_18px_50px_-24px_rgba(0,0,148,0.55)] backdrop-blur-md">
        <img
          src="/apple-touch-icon.png"
          alt=""
          className="h-11 w-11 shrink-0 rounded-xl object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-secondary">
            Install {Constants.APP_SHORT_NAME}
          </p>
          <p className="text-xs text-gray-500">
            {iosHint
              ? 'Tap Share, then Add to Home Screen.'
              : 'Add to your home screen for faster access.'}
          </p>
        </div>
        {iosHint ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
            <FiShare className="h-3.5 w-3.5" />
            Share
          </span>
        ) : (
          <button
            type="button"
            onClick={install}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white transition hover:bg-primary/90"
          >
            <FiDownload className="h-3.5 w-3.5" />
            Install
          </button>
        )}
        <button
          type="button"
          aria-label="Dismiss install prompt"
          onClick={dismiss}
          className="shrink-0 rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
        >
          <FiX className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default PwaInstallBanner;
