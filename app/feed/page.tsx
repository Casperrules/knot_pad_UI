"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import StoryCard from "@/components/StoryCard";
import { storiesAPI } from "@/lib/api";
import { StoryListResponse } from "@/types";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Search, X } from "lucide-react";

export default function FeedPage() {
  const [stories, setStories] = useState<StoryListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const response = await storiesAPI.getAll({
        page,
        page_size: 12,
        search: searchQuery || undefined,
      });
      setStories(response.data);
    } catch (error) {
      toast.error("Failed to load feed");
      console.error("Error fetching feed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchFeed();
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setPage(1);
    setTimeout(fetchFeed, 0);
  };

  const handleDelete = async (id: string) => {
    try {
      await storiesAPI.delete(id);
      toast.success("Story deleted successfully");
      fetchFeed();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete story");
    }
  };

  const totalPages = stories ? Math.ceil(stories.total / 12) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Discover Stories
          </h1>
          <p className="mt-2 text-sm md:text-base text-gray-600">
            Explore approved stories from our community
          </p>

          {/* Search Bar */}
          <div className="mt-4 md:mt-6 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search stories by title or tags..."
                className="w-full pl-10 pr-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500"
              />
            </div>
            {searchQuery ? (
              <button
                onClick={handleClearSearch}
                className="px-4 py-2.5 md:py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            ) : (
              <button
                onClick={handleSearch}
                className="px-4 md:px-6 py-2.5 md:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition"
              >
                Search
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : stories && stories.stories.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-4 md:gap-6">
              {stories.stories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  onDelete={isAdmin ? handleDelete : undefined}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 md:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm md:text-base transition"
                >
                  Previous
                </button>
                <span className="px-3 md:px-4 py-2 text-sm md:text-base text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages}
                  className="px-3 md:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm md:text-base transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500 text-base md:text-lg">
              {searchQuery ? "No stories found" : "No stories available yet"}
            </p>
            <p className="text-gray-400 text-sm md:text-base mt-2">
              {searchQuery
                ? "Try a different search"
                : "Be the first to create one!"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
