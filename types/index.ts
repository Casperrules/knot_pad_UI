export interface User {
  id: string;
  username?: string;
  anonymous_name: string;
  email?: string;
  role: "admin" | "user";
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginData {
  username?: string;
  email?: string;
  password: string;
}

export interface RegisterData {
  username?: string;
  email?: string;
  password: string;
  anonymous_name?: string;
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  chapter_number: number;
  story_id: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChapterCreate {
  title: string;
  content: string;
  chapter_number: number;
}

export interface ChapterUpdate {
  title?: string;
  content?: string;
  chapter_number?: number;
}

export interface Story {
  id: string;
  title: string;
  description: string;
  cover_image?: string;
  author_anonymous_name: string;
  author_id?: string;
  tags: string[];
  mature_content: boolean;
  status: "draft" | "pending" | "approved" | "rejected";
  chapter_count: number;
  total_reads: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
  rejection_reason?: string;
}

export interface StoryCreate {
  title: string;
  description: string;
  cover_image?: string;
  tags: string[];
  mature_content?: boolean;
}

export interface StoryUpdate {
  title?: string;
  description?: string;
  cover_image?: string;
  tags?: string[];
  mature_content?: boolean;
}

export interface StoryListResponse {
  stories: Story[];
  total: number;
  page_size?: number;
}

export interface StoryApproval {
  approved: boolean;
  rejection_reason?: string;
}

export interface Comment {
  id: string;
  story_id?: string;
  chapter_id?: string;
  video_id?: string;
  user_anonymous_name: string;
  content: string;
  selected_text?: string;
  text_position?: number;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  replies?: Comment[];
}

export interface Video {
  id: string;
  video_url: string;
  caption: string;
  tags: string[];
  mature_content: boolean;
  author_anonymous_name: string;
  author_id?: string;
  likes: number;
  views: number;
  status: "draft" | "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
  rejection_reason?: string;
}

export interface VideoCreate {
  video_url: string;
  caption: string;
  tags: string[];
  mature_content?: boolean;
}

export interface VideoUpdate {
  video_url?: string;
  caption?: string;
  tags?: string[];
  mature_content?: boolean;
}

export interface VideoListResponse {
  videos: Video[];
  total: number;
}

export interface VideoApproval {
  approved: boolean;
  rejection_reason?: string;
}
