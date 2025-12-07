"use client";

import { useState, useEffect } from "react";
import { userStatsAPI } from "@/lib/api";
import type { UserStats, PointsBreakdown } from "@/types";

export default function PointsDisplay() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [breakdown, setBreakdown] = useState<PointsBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, breakdownRes] = await Promise.all([
        userStatsAPI.getMyStats(),
        userStatsAPI.getMyPointsBreakdown(),
      ]);
      setStats(statsRes.data);
      setBreakdown(breakdownRes.data);
    } catch (error) {
      console.error("Failed to fetch points data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  if (!stats || !breakdown) return null;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 border border-blue-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Your Points</h2>
          <p className="text-sm text-gray-600">
            Track your achievements and rewards
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl px-6 py-4 shadow-lg">
          <div className="text-4xl font-bold text-white">{stats.points}</div>
          <div className="text-xs text-blue-100 text-center mt-1">
            Total Points
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-purple-600">
            {stats.stories_count}
          </div>
          <div className="text-xs text-gray-600 mt-1">Stories Posted</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-pink-600">
            {stats.videos_count}
          </div>
          <div className="text-xs text-gray-600 mt-1">Videos Posted</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-green-600">
            {stats.referral_count}
          </div>
          <div className="text-xs text-gray-600 mt-1">Referrals</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-orange-600">
            {stats.total_likes_received}
          </div>
          <div className="text-xs text-gray-600 mt-1">Total Likes</div>
        </div>
      </div>

      {/* Points Breakdown Toggle */}
      <button
        onClick={() => setShowBreakdown(!showBreakdown)}
        className="w-full flex items-center justify-between bg-white rounded-lg px-4 py-3 hover:bg-gray-50 transition"
      >
        <span className="text-sm font-medium text-gray-700">
          Points Breakdown
        </span>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${
            showBreakdown ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Breakdown Details */}
      {showBreakdown && (
        <div className="mt-4 bg-white rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-700">Referral Points</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {breakdown.referral_points}
            </span>
          </div>
          <div className="text-xs text-gray-500 pl-4">
            {stats.referral_count} referrals × 10 points
          </div>

          <div className="flex justify-between items-center pt-2 border-t">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span className="text-sm text-gray-700">Story Points</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {breakdown.story_points}
            </span>
          </div>
          <div className="text-xs text-gray-500 pl-4">
            {stats.stories_count} stories × 1 point
          </div>

          <div className="flex justify-between items-center pt-2 border-t">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span className="text-sm text-gray-700">Like Points</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {breakdown.like_points}
            </span>
          </div>
          <div className="text-xs text-gray-500 pl-4">
            {stats.total_likes_received} likes ÷ 1000
          </div>

          <div className="flex justify-between items-center pt-3 border-t-2 border-blue-200">
            <span className="text-sm font-bold text-gray-900">
              Total Points
            </span>
            <span className="text-lg font-bold text-blue-600">
              {breakdown.total_points}
            </span>
          </div>
        </div>
      )}

      {/* Like Stats */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="bg-white bg-opacity-60 rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-purple-600">
            {stats.total_story_likes}
          </div>
          <div className="text-xs text-gray-600 mt-1">Story Likes</div>
        </div>
        <div className="bg-white bg-opacity-60 rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-pink-600">
            {stats.total_video_likes}
          </div>
          <div className="text-xs text-gray-600 mt-1">Video Likes</div>
        </div>
        <div className="bg-white bg-opacity-60 rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-blue-600">
            {stats.total_comment_likes}
          </div>
          <div className="text-xs text-gray-600 mt-1">Comment Likes</div>
        </div>
      </div>
    </div>
  );
}
