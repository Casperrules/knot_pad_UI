"use client";

import { Chapter } from "@/types";
import Link from "next/link";
import { Calendar, Lock } from "lucide-react";

interface ChapterListProps {
  chapters: Chapter[];
  storyId: string;
  isAuthor?: boolean;
  onEdit?: (chapter: Chapter) => void;
  onDelete?: (chapterId: string) => void;
}

export default function ChapterList({
  chapters,
  storyId,
  isAuthor = false,
  onEdit,
  onDelete,
}: ChapterListProps) {
  return (
    <div className="space-y-2">
      {chapters.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No chapters yet</p>
          {isAuthor && (
            <p className="text-sm mt-2">Start writing your first chapter!</p>
          )}
        </div>
      ) : (
        chapters.map((chapter) => (
          <div
            key={chapter.id}
            className="bg-white rounded-lg border border-gray-200 hover:border-indigo-400 transition-colors"
          >
            <Link
              href={`/story/${storyId}/chapter/${chapter.id}`}
              className="block p-4 md:p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                      Chapter {chapter.chapter_number}
                    </span>
                    {!chapter.published && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Lock className="w-3 h-3" />
                        Draft
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-base md:text-lg truncate">
                    {chapter.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <time>
                      {new Date(chapter.created_at).toLocaleDateString()}
                    </time>
                  </div>
                </div>

                {isAuthor && onEdit && onDelete && (
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        onEdit(chapter);
                      }}
                      className="px-3 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        if (
                          confirm(
                            "Are you sure you want to delete this chapter?"
                          )
                        ) {
                          onDelete(chapter.id);
                        }
                      }}
                      className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </Link>
          </div>
        ))
      )}
    </div>
  );
}
