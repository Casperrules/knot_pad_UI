"use client";

import { useState, useEffect } from "react";
import Comment from "./Comment";
import { useAuth } from "@/contexts/AuthContext";

interface CommentType {
  id: string;
  content: string;
  anonymous_name: string;
  user_id: string;
  upvotes: number;
  downvotes: number;
  created_at: string;
  replies?: CommentType[];
}

interface CommentSectionProps {
  storyId?: string;
  chapterId?: string;
  videoId?: string;
  shotId?: string;
  onCommentAdded?: () => void;
}

export default function CommentSection({
  storyId,
  chapterId,
  videoId,
  shotId,
  onCommentAdded,
}: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadComments();
  }, [storyId, chapterId, videoId, shotId]);

  const loadComments = async () => {
    try {
      const endpoint = chapterId
        ? `/api/comments/chapter/${chapterId}`
        : storyId
        ? `/api/comments/story/${storyId}`
        : videoId
        ? `/api/comments/video/${videoId}`
        : `/api/comments/shot/${shotId}`;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`
      );
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Failed to load comments:", error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    if (!user) {
      setError("Please login to comment");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");
      const endpoint = storyId
        ? `/api/comments/story/${storyId}`
        : videoId
        ? `/api/comments/video/${videoId}`
        : `/api/comments/shot/${shotId}`;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: newComment,
            ...(storyId
              ? { story_id: storyId }
              : videoId
              ? { video_id: videoId }
              : { shot_id: shotId }),
          }),
        }
      );

      if (response.ok) {
        setNewComment("");
        await loadComments();
        if (onCommentAdded) {
          onCommentAdded();
        }
      } else {
        const data = await response.json();
        setError(data.detail || "Failed to post comment");
      }
    } catch (error) {
      setError("Failed to post comment");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (parentId: string, content: string) => {
    if (!user) {
      setError("Please login to reply");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const endpoint = storyId
        ? `/api/comments/story/${storyId}`
        : `/api/comments/video/${videoId}`;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content,
            ...(storyId ? { story_id: storyId } : { video_id: videoId }),
            parent_comment_id: parentId,
          }),
        }
      );

      if (response.ok) {
        await loadComments();
      } else {
        const data = await response.json();
        setError(data.detail || "Failed to post reply");
      }
    } catch (error) {
      setError("Failed to post reply");
    }
  };

  const handleEdit = async (commentId: string, content: string) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/api/comments/${commentId}?content=${encodeURIComponent(content)}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await loadComments();
      } else {
        const data = await response.json();
        setError(data.detail || "Failed to edit comment");
      }
    } catch (error) {
      setError("Failed to edit comment");
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await loadComments();
      } else {
        const data = await response.json();
        setError(data.detail || "Failed to delete comment");
      }
    } catch (error) {
      setError("Failed to delete comment");
    }
  };

  const handleVote = async (commentId: string, vote: "up" | "down") => {
    if (!user) {
      setError("Please login to vote");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/comments/${commentId}/vote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ vote }),
        }
      );

      if (response.ok) {
        await loadComments();
      }
    } catch (error) {
      console.error("Failed to vote:", error);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Comments ({comments.length})</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Add new comment */}
      {user ? (
        <div className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
          <button
            onClick={handleAddComment}
            disabled={loading || !newComment.trim()}
            className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Posting..." : "Post Comment"}
          </button>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-gray-100 rounded-lg text-center">
          <p className="text-gray-600">Please login to comment</p>
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              currentUserId={user?.id}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onVote={handleVote}
            />
          ))
        )}
      </div>
    </div>
  );
}
