"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { ChapterCreate, ChapterUpdate } from "@/types";

interface AddChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ChapterCreate) => Promise<void>;
  existingChapter?: ChapterUpdate & { chapter_number: number };
  nextChapterNumber: number;
}

export default function AddChapterModal({
  isOpen,
  onClose,
  onSubmit,
  existingChapter,
  nextChapterNumber,
}: AddChapterModalProps) {
  const [title, setTitle] = useState(existingChapter?.title || "");
  const [content, setContent] = useState(existingChapter?.content || "");
  const [chapterNumber, setChapterNumber] = useState(
    existingChapter?.chapter_number || nextChapterNumber
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        chapter_number: chapterNumber,
      });
      setTitle("");
      setContent("");
      setChapterNumber(nextChapterNumber);
      onClose();
    } catch (error) {
      console.error("Failed to save chapter:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            {existingChapter ? "Edit Chapter" : "Add New Chapter"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 space-y-4">
            {/* Chapter Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chapter Number
              </label>
              <input
                type="number"
                min="1"
                value={chapterNumber}
                onChange={(e) => setChapterNumber(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chapter Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter chapter title..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your chapter..."
                rows={15}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-mono text-sm"
                required
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-4 md:p-6 border-t bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isSubmitting
                ? "Saving..."
                : existingChapter
                ? "Update Chapter"
                : "Add Chapter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
