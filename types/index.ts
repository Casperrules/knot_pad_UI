export interface User {
  id: string;
  username: string;
  anonymous_name: string;
  role: "admin" | "user";
  gender_preference: "biological_male" | "biological_female" | "all";
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  anonymous_name?: string;
}

export interface StoryImage {
  url: string;
  caption?: string;
}

export interface Story {
  id: string;
  title: string;
  content: string;
  author_anonymous_name: string;
  author_id?: string;
  images: StoryImage[];
  tags: string[];
  gender_category: "biological_male" | "biological_female" | "all";
  status: "draft" | "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
  published_at?: string;
  rejection_reason?: string;
}

export interface StoryCreate {
  title: string;
  content: string;
  images: StoryImage[];
  tags: string[];
  gender_category?: "biological_male" | "biological_female" | "all";
}

export interface StoryUpdate {
  title?: string;
  content?: string;
  images?: StoryImage[];
  tags?: string[];
}

export interface StoryListResponse {
  stories: Story[];
  total: number;
  page: number;
  page_size: number;
}

export interface StoryApproval {
  approved: boolean;
  rejection_reason?: string;
  gender_category?: "biological_male" | "biological_female" | "all";
}
