"use client";

import { Story } from "@/types";
import Link from "next/link";
import Image from "next/image";

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
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {story.images.length > 0 && (
        <div className="relative h-48 w-full">
          <Image
            src={`${process.env.NEXT_PUBLIC_API_URL}${story.images[0].url}`}
            alt={story.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Link href={`/story/${story.id}`}>
            <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 line-clamp-2">
              {story.title}
            </h3>
          </Link>
          {showStatus && (
            <span
              className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                story.status
              )}`}
            >
              {story.status}
            </span>
          )}
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
          {story.content}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500">
          {story.author_id ? (
            <Link href={`/author/${story.author_id}`}>
              <span className="font-medium hover:text-blue-600 cursor-pointer">
                {story.author_anonymous_name}
              </span>
            </Link>
          ) : (
            <span className="font-medium">{story.author_anonymous_name}</span>
          )}
          <span>{formatDate(story.published_at || story.created_at)}</span>
        </div>

        {story.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {story.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {story.rejection_reason && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
            <p className="text-xs text-red-700">
              <strong>Rejection reason:</strong> {story.rejection_reason}
            </p>
          </div>
        )}

        {(onEdit || onDelete) && (
          <div className="mt-4 flex gap-2">
            {onEdit && story.status === "draft" && (
              <button
                onClick={() => onEdit(story)}
                className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(story.id)}
                className="flex-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
