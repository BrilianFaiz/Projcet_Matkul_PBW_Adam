import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Form from "./components/Form";
import Table from "./components/Table";
import Login from "./pages/Login";
import "./App.css";

export function Dashboard() {
  const { token, user, logout } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [systemStatus, setSystemStatus] = useState("checking");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStage, setFilterStage] = useState("All");

  const warehouseData = data.filter((d) => d.stage === "Warehouse RM");
  const prosesData = data.filter((d) => d.stage === "Proses");
  const finishData = data.filter((d) => d.stage === "Finish Good");

  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:1337/api/data", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal fetch");
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("Error fetch:", err);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch("http://localhost:1337/api/health");
        const data = await res.json();
        setSystemStatus(data.status);
      } catch {
        setSystemStatus("offline");
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAdd = async (item: any) => {
    try {
      const res = await fetch("http://localhost:1337/api/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(item),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error("Gagal menambah data:", err);
    }
  };

  const filteredData = data.filter((item: any) => {
    const matchesSearch = item.barang
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStage = filterStage === "All" || item.stage === filterStage;
    return matchesSearch && matchesStage;
  });

  const filteredWarehouse = filteredData.filter(
    (d) => d.stage === "Warehouse RM",
  );
  const filteredProses = filteredData.filter((d) => d.stage === "Proses");
  const filteredFinish = filteredData.filter((d) => d.stage === "Finish Good");

  const getTotal = (arr: any[]) =>
    arr.reduce(
      (acc, item) => acc + (Number(item.in || 0) - Number(item.out || 0)),
      0,
    );

  const datenow = new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="wms-root">
      <header className="wms-header">
        <div className="wms-header-left">
          <div className="wms-logo-badge">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="7" width="20" height="14" rx="1" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              <line x1="12" y1="12" x2="12" y2="17" />
              <line x1="9" y1="14.5" x2="15" y2="14.5" />
            </svg>
          </div>
          <div>
            <div className="wms-title">
              Warehouse <span>Control</span>
            </div>
            <div className="wms-subtitle">Management System · v1.0</div>
          </div>
        </div>
        <div className="wms-header-right">
          <div
            className="wms-status-dot"
            style={{
              color:
                systemStatus === "online"
                  ? "var(--green)"
                  : systemStatus === "offline"
                    ? "var(--red)"
                    : "var(--yellow)",
            }}
          >
            {systemStatus === "online"
              ? "SYSTEM ONLINE"
              : systemStatus === "offline"
                ? "SYSTEM OFFLINE"
                : "CHECKING..."}
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--text-dim)",
              letterSpacing: "0.1em",
            }}
          >
            {datenow}
          </div>
          <div className="wms-user-info">
            <span className="wms-user-name">{user?.nama}</span>
            <span className="wms-user-role">{user?.role}</span>
          </div>
          <button className="wms-logout-btn" onClick={logout}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            KELUAR
          </button>
        </div>
      </header>

      <div className="wms-kpi-row">
        <div className="wms-kpi-card yellow">
          <div className="wms-kpi-label">▸ Warehouse RM</div>
          <div className="wms-kpi-value">{getTotal(warehouseData)}</div>
          <div className="wms-kpi-tag">{warehouseData.length} transaksi</div>
        </div>
        <div className="wms-kpi-card green">
          <div className="wms-kpi-label">▸ Proses</div>
          <div className="wms-kpi-value">{getTotal(prosesData)}</div>
          <div className="wms-kpi-tag">{prosesData.length} transaksi</div>
        </div>
        <div className="wms-kpi-card blue">
          <div className="wms-kpi-label">▸ Finish Good</div>
          <div className="wms-kpi-value">{getTotal(finishData)}</div>
          <div className="wms-kpi-tag">{finishData.length} transaksi</div>
        </div>
      </div>

      <Form onAdd={handleAdd} />

      {/* SEARCH & FILTER */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "20px",
          background: "var(--navy)",
          padding: "12px 16px",
        }}
      >
        <input
          type="text"
          placeholder="🔍 Cari nama barang..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 2,
            padding: "10px 14px",
            background: "var(--bg)",
            color: "var(--text-h)",
            border: "1px solid var(--border)",
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            outline: "none",
          }}
        />
        <select
          value={filterStage}
          onChange={(e) => setFilterStage(e.target.value)}
          style={{
            flex: 1,
            padding: "10px 14px",
            background: "var(--bg)",
            color: "var(--text-h)",
            border: "1px solid var(--border)",
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            outline: "none",
          }}
        >
          <option value="All">Semua Stage</option>
          <option value="Warehouse RM">Warehouse RM</option>
          <option value="Proses">Proses</option>
          <option value="Finish Good">Finish Good</option>
        </select>
      </div>

      <div className="wms-section">
        <div className="wms-section-header">
          <div className="wms-section-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
          </div>
          <span className="wms-section-title">Warehouse RM</span>
          <span className="wms-section-badge">
            TOTAL: {getTotal(warehouseData)}
          </span>
        </div>
        <Table data={filteredWarehouse} />
      </div>

      <div className="wms-section">
        <div className="wms-section-header">
          <div className="wms-section-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
            </svg>
          </div>
          <span className="wms-section-title">Proses</span>
          <span className="wms-section-badge">
            TOTAL: {getTotal(prosesData)}
          </span>
        </div>
        <Table data={filteredProses} />
      </div>

      <div className="wms-section">
        <div className="wms-section-header">
          <div className="wms-section-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <polyline points="20 12 20 22 4 22 4 12" />
              <rect x="2" y="7" width="20" height="5" />
              <line x1="12" y1="22" x2="12" y2="7" />
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
            </svg>
          </div>
          <span className="wms-section-title">Finish Good</span>
          <span className="wms-section-badge">
            TOTAL: {getTotal(finishData)}
          </span>
        </div>
        <Table data={filteredFinish} />
      </div>
    </div>
  );
}

function PrivateRoute({ children }: any) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
