export type Priority = "high" | "medium" | "low";
export type ThemeMode = "system" | "light" | "dark";
export type Lang = "tr" | "en";

export interface Note {
  id: string;
  text: string;
  category: string;
  priority: Priority;
  /** v1.2 kalıntısı (yıldız). UI artık okumuyor; eski kayıtlar için tutulur. */
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

export interface OrganizedItem {
  text: string;
  category: string;
  priority: Priority;
}
