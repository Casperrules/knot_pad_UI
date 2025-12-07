"use client";

import { useState, useEffect } from "react";
import { userStatsAPI } from "@/lib/api";
import type { ReferralInfo } from "@/types";
import toast from "react-hot-toast";

export default function ReferralCard() {
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferralInfo();
  }, []);

  const fetchReferralInfo = async () => {
    try {
      const response = await userStatsAPI.getMyReferralInfo();
      setReferralInfo(response.data);
    } catch (error) {
      console.error("Failed to fetch referral info:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Referral link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  const shareReferral = async () => {
    if (!referralInfo) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me on this platform!",
          text: `Use my referral code ${referralInfo.referral_code} to sign up and help me earn points!`,
          url: referralInfo.referral_link,
        });
      } catch (error) {
        // User cancelled or share failed
        copyToClipboard(referralInfo.referral_link);
      }
    } else {
      copyToClipboard(referralInfo.referral_link);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (!referralInfo) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-md p-6 border border-purple-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Invite Friends & Earn Points
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Unable to load referral information. Please refresh the page.
        </p>
        <button
          onClick={fetchReferralInfo}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-md p-6 border border-purple-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Invite Friends & Earn Points
          </h3>
          <p className="text-sm text-gray-600">
            Earn 10 points for each friend who signs up with your code
          </p>
        </div>
        <div className="bg-white rounded-full px-4 py-2 shadow-sm">
          <span className="text-2xl font-bold text-purple-600">
            {referralInfo.referral_count}
          </span>
          <p className="text-xs text-gray-500 text-center">Referrals</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Referral Code */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Your Referral Code
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white border-2 border-purple-300 rounded-lg px-4 py-3">
              <code className="text-2xl font-bold text-purple-600 tracking-wider">
                {referralInfo.referral_code}
              </code>
            </div>
            <button
              onClick={() => copyToClipboard(referralInfo.referral_code)}
              className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              title="Copy code"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Referral Link */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Referral Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={referralInfo.referral_link}
              readOnly
              className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none"
            />
            <button
              onClick={() => copyToClipboard(referralInfo.referral_link)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Share Button */}
        <button
          onClick={shareReferral}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          Share Referral Link
        </button>
      </div>

      {/* Info Box */}
      <div className="mt-4 bg-white bg-opacity-50 rounded-lg p-3 border border-purple-200">
        <p className="text-xs text-gray-600 leading-relaxed">
          💡 <span className="font-medium">How it works:</span> Share your
          referral link with friends. When they sign up using your link or code,
          you'll earn 10 points! You also earn 1 point for each story you post
          and 1 point for every 1000 likes you receive.
        </p>
      </div>
    </div>
  );
}
