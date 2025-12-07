"use client";

import { useState, useEffect } from "react";
import { Shot } from "@/types";
import { shotsAPI } from "@/lib/api";
import ShotCard from "@/components/ShotCard";
import UploadShotModal from "@/components/UploadShotModal";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Filter } from "lucide-react";

export default function ShotsPage() {
  const { user } = useAuth();
  const [shots, setShots] = useState<Shot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("approved");
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  useEffect(() => {
    fetchShots();
  }, [statusFilter]);

  const fetchShots = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await shotsAPI.getAll({
        limit: 100,
        status_filter: statusFilter,
      });

      setShots(response.data.shots);
    } catch (error: any) {
      console.error("Error fetching shots:", error);
      setError(error.response?.data?.detail || "Failed to load shots");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    fetchShots();
  };

  const handleLike = (shotId: string, newLikes: number) => {
    setShots((prevShots) =>
      prevShots.map((shot) =>
        shot.id === shotId ? { ...shot, likes: newLikes } : shot
      )
    );
  };

  const handleDelete = (shotId: string) => {
    setShots((prevShots) => prevShots.filter((shot) => shot.id !== shotId));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shots</h1>
            <p className="text-gray-600 mt-1">
              Share and discover amazing images
            </p>
          </div>

          <div className="flex gap-2">
            {/* Filter Button */}
            <div className="relative">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                <Filter className="w-5 h-5" />
                <span className="hidden sm:inline">Filter</span>
              </button>

              {showFilterMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <button
                    onClick={() => {
                      setStatusFilter("approved");
                      setShowFilterMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                      statusFilter === "approved"
                        ? "bg-blue-50 text-blue-600"
                        : ""
                    }`}
                  >
                    Approved
                  </button>
                  {user && (
                    <>
                      <button
                        onClick={() => {
                          setStatusFilter("pending");
                          setShowFilterMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                          statusFilter === "pending"
                            ? "bg-blue-50 text-blue-600"
                            : ""
                        }`}
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => {
                          setStatusFilter("");
                          setShowFilterMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                          statusFilter === "" ? "bg-blue-50 text-blue-600" : ""
                        }`}
                      >
                        All
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Upload Button */}
            {user && (
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Upload Shot</span>
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading shots...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && shots.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">No shots found</p>
            {user && (
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" />
                Upload Your First Shot
              </button>
            )}
          </div>
        )}

        {/* Shots Grid */}
        {!loading && !error && shots.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {shots.map((shot) => (
              <ShotCard
                key={shot.id}
                shot={shot}
                onLike={handleLike}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* Upload Modal */}
      <UploadShotModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
