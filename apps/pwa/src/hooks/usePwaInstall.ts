import { useCallback, useEffect, useMemo, useState } from "react";

const INSTALL_DISMISS_KEY = "promolocation-pwa-install-dismissed";

type AppInstallOutcome = "accepted" | "dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: AppInstallOutcome;
    platform: string;
  }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }

  interface Navigator {
    standalone?: boolean;
  }
}

export type PwaInstallState = {
  canInstall: boolean;
  dismiss: () => void;
  isAvailable: boolean;
  isInstalled: boolean;
  isPrompting: boolean;
  isVisible: boolean;
  needsManualInstall: boolean;
  promptInstall: () => Promise<void>;
};

function readDismissedState() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(INSTALL_DISMISS_KEY) === "true";
}

function writeDismissedState(value: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(INSTALL_DISMISS_KEY, value ? "true" : "false");
}

function detectStandaloneMode() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigator.standalone === true
  );
}

function detectIosManualInstall() {
  if (typeof navigator === "undefined" || typeof window === "undefined") {
    return false;
  }

  const userAgent = window.navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafari =
    /Safari/.test(userAgent) && !/CriOS|FxiOS|OPiOS|EdgiOS/.test(userAgent);

  return isIOS && isSafari && !detectStandaloneMode();
}

export default function usePwaInstall(): PwaInstallState {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isPrompting, setIsPrompting] = useState(false);
  const [isDismissed, setIsDismissed] = useState(readDismissedState);

  useEffect(() => {
    setIsInstalled(detectStandaloneMode());

    const installMediaQuery = window.matchMedia("(display-mode: standalone)");

    const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsDismissed(false);
      writeDismissedState(false);
    };

    const handleDisplayModeChange = () => {
      setIsInstalled(detectStandaloneMode());
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt,
    );
    window.addEventListener("appinstalled", handleInstalled);
    installMediaQuery.addEventListener("change", handleDisplayModeChange);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleInstalled);
      installMediaQuery.removeEventListener("change", handleDisplayModeChange);
    };
  }, []);

  const dismiss = useCallback(() => {
    setIsDismissed(true);
    writeDismissedState(true);
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) {
      return;
    }

    setIsPrompting(true);

    try {
      await deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;

      if (result.outcome === "dismissed") {
        setIsDismissed(true);
        writeDismissedState(true);
      }
    } finally {
      setIsPrompting(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  const needsManualInstall = useMemo(() => {
    return !deferredPrompt && detectIosManualInstall();
  }, [deferredPrompt]);

  const isVisible = useMemo(() => {
    if (isInstalled || isDismissed) {
      return false;
    }

    return Boolean(deferredPrompt || needsManualInstall);
  }, [deferredPrompt, isDismissed, isInstalled, needsManualInstall]);

  return {
    canInstall: Boolean(deferredPrompt),
    dismiss,
    isAvailable: !isInstalled && Boolean(deferredPrompt || needsManualInstall),
    isInstalled,
    isPrompting,
    isVisible,
    needsManualInstall,
    promptInstall,
  };
}
