import type {
  CareerAnalysisResponse,
  NexusAskRequest,
  NexusAskResponse,
  ProgressStatus,
  UploadDocumentResponse,
  UserProgress
} from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const BROWSER_PROXY_BASE = "/api/backend";

export class ApiError extends Error {
  readonly status: number;
  readonly details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function getBaseUrl() {
  return typeof window === "undefined" ? API_BASE_URL : BROWSER_PROXY_BASE;
}

function createUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getBaseUrl()}${normalizedPath}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getErrorMessage(payload: unknown, fallback: string) {
  if (isRecord(payload)) {
    const detail = payload.detail;
    const message = payload.message;

    if (typeof detail === "string") {
      return detail;
    }

    if (typeof message === "string") {
      return message;
    }
  }

  return fallback;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let payload: unknown = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(payload, "Something went wrong. Please check that the NEXUS AI backend is running."),
      response.status,
      payload
    );
  }

  return payload as T;
}

async function request<T>(path: string, init?: RequestInit) {
  const response = await fetch(createUrl(path), {
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(init?.headers ?? {})
    }
  });

  return parseResponse<T>(response);
}

export async function askNexus(userId: string, message: string, threadId: string) {
  const body: NexusAskRequest = {
    user_id: userId,
    message,
    thread_id: threadId
  };

  return request<NexusAskResponse>("/nexus/ask", {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export async function getProgress(userId: string) {
  return request<UserProgress>(`/progress/${encodeURIComponent(userId)}`, {
    method: "GET"
  });
}

export async function updateSkill(userId: string, skill: string, progress: number, status: ProgressStatus) {
  const params = new URLSearchParams({
    skill,
    progress: String(progress),
    status
  });

  return request<UserProgress>(`/progress/${encodeURIComponent(userId)}/skill?${params.toString()}`, {
    method: "POST"
  });
}

export async function updateProject(userId: string, project: string, progress: number, status: ProgressStatus) {
  const params = new URLSearchParams({
    project,
    progress: String(progress),
    status
  });

  return request<UserProgress>(`/progress/${encodeURIComponent(userId)}/project?${params.toString()}`, {
    method: "POST"
  });
}

export async function uploadDocument(userId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return request<UploadDocumentResponse>(`/documents/upload?user_id=${encodeURIComponent(userId)}`, {
    method: "POST",
    body: formData
  });
}

export async function analyzeCareer(userId: string, jobDescription: string) {
  return request<CareerAnalysisResponse>("/career/analyze", {
    method: "POST",
    body: JSON.stringify({
      user_id: userId,
      job_description: jobDescription
    })
  });
}

export async function checkApiHealth() {
  await request<{ message?: string }>("/", {
    method: "GET"
  });
}
