import { storageService } from "@/services";

const ANONYMOUS_ID_KEY = "anonymous_id";
const CHECKOUT_SESSION_KEY = "checkout_session_id";
const CHECKOUT_SESSION_TTL_MS = 30 * 60 * 1000;

type AnonymousRecord = {
  id: string;
};

type CheckoutSessionRecord = {
  id: string;
  lastActiveAt: number;
};

const createUuidV4FromRandomValues = () => {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  // RFC 4122 v4 bits
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

const createSafeUuid = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    return createUuidV4FromRandomValues();
  }

  // Last-resort fallback for very old browsers.
  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
};

const createAnonymousRecord = (): AnonymousRecord => ({
  id: createSafeUuid(),
});

const normalizeAnonymousRecord = (rawValue: unknown): AnonymousRecord | null => {
  if (!rawValue) return null;

  if (typeof rawValue === "string") {
    return { id: rawValue };
  }

  if (typeof rawValue === "object") {
    const record = rawValue as Partial<AnonymousRecord>;
    if (typeof record.id === "string") {
      return { id: record.id };
    }
  }

  return null;
};

const normalizeCheckoutSessionRecord = (rawValue: unknown): CheckoutSessionRecord | null => {
  if (!rawValue) return null;

  if (typeof rawValue === "string") {
    return {
      id: rawValue,
      lastActiveAt: 0,
    };
  }

  if (typeof rawValue === "object") {
    const record = rawValue as Partial<CheckoutSessionRecord>;
    if (typeof record.id === "string") {
      return {
        id: record.id,
        lastActiveAt: typeof record.lastActiveAt === "number" ? record.lastActiveAt : 0,
      };
    }
  }

  return null;
};

export const getOrCreateAnonymousId = (): string => {
  const rawValue = storageService.getLocalItem<unknown>(ANONYMOUS_ID_KEY);
  const existing = normalizeAnonymousRecord(rawValue);

  if (existing?.id) {
    storageService.saveLocalItem(ANONYMOUS_ID_KEY, existing.id);
    return existing.id;
  }

  const next = createAnonymousRecord();
  storageService.saveLocalItem(ANONYMOUS_ID_KEY, next.id);
  return next.id;
};

export const getOrCreateCheckoutSessionId = (): string => {
  const now = Date.now();
  const rawValue = storageService.getLocalItem<unknown>(CHECKOUT_SESSION_KEY);
  const existingRecord = normalizeCheckoutSessionRecord(rawValue);

  if (!existingRecord) {
    const nextRecord: CheckoutSessionRecord = {
      id: createSafeUuid(),
      lastActiveAt: now,
    };
    storageService.saveLocalItem(CHECKOUT_SESSION_KEY, nextRecord);
    return nextRecord.id;
  }

  const isExpired = now - existingRecord.lastActiveAt > CHECKOUT_SESSION_TTL_MS;

  if (isExpired) {
    const nextRecord: CheckoutSessionRecord = {
      id: createSafeUuid(),
      lastActiveAt: now,
    };
    storageService.saveLocalItem(CHECKOUT_SESSION_KEY, nextRecord);
    return nextRecord.id;
  }

  storageService.saveLocalItem(CHECKOUT_SESSION_KEY, {
    ...existingRecord,
    lastActiveAt: now,
  });

  return existingRecord.id;
};

export const clearCheckoutSessionId = () => {
  storageService.destroyLocalItem(CHECKOUT_SESSION_KEY);
};

export const markCheckoutSessionAsUsed = (sessionId: string) => {
  const rawValue = storageService.getLocalItem<unknown>(CHECKOUT_SESSION_KEY);
  const existingRecord = normalizeCheckoutSessionRecord(rawValue);

  if (!existingRecord || existingRecord.id !== sessionId) return;

  storageService.saveLocalItem(CHECKOUT_SESSION_KEY, {
    ...existingRecord,
    lastActiveAt: Date.now(),
  });
};
