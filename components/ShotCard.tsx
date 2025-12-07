"use client";

import { useState } from "react";
import { Shot } from "@/types";
import { Heart, MessageCircle, Share2, MoreVertical, Eye } from "lucide-react";
import { shotsAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface ShotCardProps {
  shot: Shot;
  onLike?: (shotId: string, newLikes: number) => void;
  onDelete?: (shotId: string) => void;
}

export default function ShotCard({ shot, onLike, onDelete }: ShotCardProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(shot.is_liked);
  const [likes, setLikes] = useState(shot.likes);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLike = async () => {
    if (!user) {
      alert("Please login to like shots");
      return;
    }

    try {
      const response = await shotsAPI.like(shot.id);
      const newIsLiked = response.data.liked;
      const newLikes =
        (response.data as any).likes ||
        response.data.total_likes ||
        likes + (newIsLiked ? 1 : -1);

      setIsLiked(newIsLiked);
      setLikes(newLikes);

      if (onLike) {
        onLike(shot.id, newLikes);
      }
    } catch (error) {
      console.error("Error liking shot:", error);
      alert("Failed to like shot");
    }
  };

  const handleShare = async () => {
    try {
      const response = await shotsAPI.getShareLink(shot.id);
      const shareLink = response.data.share_link;

      if (navigator.share) {
        await navigator.share({
          title: `Shot by ${shot.author_anonymous_name}`,
          text: shot.caption,
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

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this shot?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await shotsAPI.delete(shot.id);
      if (onDelete) {
        onDelete(shot.id);
      }
    } catch (error) {
      console.error("Error deleting shot:", error);
      alert("Failed to delete shot");
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

  const canDelete =
    user && (user.id === shot.author_id || user.role === "admin");

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative aspect-square bg-gray-100">
        <img
          src={shot.image_url}
          alt={shot.caption}
          className="w-full h-full object-cover"
        />

        {/* Menu button for owner/admin */}
        {canDelete && (
          <div className="absolute top-2 right-2">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-700" />
            </button>

            {showMenu && (
              <div className="absolute top-12 right-0 bg-white rounded-lg shadow-lg py-1 min-w-[120px] z-10">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Status badge */}
        {shot.status !== "approved" && (
          <div className="absolute top-2 left-2">
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${
                shot.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : shot.status === "rejected"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {shot.status.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Author */}
        <p className="font-semibold text-gray-900 mb-2">
          {shot.author_anonymous_name}
        </p>

        {/* Caption */}
        <p className="text-gray-700 text-sm mb-3 line-clamp-3">
          {shot.caption}
        </p>

        {/* Tags */}
        {shot.tags && shot.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {shot.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
              >
                #{tag}
              </span>
            ))}
            {shot.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{shot.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
          <button
            onClick={handleLike}
            className="flex items-center gap-1 transition-colors"
            disabled={!user}
          >
            <Heart
              className={`w-5 h-5 ${
                isLiked
                  ? "fill-red-500 text-red-500"
                  : "text-gray-600 hover:text-red-500"
              }`}
            />
            <span className="text-sm text-gray-600">{likes}</span>
          </button>

          <div className="flex items-center gap-1 text-gray-600">
            <Eye className="w-5 h-5" />
            <span className="text-sm">{shot.views || 0}</span>
          </div>

          <button
            onClick={handleShare}
            className="flex items-center gap-1 text-gray-600 hover:text-blue-500 transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>

          {shot.mature_content && (
            <span className="ml-auto text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
              18+
            </span>
          )}
        </div>

        {/* Rejection reason */}
        {shot.status === "rejected" && shot.rejection_reason && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            <strong>Rejected:</strong> {shot.rejection_reason}
          </div>
        )}

        {/* Timestamp */}
        <p className="text-xs text-gray-400 mt-2">
          {new Date(shot.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}
