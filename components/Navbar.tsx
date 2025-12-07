"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu } from "@headlessui/react";
import { useState, useEffect } from "react";
import { Home, Video, PlusSquare, User, BookOpen, Award } from "lucide-react";
import { userStatsAPI } from "@/lib/api";

export default function Navbar() {
  const { user, logout, isAdmin, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [points, setPoints] = useState<number>(0);
  const [loadingPoints, setLoadingPoints] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPoints();
    }
  }, [user]);

  const fetchPoints = async () => {
    try {
      setLoadingPoints(true);
      const response = await userStatsAPI.getMyStats();
      setPoints(response.data.points);
    } catch (error) {
      console.error("Failed to fetch points:", error);
    } finally {
      setLoadingPoints(false);
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Top Navbar - Desktop Only */}
      <nav className="bg-white shadow-md hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <span
                  className="text-2xl font-bold text-blue-600"
                  style={{ fontFamily: '"Pacifico", cursive' }}
                >
                  KnotPad
                </span>
              </Link>

              {/* Desktop Menu */}
              <div className="ml-8 flex space-x-4">
                <Link
                  href="/feed"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive("/feed")
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Stories
                </Link>
                <Link
                  href="/videos"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive("/videos")
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Snippets
                </Link>
                <Link
                  href="/shots"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive("/shots")
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Shots
                </Link>
                {!loading && user && (
                  <>
                    <Link
                      href="/my-stories"
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        isActive("/my-stories")
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      My Stories
                    </Link>
                    <Link
                      href="/create"
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        isActive("/create")
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      Create Story
                    </Link>
                    {isAdmin && (
                      <>
                        <Link
                          href="/admin"
                          className={`px-3 py-2 rounded-md text-sm font-medium ${
                            isActive("/admin")
                              ? "bg-blue-100 text-blue-700"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          Admin Panel
                        </Link>
                        <Link
                          href="/monitoring"
                          className={`px-3 py-2 rounded-md text-sm font-medium ${
                            isActive("/monitoring")
                              ? "bg-blue-100 text-blue-700"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          Monitoring
                        </Link>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {loading ? (
                <div className="w-8 h-8 animate-pulse bg-gray-200 rounded-full"></div>
              ) : user ? (
                <>
                  {/* Points Display */}
                  <Link
                    href="/profile"
                    className="mr-2 px-3 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-md hover:from-yellow-500 hover:to-orange-600 font-bold text-sm flex items-center gap-2 shadow-md transition-all"
                  >
                    <Award className="w-4 h-4" />
                    {loadingPoints ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      <span>{points.toLocaleString()} pts</span>
                    )}
                  </Link>

                  <Link
                    href="/create"
                    className="mr-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span>Write Story</span>
                  </Link>
                  <Link
                    href="/videos?upload=true"
                    className="mr-3 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 font-medium text-sm flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Upload Video</span>
                  </Link>
                  <Menu as="div" className="relative">
                    <Menu.Button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user.anonymous_name[0].toUpperCase()}
                          </span>
                        </div>
                        <span className="text-gray-700 font-medium">
                          {user.anonymous_name}
                        </span>
                      </div>
                    </Menu.Button>
                    <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/profile"
                            className={`${
                              active ? "bg-gray-100" : ""
                            } block px-4 py-2 text-sm text-gray-700`}
                          >
                            Profile
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={logout}
                            className={`${
                              active ? "bg-gray-100" : ""
                            } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                          >
                            Logout
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Menu>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-blue-600 font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Top Navbar - Logo Only */}
      <nav className="bg-white shadow-md sm:hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center h-16 items-center">
            <Link href="/" className="flex items-center">
              <span
                className="text-2xl font-bold text-blue-600"
                style={{ fontFamily: '"Pacifico", cursive' }}
              >
                KnotPad
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation Bar (Mobile Only) - Instagram Style */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-inset-bottom">
        <div className="flex justify-around items-center h-14 px-1">
          {/* Stories */}
          <Link
            href="/feed"
            className="flex flex-col items-center justify-center flex-1 h-full py-1"
          >
            <BookOpen
              className={`w-6 h-6 ${
                isActive("/feed") ? "text-blue-600" : "text-gray-700"
              }`}
              strokeWidth={isActive("/feed") ? 2.5 : 2}
            />
            <span
              className={`text-[10px] mt-0.5 ${
                isActive("/feed")
                  ? "text-blue-600 font-semibold"
                  : "text-gray-700"
              }`}
            >
              Stories
            </span>
          </Link>

          {/* Snippets (Videos) */}
          <Link
            href="/videos"
            className="flex flex-col items-center justify-center flex-1 h-full py-1"
          >
            <Video
              className={`w-6 h-6 ${
                isActive("/videos") ? "text-blue-600" : "text-gray-700"
              }`}
              strokeWidth={isActive("/videos") ? 2.5 : 2}
            />
            <span
              className={`text-[10px] mt-0.5 ${
                isActive("/videos")
                  ? "text-blue-600 font-semibold"
                  : "text-gray-700"
              }`}
            >
              Snippets
            </span>
          </Link>

          {/* Shots */}
          <Link
            href="/shots"
            className="flex flex-col items-center justify-center flex-1 h-full py-1"
          >
            <svg
              className={`w-6 h-6 ${
                isActive("/shots") ? "text-blue-600" : "text-gray-700"
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth={isActive("/shots") ? 2.5 : 2}
              viewBox="0 0 24 24"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            <span
              className={`text-[10px] mt-0.5 ${
                isActive("/shots")
                  ? "text-blue-600 font-semibold"
                  : "text-gray-700"
              }`}
            >
              Shots
            </span>
          </Link>

          {/* Create (Plus) - Only if logged in */}
          {user ? (
            <Link
              href="/create"
              className="flex flex-col items-center justify-center flex-1 h-full py-1"
            >
              <PlusSquare
                className={`w-6 h-6 ${
                  isActive("/create") ? "text-blue-600" : "text-gray-700"
                }`}
                strokeWidth={isActive("/create") ? 2.5 : 2}
              />
              <span
                className={`text-[10px] mt-0.5 ${
                  isActive("/create")
                    ? "text-blue-600 font-semibold"
                    : "text-gray-700"
                }`}
              >
                Create
              </span>
            </Link>
          ) : (
            <div className="flex-1" />
          )}

          {/* My Stories - Only if logged in */}
          {user ? (
            <Link
              href="/my-stories"
              className="flex flex-col items-center justify-center flex-1 h-full py-1"
            >
              <Home
                className={`w-6 h-6 ${
                  isActive("/my-stories") ? "text-blue-600" : "text-gray-700"
                }`}
                strokeWidth={isActive("/my-stories") ? 2.5 : 2}
              />
              <span
                className={`text-[10px] mt-0.5 ${
                  isActive("/my-stories")
                    ? "text-blue-600 font-semibold"
                    : "text-gray-700"
                }`}
              >
                My Stories
              </span>
            </Link>
          ) : (
            <div className="flex-1" />
          )}

          {/* Profile / Login */}
          <Link
            href={user ? "/profile" : "/login"}
            className="flex flex-col items-center justify-center flex-1 h-full py-1 relative"
          >
            {user ? (
              <>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isActive("/profile")
                      ? "bg-blue-600 ring-2 ring-blue-600"
                      : "bg-gray-700"
                  }`}
                >
                  <span className="text-white font-medium text-[10px]">
                    {user.anonymous_name[0].toUpperCase()}
                  </span>
                </div>
                {points > 0 && (
                  <div className="absolute -top-1 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                    {points > 999 ? `${Math.floor(points / 1000)}k` : points}
                  </div>
                )}
                <span
                  className={`text-[10px] mt-0.5 ${
                    isActive("/profile")
                      ? "text-blue-600 font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  Profile
                </span>
              </>
            ) : (
              <>
                <User className="w-6 h-6 text-gray-700" strokeWidth={2} />
                <span className="text-[10px] mt-0.5 text-gray-700">Login</span>
              </>
            )}
          </Link>
        </div>
      </div>

      {/* Add bottom padding to main content on mobile to prevent content from being hidden behind bottom nav */}
      <style jsx global>{`
        @media (max-width: 640px) {
          body {
            padding-bottom: 56px;
          }
        }
      `}</style>
    </>
  );
}
