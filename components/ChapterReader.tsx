"use client";

import { Chapter } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface ChapterReaderProps {
  chapter: Chapter;
  storyId: string;
  storyTitle: string;
  prevChapter?: Chapter;
  nextChapter?: Chapter;
  onTextSelect?: (selectedText: string, position: number) => void;
}

export default function ChapterReader({
  chapter,
  storyId,
  storyTitle,
  prevChapter,
  nextChapter,
  onTextSelect,
}: ChapterReaderProps) {
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const selectedText = selection.toString();
      const range = selection.getRangeAt(0);
      const position = range.startOffset;
      onTextSelect?.(selectedText, position);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/story/${storyId}`}
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          ← Back to {storyTitle}
        </Link>
        <div className="mt-4">
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            Chapter {chapter.chapter_number}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-3">
            {chapter.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div
        className="prose prose-lg max-w-none bg-white rounded-lg p-6 md:p-8 shadow-sm"
        onMouseUp={handleTextSelection}
      >
        <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
          {chapter.content}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8 gap-4">
        <div className="flex-1">
          {prevChapter && (
            <Link
              href={`/story/${storyId}/chapter/${prevChapter.id}`}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 font-medium transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <div className="text-left">
                <div className="text-xs text-gray-500">Previous</div>
                <div className="truncate max-w-[200px]">
                  {prevChapter.title}
                </div>
              </div>
            </Link>
          )}
        </div>

        <Link
          href={`/story/${storyId}`}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
        >
          Chapters
        </Link>

        <div className="flex-1 flex justify-end">
          {nextChapter && (
            <Link
              href={`/story/${storyId}/chapter/${nextChapter.id}`}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 font-medium transition"
            >
              <div className="text-right">
                <div className="text-xs text-gray-500">Next</div>
                <div className="truncate max-w-[200px]">
                  {nextChapter.title}
                </div>
              </div>
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
