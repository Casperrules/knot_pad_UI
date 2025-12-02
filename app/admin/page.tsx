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
                            <p className="text-gray-900 mb-2">{video.caption}</p>
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
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [matureContent, setMatureContent] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin) {
      router.push("/feed");
      return;
    }
    fetchPendingStories();
  }, [isAdmin, router]);

  const fetchPendingStories = async () => {
    try {
      setLoading(true);
      const response = await storiesAPI.getPending();
      setStories(response.data.stories);
    } catch (error) {
      console.error("Error fetching stories:", error);
      toast.error("Failed to load pending stories");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (storyId: string) => {
    if (!confirm("Are you sure you want to approve this story?")) return;

    setProcessing(true);
    try {
      await storiesAPI.approve(storyId, {
        approved: true,
      });
      toast.success("Story approved successfully!");

      // Update local state
      const updatedStories = stories.filter((s) => s.id !== storyId);
      setStories(updatedStories);
      setSelectedStory(null);
      setMatureContent(false);

      // Refresh the list to ensure sync
      await fetchPendingStories();
    } catch (error) {
      console.error("Approve error:", error);
      toast.error("Failed to approve story");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (storyId: string) => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    if (!confirm("Are you sure you want to reject this story?")) return;

    setProcessing(true);
    try {
      await storiesAPI.approve(storyId, {
        approved: false,
        rejection_reason: rejectionReason.trim(),
      });
      toast.success("Story rejected");

      // Update local state
      const updatedStories = stories.filter((s) => s.id !== storyId);
      setStories(updatedStories);
      setSelectedStory(null);
      setRejectionReason("");

      // Refresh the list to ensure sync
      await fetchPendingStories();
    } catch (error) {
      console.error("Reject error:", error);
      toast.error("Failed to reject story");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (storyId: string) => {
    if (
      !confirm(
        "Are you sure you want to permanently delete this story? This action cannot be undone."
      )
    )
      return;

    setProcessing(true);
    try {
      await storiesAPI.delete(storyId);
      toast.success("Story deleted successfully");

      // Update local state
      const updatedStories = stories.filter((s) => s.id !== storyId);
      setStories(updatedStories);
      setSelectedStory(null);

      // Refresh the list to ensure sync
      await fetchPendingStories();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete story");
    } finally {
      setProcessing(false);
    }
  };

  const handleSelectStory = (story: Story) => {
    setSelectedStory(story);
    setMatureContent(story.mature_content);
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
              Review and moderate pending stories
            </p>
          </div>

          {/* Stats */}
          <div className="mb-6 bg-white p-4 md:p-6 rounded-lg shadow">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gray-900">
                {stories.length}
              </div>
              <div className="text-sm md:text-base text-gray-600">
                Stories Pending Review
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : stories.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Stories List */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Pending Reviews
                </h2>
                {stories.map((story) => (
                  <div
                    key={story.id}
                    onClick={() => handleSelectStory(story)}
                    className={`bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow ${
                      selectedStory?.id === story.id
                        ? "ring-2 ring-indigo-500"
                        : ""
                    }`}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {story.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {story.description}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        By {story.author_anonymous_name}
                      </span>
                      <span className="text-gray-400">
                        {new Date(story.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {story.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {story.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Story Detail & Actions */}
              <div className="lg:sticky lg:top-4 lg:h-fit">
                {selectedStory ? (
                  <div className="bg-white p-6 rounded-lg shadow space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedStory.title}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>By {selectedStory.author_anonymous_name}</span>
                        <span>•</span>
                        <span>
                          {new Date(
                            selectedStory.created_at
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {selectedStory.images.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900">Images</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {selectedStory.images.map((img, index) => (
                            <div
                              key={index}
                              className="relative h-32 rounded-md overflow-hidden"
                            >
                              <Image
                                src={`${process.env.NEXT_PUBLIC_API_URL}${img.url}`}
                                alt={img.caption || "Story image"}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Content
                      </h3>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {selectedStory.content}
                        </p>
                      </div>
                    </div>

                    {selectedStory.tags.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedStory.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Moderation Actions
                      </h3>

                      {/* Mature Content Toggle */}
                      <div className="mb-4">
                        <label className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg cursor-pointer hover:bg-red-100 transition">
                          <input
                            type="checkbox"
                            checked={matureContent}
                            onChange={(e) => setMatureContent(e.target.checked)}
                            className="mt-1 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                              <span className="font-medium text-red-900">
                                Mark as Mature Content (18+)
                              </span>
                            </div>
                            <p className="text-xs text-red-700 mt-1">
                              Readers will be shown an age verification warning
                              before viewing this story
                            </p>
                          </div>
                        </label>
                      </div>

                      {/* Rejection Reason */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rejection Reason (if rejecting)
                        </label>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          placeholder="Provide a reason for rejection..."
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleApprove(selectedStory.id)}
                            disabled={processing}
                            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                          >
                            ✓ Approve Story
                          </button>
                          <button
                            onClick={() => handleReject(selectedStory.id)}
                            disabled={processing || !rejectionReason.trim()}
                            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                          >
                            ✗ Reject Story
                          </button>
                        </div>
                        <button
                          onClick={() => handleDelete(selectedStory.id)}
                          disabled={processing}
                          className="w-full px-4 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                        >
                          🗑️ Delete Story Permanently
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-12 rounded-lg shadow text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                      />
                    </svg>
                    <p className="mt-4 text-gray-500">
                      Select a story to review
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                All caught up!
              </h3>
              <p className="mt-1 text-gray-500">
                No pending stories to review at the moment.
              </p>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
