import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/Navbar";
import StorageService from "@/services/StorageService";
import SensorService from "@/services/SensorService";
import { StorageStats, SensorReading } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";

const PIE_COLORS = ["#0d6efd", "#20c997", "#ffc107", "#dc3545", "#6f42c1", "#fd7e14"];

const formatBytes = (bytes: number): string => {
  if (bytes >= 1_073_741_824) return (bytes / 1_073_741_824).toFixed(1) + " GB";
  if (bytes >= 1_048_576) return (bytes / 1_048_576).toFixed(1) + " MB";
  return (bytes / 1024).toFixed(1) + " KB";
};

const Dashboard = () => {
  const router = useRouter();
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [sensorHistory, setSensorHistory] = useState<SensorReading[]>([]);
  const [latestSensor, setLatestSensor] = useState<SensorReading | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const user = sessionStorage.getItem("loggedInUser");
    if (!user) {
      router.push("/login");
      return;
    }
    fetchData();
    const interval = setInterval(fetchData, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, historyRes, latestRes] = await Promise.all([
        StorageService.getStats(),
        SensorService.getHistory(24),
        SensorService.getLastest(),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (historyRes.ok) setSensorHistory(await historyRes.json());
      if (latestRes.ok) setLatestSensor(await latestRes.json());
    } catch (e) {
      setError("Failed to load dashboard data.");
    }
  };

  // Prepare storage bar chart data
  const storageBarData = stats
    ? [
        { name: "Used", value: stats.usedBytes, fill: "#0d6efd" },
        { name: "Free", value: stats.freeBytes, fill: "#20c997" },
      ]
    : [];

  // Prepare pie chart data from file types
  const pieData = stats
    ? Object.entries(stats.byFileType).map(([type, count]) => ({
        name: type.toUpperCase(),
        value: count,
      }))
    : [];

  // Prepare sensor line chart data
  const sensorChartData = sensorHistory.map((r) => ({
    time: new Date(r.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    temperature: r.temperature,
    humidity: r.humidity,
    pressure: r.pressure,
  }));

  return (
    <>
      <Navbar />
      <div className="container py-4">
        <h1 className="h4 fw-bold text-primary mb-4">Dashboard</h1>

        {error && <div className="alert alert-danger">{error}</div>}

        {/* ── Storage Overview ── */}
        <div className="row g-4 mb-4">
          {/* Storage bar */}
          <div className="col-12 col-md-6">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title text-primary">Storage Usage</h5>
                {stats ? (
                  <>
                    <p className="text-muted small mb-2">
                      {formatBytes(stats.usedBytes)} used of{" "}
                      {formatBytes(stats.totalBytes)} —{" "}
                      <strong>{stats.totalFiles} files</strong>
                    </p>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={storageBarData} layout="vertical">
                        <XAxis
                          type="number"
                          tickFormatter={(v) => formatBytes(v)}
                          tick={{ fontSize: 11 }}
                        />
                        <YAxis type="category" dataKey="name" width={40} tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value: any) => {
                          if (Array.isArray(value)) {
                            return value
                              .map((v) => (typeof v === "number" ? formatBytes(v) : String(v)))
                              .join(", ");
                          }
                          if (typeof value === "number") return formatBytes(value);
                          return value == null ? undefined : String(value);
                        }} />
                        <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                          {storageBarData.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </>
                ) : (
                  <p className="text-muted">Loading...</p>
                )}
              </div>
            </div>
          </div>

          {/* File type pie */}
          <div className="col-12 col-md-6">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title text-primary">Files by Type</h5>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted">No files uploaded yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Latest Sensor Readings ── */}
        <div className="row g-3 mb-4">
          {[
            {
              label: "Temperature",
              value: latestSensor ? `${latestSensor.temperature.toFixed(1)} °C` : "—",
              icon: "🌡️",
              color: "danger",
            },
            {
              label: "Humidity",
              value: latestSensor ? `${latestSensor.humidity.toFixed(1)} %` : "—",
              icon: "💧",
              color: "primary",
            },
            {
              label: "Pressure",
              value: latestSensor ? `${latestSensor.pressure.toFixed(1)} hPa` : "—",
              icon: "🔵",
              color: "success",
            },
          ].map((card) => (
            <div className="col-12 col-md-4" key={card.label}>
              <div className={`card shadow-sm border-${card.color} border-start border-4`}>
                <div className="card-body d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted small mb-1">{card.label}</p>
                    <h4 className={`fw-bold text-${card.color} mb-0`}>{card.value}</h4>
                  </div>
                  <span style={{ fontSize: "2rem" }}>{card.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Sensor History Chart ── */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title text-primary">Sensor History (last 24h)</h5>
            {sensorChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={sensorChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 11 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke="#dc3545"
                    dot={false}
                    name="Temp (°C)"
                  />
                  <Line
                    type="monotone"
                    dataKey="humidity"
                    stroke="#0d6efd"
                    dot={false}
                    name="Humidity (%)"
                  />
                  <Line
                    type="monotone"
                    dataKey="pressure"
                    stroke="#20c997"
                    dot={false}
                    name="Pressure (hPa)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted">No sensor data yet.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;