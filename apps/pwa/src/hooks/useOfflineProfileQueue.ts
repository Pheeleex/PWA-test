import { useCallback, useEffect, useRef, useState } from "react";
import {
  updatePromoterProfile,
  type AuthenticatedUser,
  type ProfileUpdatePayload,
} from "@promolocation/shared";
import {
  flushQueuedProfileUpdate,
  isLikelyOfflineError,
  readFileAsDataUrl,
  readQueuedProfileUpdate,
  removeQueuedProfileUpdate,
  upsertQueuedProfileUpdate,
} from "../offline/profileUpdateQueue";

type SessionState = {
  accessToken: string;
  apiKey: string;
  user: AuthenticatedUser;
};

type SessionPatch = {
  accessToken?: string;
  apiKey?: string;
  user?: AuthenticatedUser;
};

type UseOfflineProfileQueueOptions = {
  isOnline: boolean;
  onSessionPatch: (session: SessionPatch) => void;
  session: SessionState | null;
};

export type ProfileSaveRequest = {
  avatarFile?: File | null;
  fullname: string;
  phone: string;
};

export type ProfileSaveResult = {
  message: string;
  status: "queued" | "synced";
};

function mergeOptimisticUser(
  user: AuthenticatedUser,
  profile: ProfileUpdatePayload,
  avatarPreviewUrl: string | null,
) : AuthenticatedUser {
  const nextAvatar = avatarPreviewUrl ?? user.avatar;

  return {
    ...user,
    fullname: profile.fullname,
    phone: profile.phone,
    avatar: nextAvatar,
  };
}

function mergeSyncedUser(
  user: AuthenticatedUser,
  profile: ProfileUpdatePayload,
  updatedUser: Partial<AuthenticatedUser>,
  avatarPreviewUrl: string | null,
) : AuthenticatedUser {
  const hasSyncedAvatar =
    typeof updatedUser.avatar === "string" && updatedUser.avatar.trim().length > 0;
  const nextAvatar: string =
    hasSyncedAvatar && typeof updatedUser.avatar === "string"
      ? updatedUser.avatar
      : avatarPreviewUrl ?? user.avatar;

  return {
    ...user,
    ...updatedUser,
    fullname: String(updatedUser.fullname ?? profile.fullname),
    phone: String(updatedUser.phone ?? profile.phone),
    avatar: nextAvatar,
  };
}

export default function useOfflineProfileQueue({
  isOnline,
  onSessionPatch,
  session,
}: UseOfflineProfileQueueOptions) {
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);
  const isSyncingRef = useRef(false);

  const refreshPendingState = useCallback(async () => {
    if (!session) {
      setPendingCount(0);
      setLastSyncError(null);
      return;
    }

    const queuedUpdate = await readQueuedProfileUpdate(session.user.user_id);

    setPendingCount(queuedUpdate ? 1 : 0);
    setLastSyncError(queuedUpdate?.lastError ?? null);
  }, [session]);

  const queueProfileUpdate = useCallback(
    async (profile: ProfileUpdatePayload, avatarFile: File | null = null) => {
      if (!session) {
        throw new Error("You need to be signed in to update your profile.");
      }

      let avatarPreviewUrl: string | null = null;

      if (avatarFile) {
        try {
          avatarPreviewUrl = await readFileAsDataUrl(avatarFile);
        } catch {
          avatarPreviewUrl = null;
        }
      }

      await upsertQueuedProfileUpdate({
        avatarFile,
        avatarPreviewUrl,
        profile,
        promoterId: session.user.promoter_id,
        userId: session.user.user_id,
      });

      onSessionPatch({
        user: mergeOptimisticUser(session.user, profile, avatarPreviewUrl),
      });

      await refreshPendingState();
    },
    [onSessionPatch, refreshPendingState, session],
  );

  const flushQueue = useCallback(async () => {
    if (!session || !isOnline || isSyncingRef.current) {
      return {
        completed: false,
        lastError: null,
      };
    }

    isSyncingRef.current = true;
    setIsSyncing(true);

    try {
      const result = await flushQueuedProfileUpdate(session, {
        onSuccess: (queuedUpdate, updatedUser) => {
          onSessionPatch({
            user: mergeSyncedUser(
              session.user,
              queuedUpdate.profile,
              updatedUser,
              queuedUpdate.avatarPreviewUrl,
            ),
          });
        },
      });

      setLastSyncError(result.lastError);
      return result;
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
      await refreshPendingState();
    }
  }, [isOnline, onSessionPatch, refreshPendingState, session]);

  useEffect(() => {
    void refreshPendingState();
  }, [refreshPendingState]);

  useEffect(() => {
    if (!isOnline || !session) {
      return;
    }

    void flushQueue();
  }, [flushQueue, isOnline, session]);

  const saveProfile = useCallback(
    async ({
      avatarFile = null,
      fullname,
      phone,
    }: ProfileSaveRequest): Promise<ProfileSaveResult> => {
      if (!session) {
        throw new Error("You need to be signed in to update your profile.");
      }

      const profile = {
        fullname: fullname.trim(),
        phone: phone.trim(),
      };

      if (!isOnline) {
        await queueProfileUpdate(profile, avatarFile);

        return {
          message:
            "You are offline. Your profile changes were saved on this device and will sync automatically when you reconnect.",
          status: "queued",
        };
      }

      try {
        const updatedUser = await updatePromoterProfile(
          {
            accessToken: session.accessToken,
            apiKey: session.apiKey,
            userId: session.user.user_id,
          },
          profile,
          avatarFile,
        );

        let avatarPreviewUrl: string | null = null;

        if (
          avatarFile &&
          (typeof updatedUser.avatar !== "string" || updatedUser.avatar.trim().length === 0)
        ) {
          try {
            avatarPreviewUrl = await readFileAsDataUrl(avatarFile);
          } catch {
            avatarPreviewUrl = null;
          }
        }

        await removeQueuedProfileUpdate(session.user.user_id);
        onSessionPatch({
          user: mergeSyncedUser(session.user, profile, updatedUser, avatarPreviewUrl),
        });
        await refreshPendingState();

        return {
          message: "Profile updated successfully.",
          status: "synced",
        };
      } catch (error) {
        if (!isLikelyOfflineError(error)) {
          throw error;
        }

        await queueProfileUpdate(profile, avatarFile);

        return {
          message:
            "The connection dropped while saving. Your profile changes were queued and will sync when you are back online.",
          status: "queued",
        };
      }
    },
    [isOnline, onSessionPatch, queueProfileUpdate, refreshPendingState, session],
  );

  return {
    flushQueue,
    isSyncing,
    lastSyncError,
    pendingCount,
    saveProfile,
  };
}
