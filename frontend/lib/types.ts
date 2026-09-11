export type ProgressStatus = "not_started" | "in_progress" | "completed";

export type SkillProgress = {
  skill: string;
  status: ProgressStatus | string;
  progress: number;
};

export type ProjectProgress = {
  project: string;
  status: ProgressStatus | string;
  progress: number;
};

export type UserProgress = {
  user_id: string;
  skills: SkillProgress[];
  projects: ProjectProgress[];
};

export type NexusAskRequest = {
  user_id: string;
  message: string;
  thread_id: string;
};

export type NexusAskResponse = {
  result: string;
};

export type CareerAnalysis = {
  match_score: number;
  strong_matches: string[];
  missing_skills: string[];
  resume_gaps: string[];
  recommended_projects: string[];
  interview_topics: string[];
  action_plan: string[];
};

export type CareerAnalysisResponse = {
  result: CareerAnalysis;
};

export type UploadDocumentResponse = {
  message: string;
  filename: string;
  chunks: number;
};

export type UploadedDocumentRecord = {
  id: string;
  userId: string;
  filename: string;
  size: number;
  chunks: number;
  uploadedAt: string;
};

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
};

export type ThemePreference = "dark" | "light" | "system";
