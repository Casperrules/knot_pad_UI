import axios, { AxiosError } from "axios";
import type {
  LoginData,
  RegisterData,
  TokenResponse,
  User,
  Story,
  StoryCreate,
  StoryUpdate,
  StoryListResponse,
  Chapter,
  ChapterCreate,
  ChapterUpdate,
  Comment,
  StoryApproval,
  Video,
  VideoCreate,
  VideoUpdate,
  VideoListResponse,
  VideoApproval,
  UserStats,
  PointsBreakdown,
  ReferralInfo,
  ShareLink,
  LikeResponse,
  LeaderboardResponse,
  Shot,
  ShotCreate,
  ShotUpdate,
  ShotListResponse,
  ShotApproval,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Don't try to refresh token for login/register/refresh endpoints
    if (
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register") ||
      originalRequest.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const response = await axios.post(`${API_URL}/api/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token } = response.data;
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", refresh_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token failed, logout user
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data: LoginData) => api.post<TokenResponse>("/api/auth/login", data),
  register: (data: RegisterData) =>
    api.post<TokenResponse>("/api/auth/register", data),
  getCurrentUser: () => api.get<User>("/api/auth/me"),
  logout: () => api.post("/api/auth/logout"),
};

// Stories API
export const storiesAPI = {
  getAll: (params?: { page?: number; page_size?: number; search?: string }) =>
    api.get<StoryListResponse>("/api/stories/", { params }),
  getById: (id: string) => api.get<Story>(`/api/stories/${id}`),
  create: (data: StoryCreate) => api.post<Story>("/api/stories/", data),
  update: (id: string, data: StoryUpdate) =>
    api.put<Story>(`/api/stories/${id}`, data),
  delete: (id: string) => api.delete(`/api/stories/${id}`),
  getMyStories: () => api.get<StoryListResponse>("/api/stories/my-stories"),
  getByAuthor: (authorId: string) =>
    api.get<StoryListResponse>(`/api/stories/author/${authorId}`),
};

// Chapters API
export const chaptersAPI = {
  getByStory: (storyId: string) =>
    api.get<Chapter[]>(`/api/chapters/story/${storyId}`),
  getById: (id: string) => api.get<Chapter>(`/api/chapters/${id}`),
  create: (storyId: string, data: ChapterCreate) =>
    api.post<Chapter>(`/api/chapters/`, { ...data, story_id: storyId }),
  update: (id: string, data: ChapterUpdate) =>
    api.put<Chapter>(`/api/chapters/${id}`, data),
  delete: (id: string) => api.delete(`/api/chapters/${id}`),
  publish: (id: string) => api.post<Chapter>(`/api/chapters/${id}/publish`),
};

// Comments API
export const commentsAPI = {
  getByStory: (storyId: string) =>
    api.get<Comment[]>(`/api/comments/story/${storyId}`),
  getByChapter: (chapterId: string) =>
    api.get<Comment[]>(`/api/comments/chapter/${chapterId}`),
  getByVideo: (videoId: string) =>
    api.get<Comment[]>(`/api/comments/video/${videoId}`),
  create: (data: {
    story_id?: string;
    chapter_id?: string;
    video_id?: string;
    content: string;
    parent_id?: string;
    selected_text?: string;
    text_position?: number;
  }) => api.post<Comment>("/api/comments/", data),
  update: (id: string, content: string) =>
    api.put<Comment>(`/api/comments/${id}`, { content }),
  delete: (id: string) => api.delete(`/api/comments/${id}`),
};

// Videos API
export const videosAPI = {
  getAll: (params?: { page?: number; page_size?: number; search?: string }) =>
    api.get<VideoListResponse>("/api/videos/", { params }),
  getById: (id: string) => api.get<Video>(`/api/videos/${id}`),
  create: (data: VideoCreate) => api.post<Video>("/api/videos/", data),
  update: (id: string, data: VideoUpdate) =>
    api.put<Video>(`/api/videos/${id}`, data),
  delete: (id: string) => api.delete(`/api/videos/${id}`),
  getMyVideos: () => api.get<VideoListResponse>("/api/videos/my-videos"),
  like: (id: string) => api.post<LikeResponse>(`/api/videos/${id}/like`),
  checkLiked: (id: string) =>
    api.get<{ liked: boolean }>(`/api/videos/${id}/liked`),
  getShareLink: (id: string) => api.get<ShareLink>(`/api/videos/${id}/share`),
};

// Stories API - add like and share
export const storiesLikeAPI = {
  like: (id: string) => api.post<LikeResponse>(`/api/stories/${id}/like`),
  getShareLink: (id: string) => api.get<ShareLink>(`/api/stories/${id}/share`),
};

// Comments API - add like
export const commentsLikeAPI = {
  like: (id: string) => api.post<LikeResponse>(`/api/comments/${id}/like`),
};

// User Stats and Referral API
export const userStatsAPI = {
  getMyStats: () => api.get<UserStats>("/api/users/me/stats"),
  getMyPointsBreakdown: () => api.get<PointsBreakdown>("/api/users/me/points"),
  getMyReferralInfo: () => api.get<ReferralInfo>("/api/users/me/referral"),
  getLeaderboard: (limit: number = 50) =>
    api.get<LeaderboardResponse>("/api/users/leaderboard", {
      params: { limit },
    }),
  getUserStats: (userId: string) =>
    api.get<UserStats>(`/api/users/${userId}/stats`),
  getMyLikedPosts: () => api.get("/api/users/me/liked-posts"),
};

// Shots API
export const shotsAPI = {
  getAll: (params?: {
    skip?: number;
    limit?: number;
    status_filter?: string;
  }) => api.get<ShotListResponse>("/api/shots/", { params }),
  getById: (id: string) => api.get<Shot>(`/api/shots/${id}`),
  create: (data: ShotCreate) => api.post<Shot>("/api/shots/", data),
  update: (id: string, data: ShotUpdate) =>
    api.put<Shot>(`/api/shots/${id}`, data),
  delete: (id: string) => api.delete(`/api/shots/${id}`),
  getMyShots: (params?: { skip?: number; limit?: number }) =>
    api.get<ShotListResponse>("/api/shots/my-shots", { params }),
  like: (id: string) => api.post<LikeResponse>(`/api/shots/${id}/like`),
  getShareLink: (id: string) =>
    api.get<{ share_link: string }>(`/api/shots/${id}/share-link`),
  // Admin endpoints
  approve: (id: string, data: ShotApproval) =>
    api.put<Shot>(`/api/shots/${id}/approval`, data),
  getPending: (params?: { skip?: number; limit?: number }) =>
    api.get<ShotListResponse>("/api/shots/pending/all", { params }),
};

export default api;
