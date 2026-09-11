import type { ThemePreference, UploadedDocumentRecord } from "@/lib/types";

export const DEFAULT_USER_ID = "default_user";
export const USER_ID_STORAGE_KEY = "nexus-ai-user-id";
export const THREAD_ID_STORAGE_KEY = "nexus-ai-thread-id";
export const THEME_STORAGE_KEY = "nexus-ai-theme";
export const DOCUMENTS_STORAGE_KEY = "nexus-ai-uploaded-documents";
export const USER_ID_CHANGED_EVENT = "nexus-ai-user-id-changed";

function hasWindow() {
  return typeof window !== "undefined";
}

export function createId(prefix = "nexus") {
  if (hasWindow() && window.crypto?.randomUUID) {
    return `${prefix}-${window.crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getUserId() {
  if (!hasWindow()) {
    return DEFAULT_USER_ID;
  }

  const saved = window.localStorage.getItem(USER_ID_STORAGE_KEY);
  return saved?.trim() || DEFAULT_USER_ID;
}

export function setUserId(userId: string) {
  if (!hasWindow()) {
    return;
  }

  const normalized = userId.trim() || DEFAULT_USER_ID;
  window.localStorage.setItem(USER_ID_STORAGE_KEY, normalized);
  window.dispatchEvent(new CustomEvent(USER_ID_CHANGED_EVENT, { detail: normalized }));
}

export function createThreadId() {
  return createId("nexus-thread");
}

export function getThreadId() {
  if (!hasWindow()) {
    return "default";
  }

  const saved = window.localStorage.getItem(THREAD_ID_STORAGE_KEY);
  if (saved) {
    return saved;
  }

  const nextThreadId = createThreadId();
  window.localStorage.setItem(THREAD_ID_STORAGE_KEY, nextThreadId);
  return nextThreadId;
}

export function setThreadId(threadId: string) {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.setItem(THREAD_ID_STORAGE_KEY, threadId);
}

export function startNewThread() {
  const threadId = createThreadId();
  setThreadId(threadId);
  return threadId;
}

export function getThemePreference(): ThemePreference {
  if (!hasWindow()) {
    return "dark";
  }

  const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === "light" || saved === "system" || saved === "dark") {
    return saved;
  }

  return "dark";
}

export function setThemePreference(theme: ThemePreference) {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}

function readDocumentRecords(): UploadedDocumentRecord[] {
  if (!hasWindow()) {
    return [];
  }

  const raw = window.localStorage.getItem(DOCUMENTS_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isUploadedDocumentRecord);
  } catch {
    return [];
  }
}

function writeDocumentRecords(records: UploadedDocumentRecord[]) {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(records));
}

export function getUploadedDocuments(userId: string) {
  return readDocumentRecords().filter((document) => document.userId === userId);
}

export function addUploadedDocument(document: UploadedDocumentRecord) {
  const records = readDocumentRecords();
  const nextRecords = [document, ...records.filter((item) => item.id !== document.id)];
  writeDocumentRecords(nextRecords);
}

function isUploadedDocumentRecord(value: unknown): value is UploadedDocumentRecord {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Partial<UploadedDocumentRecord>;
  return (
    typeof record.id === "string" &&
    typeof record.userId === "string" &&
    typeof record.filename === "string" &&
    typeof record.size === "number" &&
    typeof record.chunks === "number" &&
    typeof record.uploadedAt === "string"
  );
}
