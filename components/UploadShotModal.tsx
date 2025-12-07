"use client";

import { useState } from "react";
import { X, Upload, Camera } from "lucide-react";
import { shotsAPI } from "@/lib/api";
import { ShotCreate } from "@/types";

interface UploadShotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: () => void;
}

export default function UploadShotModal({
  isOpen,
  onClose,
  onUploadSuccess,
}: UploadShotModalProps) {
  const [formData, setFormData] = useState<ShotCreate>({
    image_url: "",
    caption: "",
    tags: [],
    mature_content: false,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [tagInput, setTagInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("Image size must be less than 10MB");
        return;
      }

      setSelectedFile(file);
      setError("");

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedFile) {
      setError("Please select an image");
      return;
    }

    if (!formData.caption.trim()) {
      setError("Please enter a caption");
      return;
    }

    setIsUploading(true);

    try {
      // Upload image first
      const uploadResponse = await shotsAPI.uploadImage(selectedFile);
      const imageUrl = uploadResponse.data.url;

      // Create shot with uploaded image URL
      await shotsAPI.create({
        ...formData,
        image_url: imageUrl,
      });

      // Reset form
      setFormData({
        image_url: "",
        caption: "",
        tags: [],
        mature_content: false,
      });
      setSelectedFile(null);
      setPreviewUrl("");
      setTagInput("");

      if (onUploadSuccess) {
        onUploadSuccess();
      }

      onClose();
      alert(
        "Shot uploaded successfully! It will be visible after admin approval."
      );
    } catch (error: any) {
      console.error("Error uploading shot:", error);
      setError(error.response?.data?.detail || "Failed to upload shot");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, trimmedTag],
      });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Upload Shot</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Image *
            </label>
            <div className="space-y-3">
              {/* Upload Button */}
              <div className="flex gap-2">
                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  <Upload className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {selectedFile ? selectedFile.name : "Choose from gallery"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {/* Camera Button (mobile only) */}
                <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors md:hidden">
                  <Camera className="w-5 h-5 text-gray-500" />
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              <p className="text-xs text-gray-500">
                Supported formats: JPG, PNG, GIF, WebP (Max 10MB)
              </p>
            </div>
          </div>

          {/* Image Preview */}
          {previewUrl && (
            <div className="relative aspect-square bg-gray-100 rounded-md overflow-hidden">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl("");
                }}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Caption */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Caption *
            </label>
            <textarea
              value={formData.caption}
              onChange={(e) =>
                setFormData({ ...formData, caption: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
              placeholder="Write a caption for your shot..."
              required
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a tag..."
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Add
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Mature Content */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="mature_content"
              checked={formData.mature_content}
              onChange={(e) =>
                setFormData({ ...formData, mature_content: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="mature_content"
              className="text-sm text-gray-700 cursor-pointer"
            >
              This shot contains mature content (18+)
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Upload Shot"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
