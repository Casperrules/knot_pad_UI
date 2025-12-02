"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { storiesAPI } from "@/lib/api";
import toast from "react-hot-toast";
import { ImagePlus } from "lucide-react";

export default function CreateStoryPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tags, setTags] = useState("");
  const [matureContent, setMatureContent] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent, asDraft: boolean = false) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    setLoading(true);
    try {
      const tagArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const response = await storiesAPI.create({
        title: title.trim(),
        description: description.trim(),
        cover_image: coverImage.trim() || undefined,
        tags: tagArray,
        mature_content: matureContent,
      });

      toast.success(
        asDraft
          ? "Story created as draft!"
          : "Story submitted for approval!"
      );
      router.push(`/story/${response.data.id}`);
    } catch (error) {
      console.error("Create error:", error);
      toast.error("Failed to create story");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="bg-white rounded-lg shadow-md p-4 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Create New Story
            </h1>
            <p className="text-gray-600 mb-6">
              Start your story with a title and description. You can add chapters
              after creating it.
            </p>

            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Story Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your story title..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your story... This will appear on the story card."
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              {/* Cover Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Image URL (optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://example.com/cover.jpg"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                  >
                    <ImagePlus className="w-5 h-5" />
                  </button>
                </div>
                {coverImage && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                    <div className="w-32 aspect-[2/3] rounded-lg overflow-hidden bg-gray-200">
                      <img
                        src={coverImage}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                        onError={() => toast.error("Invalid image URL")}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="romance, fantasy, adventure (comma-separated)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Separate tags with commas
                </p>
              </div>

              {/* Mature Content */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="mature"
                  checked={matureContent}
                  onChange={(e) => setMatureContent(e.target.checked)}
                  className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="mature" className="text-sm text-gray-700">
                  <span className="font-medium">Mature Content</span>
                  <p className="text-gray-500 mt-1">
                    Check this if your story contains adult themes, violence, or
                    explicit content
                  </p>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                >
                  {loading ? "Creating..." : "Save as Draft"}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                >
                  {loading ? "Creating..." : "Create Story"}
                </button>
              </div>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> After creating your story, you&apos;ll be able
                to add chapters to it. Stories need at least one published chapter
                before submission for approval.
              </p>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
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
