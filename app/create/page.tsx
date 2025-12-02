"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { storiesAPI, chaptersAPI } from "@/lib/api";
import toast from "react-hot-toast";
import { ImagePlus, Plus, X, ChevronDown, ChevronUp } from "lucide-react";

interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
}

export default function CreateStoryPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tags, setTags] = useState("");
  const [matureContent, setMatureContent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([
    { id: "temp-1", title: "", content: "", order: 1 },
  ]);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(
    "temp-1"
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    // Validate chapters
    const validChapters = chapters.filter(
      (ch) => ch.title.trim() && ch.content.trim()
    );
    if (validChapters.length === 0) {
      toast.error("Please add at least one chapter with title and content");
      return;
    }

    // Show confirmation modal
    setShowConfirmModal(true);
  };

  const handleConfirmPublish = async () => {
    setShowConfirmModal(false);
    setLoading(true);

    const validChapters = chapters.filter(
      (ch) => ch.title.trim() && ch.content.trim()
    );
    try {
      const tagArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      // Create story first (automatically approved)
      const response = await storiesAPI.create({
        title: title.trim(),
        description: description.trim(),
        cover_image: coverImage.trim() || undefined,
        tags: tagArray,
        mature_content: matureContent,
      });

      const storyId = response.data.id;

      // Create chapters
      for (let i = 0; i < validChapters.length; i++) {
        const chapter = validChapters[i];
        await chaptersAPI.create(storyId, {
          title: chapter.title.trim(),
          content: chapter.content.trim(),
          chapter_number: i + 1,
        });
      }

      toast.success(
        `Story published with ${validChapters.length} chapter${
          validChapters.length > 1 ? "s" : ""
        }!`
      );
      router.push(`/story/${storyId}`);
    } catch (error) {
      console.error("Create error:", error);
      toast.error("Failed to create story");
    } finally {
      setLoading(false);
    }
  };

  const addChapter = () => {
    const newChapter: Chapter = {
      id: `temp-${Date.now()}`,
      title: "",
      content: "",
      order: chapters.length + 1,
    };
    setChapters([...chapters, newChapter]);
    setExpandedChapter(newChapter.id);
  };

  const removeChapter = (id: string) => {
    if (chapters.length === 1) {
      toast.error("You must have at least one chapter");
      return;
    }
    setChapters(chapters.filter((ch) => ch.id !== id));
  };

  const updateChapter = (
    id: string,
    field: "title" | "content",
    value: string
  ) => {
    setChapters(
      chapters.map((ch) => (ch.id === id ? { ...ch, [field]: value } : ch))
    );
  };

  const toggleChapter = (id: string) => {
    setExpandedChapter(expandedChapter === id ? null : id);
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
              Add your story details and write your first chapter. You can add
              more chapters too!
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-900"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-900"
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
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-900"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-900"
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

              {/* Chapters Section */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Chapters
                    </h2>
                    <p className="text-sm text-gray-600">
                      Write your first chapter and add more if you like
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addChapter}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Add Chapter
                  </button>
                </div>

                <div className="space-y-3">
                  {chapters.map((chapter, index) => (
                    <div
                      key={chapter.id}
                      className="border border-gray-300 rounded-lg overflow-hidden"
                    >
                      {/* Chapter Header */}
                      <div
                        className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
                        onClick={() => toggleChapter(chapter.id)}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-sm font-medium text-gray-500">
                            #{index + 1}
                          </span>
                          <span className="font-medium text-gray-900">
                            {chapter.title || `Chapter ${index + 1} (untitled)`}
                          </span>
                          {chapter.content && (
                            <span className="text-xs text-gray-500">
                              ({chapter.content.length} characters)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {chapters.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeChapter(chapter.id);
                              }}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                          {expandedChapter === chapter.id ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                      </div>

                      {/* Chapter Content */}
                      {expandedChapter === chapter.id && (
                        <div className="p-4 space-y-4 bg-white">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Chapter Title{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={chapter.title}
                              onChange={(e) =>
                                updateChapter(
                                  chapter.id,
                                  "title",
                                  e.target.value
                                )
                              }
                              placeholder={`Chapter ${index + 1} title...`}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-900"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Chapter Content{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              value={chapter.content}
                              onChange={(e) =>
                                updateChapter(
                                  chapter.id,
                                  "content",
                                  e.target.value
                                )
                              }
                              placeholder="Write your chapter content here..."
                              rows={12}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-900 font-serif"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                >
                  {loading ? "Publishing..." : "Publish Story"}
                </button>
              </div>
            </form>
          </div>
        </main>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to Publish?
                </h2>

                <div className="text-left space-y-4 mb-6 text-gray-700">
                  <p className="font-semibold">
                    Before publishing, please confirm:
                  </p>

                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>
                      Your story content is appropriate and follows community
                      guidelines
                    </li>
                    <li>
                      You have properly tagged your story with relevant keywords
                    </li>
                    {matureContent && (
                      <li className="text-red-600 font-semibold">
                        Your story is correctly marked as{" "}
                        <strong>18+ Mature Content</strong>
                      </li>
                    )}
                    {!matureContent && (
                      <li>
                        Your story does NOT contain mature content (violence,
                        explicit themes, strong language)
                      </li>
                    )}
                    <li>
                      Your story title and description accurately represent the
                      content
                    </li>
                  </ul>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Once published, your story will be
                      immediately visible to all readers.
                      {matureContent &&
                        " Readers will see a warning before viewing mature content."}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition"
                  >
                    Review Again
                  </button>
                  <button
                    onClick={handleConfirmPublish}
                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                  >
                    Confirm & Publish
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
