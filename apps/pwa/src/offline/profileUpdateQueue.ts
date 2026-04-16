import {
  updatePromoterProfile,
  type AuthenticatedUser,
  type ProfileUpdatePayload,
} from "@promolocation/shared";

const DATABASE_NAME = "promolocation-pwa-offline";
const DATABASE_VERSION = 1;
const PROFILE_UPDATE_STORE = "profile-update-queue";

export type QueuedProfileUpdate = {
  avatarFile: File | null;
  avatarPreviewUrl: string | null;
  enqueuedAt: string;
  id: string;
  lastError: string | null;
  profile: ProfileUpdatePayload;
  promoterId: string;
  removeAvatar: boolean;
  updatedAt: string;
  userId: number;
};

type ActiveSession = {
  accessToken: string;
  apiKey: string;
  user: AuthenticatedUser;
};

type FlushQueuedProfileUpdateOptions = {
  onError?: (queuedUpdate: QueuedProfileUpdate, error: unknown) => void;
  onSuccess?: (
    queuedUpdate: QueuedProfileUpdate,
    updatedUser: Partial<AuthenticatedUser>,
  ) => void;
};

function getQueueId(userId: number) {
  return `profile:${userId}`;
}

function ensureIndexedDbSupport() {
  if (typeof indexedDB === "undefined") {
    throw new Error(
      "Offline queueing is not supported in this browser. Reconnect to save your profile changes.",
    );
  }
}

function openQueueDatabase() {
  ensureIndexedDbSupport();

  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(PROFILE_UPDATE_STORE)) {
        database.createObjectStore(PROFILE_UPDATE_STORE, {
          keyPath: "id",
        });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      reject(request.error ?? new Error("Failed to open the offline queue."));
    };
  });
}

function requestToPromise<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      reject(request.error ?? new Error("IndexedDB request failed."));
    };
  });
}

function transactionToPromise(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => {
      reject(transaction.error ?? new Error("IndexedDB transaction failed."));
    };
    transaction.onabort = () => {
      reject(transaction.error ?? new Error("IndexedDB transaction was aborted."));
    };
  });
}

async function withQueueDatabase<T>(
  operation: (database: IDBDatabase) => Promise<T>,
) {
  const database = await openQueueDatabase();

  try {
    return await operation(database);
  } finally {
    database.close();
  }
}

export async function readQueuedProfileUpdate(userId: number) {
  return withQueueDatabase(async (database) => {
    const transaction = database.transaction(PROFILE_UPDATE_STORE, "readonly");
    const request = transaction.objectStore(PROFILE_UPDATE_STORE).get(getQueueId(userId));
    const record = (await requestToPromise(request)) as
      | QueuedProfileUpdate
      | undefined;

    await transactionToPromise(transaction);
    return record ?? null;
  });
}

export async function upsertQueuedProfileUpdate(
  record: Omit<QueuedProfileUpdate, "enqueuedAt" | "id" | "lastError" | "updatedAt">,
) {
  const existingRecord = await readQueuedProfileUpdate(record.userId);

  const nextRecord: QueuedProfileUpdate = {
    ...record,
    id: getQueueId(record.userId),
    enqueuedAt: existingRecord?.enqueuedAt ?? new Date().toISOString(),
    lastError: null,
    updatedAt: new Date().toISOString(),
  };

  return withQueueDatabase(async (database) => {
    const transaction = database.transaction(PROFILE_UPDATE_STORE, "readwrite");
    transaction.objectStore(PROFILE_UPDATE_STORE).put(nextRecord);
    await transactionToPromise(transaction);
    return nextRecord;
  });
}

export async function removeQueuedProfileUpdate(userId: number) {
  return withQueueDatabase(async (database) => {
    const transaction = database.transaction(PROFILE_UPDATE_STORE, "readwrite");
    transaction.objectStore(PROFILE_UPDATE_STORE).delete(getQueueId(userId));
    await transactionToPromise(transaction);
  });
}

export async function markQueuedProfileUpdateError(
  userId: number,
  lastError: string,
) {
  const existingRecord = await readQueuedProfileUpdate(userId);

  if (!existingRecord) {
    return null;
  }

  const nextRecord: QueuedProfileUpdate = {
    ...existingRecord,
    lastError,
    updatedAt: new Date().toISOString(),
  };

  return withQueueDatabase(async (database) => {
    const transaction = database.transaction(PROFILE_UPDATE_STORE, "readwrite");
    transaction.objectStore(PROFILE_UPDATE_STORE).put(nextRecord);
    await transactionToPromise(transaction);
    return nextRecord;
  });
}

export async function flushQueuedProfileUpdate(
  session: ActiveSession,
  options: FlushQueuedProfileUpdateOptions = {},
) {
  const queuedUpdate = await readQueuedProfileUpdate(session.user.user_id);

  if (!queuedUpdate) {
    return {
      completed: false,
      lastError: null,
      queuedUpdate: null,
      updatedUser: null,
    };
  }

  try {
    const updatedUser = await updatePromoterProfile(
        {
          accessToken: session.accessToken,
          apiKey: session.apiKey,
          promoterId: session.user.promoter_id,
          userId: session.user.user_id,
        },
        queuedUpdate.profile,
        queuedUpdate.avatarFile,
        queuedUpdate.removeAvatar,
      );

    await removeQueuedProfileUpdate(session.user.user_id);
    options.onSuccess?.(queuedUpdate, updatedUser);

    return {
      completed: true,
      lastError: null,
      queuedUpdate,
      updatedUser,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to sync your saved profile changes.";

    await markQueuedProfileUpdateError(session.user.user_id, message);
    options.onError?.(queuedUpdate, error);

    return {
      completed: false,
      lastError: message,
      queuedUpdate,
      updatedUser: null,
    };
  }
}

export function isLikelyOfflineError(error: unknown) {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return true;
  }

  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  return (
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("load failed") ||
    message.includes("network request failed")
  );
}

export function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Unable to read the selected file."));
    };

    reader.onerror = () => {
      reject(reader.error ?? new Error("Unable to read the selected file."));
    };

    reader.readAsDataURL(file);
  });
}
