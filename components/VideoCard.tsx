"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { videosAPI, commentsAPI } from "@/lib/api";
import type { Video } from "@/types";
import CommentSection from "./CommentSection";
import MatureContentModal from "./MatureContentModal";
import { useRouter } from "next/navigation";

interface VideoCardProps {
  video: Video;
  onDelete?: () => void;
}

export default function VideoCard({ video, onDelete }: VideoCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(video.likes);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [showMatureModal, setShowMatureModal] = useState(false);
  const [canViewMature, setCanViewMature] = useState(false);

  const isAuthor = user?.id === video.author_id;
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    // Check if user has accepted mature content warning
    if (video.mature_content) {
      const accepted = localStorage.getItem(`mature_video_${video.id}`);
      setCanViewMature(!!accepted || isAuthor || isAdmin);
      if (!accepted && !isAuthor && !isAdmin) {
        setShowMatureModal(true);
      }
    } else {
      setCanViewMature(true);
    }

    // Check if user liked this video
    if (user) {
      videosAPI
        .checkLiked(video.id)
        .then((res) => setLiked(res.data.liked))
        .catch(() => {});
    }

    // Get comment count
    commentsAPI
      .getByVideo(video.id)
      .then((res) => setCommentCount(res.data.length))
      .catch(() => {});
  }, [video.id, video.mature_content, user, isAuthor, isAdmin]);

  const handleLike = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      await videosAPI.like(video.id);
      setLiked(!liked);
      setLikes((prev) => (liked ? prev - 1 : prev + 1));
    } catch (error) {
      console.error("Failed to like video:", error);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/videos?id=${video.id}`;
    if (navigator.share) {
      navigator.share({
        title: `Check out this video by ${video.author_anonymous_name}`,
        text: video.caption,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this video?")) return;

    try {
      await videosAPI.delete(video.id);
      onDelete?.();
    } catch (error) {
      console.error("Failed to delete video:", error);
      alert("Failed to delete video");
    }
  };

  const handleMatureAccept = () => {
    localStorage.setItem(`mature_video_${video.id}`, "true");
    setCanViewMature(true);
    setShowMatureModal(false);
  };

  const handleMatureDecline = () => {
    setShowMatureModal(false);
    router.push("/videos");
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Video Player */}
      <div className="relative bg-black aspect-[9/16] max-h-[600px]">
        {canViewMature ? (
          <video
            src={video.video_url}
            controls
            className="w-full h-full object-contain"
            playsInline
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center text-white p-8">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="text-lg font-semibold">Mature Content</p>
            </div>
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="p-4">
        {/* Author and Views */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
              {video.author_anonymous_name[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {video.author_anonymous_name}
              </p>
              <p className="text-xs text-gray-500">{video.views} views</p>
            </div>
          </div>

          {/* Action Buttons */}
          {(isAuthor || isAdmin) && (
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700 p-2"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Caption */}
        <p className="text-gray-700 mb-3">{video.caption}</p>

        {/* Tags */}
        {video.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {video.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"
              >
                #{tag}
              </span>
            ))}
            {video.mature_content && (
              <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                18+
              </span>
            )}
          </div>
        )}

        {/* Interaction Buttons */}
        <div className="flex items-center gap-6 pt-3 border-t border-gray-200">
          {/* Like Button */}
          <button
            onClick={handleLike}
            className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors"
          >
            <svg
              className={`w-6 h-6 ${liked ? "fill-red-600 text-red-600" : ""}`}
              fill={liked ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span className="font-medium">{likes}</span>
          </button>

          {/* Comment Button */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="font-medium">{commentCount}</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            <span className="font-medium">Share</span>
          </button>
        </div>

        {/* Comments Section */}
        {showComments && canViewMature && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <CommentSection videoId={video.id} />
          </div>
        )}
      </div>

      {/* Mature Content Modal */}
      {showMatureModal && (
        <MatureContentModal
          isOpen={showMatureModal}
          onAccept={handleMatureAccept}
          onReject={handleMatureDecline}
        />
      )}
    </div>
  );
}
