"use client";

import { useState } from "react";
import { videosAPI } from "@/lib/api";
import type { VideoCreate } from "@/types";
import axios from "axios";
import toast from "react-hot-toast";

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
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-msvideo"];
    if (!validTypes.includes(file.type)) {
      setError("Please select a valid video file (MP4, WebM, OGG, MOV, AVI)");
      return;
    }

    // Validate file size (100MB max)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      setError("Video file must be less than 100MB");
      return;
    }

    setError("");
    setSelectedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const uploadVideoFile = async () => {
    if (!selectedFile) return null;

    try {
      setUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/videos/upload-video`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.total
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0;
            setUploadProgress(progress);
          },
        }
      );

      return response.data.url;
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || "Failed to upload video file");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedFile && !formData.video_url) {
      setError("Please select a video file or enter a video URL");
      return;
    }

    if (!formData.caption) {
      setError("Caption is required");
      return;
    }

    try {
      setLoading(true);

      let videoUrl = formData.video_url;

      // Upload file if selected
      if (selectedFile) {
        toast.loading("Uploading video file...", { id: "video-upload" });
        videoUrl = await uploadVideoFile();
        toast.success("Video file uploaded!", { id: "video-upload" });
      }

      if (!videoUrl) {
        setError("Failed to get video URL");
        return;
      }

      // Create video record
      await videosAPI.create({
        ...formData,
        video_url: videoUrl,
      });

      toast.success("Video published successfully!");
      onSuccess();
    } catch (err: any) {
      setError(err.message || err.response?.data?.detail || "Failed to upload video");
      toast.error(err.message || "Failed to upload video");
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
            {/* Video File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Video File *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="video-file-input"
                />
                <label
                  htmlFor="video-file-input"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <svg
                    className="w-12 h-12 text-gray-400 mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  {selectedFile ? (
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <p className="text-xs text-purple-600 mt-2">
                        Click to change file
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Click to select video
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        MP4, WebM, OGG, MOV, AVI (max 100MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>
              {uploading && (
                <div className="mt-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* OR Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            {/* Video URL (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video URL (Optional)
              </label>
              <input
                type="url"
                value={formData.video_url}
                onChange={(e) =>
                  setFormData({ ...formData, video_url: e.target.value })
                }
                placeholder="https://example.com/video.mp4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                disabled={!!selectedFile}
              />
              <p className="text-xs text-gray-500 mt-1">
                Or paste a direct link to your video file
              </p>
            </div>

            {/* Video Preview */}
            {(previewUrl || formData.video_url) && (
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  src={previewUrl || formData.video_url}
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
              <button
                type="submit"
                disabled={loading || uploading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? `Uploading... ${uploadProgress}%` : loading ? "Publishing..." : "Upload Video"}
              </button>={tagInput}
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
