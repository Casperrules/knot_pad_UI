"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import StoryCard from "@/components/StoryCard";
import api from "@/lib/api";
import { StoryListResponse } from "@/types";
import toast from "react-hot-toast";

export default function AuthorPage() {
  const params = useParams();
  const router = useRouter();
  const authorId = params.id as string;

  const [stories, setStories] = useState<StoryListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchAuthorStories();
  }, [page, authorId]);

  const fetchAuthorStories = async () => {
    try {
      setLoading(true);
      const response = await api.get<StoryListResponse>(
        `/api/stories/author/${authorId}?page=${page}&page_size=12`
      );
      setStories(response.data);
    } catch (error) {
      toast.error("Failed to load author stories");
      console.error("Error fetching author stories:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stories) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const authorName = stories?.stories[0]?.author_anonymous_name || "Author";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Stories by {authorName}
          </h1>
          <p className="mt-2 text-gray-600">
            {stories?.total || 0} published{" "}
            {stories?.total === 1 ? "story" : "stories"}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : stories && stories.stories.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {stories.stories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>

            {/* Pagination */}
            {stories.page_size && stories.total > stories.page_size && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 bg-white border border-gray-300 rounded-md">
                  Page {page} of {Math.ceil(stories.total / stories.page_size)}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={
                    page >= Math.ceil(stories.total / stories.page_size)
                  }
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">
              No stories found for this author.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
