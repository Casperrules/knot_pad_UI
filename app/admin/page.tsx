"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { storiesAPI, videosAPI, commentsAPI } from "@/lib/api";
import { Story, Video, Comment } from "@/types";
import toast from "react-hot-toast";

type ContentType = "stories" | "videos" | "comments";

export default function AdminPage() {
  const [contentType, setContentType] = useState<ContentType>("stories");
  const [stories, setStories] = useState<Story[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin) {
      router.push("/feed");
      return;
    }
    fetchContent();
  }, [isAdmin, router, contentType]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      if (contentType === "stories") {
        const response = await storiesAPI.getAll({ page_size: 50 });
        setStories(response.data.stories);
      } else if (contentType === "videos") {
        const response = await videosAPI.getAll({ page_size: 50 });
        setVideos(response.data.videos);
      }
    } catch (error) {
      console.error("Error fetching content:", error);
      toast.error("Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    if (
      !confirm(
        "Are you sure you want to permanently delete this story? This action cannot be undone."
      )
    )
      return;

    try {
      await storiesAPI.delete(storyId);
      toast.success("Story deleted successfully");
      setStories(stories.filter((s) => s.id !== storyId));
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete story");
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (
      !confirm(
        "Are you sure you want to permanently delete this video? This action cannot be undone."
      )
    )
      return;

    try {
      await videosAPI.delete(videoId);
      toast.success("Video deleted successfully");
      setVideos(videos.filter((v) => v.id !== videoId));
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete video");
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Admin Panel
            </h1>
            <p className="mt-2 text-sm md:text-base text-gray-600">
              Moderate and manage platform content
            </p>
          </div>

          {/* Content Type Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setContentType("stories")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  contentType === "stories"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Stories
              </button>
              <button
                onClick={() => setContentType("videos")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  contentType === "videos"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Videos
              </button>
            </nav>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Stories */}
              {contentType === "stories" && (
                <div className="space-y-4">
                  {stories.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                      <p className="text-gray-500">No stories found</p>
                    </div>
                  ) : (
                    stories.map((story) => (
                      <div
                        key={story.id}
                        className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              {story.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-3">
                              {story.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>By {story.author_anonymous_name}</span>
                              <span>•</span>
                              <span>{story.chapter_count} chapters</span>
                              <span>•</span>
                              <span>{story.total_reads} reads</span>
                            </div>
                            {story.tags.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {story.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                                {story.mature_content && (
                                  <span className="px-2 py-1 bg-red-50 text-red-600 text-xs rounded-full">
                                    18+
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteStory(story.id)}
                            className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete story"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Videos */}
              {contentType === "videos" && (
                <div className="space-y-4">
                  {videos.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                      <p className="text-gray-500">No videos found</p>
                    </div>
                  ) : (
                    videos.map((video) => (
                      <div
                        key={video.id}
                        className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                      >
                        <div className="flex gap-4">
                          <div className="flex-shrink-0">
                            <video
                              src={video.video_url}
                              className="w-32 h-48 object-cover rounded-lg"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-900 mb-2">
                              {video.caption}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                              <span>By {video.author_anonymous_name}</span>
                              <span>•</span>
                              <span>{video.likes} likes</span>
                              <span>•</span>
                              <span>{video.views} views</span>
                            </div>
                            {video.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {video.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded-full"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                                {video.mature_content && (
                                  <span className="px-2 py-1 bg-red-50 text-red-600 text-xs rounded-full">
                                    18+
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteVideo(video.id)}
                            className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors self-start"
                            title="Delete video"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
