"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import { Story } from "@/types";
import toast from "react-hot-toast";
import Image from "next/image";

export default function StoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const storyId = params?.id as string;

  const fetchStory = async () => {
    try {
      setLoading(true);
      const response = await api.get<Story>(`/api/stories/${storyId}`);
      setStory(response.data);
    } catch (error) {
      console.error("Error fetching story:", error);
      const apiError = error as { response?: { status?: number } };
      if (apiError.response?.status === 404) {
        toast.error("Story not found");
      } else if (apiError.response?.status === 403) {
        toast.error("You do not have permission to view this story");
      } else {
        toast.error("Failed to load story");
      }
      router.push("/feed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storyId) {
      fetchStory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      approved: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      rejected: "bg-red-100 text-red-800",
      draft: "bg-gray-100 text-gray-800",
    };
    return styles[status as keyof typeof styles] || styles.draft;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : story ? (
            <article className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Story Header */}
              <div className="p-6 sm:p-8">
                <div className="mb-4">
                  <button
                    onClick={() => router.back()}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Back
                  </button>
                </div>

                <div className="flex items-start justify-between gap-4 mb-4">
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                    {story.title}
                  </h1>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                      story.status
                    )}`}
                  >
                    {story.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {story.author_anonymous_name[0].toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {story.author_anonymous_name}
                    </span>
                  </div>
                  <span>•</span>
                  <span>
                    {formatDate(story.published_at || story.created_at)}
                  </span>
                  {story.updated_at !== story.created_at && (
                    <>
                      <span>•</span>
                      <span className="text-gray-500">
                        Updated {formatDate(story.updated_at)}
                      </span>
                    </>
                  )}
                </div>

                {/* Tags */}
                {story.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {story.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-blue-50 text-blue-600 text-sm font-medium rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Rejection Reason */}
                {story.rejection_reason && story.status === "rejected" && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex gap-3">
                      <svg
                        className="w-5 h-5 text-red-600 shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <h3 className="text-sm font-semibold text-red-800 mb-1">
                          Story Rejected
                        </h3>
                        <p className="text-sm text-red-700">
                          {story.rejection_reason}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Story Images */}
              {story.images.length > 0 && (
                <div className="px-6 sm:px-8 mb-6">
                  <div
                    className={`grid gap-4 ${
                      story.images.length === 1 ? "grid-cols-1" : "grid-cols-2"
                    }`}
                  >
                    {story.images.map((img, index) => (
                      <div key={index} className="space-y-2">
                        <div
                          className={`relative ${
                            story.images.length === 1 ? "h-96" : "h-64"
                          } rounded-lg overflow-hidden`}
                        >
                          <Image
                            src={`${process.env.NEXT_PUBLIC_API_URL}${img.url}`}
                            alt={img.caption || `Story image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        {img.caption && (
                          <p className="text-sm text-gray-600 italic text-center">
                            {img.caption}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Story Content */}
              <div className="px-6 sm:px-8 pb-8">
                <div className="prose prose-lg max-w-none">
                  <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {story.content}
                  </div>
                </div>
              </div>

              {/* Story Footer */}
              <div className="px-6 sm:px-8 py-6 bg-gray-50 border-t">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Published on{" "}
                    {formatDate(story.published_at || story.created_at)}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => router.push("/feed")}
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
                    >
                      Back to Feed
                    </button>
                    {story.status === "approved" && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          toast.success("Link copied to clipboard!");
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium flex items-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                          />
                        </svg>
                        Share
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </article>
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                Story not found
              </h3>
              <p className="mt-1 text-gray-500">
                The story you&apos;re looking for doesn&apos;t exist or has been
                removed.
              </p>
              <button
                onClick={() => router.push("/feed")}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Browse Stories
              </button>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
