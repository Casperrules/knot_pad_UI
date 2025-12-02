"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import CommentSection from "@/components/CommentSection";
import ChapterList from "@/components/ChapterList";
import AddChapterModal from "@/components/AddChapterModal";
import MatureContentModal from "@/components/MatureContentModal";
import { storiesAPI, chaptersAPI } from "@/lib/api";
import { Story, Chapter, ChapterCreate, ChapterUpdate } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import { Book, Plus } from "lucide-react";

export default function StoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [showMatureWarning, setShowMatureWarning] = useState(false);
  const [matureContentAccepted, setMatureContentAccepted] = useState(false);
  const storyId = params?.id as string;

  const isAuthor = user && story?.author_id === user.id;

  const fetchStory = async () => {
    try {
      setLoading(true);
      const [storyResponse, chaptersResponse] = await Promise.all([
        storiesAPI.getById(storyId),
        chaptersAPI.getByStory(storyId),
      ]);
      setStory(storyResponse.data);
      setChapters(chaptersResponse.data);

      // Check if mature content warning should be shown
      const story = storyResponse.data;
      if (story.mature_content) {
        const acceptedStories = JSON.parse(
          localStorage.getItem("mature_accepted_stories") || "[]"
        );
        // Authors and admins skip the warning
        if (!isAuthor && !isAdmin && !acceptedStories.includes(storyId)) {
          setShowMatureWarning(true);
        } else {
          setMatureContentAccepted(true);
        }
      } else {
        setMatureContentAccepted(true);
      }
    } catch (error) {
      console.error("Error fetching story:", error);
      const apiError = error as { response?: { status?: number } };
      if (apiError.response?.status === 404) {
        toast.error("Story not found");
      } else if (apiError.response?.status === 403) {
        toast.error("You do not have permission to view this story");
      } else {
        toast.error("Failed to load story");
      }
      router.push("/feed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storyId) {
      fetchStory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyId]);

  const handleAddChapter = async (data: ChapterCreate) => {
    try {
      await chaptersAPI.create(storyId, data);
      toast.success("Chapter added successfully!");
      fetchStory();
    } catch (error) {
      console.error("Error creating chapter:", error);
      toast.error("Failed to create chapter");
      throw error;
    }
  };

  const handleEditChapter = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setIsModalOpen(true);
  };

  const handleUpdateChapter = async (data: ChapterUpdate) => {
    if (!editingChapter) return;
    try {
      await chaptersAPI.update(editingChapter.id, data);
      toast.success("Chapter updated successfully!");
      setEditingChapter(null);
      fetchStory();
    } catch (error) {
      console.error("Error updating chapter:", error);
      toast.error("Failed to update chapter");
      throw error;
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    try {
      await chaptersAPI.delete(chapterId);
      toast.success("Chapter deleted successfully!");
      fetchStory();
    } catch (error) {
      console.error("Error deleting chapter:", error);
      toast.error("Failed to delete chapter");
    }
  };

  const handlePublishChapter = async (chapterId: string) => {
    try {
      await chaptersAPI.publish(chapterId);
      toast.success("Chapter published!");
      fetchStory();
    } catch (error) {
      console.error("Error publishing chapter:", error);
      toast.error("Failed to publish chapter");
    }
  };

  const handleMatureAccept = () => {
    const acceptedStories = JSON.parse(
      localStorage.getItem("mature_accepted_stories") || "[]"
    );
    acceptedStories.push(storyId);
    localStorage.setItem(
      "mature_accepted_stories",
      JSON.stringify(acceptedStories)
    );
    setShowMatureWarning(false);
    setMatureContentAccepted(true);
  };

  const handleMatureReject = () => {
    router.push("/feed");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      approved: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      rejected: "bg-red-100 text-red-800",
      draft: "bg-gray-100 text-gray-800",
    };
    return styles[status as keyof typeof styles] || styles.draft;
  };

  // Show mature content warning
  if (showMatureWarning) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <MatureContentModal
            isOpen={showMatureWarning}
            onAccept={handleMatureAccept}
            onReject={handleMatureReject}
          />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : story ? (
            <div className="space-y-6">
              {/* Story Header */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 md:p-6">
                  <button
                    onClick={() => router.back()}
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium mb-4 flex items-center gap-1"
                  >
                    ← Back
                  </button>

                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Cover Image */}
                    {story.cover_image && (
                      <div className="md:w-48 shrink-0">
                        <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-200">
                          <img
                            src={story.cover_image}
                            alt={story.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}

                    {/* Story Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                          {story.title}
                        </h1>
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusBadge(
                            story.status
                          )}`}
                        >
                          {story.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-semibold">
                              {story.author_anonymous_name[0].toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">
                            {story.author_anonymous_name}
                          </span>
                        </div>
                        <span>•</span>
                        <span>{story.chapter_count} chapters</span>
                        <span>•</span>
                        <span>{story.total_reads} reads</span>
                      </div>

                      {story.description && (
                        <p className="text-gray-700 mb-4 text-sm md:text-base leading-relaxed">
                          {story.description}
                        </p>
                      )}

                      {story.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {story.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {story.mature_content && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full">
                          ⚠️ Mature Content
                        </div>
                      )}

                      {story.rejection_reason &&
                        story.status === "rejected" && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm font-semibold text-red-800 mb-1">
                              Story Rejected
                            </p>
                            <p className="text-sm text-red-700">
                              {story.rejection_reason}
                            </p>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chapters Section */}
              <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Book className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                      Chapters
                    </h2>
                  </div>
                  {isAuthor && (
                    <button
                      onClick={() => {
                        setEditingChapter(null);
                        setIsModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Add Chapter
                    </button>
                  )}
                </div>

                <ChapterList
                  chapters={chapters}
                  storyId={storyId}
                  isAuthor={isAuthor ?? false}
                  onEdit={handleEditChapter}
                  onDelete={handleDeleteChapter}
                />
              </div>

              {/* Comments Section */}
              <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
                  Comments
                </h2>
                <CommentSection storyId={storyId} />
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">
                Story not found
              </h3>
              <p className="mt-2 text-gray-500">
                The story you&apos;re looking for doesn&apos;t exist or has been
                removed.
              </p>
              <button
                onClick={() => router.push("/feed")}
                className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
              >
                Browse Stories
              </button>
            </div>
          )}
        </main>

        <AddChapterModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingChapter(null);
          }}
          onSubmit={
            editingChapter ? (handleUpdateChapter as any) : handleAddChapter
          }
          existingChapter={
            editingChapter
              ? {
                  title: editingChapter.title,
                  content: editingChapter.content,
                  chapter_number: editingChapter.chapter_number,
                }
              : undefined
          }
          nextChapterNumber={chapters.length + 1}
        />
      </div>
    </ProtectedRoute>
  );
}
