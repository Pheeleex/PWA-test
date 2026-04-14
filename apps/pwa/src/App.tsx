import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { AuthenticatedUser, LoginCredentials } from "@promolocation/shared";
import { loginPromoter } from "@promolocation/shared";
import ActivationMapScreen from "./components/ActivationMapScreen";
import AuthenticatedShell from "./components/AuthenticatedShell";
import ChangePasswordScreen from "./components/ChangePasswordScreen";
import ConnectivityBanner from "./components/ConnectivityBanner";
import ForgotPasswordScreen from "./components/ForgotPasswordScreen";
import LoginScreen from "./components/LoginScreen";
import OnboardingScreen from "./components/OnboardingScreen";
import ProfileScreen from "./components/ProfileScreen";
import SettingsScreen from "./components/SettingsScreen";
import useNetworkStatus from "./hooks/useNetworkStatus";
import useOfflineProfileQueue from "./hooks/useOfflineProfileQueue";
import usePwaInstall from "./hooks/usePwaInstall";

const ONBOARDING_STORAGE_KEY = "promolocation-pwa-onboarding-complete";
const SESSION_STORAGE_KEY = "promolocation-pwa-session";

type StoredSession = {
  accessToken: string;
  apiKey: string;
  user: AuthenticatedUser;
};

type ScreenState =
  | { name: "onboarding" }
  | { name: "change-password"; forcedReset: boolean }
  | { name: "forgot-password" }
  | { name: "login" }
  | { name: "map" }
  | { name: "profile" }
  | { name: "settings" };

function readStoredSession() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawSession = window.localStorage.getItem(SESSION_STORAGE_KEY);

    if (!rawSession) {
      return null;
    }

    return JSON.parse(rawSession) as StoredSession;
  } catch {
    return null;
  }
}

function writeStoredSession(session: StoredSession | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

function readOnboardingComplete() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(ONBOARDING_STORAGE_KEY) === "true";
}

function writeOnboardingComplete(value: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ONBOARDING_STORAGE_KEY, value ? "true" : "false");
}

function getDefaultAuthenticatedScreen(session: StoredSession | null): ScreenState {
  if (session?.user.resetKey === "Yes") {
    return { name: "change-password", forcedReset: true };
  }

  if (session) {
    return { name: "map" };
  }

  return { name: "login" };
}

function getFallbackBackTarget(
  currentScreen: ScreenState,
  session: StoredSession | null,
): ScreenState | null {
  if (!session) {
    if (currentScreen.name === "forgot-password") {
      return { name: "login" };
    }

    return null;
  }

  if (currentScreen.name === "map") {
    return null;
  }

  if (currentScreen.name === "change-password" && currentScreen.forcedReset) {
    return null;
  }

  return { name: "map" };
}

