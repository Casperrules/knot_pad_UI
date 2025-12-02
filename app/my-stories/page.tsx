"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import StoryCard from "@/components/StoryCard";
import { storiesAPI } from "@/lib/api";
import { Story } from "@/types";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";

export default function MyStoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "draft" | "pending" | "approved" | "rejected"
  >("all");
  const router = useRouter();

  useEffect(() => {
    fetchMyStories();
  }, []);

  const fetchMyStories = async () => {
    try {
      setLoading(true);
      const response = await storiesAPI.getMyStories();
      setStories(response.data.stories);
    } catch (error) {
      console.error("Error fetching stories:", error);
      toast.error("Failed to load stories");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (story: Story) => {
    router.push(`/story/${story.id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      await storiesAPI.delete(id);
      toast.success("Story deleted successfully");
      setStories(stories.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete story");
    }
  };

  const filteredStories =
    filter === "all" ? stories : stories.filter((s) => s.status === filter);

  const getStatusCount = (status: string) => {
    return stories.filter((s) => s.status === status).length;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  My Stories
                </h1>
                <p className="mt-2 text-sm md:text-base text-gray-600">
                  Manage your stories and track their status
                </p>
              </div>
              <button
                onClick={() => router.push("/create")}
                className="flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition"
              >
                <Plus className="w-5 h-5" />
                <span>Create New Story</span>
              </button>
            </div>

            {/* Stats Cards */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3 md:gap-4">
              <div className="bg-white p-3 md:p-4 rounded-lg shadow text-center">
                <div className="text-xl md:text-2xl font-bold text-gray-900">
                  {stories.length}
                </div>
                <div className="text-xs md:text-sm text-gray-600">Total</div>
              </div>
              <div className="bg-white p-3 md:p-4 rounded-lg shadow text-center">
                <div className="text-xl md:text-2xl font-bold text-gray-600">
                  {getStatusCount("draft")}
                </div>
                <div className="text-xs md:text-sm text-gray-600">Drafts</div>
              </div>
              <div className="bg-white p-3 md:p-4 rounded-lg shadow text-center">
                <div className="text-xl md:text-2xl font-bold text-yellow-600">
                  {getStatusCount("pending")}
                </div>
                <div className="text-xs md:text-sm text-gray-600">Pending</div>
              </div>
              <div className="bg-white p-3 md:p-4 rounded-lg shadow text-center">
                <div className="text-xl md:text-2xl font-bold text-green-600">
                  {getStatusCount("approved")}
                </div>
                <div className="text-xs md:text-sm text-gray-600">Approved</div>
              </div>
              <div className="bg-white p-3 md:p-4 rounded-lg shadow text-center">
                <div className="text-xl md:text-2xl font-bold text-red-600">
                  {getStatusCount("rejected")}
                </div>
                <div className="text-xs md:text-sm text-gray-600">Rejected</div>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="mt-6 flex flex-wrap gap-2">
              {["all", "draft", "pending", "approved", "rejected"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as typeof filter)}
                  className={`px-3 md:px-4 py-2 rounded-lg font-medium text-sm md:text-base transition ${
                    filter === f
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredStories.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:gap-6">
              {filteredStories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  showStatus
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500 text-base md:text-lg">
                {filter === "all"
                  ? "You haven't created any stories yet"
                  : `No ${filter} stories`}
              </p>
              <button
                onClick={() => router.push("/create")}
                className="mt-4 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition"
              >
                Create Your First Story
              </button>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
              </div>
              <div className="bg-white p-4 rounded-lg shadow text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {getStatusCount("draft")}
                </div>
                <div className="text-sm text-gray-600">Drafts</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {getStatusCount("pending")}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow text-center">
                <div className="text-2xl font-bold text-green-600">
                  {getStatusCount("approved")}
                </div>
                <div className="text-sm text-gray-600">Approved</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow text-center">
                <div className="text-2xl font-bold text-red-600">
                  {getStatusCount("rejected")}
                </div>
                <div className="text-sm text-gray-600">Rejected</div>
              </div>
            </div>

            {/* Filters */}
            <div className="mt-6 flex flex-wrap gap-2">
              {["all", "draft", "pending", "approved", "rejected"].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status as typeof filter)}
                    className={`px-4 py-2 rounded-md font-medium capitalize ${
                      filter === status
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {status}
                  </button>
                )
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredStories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredStories.map((story) => (
                <div key={story.id} className="relative">
                  <StoryCard
                    story={story}
                    showStatus={true}
                    onEdit={
                      story.status === "draft" || story.status === "rejected"
                        ? handleEdit
                        : undefined
                    }
                    onDelete={handleDelete}
                  />
                  {story.status === "draft" && (
                    <button
                      onClick={() => handleSubmit(story.id)}
                      className="mt-2 w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                    >
                      Submit for Approval
                    </button>
                  )}
                  {story.status === "rejected" && (
                    <button
                      onClick={() => handleSubmit(story.id)}
                      className="mt-2 w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm font-medium"
                    >
                      Resubmit for Approval
                    </button>
                  )}
                </div>
              ))}
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No stories found
              </h3>
              <p className="mt-1 text-gray-500">
                {filter === "all"
                  ? "You haven't created any stories yet."
                  : `No stories with status "${filter}".`}
              </p>
              <button
                onClick={() => router.push("/create")}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Create Your First Story
              </button>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
