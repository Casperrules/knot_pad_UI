"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import StoryCard from "@/components/StoryCard";
import api from "@/lib/api";
import { StoryListResponse } from "@/types";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function FeedPage() {
  const [stories, setStories] = useState<StoryListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const { isAdmin, user } = useAuth();

  useEffect(() => {
    fetchFeed();
  }, [page]);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const searchParam = searchQuery
        ? `&search=${encodeURIComponent(searchQuery)}`
        : "";
      const response = await api.get<StoryListResponse>(
        `/api/stories/feed?page=${page}&page_size=12${searchParam}`
      );
      setStories(response.data);
    } catch (error) {
      toast.error("Failed to load feed");
      console.error("Error fetching feed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this story? This action cannot be undone."
      )
    )
      return;

    try {
      await api.delete(`/api/stories/${id}`);
      toast.success("Story deleted successfully");
      fetchFeed(); // Refresh the feed
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete story");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Discover Stories</h1>
          <p className="mt-2 text-gray-600">
            Explore approved stories from our community
          </p>

          {/* Search Bar */}
          <div className="mt-6 flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && fetchFeed()}
              placeholder="Search stories by title, content, or tags..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
            />
            <button
              onClick={fetchFeed}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Search
            </button>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setPage(1);
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : stories && stories.stories.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {stories.stories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  onDelete={isAdmin ? handleDelete : undefined}
                />
              ))}
            </div>

            {/* Pagination */}
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
                disabled={page >= Math.ceil(stories.total / stories.page_size)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No stories available yet.</p>
            <p className="text-gray-400 mt-2">Be the first to create one!</p>
          </div>
        )}
      </main>
    </div>
  );
}
