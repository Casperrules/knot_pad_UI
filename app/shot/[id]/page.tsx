"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Shot } from "@/types";
import { shotsAPI, commentsAPI } from "@/lib/api";
import { Heart, MessageCircle, Share2, Eye, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import CommentSection from "@/components/CommentSection";

export default function ShotDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const shotId = params.id as string;

  const [shot, setShot] = useState<Shot | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    fetchShot();
  }, [shotId]);

  const fetchShot = async () => {
    try {
      const response = await shotsAPI.getById(shotId);
      setShot(response.data);
      setIsLiked(response.data.is_liked);
      setLikes(response.data.likes);
    } catch (error) {
      console.error("Error fetching shot:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert("Please login to like shots");
      return;
    }

    try {
      const response = await shotsAPI.like(shotId);
      const newIsLiked = response.data.liked;
      const newLikes =
        (response.data as any).likes ||
        response.data.total_likes ||
        likes + (newIsLiked ? 1 : -1);

      setIsLiked(newIsLiked);
      setLikes(newLikes);

      if (shot) {
        setShot({ ...shot, likes: newLikes, is_liked: newIsLiked });
      }
    } catch (error) {
      console.error("Error liking shot:", error);
      alert("Failed to like shot");
    }
  };

  const handleShare = async () => {
    try {
      const response = await shotsAPI.getShareLink(shotId);
      const shareLink = response.data.share_link;

      if (navigator.share) {
        await navigator.share({
          title: `Shot by ${shot?.author_anonymous_name}`,
          text: shot?.caption,
          url: shareLink,
        });
      } else {
        await navigator.clipboard.writeText(shareLink);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing shot:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading shot...</p>
        </div>
      </div>
    );
  }

  if (!shot) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Shot not found
          </h1>
          <button
            onClick={() => router.push("/shots")}
            className="text-purple-600 hover:text-purple-700"
          >
            Back to Shots
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Image */}
          <div className="relative w-full">
            <img
              src={shot.image_url}
              alt={shot.caption}
              className="w-full max-h-[600px] object-contain bg-gray-100"
            />
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Author */}
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-gray-900 text-lg">
                {shot.author_anonymous_name}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(shot.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Caption */}
            <p className="text-gray-700 mb-4 whitespace-pre-wrap">
              {shot.caption}
            </p>

            {/* Tags */}
            {shot.tags && shot.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {shot.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-6 py-4 border-y border-gray-200">
              <button
                onClick={handleLike}
                className="flex items-center gap-2 transition-colors"
                disabled={!user}
              >
                <Heart
                  className={`w-6 h-6 ${
                    isLiked
                      ? "fill-red-500 text-red-500"
                      : "text-gray-600 hover:text-red-500"
                  }`}
                />
                <span className="text-gray-700 font-medium">{likes}</span>
              </button>

              <div className="flex items-center gap-2 text-gray-600">
                <MessageCircle className="w-6 h-6" />
                <span className="font-medium">{shot.comments_count || 0}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Eye className="w-6 h-6" />
                <span className="font-medium">{shot.views || 0}</span>
              </div>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors ml-auto"
              >
                <Share2 className="w-6 h-6" />
                <span className="font-medium">Share</span>
              </button>

              {shot.mature_content && (
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                  18+
                </span>
              )}
            </div>

            {/* Comments Section */}
            <div className="mt-6">
              <CommentSection
                shotId={shotId}
                onCommentAdded={() => {
                  // Refresh shot to update comment count
                  fetchShot();
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
