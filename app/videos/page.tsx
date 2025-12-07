"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { videosAPI } from "@/lib/api";
import type { Video } from "@/types";
import VideoCard from "@/components/VideoCard";
import UploadVideoModal from "@/components/UploadVideoModal";
import Navbar from "@/components/Navbar";
import { useSearchParams, useRouter } from "next/navigation";

function VideosContent() {
  const { user, loading: authLoading } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await videosAPI.getAll({
        page,
        page_size: 10,
        search: search || undefined,
      });
      setVideos(response.data.videos);
      setTotal(response.data.total);
    } catch (error) {
      console.error("Failed to fetch videos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [page, search]);

  // Check URL params to auto-open upload modal
  useEffect(() => {
    if (searchParams.get("upload") === "true" && user) {
      setShowUploadModal(true);
      // Clean up URL
      router.replace("/videos", { scroll: false });
    }
  }, [searchParams, user, router]);

  const handleVideoUploaded = () => {
    setShowUploadModal(false);
    fetchVideos();
  };

  const handleVideoDeleted = () => {
    fetchVideos();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <Navbar />
      {authLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <>
          <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Snippets
              </h1>
              <p className="text-gray-600 mb-6">
                Discover short video stories from our community
              </p>

              {/* Search and Upload */}
              <div className="flex gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder-gray-500"
                />
                {user && (
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md"
                  >
                    Upload Video
                  </button>
                )}
              </div>
            </div>

            {/* Videos Feed */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {search
                    ? "No videos found"
                    : "No videos yet. Be the first to upload!"}
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {videos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onDelete={handleVideoDeleted}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {total > 10 && (
              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Page {page} of {Math.ceil(total / 10)}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(total / 10)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Upload Modal */}
          {showUploadModal && (
            <UploadVideoModal
              onClose={() => setShowUploadModal(false)}
              onSuccess={handleVideoUploaded}
            />
          )}
        </>
      )}
    </div>
  );
}

export default function VideosPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
          <Navbar />
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        </div>
      }
    >
      <VideosContent />
    </Suspense>
  );
}
