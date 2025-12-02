"use client";

import { useState, FormEvent, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import toast from "react-hot-toast";

type LoginMethod = "password" | "otp";

export default function LoginPage() {
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("password");

  // Password login fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // OTP login fields
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [devOtpCode, setDevOtpCode] = useState(""); // For development

  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  // Countdown timer for OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handlePasswordLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ username, password });
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/send-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setOtpSent(true);
        setCountdown(60); // 60 seconds cooldown
        toast.success("OTP sent to your email!");

        // For development - show OTP in toast
        if (data.code) {
          setDevOtpCode(data.code);
          toast.success(`Development OTP: ${data.code}`, { duration: 10000 });
        }
      } else {
        toast.error(data.detail || "Failed to send OTP");
      }
    } catch (error) {
      toast.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 4) {
      toast.error("Please enter the 4-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, code: otp }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Store tokens
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        toast.success("Login successful!");
        window.location.href = "/feed";
      } else {
        toast.error(data.detail || "Invalid OTP");
      }
    } catch (error) {
      toast.error("Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>

        {/* Login Method Tabs */}
        <div className="flex border-b">
          <button
            type="button"
            onClick={() => setLoginMethod("password")}
            className={`flex-1 py-2 px-4 text-center font-medium ${
              loginMethod === "password"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => setLoginMethod("otp")}
            className={`flex-1 py-2 px-4 text-center font-medium ${
              loginMethod === "otp"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            OTP
          </button>
        </div>

        {/* Password Login Form */}
        {loginMethod === "password" && (
          <form className="mt-8 space-y-6" onSubmit={handlePasswordLogin}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Username or Email
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your username or email"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>

            <div className="text-center">
              <span className="text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign up
                </Link>
              </span>
            </div>
          </form>
        )}

        {/* OTP Login Form */}
        {loginMethod === "otp" && (
          <div className="mt-8 space-y-6">
            {!otpSent ? (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your email"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading || countdown > 0}
                  className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Sending..."
                    : countdown > 0
                    ? `Resend in ${countdown}s`
                    : "Send OTP"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label
                    htmlFor="otp"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Enter 4-Digit OTP
                  </label>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    maxLength={4}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest sm:text-sm"
                    placeholder="0000"
                  />
                  {devOtpCode && (
                    <p className="mt-1 text-xs text-gray-500 text-center">
                      Dev Mode: OTP is {devOtpCode}
                    </p>
                  )}
                </div>
                <div className="text-sm text-center text-gray-600">
                  OTP sent to {email}
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp("");
                      setDevOtpCode("");
                    }}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    Change email
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loading || otp.length !== 4}
                  className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </button>
                {countdown === 0 && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="w-full text-sm text-blue-600 hover:text-blue-800"
                  >
                    Resend OTP
                  </button>
                )}
              </form>
            )}

            <div className="text-center">
              <span className="text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign up
                </Link>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
