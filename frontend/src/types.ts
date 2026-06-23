export type Priority = "high" | "medium" | "low";
export type ThemeMode = "system" | "light" | "dark";
export type Lang = "tr" | "en";

export interface Note {
  id: string;
  text: string;
  category: string;
  priority: Priority;
  pinned: boolean;
  done: boolean;
  createdAt: number;
  updatedAt: number;
  deleted?: boolean;
  source?: "ai" | "local";
}

export interface CustomCategory {
  id: string;
  label: string;
  color: string;
}

export interface AuthUser {
  user_id: string;
  email: string;
  name: string;
  picture: string;
}

export interface OrganizedItem {
  text: string;
  category: string;
  priority: Priority;
}
