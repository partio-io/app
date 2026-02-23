export interface RepoDetail {
  owner: string;
  name: string;
  description: string | null;
  private: boolean;
  language: string | null;
  license: string | null;
  default_branch: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  topics: string[];
  homepage: string | null;
  size: number;
  avatar_url: string;
  html_url: string;
  pushed_at: string;
}

export interface UserSummary {
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface CommitSummary {
  sha: string;
  message: string;
  author: UserSummary | null;
  date: string;
  committer: UserSummary | null;
}

export interface CommitFileChange {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

export interface CommitDetail extends CommitSummary {
  files: CommitFileChange[];
  stats: {
    total: number;
    additions: number;
    deletions: number;
  };
  parents: { sha: string }[];
}

export interface Label {
  id: number;
  name: string;
  color: string;
  description: string | null;
}

export interface PullRequestSummary {
  number: number;
  title: string;
  state: "open" | "closed";
  merged: boolean;
  draft: boolean;
  user: UserSummary;
  labels: Label[];
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  comments: number;
  head: { ref: string };
  base: { ref: string };
}

export interface PullRequestDetail extends PullRequestSummary {
  body: string | null;
  additions: number;
  deletions: number;
  changed_files: number;
  mergeable: boolean | null;
  commits: number;
  review_comments: number;
}

export interface IssueSummary {
  number: number;
  title: string;
  state: "open" | "closed";
  user: UserSummary;
  labels: Label[];
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  comments: number;
}

export interface IssueDetail extends IssueSummary {
  body: string | null;
  assignees: UserSummary[];
  milestone: { title: string } | null;
}

export interface TreeEntry {
  name: string;
  path: string;
  type: "file" | "dir";
  size?: number;
  sha: string;
}

export interface FileContent {
  name: string;
  path: string;
  content: string;
  size: number;
  sha: string;
  encoding: string;
}

export interface Contributor {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

export interface WeeklyActivity {
  week: number;
  total: number;
  days: number[];
}

export interface RepoLatestCheckpoint {
  owner: string;
  repo: string;
  checkpoint: {
    id: string;
    commit_hash: string;
    branch: string;
    created_at: string;
    agent: string;
    agent_percent: number;
  };
  commit: CommitSummary | null;
  summary: string | null;
  session_duration_ms: number | null;
}
