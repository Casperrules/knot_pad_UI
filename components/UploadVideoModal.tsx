"use client";

import { useState } from "react";
import { videosAPI } from "@/lib/api";
import type { VideoCreate } from "@/types";

interface UploadVideoModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadVideoModal({
  onClose,
  onSuccess,
}: UploadVideoModalProps) {
  const [formData, setFormData] = useState<VideoCreate>({
    video_url: "",
    caption: "",
    tags: [],
    mature_content: false,
  });
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.video_url) {
      setError("Video URL is required");
      return;
    }

    if (!formData.caption) {
      setError("Caption is required");
      return;
    }

    try {
      setLoading(true);
      await videosAPI.create(formData);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to upload video");
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Upload Video</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Video URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video URL *
              </label>
              <input
                type="url"
                value={formData.video_url}
                onChange={(e) =>
                  setFormData({ ...formData, video_url: e.target.value })
                }
                placeholder="https://example.com/video.mp4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter a direct link to your video file (mp4, webm, etc.)
              </p>
            </div>

            {/* Video Preview */}
            {formData.video_url && (
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  src={formData.video_url}
                  controls
                  className="w-full h-full object-contain"
                  playsInline
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            {/* Caption */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Caption *
              </label>
              <textarea
                value={formData.caption}
                onChange={(e) =>
                  setFormData({ ...formData, caption: e.target.value })
                }
                placeholder="Write a caption for your video..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Add a tag..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                >
                  Add
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-2"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-purple-500 hover:text-purple-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Mature Content */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="mature"
                checked={formData.mature_content}
                onChange={(e) =>
                  setFormData({ ...formData, mature_content: e.target.checked })
                }
                className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <div>
                <label
                  htmlFor="mature"
                  className="text-sm font-medium text-gray-700"
                >
                  Mature Content (18+)
                </label>
                <p className="text-xs text-gray-500">
                  Check this if your video contains mature themes, violence, or
                  explicit content
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Uploading..." : "Upload Video"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
