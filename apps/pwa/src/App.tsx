import { useEffect, useState } from "react";
import type { AuthenticatedUser, LoginCredentials } from "@promolocation/shared";
import { loginPromoter } from "@promolocation/shared";
import ActivationMapScreen from "./components/ActivationMapScreen";
import AuthenticatedShell from "./components/AuthenticatedShell";
import ChangePasswordScreen from "./components/ChangePasswordScreen";
import ForgotPasswordScreen from "./components/ForgotPasswordScreen";
import IncidentsScreen from "./components/IncidentsScreen";
import LoginScreen from "./components/LoginScreen";
import OnboardingScreen from "./components/OnboardingScreen";
import ProfileScreen from "./components/ProfileScreen";
import SettingsScreen from "./components/SettingsScreen";
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
  | { name: "incidents" }
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

export default function App() {
  const install = usePwaInstall();
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
      if (currentStack.length <= 1) {
        return currentStack;
      }

      return currentStack.slice(0, -1);
    });
  };

  const handleLogin = async (credentials: LoginCredentials) => {
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

  const handleSessionPatch = (partialSession: Partial<StoredSession>) => {
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

  if (isHydrating) {
    return (
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
    return (
      <OnboardingScreen
        install={install}
        onComplete={handleCompleteOnboarding}
      />
    );
  }

  if (!session) {
    if (currentScreen.name === "forgot-password") {
      return (
        <ForgotPasswordScreen
          apiKey={null}
          onBack={goBack}
          onDone={() => resetNavigation({ name: "login" })}
        />
      );
    }

    return (
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
    return (
      <ForgotPasswordScreen
        apiKey={session.apiKey}
        onBack={goBack}
        onDone={handleLogout}
      />
    );
  }

  if (currentScreen.name === "incidents") {
    return (
      <AuthenticatedShell
        activeSection={activeAuthenticatedSection}
        onLogout={handleLogout}
        onOpenMap={() => resetNavigation({ name: "map" })}
        onOpenProfile={() => resetNavigation({ name: "profile" })}
        onOpenSettings={() => resetNavigation({ name: "settings" })}
      >
        <IncidentsScreen onBack={goBack} session={session} />
      </AuthenticatedShell>
    );
  }

  if (currentScreen.name === "profile") {
    return (
      <AuthenticatedShell
        activeSection={activeAuthenticatedSection}
        onLogout={handleLogout}
        onOpenMap={() => resetNavigation({ name: "map" })}
        onOpenProfile={() => resetNavigation({ name: "profile" })}
        onOpenSettings={() => resetNavigation({ name: "settings" })}
      >
        <ProfileScreen
          onBack={goBack}
          onSessionPatch={handleSessionPatch}
          session={session}
        />
      </AuthenticatedShell>
    );
  }

  if (currentScreen.name === "settings") {
    return (
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
          onLogout={handleLogout}
          onOpenChangePassword={() =>
            navigateTo({ name: "change-password", forcedReset: false })
          }
          onOpenIncidents={() => navigateTo({ name: "incidents" })}
          onOpenProfile={() => navigateTo({ name: "profile" })}
          session={session}
        />
      </AuthenticatedShell>
    );
  }

  if (currentScreen.name === "change-password") {
    return (
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

  return (
    <AuthenticatedShell
      activeSection={activeAuthenticatedSection}
      fullBleed
      onLogout={handleLogout}
      onOpenMap={() => resetNavigation({ name: "map" })}
      onOpenProfile={() => resetNavigation({ name: "profile" })}
      onOpenSettings={() => resetNavigation({ name: "settings" })}
    >
      <ActivationMapScreen
        onOpenChangePassword={() =>
          navigateTo({ name: "change-password", forcedReset: false })
        }
        onOpenIncidents={() => navigateTo({ name: "incidents" })}
        onSessionPatch={handleSessionPatch}
        session={session}
      />
    </AuthenticatedShell>
  );
}
