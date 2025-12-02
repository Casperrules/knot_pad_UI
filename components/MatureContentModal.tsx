"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

interface MatureContentModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onReject: () => void;
}

export default function MatureContentModal({
  isOpen,
  onAccept,
  onReject,
}: MatureContentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Mature Content Warning
          </h2>

          <div className="text-left space-y-4 mb-6 text-gray-700">
            <p className="font-semibold">
              This story contains mature content that may include:
            </p>

            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Explicit adult themes and sexual content</li>
              <li>Violence, gore, or disturbing imagery</li>
              <li>Strong language and mature topics</li>
              <li>Content that may not be suitable for all audiences</li>
            </ul>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-red-800 font-medium">
                You must be <strong>18 years or older</strong> to view this
                content.
              </p>
            </div>

            <p className="text-sm italic text-gray-600 mt-4">
              By continuing, you confirm that you are of legal age and consent
              to view mature content.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onReject}
              className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition"
            >
              Go Back
            </button>
            <button
              onClick={onAccept}
              className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
            >
              I am 18+ - Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
