"use client";

import { Story } from "@/types";
import Link from "next/link";
import { Book, Eye, AlertTriangle } from "lucide-react";

interface StoryCardProps {
  story: Story;
  showStatus?: boolean;
  onEdit?: (story: Story) => void;
  onDelete?: (id: string) => void;
}

export default function StoryCard({
  story,
  showStatus = false,
  onEdit,
  onDelete,
}: StoryCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 group">
      <Link href={`/story/${story.id}`}>
        <div className="flex flex-col sm:flex-row">
          {/* Cover Image */}
          <div className="relative w-full sm:w-32 md:w-40 h-48 sm:h-auto shrink-0 bg-gradient-to-br from-indigo-100 to-purple-100">
            {story.cover_image ? (
              <img
                src={story.cover_image}
                alt={story.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Book className="w-12 h-12 text-indigo-300" />
              </div>
            )}
            {story.mature_content && (
              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1 shadow-lg">
                <AlertTriangle className="w-3 h-3" />
                18+
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-indigo-600 line-clamp-2 transition-colors">
                {story.title}
              </h3>
              {showStatus && (
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(
                    story.status
                  )}`}
                >
                  {story.status}
                </span>
              )}
            </div>

            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {story.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
              {story.author_id ? (
                <Link
                  href={`/author/${story.author_id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="font-medium hover:text-indigo-600"
                >
                  {story.author_anonymous_name}
                </Link>
              ) : (
                <span className="font-medium">
                  {story.author_anonymous_name}
                </span>
              )}
              <span>•</span>
              <div className="flex items-center gap-1">
                <Book className="w-3 h-3" />
                <span>
                  {story.chapter_count} chapter
                  {story.chapter_count !== 1 ? "s" : ""}
                </span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{story.total_reads.toLocaleString()} reads</span>
              </div>
            </div>

            {story.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {story.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded-full font-medium"
                  >
                    #{tag}
                  </span>
                ))}
                {story.tags.length > 3 && (
                  <span className="px-2 py-0.5 text-gray-500 text-xs">
                    +{story.tags.length - 3} more
                  </span>
                )}
              </div>
            )}

            {story.rejection_reason && (
              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                <p className="text-xs text-red-700">
                  <strong>Rejection reason:</strong> {story.rejection_reason}
                </p>
              </div>
            )}
          </div>
        </div>
      </Link>

      {(onEdit || onDelete) && (
        <div className="px-4 pb-4 flex gap-2">
          {onEdit && story.status === "draft" && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onEdit(story);
              }}
              className="flex-1 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 font-medium transition"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                if (confirm("Are you sure you want to delete this story?")) {
                  onDelete(story.id);
                }
              }}
              className="flex-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 font-medium transition"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
