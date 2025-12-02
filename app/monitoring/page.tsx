"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface MetricsSummary {
  total_requests: number;
  total_errors: number;
  error_rate: number;
  status_codes: Record<string, number>;
  top_endpoints: Array<{
    endpoint: string;
    count: number;
    avg_duration: number;
    errors: number;
    error_rate: number;
  }>;
  slowest_endpoints: Array<{
    endpoint: string;
    avg_duration: number;
  }>;
  daily_active_users: number;
  total_unique_users: number;
  total_registered_users: number;
  dau_history: Array<{
    date: string;
    users: number;
  }>;
}

interface ErrorEntry {
  timestamp: string;
  method: string;
  path: string;
  status_code: number;
  duration: number;
}

interface LogsResponse {
  log_type: string;
  log_file: string;
  total_lines: number;
  lines: string[];
}

const COLORS = [
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#ef4444",
];

export default function MonitoringPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [errors, setErrors] = useState<ErrorEntry[]>([]);
  const [logs, setLogs] = useState<LogsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"metrics" | "errors" | "logs">(
    "metrics"
  );
  const [logType, setLogType] = useState<"app" | "error">("app");
  const [logLines, setLogLines] = useState(100);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchData();
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };

      const [metricsRes, errorsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/monitoring/metrics`, {
          headers,
        }),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/monitoring/metrics/errors?limit=50`,
          { headers }
        ),
      ]);

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData);
      }

      if (errorsRes.ok) {
        const errorsData = await errorsRes.json();
        setErrors(errorsData.errors);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching monitoring data:", error);
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/monitoring/logs?log_type=${logType}&lines=${logLines}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "logs" && user?.role === "admin") {
      fetchLogs();
    }
  }, [activeTab, logType, logLines, user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  // Prepare chart data
  const statusCodeData = metrics
    ? Object.entries(metrics.status_codes).map(([code, count]) => ({
        name: code,
        value: count,
      }))
    : [];

  const endpointData = metrics
    ? metrics.top_endpoints.slice(0, 8).map((ep) => ({
        name: ep.endpoint.split(" ")[1]?.substring(0, 20) || ep.endpoint,
        requests: ep.count,
        avgTime: parseFloat(ep.avg_duration.toFixed(3)),
        errors: ep.errors,
      }))
    : [];

  const slowestData = metrics
    ? metrics.slowest_endpoints.slice(0, 8).map((ep) => ({
        name: ep.endpoint.split(" ")[1]?.substring(0, 20) || ep.endpoint,
        duration: parseFloat(ep.avg_duration.toFixed(3)),
      }))
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            System Monitoring
          </h1>
          <p className="text-gray-600">
            Real-time application metrics and logs
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("metrics")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "metrics"
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Metrics
          </button>
          <button
            onClick={() => setActiveTab("errors")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "errors"
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Recent Errors
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "logs"
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Logs
          </button>
        </div>

        {/* Metrics Tab */}
        {activeTab === "metrics" && metrics && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium mb-2">
                  Total Requests
                </h3>
                <p className="text-3xl font-bold text-gray-900">
                  {metrics.total_requests.toLocaleString()}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium mb-2">
                  Total Errors
                </h3>
                <p className="text-3xl font-bold text-red-600">
                  {metrics.total_errors.toLocaleString()}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium mb-2">
                  Error Rate
                </h3>
                <p className="text-3xl font-bold text-orange-600">
                  {metrics.error_rate.toFixed(2)}%
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium mb-2">
                  Total Registered
                </h3>
                <p className="text-3xl font-bold text-purple-600">
                  {metrics.total_registered_users.toLocaleString()}
                </p>
              </div>
            </div>

            {/* User Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg shadow">
                <h3 className="text-blue-700 text-sm font-medium mb-2">
                  Active Users Today
                </h3>
                <p className="text-4xl font-bold text-blue-600">
                  {metrics.daily_active_users.toLocaleString()}
                </p>
                <p className="text-sm text-blue-600 mt-2">
                  Users who made requests today
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg shadow">
                <h3 className="text-green-700 text-sm font-medium mb-2">
                  Total Unique Users
                </h3>
                <p className="text-4xl font-bold text-green-600">
                  {metrics.total_unique_users.toLocaleString()}
                </p>
                <p className="text-sm text-green-600 mt-2">
                  Unique users tracked in metrics
                </p>
              </div>
            </div>

            {/* User Activity Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">
                Daily Active Users (Last 7 Days)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics.dau_history}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => {
                      const d = new Date(date);
                      return `${d.getMonth() + 1}/${d.getDate()}`;
                    }}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(date) =>
                      new Date(date).toLocaleDateString()
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Active Users"
                    dot={{ fill: "#3b82f6", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Codes Distribution */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">
                  Status Code Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusCodeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusCodeData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Top Endpoints */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">
                  Top Endpoints by Traffic
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={endpointData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="requests" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Average Response Times */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">
                  Average Response Times (seconds)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={endpointData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avgTime" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Slowest Endpoints */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">
                  Slowest Endpoints
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={slowestData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip />
                    <Bar dataKey="duration" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Endpoint Details Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <h3 className="text-lg font-semibold p-6 border-b">
                Endpoint Details
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Endpoint
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Requests
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Avg Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Errors
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Error Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {metrics.top_endpoints.map((ep, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                          {ep.endpoint}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {ep.count.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {ep.avg_duration.toFixed(3)}s
                        </td>
                        <td className="px-6 py-4 text-sm text-red-600">
                          {ep.errors}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {ep.error_rate.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Errors Tab */}
        {activeTab === "errors" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <h3 className="text-lg font-semibold p-6 border-b">
              Recent Errors (Last 50)
            </h3>
            {errors.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-lg">No errors recorded 🎉</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Path
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {errors.map((error, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(error.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {error.method}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                          {error.path}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              error.status_code >= 500
                                ? "bg-red-100 text-red-800"
                                : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {error.status_code}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {error.duration.toFixed(3)}s
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === "logs" && (
          <div className="space-y-4">
            {/* Log Controls */}
            <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mr-2">
                  Log Type:
                </label>
                <select
                  value={logType}
                  onChange={(e) =>
                    setLogType(e.target.value as "app" | "error")
                  }
                  className="border border-gray-300 rounded px-3 py-1"
                >
                  <option value="app">Application Logs</option>
                  <option value="error">Error Logs</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mr-2">
                  Lines:
                </label>
                <select
                  value={logLines}
                  onChange={(e) => setLogLines(Number(e.target.value))}
                  className="border border-gray-300 rounded px-3 py-1"
                >
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value="200">200</option>
                  <option value="500">500</option>
                  <option value="1000">1000</option>
                </select>
              </div>
              <button
                onClick={fetchLogs}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Refresh
              </button>
            </div>

            {/* Log Display */}
            <div className="bg-gray-900 rounded-lg shadow p-4 overflow-x-auto">
              {logs ? (
                <div>
                  <div className="text-gray-400 text-sm mb-2">
                    File: {logs.log_file} | Total Lines: {logs.total_lines} |
                    Showing: {logs.lines.length}
                  </div>
                  <pre className="text-green-400 text-xs font-mono whitespace-pre-wrap">
                    {logs.lines.join("\n")}
                  </pre>
                </div>
              ) : (
                <div className="text-gray-400">Loading logs...</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
