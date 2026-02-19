export interface CheckpointMetadata {
  id: string;
  session_id: string;
  commit_hash: string;
  branch: string;
  created_at: string;
  agent: string;
  agent_percent: number;
  content_hash: string;
}

export interface SessionMetadata {
  agent: string;
  total_tokens: number;
  duration: string;
}

export interface Message {
  role: string;
  content: string;
  timestamp: string;
  tokens?: number;
}

export interface RepoWithCheckpoints {
  owner: string;
  name: string;
  full_name: string;
  language: string | null;
  stars: number;
  checkpoint_count: number;
  updated_at: string;
  description: string | null;
  open_issues_count: number;
}