export default function App() {
  const install = usePwaInstall();
  const networkStatus = useNetworkStatus();
  const [session, setSession] = useState<StoredSession | null>(null);
  const [screenStack, setScreenStack] = useState<ScreenState[]>([{ name: "login" }]);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const currentScreen = screenStack[screenStack.length - 1];

  useEffect(() => {
    const restoredSession = readStoredSession();
    const onboardingComplete = readOnboardingComplete();

    setSession(restoredSession);
    setIsOnboardingComplete(onboardingComplete);
    setScreenStack([
      onboardingComplete
        ? getDefaultAuthenticatedScreen(restoredSession)
        : { name: "onboarding" },
    ]);
    setIsHydrating(false);
  }, []);

  const handleSessionPatch = useCallback((partialSession: Partial<StoredSession>) => {
    setSession((currentSession) => {
      if (!currentSession) {
        return currentSession;
      }

      const nextSession = {
        ...currentSession,
        ...partialSession,
      };

      writeStoredSession(nextSession);
      return nextSession;
    });
  }, []);

  const profileQueue = useOfflineProfileQueue({
    isOnline: networkStatus.isOnline,
    onSessionPatch: handleSessionPatch,
    session,
  });

  const navigateTo = (nextScreen: ScreenState, replace = false) => {
    setScreenStack((currentStack) => {
      if (replace) {
        if (currentStack.length === 0) {
          return [nextScreen];
        }

        return [...currentStack.slice(0, -1), nextScreen];
      }

      return [...currentStack, nextScreen];
    });
  };

  const resetNavigation = (nextScreen: ScreenState) => {
    setScreenStack([nextScreen]);
  };

  const goBack = () => {
    setScreenStack((currentStack) => {
      if (currentStack.length > 1) {
        return currentStack.slice(0, -1);
      }

      const activeScreen = currentStack[currentStack.length - 1];
      const fallbackScreen = activeScreen
        ? getFallbackBackTarget(activeScreen, session)
        : null;

      if (!fallbackScreen) {
        return currentStack;
      }

      return [fallbackScreen];
    });
  };

  const handleLogin = async (credentials: LoginCredentials) => {
    if (!networkStatus.isOnline) {
      const message =
        "You are offline. Login needs an internet connection, but any saved session on this device can still reopen the app.";

      setAuthError(message);
      throw new Error(message);
    }

    setIsLoggingIn(true);
    setAuthError(null);

    try {
      const result = await loginPromoter(credentials, session?.apiKey);
      const nextSession: StoredSession = {
        accessToken: result.accessToken,
        apiKey: result.apiKey,
        user: result.user,
      };

      setSession(nextSession);
      writeStoredSession(nextSession);
      resetNavigation(getDefaultAuthenticatedScreen(nextSession));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to log in right now.";
      setAuthError(message);
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setSession(null);
    setAuthError(null);
    writeStoredSession(null);
    resetNavigation({ name: "login" });
  };

  const handleCompleteOnboarding = () => {
    setIsOnboardingComplete(true);
    writeOnboardingComplete(true);
    resetNavigation(getDefaultAuthenticatedScreen(session));
  };

  const activeAuthenticatedSection =
    currentScreen.name === "profile" ||
    currentScreen.name === "settings" ||
    currentScreen.name === "map"
      ? currentScreen.name
      : undefined;

  const renderWithConnectivity = (content: ReactNode) => (
    <>
      <ConnectivityBanner
        isOnline={networkStatus.isOnline}
        isSyncingProfileUpdates={profileQueue.isSyncing}
        lastSyncError={profileQueue.lastSyncError}
        pendingProfileUpdates={profileQueue.pendingCount}
      />
      {content}
    </>
  );

  if (isHydrating) {
    return renderWithConnectivity(
      <main className="app-shell">
        <section className="loading-screen">
          <p className="eyebrow">Promolocation PWA</p>
          <h1>Loading your session</h1>
          <p className="muted">
            Preparing the browser app and restoring the last signed-in state.
          </p>
        </section>
      </main>
    );
  }

  if (!isOnboardingComplete || currentScreen.name === "onboarding") {
    return renderWithConnectivity(
      <OnboardingScreen
        install={install}
        onComplete={handleCompleteOnboarding}
      />
    );
  }

  if (!session) {
    if (currentScreen.name === "forgot-password") {
      return renderWithConnectivity(
        <ForgotPasswordScreen
          apiKey={null}
          onBack={goBack}
          onDone={() => resetNavigation({ name: "login" })}
        />
      );
    }

    return renderWithConnectivity(
      <LoginScreen
        error={authError}
        isLoading={isLoggingIn}
        install={install}
        onForgotPassword={() => navigateTo({ name: "forgot-password" })}
        onSubmit={handleLogin}
      />
    );
  }

  if (currentScreen.name === "forgot-password") {
    return renderWithConnectivity(
      <ForgotPasswordScreen
        apiKey={session.apiKey}
        onBack={goBack}
        onDone={handleLogout}
      />
    );
  }

  if (currentScreen.name === "profile") {
    return renderWithConnectivity(
      <AuthenticatedShell
        activeSection={activeAuthenticatedSection}
        onLogout={handleLogout}
        onOpenMap={() => resetNavigation({ name: "map" })}
        onOpenProfile={() => resetNavigation({ name: "profile" })}
        onOpenSettings={() => resetNavigation({ name: "settings" })}
      >
        <ProfileScreen
          isOnline={networkStatus.isOnline}
          isSyncingQueuedUpdates={profileQueue.isSyncing}
          onBack={goBack}
          onSaveProfile={profileQueue.saveProfile}
          onSyncQueuedUpdates={profileQueue.flushQueue}
          pendingProfileUpdates={profileQueue.pendingCount}
          profileSyncError={profileQueue.lastSyncError}
          session={session}
        />
      </AuthenticatedShell>
    );
  }

  if (currentScreen.name === "settings") {
    return renderWithConnectivity(
      <AuthenticatedShell
        activeSection={activeAuthenticatedSection}
        onLogout={handleLogout}
        onOpenMap={() => resetNavigation({ name: "map" })}
        onOpenProfile={() => resetNavigation({ name: "profile" })}
        onOpenSettings={() => resetNavigation({ name: "settings" })}
      >
        <SettingsScreen
          install={install}
          onBack={goBack}
          onOpenChangePassword={() =>
            navigateTo({ name: "change-password", forcedReset: false })
          }
          onOpenProfile={() => navigateTo({ name: "profile" })}
          session={session}
        />
      </AuthenticatedShell>
    );
  }

  if (currentScreen.name === "change-password") {
    return renderWithConnectivity(
      <AuthenticatedShell
        activeSection={activeAuthenticatedSection}
        onLogout={handleLogout}
        onOpenMap={() => resetNavigation({ name: "map" })}
        onOpenProfile={() => resetNavigation({ name: "profile" })}
        onOpenSettings={() => resetNavigation({ name: "settings" })}
      >
        <ChangePasswordScreen
          forcedReset={currentScreen.forcedReset}
          onBack={goBack}
          onDone={() => {
            handleSessionPatch({
              user: {
                ...session.user,
                resetKey: "No",
              },
            });
            resetNavigation({ name: "map" });
          }}
          onForgotPassword={() => navigateTo({ name: "forgot-password" })}
          session={session}
        />
      </AuthenticatedShell>
    );
  }

  return renderWithConnectivity(
    <AuthenticatedShell
      activeSection={activeAuthenticatedSection}
      fullBleed
      onLogout={handleLogout}
      onOpenMap={() => resetNavigation({ name: "map" })}
      onOpenProfile={() => resetNavigation({ name: "profile" })}
      onOpenSettings={() => resetNavigation({ name: "settings" })}
    >
      <ActivationMapScreen
        isOnline={networkStatus.isOnline}
        onOpenChangePassword={() =>
          navigateTo({ name: "change-password", forcedReset: false })
        }
        onSessionPatch={handleSessionPatch}
        session={session}
      />
    </AuthenticatedShell>
  );
}
