"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import PointsDisplay from "@/components/PointsDisplay";
import ReferralCard from "@/components/ReferralCard";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { StoryListResponse, Story } from "@/types";
import StoryCard from "@/components/StoryCard";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    drafts: 0,
  });
  const [recentStories, setRecentStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile editing states
  const [isEditing, setIsEditing] = useState(false);
  const [newAnonymousName, setNewAnonymousName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUserStats();
    if (user) {
      setNewAnonymousName(user.anonymous_name);
      setNewEmail(user.email || "");
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!newAnonymousName.trim()) {
      toast.error("Anonymous name cannot be empty");
      return;
    }

    setUpdating(true);
    try {
      const response = await api.put("/api/auth/profile", null, {
        params: {
          anonymous_name: newAnonymousName,
          email: newEmail || undefined,
        },
      });

      if (response.status === 200) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
        // Reload user data
        window.location.reload();
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.detail || "Failed to update profile";
      toast.error(errorMsg);
    } finally {
      setUpdating(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const response = await api.get<StoryListResponse>(
        "/api/stories/my-stories?page=1&page_size=100"
      );
      const stories = response.data.stories;

      setStats({
        total: stories.length,
        approved: stories.filter((s) => s.status === "approved").length,
        pending: stories.filter((s) => s.status === "pending").length,
        rejected: stories.filter((s) => s.status === "rejected").length,
        drafts: stories.filter((s) => s.status === "draft").length,
      });

      // Get 3 most recent stories
      setRecentStories(stories.slice(0, 3));
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-4xl font-bold">
                  {user.anonymous_name[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {user.anonymous_name}
                    </h1>
                    <p className="text-gray-600 mt-1">@{user.username}</p>
                  </div>
                  <a
                    href="/create"
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium flex items-center justify-center gap-2 shadow-sm"
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
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                    Write New Story
                  </a>
                </div>
                <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize">
                    {user.role}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    Member since{" "}
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Statistics */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Your Statistics
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  <div className="bg-white p-6 rounded-lg shadow text-center">
                    <div className="text-3xl font-bold text-gray-900">
                      {stats.total}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Total Stories
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {stats.approved}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Approved</div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow text-center">
                    <div className="text-3xl font-bold text-yellow-600">
                      {stats.pending}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Pending</div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow text-center">
                    <div className="text-3xl font-bold text-gray-600">
                      {stats.drafts}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Drafts</div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow text-center">
                    <div className="text-3xl font-bold text-red-600">
                      {stats.rejected}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Rejected</div>
                  </div>
                </div>
              </div>

              {/* Achievement/Progress */}
              <div className="mb-6 bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Writing Progress
                </h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Stories Published</span>
                      <span className="font-medium text-gray-900">
                        {stats.approved}/{stats.total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{
                          width:
                            stats.total > 0
                              ? `${(stats.approved / stats.total) * 100}%`
                              : "0%",
                        }}
                      ></div>
                    </div>
                  </div>

                  {stats.total >= 5 && (
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-md">
                      <span className="text-2xl">🏆</span>
                      <div>
                        <div className="font-semibold text-gray-900">
                          Prolific Writer!
                        </div>
                        <div className="text-sm text-gray-600">
                          You&apos;ve created {stats.total} stories
                        </div>
                      </div>
                    </div>
                  )}

                  {stats.approved >= 3 && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-md">
                      <span className="text-2xl">⭐</span>
                      <div>
                        <div className="font-semibold text-gray-900">
                          Published Author!
                        </div>
                        <div className="text-sm text-gray-600">
                          {stats.approved} stories approved
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Points and Referral Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <PointsDisplay />
                <ReferralCard />
              </div>

              {/* Recent Stories */}
              {recentStories.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Recent Stories
                    </h2>
                    <a
                      href="/my-stories"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View All →
                    </a>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recentStories.map((story) => (
                      <StoryCard
                        key={story.id}
                        story={story}
                        showStatus={true}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Account Info */}
              <div className="mt-6 bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Account Information
                  </h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Anonymous Name
                      </label>
                      <input
                        type="text"
                        value={newAnonymousName}
                        onChange={(e) => setNewAnonymousName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Your anonymous name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email (for account recovery)
                      </label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="your.email@example.com"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Optional - used for OTP login and account recovery
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleUpdateProfile}
                        disabled={updating}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updating ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setNewAnonymousName(user?.anonymous_name || "");
                          setNewEmail(user?.email || "");
                        }}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {user?.username && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Username</span>
                        <span className="font-medium text-gray-900">
                          {user.username}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Anonymous Name</span>
                      <span className="font-medium text-gray-900">
                        {user?.anonymous_name}
                      </span>
                    </div>
                    {user?.email && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Email</span>
                        <span className="font-medium text-gray-900">
                          {user.email}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Role</span>
                      <span className="font-medium text-gray-900 capitalize">
                        {user?.role}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Member Since</span>
                      <span className="font-medium text-gray-900">
                        {user &&
                          new Date(user.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
