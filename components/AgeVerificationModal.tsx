"use client";

import { useEffect, useState } from "react";

export default function AgeVerificationModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already verified their age
    const ageVerified = localStorage.getItem("age_verified");
    if (!ageVerified) {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("age_verified", "true");
    setIsOpen(false);
  };

  const handleReject = () => {
    // Redirect to a blank page or close the window
    window.location.href = "about:blank";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            ⚠️ Adult Content Warning
          </h2>

          <div className="text-left space-y-4 mb-6 text-gray-700">
            <p className="font-semibold">
              Before proceeding, please read carefully:
            </p>

            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>
                This platform contains <strong>mature and adult content</strong>
              </li>
              <li>
                Stories may include explicit themes, violence, and strong
                language
              </li>
              <li>
                All stories are user-generated and reflect individual
                perspectives
              </li>
              <li>
                We respect your privacy - your reading preferences are
                confidential
              </li>
              <li>
                You must be <strong>18 years or older</strong> to access this
                content
              </li>
            </ul>

            <p className="text-sm italic text-gray-600 mt-4">
              By continuing, you confirm that you are of legal age in your
              jurisdiction and agree to view adult content at your own
              discretion.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleReject}
              className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition"
            >
              Exit
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition"
            >
              I am 18+ - Enter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
