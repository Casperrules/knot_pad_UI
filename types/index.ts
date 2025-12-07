export interface User {
  id: string;
  username?: string;
  anonymous_name: string;
  email?: string;
  role: "admin" | "user";
  created_at: string;
  points?: number;
  referral_code?: string;
  referral_count?: number;
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
  referral_code?: string;
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
  likes: number;
  is_liked: boolean;
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
  is_liked: boolean;
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

// Points and Referral Types
export interface UserStats {
  user_id: string;
  username?: string;
  anonymous_name: string;
  points: number;
  referral_code: string;
  referral_count: number;
  stories_count: number;
  videos_count: number;
  total_likes_received: number;
  total_story_likes: number;
  total_video_likes: number;
  total_comment_likes: number;
}

export interface PointsBreakdown {
  referral_points: number;
  story_points: number;
  like_points: number;
  total_points: number;
}

export interface ReferralInfo {
  referral_code: string;
  referral_count: number;
  referral_link: string;
}

export interface ShareLink {
  share_url: string;
  title: string;
  description: string;
  author?: string;
}

export interface LikeResponse {
  liked: boolean;
  total_likes: number;
  points_earned?: number;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  anonymous_name: string;
  username?: string;
  points: number;
  referral_count: number;
  is_current_user: boolean;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  total: number;
}
export interface VideoApproval {
  approved: boolean;
  rejection_reason?: string;
}

// Shot (Image Post) Types
export interface Shot {
  id: string;
  image_url: string;
  caption: string;
  tags: string[];
  mature_content: boolean;
  author_anonymous_name: string;
  author_id?: string;
  likes: number;
  views: number;
  is_liked: boolean;
  status: "draft" | "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
  rejection_reason?: string;
}

export interface ShotCreate {
  image_url: string;
  caption: string;
  tags: string[];
  mature_content?: boolean;
}

export interface ShotUpdate {
  caption?: string;
  tags?: string[];
  mature_content?: boolean;
}

export interface ShotListResponse {
  shots: Shot[];
  total: number;
}

export interface ShotApproval {
  approved: boolean;
  rejection_reason?: string;
}
