"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import ChapterReader from "@/components/ChapterReader";
import CommentSection from "@/components/CommentSection";
import { chaptersAPI, storiesAPI, commentsAPI } from "@/lib/api";
import { Chapter, Story } from "@/types";
import toast from "react-hot-toast";

export default function ChapterPage() {
  const params = useParams();
  const router = useRouter();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [story, setStory] = useState<Story | null>(null);
  const [allChapters, setAllChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedText, setSelectedText] = useState("");
  const [textPosition, setTextPosition] = useState(0);
  const [showCommentInput, setShowCommentInput] = useState(false);

  const storyId = params?.id as string;
  const chapterId = params?.chapterId as string;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [chapterRes, storyRes, chaptersRes] = await Promise.all([
          chaptersAPI.getById(chapterId),
          storiesAPI.getById(storyId),
          chaptersAPI.getByStory(storyId),
        ]);
        setChapter(chapterRes.data);
        setStory(storyRes.data);
        setAllChapters(chaptersRes.data);
      } catch (error) {
        console.error("Error fetching chapter:", error);
        toast.error("Failed to load chapter");
        router.push(`/story/${storyId}`);
      } finally {
        setLoading(false);
      }
    };

    if (chapterId && storyId) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId, storyId]);

  const handleTextSelect = (text: string, position: number) => {
    setSelectedText(text);
    setTextPosition(position);
    setShowCommentInput(true);
  };

  const handleCommentSubmit = async (content: string) => {
    try {
      await commentsAPI.create({
        story_id: storyId,
        chapter_id: chapterId,
        content,
        selected_text: selectedText,
        text_position: textPosition,
      });
      toast.success("Comment added!");
      setShowCommentInput(false);
      setSelectedText("");
    } catch (error) {
      console.error("Error creating comment:", error);
      toast.error("Failed to add comment");
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (!chapter || !story) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="max-w-6xl mx-auto px-4 py-8">
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">
                Chapter not found
              </h3>
              <button
                onClick={() => router.push(`/story/${storyId}`)}
                className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
              >
                Back to Story
              </button>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  const currentIndex = allChapters.findIndex((ch) => ch.id === chapterId);
  const prevChapter =
    currentIndex > 0 ? allChapters[currentIndex - 1] : undefined;
  const nextChapter =
    currentIndex < allChapters.length - 1
      ? allChapters[currentIndex + 1]
      : undefined;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <ChapterReader
            chapter={chapter}
            storyId={storyId}
            storyTitle={story.title}
            prevChapter={prevChapter}
            nextChapter={nextChapter}
            onTextSelect={handleTextSelect}
          />

          {/* Inline Comment Input */}
          {showCommentInput && (
            <div className="mt-6 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
              <div className="mb-2">
                <p className="text-sm text-gray-600 mb-1">Selected text:</p>
                <blockquote className="text-sm italic border-l-4 border-yellow-400 pl-3 py-1">
                  &ldquo;{selectedText}&rdquo;
                </blockquote>
              </div>
              <textarea
                placeholder="Add your comment about this selection..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    const value = e.currentTarget.value.trim();
                    if (value) {
                      handleCommentSubmit(value);
                      e.currentTarget.value = "";
                    }
                  }
                }}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setShowCommentInput(false)}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Chapter Comments */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-4 md:p-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
              Chapter Comments
            </h2>
            <CommentSection storyId={storyId} chapterId={chapterId} />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
