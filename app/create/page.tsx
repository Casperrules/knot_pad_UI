"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Image from "next/image";

export default function CreateStoryPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [images, setImages] = useState<Array<{ url: string; caption: string }>>(
    []
  );
  const [imageCaption, setImageCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (1GB)
    if (file.size > 1024 * 1024 * 1024) {
      toast.error("Image must be less than 1GB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/api/stories/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setImages([...images, { url: response.data.url, caption: imageCaption }]);
      setImageCaption("");
      toast.success("Image uploaded successfully!");

      // Reset file input
      e.target.value = "";
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSaveDraft = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    setLoading(true);
    try {
      const tagArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      await api.post("/api/stories/", {
        title: title.trim(),
        content: content.trim(),
        images,
        tags: tagArray,
      });

      toast.success("Story saved as draft!");
      router.push("/my-stories");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save story");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForApproval = async (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setLoading(true);
    try {
      const tagArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      // Create story
      const createResponse = await api.post("/api/stories/", {
        title: title.trim(),
        content: content.trim(),
        images,
        tags: tagArray,
      });

      // Submit for approval
      await api.post(`/api/stories/${createResponse.data.id}/submit`);

      toast.success("Story submitted for approval!");
      router.push("/my-stories");
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to submit story");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Create New Story
            </h1>
            <p className="mt-2 text-gray-600">
              Write your story and submit it for approval
            </p>
          </div>

          <form onSubmit={handleSubmitForApproval} className="space-y-6">
            {/* Title */}
            <div className="bg-white p-6 rounded-lg shadow">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Story Title *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                placeholder="Enter a captivating title..."
                required
              />
            </div>

            {/* Content */}
            <div className="bg-white p-6 rounded-lg shadow">
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Story Content *
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={15}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                placeholder="Write your story here..."
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                {content.length} characters
              </p>
            </div>

            {/* Images */}
            <div className="bg-white p-6 rounded-lg shadow">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images
              </label>

              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative group">
                      <div className="relative h-32 w-full">
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API_URL}${img.url}`}
                          alt={img.caption || "Story image"}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                      {img.caption && (
                        <p className="text-xs text-gray-600 mt-1 truncate">
                          {img.caption}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg
                          className="w-4 h-4"
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
                  ))}
                </div>
              )}

              <div className="space-y-3">
                <input
                  type="text"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  placeholder="Image caption (optional)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                />

                <div className="flex items-center gap-2">
                  <label className="flex-1 cursor-pointer">
                    <div className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-md hover:bg-blue-100 text-center">
                      {uploading ? "Uploading..." : "Choose Image"}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  Supported: JPG, PNG, GIF, WebP (Max 5MB)
                </p>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white p-6 rounded-lg shadow">
              <label
                htmlFor="tags"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tags
              </label>
              <input
                id="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                placeholder="fiction, adventure, thriller (comma-separated)"
              />
              {tags && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.split(",").map(
                    (tag, index) =>
                      tag.trim() && (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                        >
                          {tag.trim()}
                        </span>
                      )
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={loading || !title.trim()}
                className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Save as Draft
              </button>
              <button
                type="submit"
                disabled={loading || !title.trim() || !content.trim()}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? "Submitting..." : "Submit for Approval"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </ProtectedRoute>
  );
}
