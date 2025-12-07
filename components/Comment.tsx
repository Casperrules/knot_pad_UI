"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { commentsLikeAPI } from "@/lib/api";
import toast from "react-hot-toast";

interface CommentProps {
  comment: {
    id: string;
    content: string;
    anonymous_name: string;
    user_id: string;
    upvotes: number;
    downvotes: number;
    likes?: number;
    is_liked?: boolean;
    created_at: string;
    replies?: CommentProps["comment"][];
  };
  currentUserId?: string;
  onReply: (commentId: string, content: string) => void;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onVote: (commentId: string, vote: "up" | "down") => void;
  depth?: number;
}

export default function Comment({
  comment,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onVote,
  depth = 0,
}: CommentProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [editContent, setEditContent] = useState(comment.content);
  const [liked, setLiked] = useState(comment.is_liked || false);
  const [likeCount, setLikeCount] = useState(comment.likes || 0);
  const [liking, setLiking] = useState(false);

  const isOwner = currentUserId === comment.user_id;
  const maxDepth = 5; // Maximum nesting level
  const canReply = depth < maxDepth;

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!currentUserId) {
      toast.error("Please login to like comments");
      return;
    }

    if (liking) return;

    setLiking(true);
    const previousLiked = liked;
    const previousCount = likeCount;

    // Optimistic update
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);

    try {
      const response = await commentsLikeAPI.like(comment.id);
      setLiked(response.data.liked);
      setLikeCount(response.data.total_likes);

      if (response.data.points_earned && response.data.points_earned > 0) {
        toast.success(
          `Author earned ${response.data.points_earned} point(s)!`,
          {
            icon: "🎉",
          }
        );
      }
    } catch (error: any) {
      // Revert on error
      setLiked(previousLiked);
      setLikeCount(previousCount);

      if (error.response?.status === 401) {
        toast.error("Please login to like comments");
      } else {
        toast.error("Failed to like comment");
      }
    } finally {
      setLiking(false);
    }
  };

  const handleReply = () => {
    if (replyContent.trim()) {
      onReply(comment.id, replyContent);
      setReplyContent("");
      setIsReplying(false);
    }
  };

  const handleEdit = () => {
    if (editContent.trim()) {
      onEdit(comment.id, editContent);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      onDelete(comment.id);
    }
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffMs = now.getTime() - commentDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return commentDate.toLocaleDateString();
  };

  return (
    <div
      className={`${
        depth > 0 ? "ml-8 border-l-2 border-gray-200 pl-4" : ""
      } mb-4`}
    >
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800">
              {comment.anonymous_name}
            </span>
            <span className="text-sm text-gray-500">
              • {formatDate(comment.created_at)}
            </span>
          </div>
          {isOwner && (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="mb-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 border rounded-lg resize-none"
              rows={3}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleEdit}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(comment.content);
                }}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-700 mb-3 whitespace-pre-wrap">
            {comment.content}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onVote(comment.id, "up")}
              className="text-gray-600 hover:text-green-600 transition-colors"
            >
              ▲
            </button>
            <span className="text-gray-700 font-medium">
              {comment.upvotes - comment.downvotes}
            </span>
            <button
              onClick={() => onVote(comment.id, "down")}
              className="text-gray-600 hover:text-red-600 transition-colors"
            >
              ▼
            </button>
          </div>

          <button
            onClick={handleLike}
            disabled={liking}
            className="flex items-center gap-1 text-gray-600 hover:text-red-500 transition-colors disabled:opacity-50"
          >
            <Heart
              className={`w-4 h-4 ${liked ? "fill-red-500 text-red-500" : ""}`}
            />
            <span>{likeCount}</span>
          </button>

          {canReply && (
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="text-blue-600 hover:text-blue-800"
            >
              Reply
            </button>
          )}
        </div>

        {isReplying && (
          <div className="mt-3">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="w-full p-2 border rounded-lg resize-none"
              rows={3}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleReply}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                Reply
              </button>
              <button
                onClick={() => {
                  setIsReplying(false);
                  setReplyContent("");
                }}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Render nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onVote={onVote}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
