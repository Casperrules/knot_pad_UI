"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { User, LoginData, RegisterData, TokenResponse } from "@/types";
import toast from "react-hot-toast";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api.get<User>("/api/auth/me");
      setUser(response.data);
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    try {
      const response = await api.post<TokenResponse>("/api/auth/login", data);
      const { access_token, refresh_token } = response.data;

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);

      const userResponse = await api.get<User>("/api/auth/me");
      setUser(userResponse.data);

      toast.success("Login successful!");

      if (userResponse.data.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/feed");
      }
    } catch (error: any) {
      const message = error.response?.data?.detail || "Login failed";
      toast.error(message);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      await api.post("/api/auth/register", data);
      toast.success("Registration successful! Please login.");
      router.push("/login");
    } catch (error: any) {
      const message = error.response?.data?.detail || "Registration failed";
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
