import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Form from "../components/Form";
import Table from "../components/Table";

export default function Dashboard() {
  const { token, user, logout } = useAuth();

  const [data, setData] = useState<any[]>([]);
  const [systemStatus, setSystemStatus] = useState("checking");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStage, setFilterStage] = useState("All");

  // =========================
  // FILTER DATA
  // =========================
  const warehouseData = data.filter(
    (d) => d.stage === "Warehouse RM",
  );

  const prosesData = data.filter(
    (d) => d.stage === "Proses",
  );

  const finishData = data.filter(
    (d) => d.stage === "Finish Good",
  );

  // =========================
  // FETCH DATA
  // =========================
  const fetchData = async () => {
    try {
      const res = await fetch(
        "http://localhost:1337/api/data",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error("Gagal fetch");
      }

      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("Error fetch:", err);
    }
  };

  // =========================
  // LOAD DATA SAAT TOKEN ADA
  // =========================
  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  // =========================
  // HEALTH CHECK
  // =========================
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(
          "http://localhost:1337/api/health",
        );

        const data = await res.json();

        setSystemStatus(data.status);
      } catch {
        setSystemStatus("offline");
      }
    };

    checkStatus();

    const interval = setInterval(
      checkStatus,
      5000,
    );

    return () => clearInterval(interval);
  }, []);

  // =========================
  // ADD DATA
  // =========================
  const handleAdd = async (item: any) => {
    try {
      const res = await fetch(
        "http://localhost:1337/api/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(item),
        },
      );

      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(
        "Gagal menambah data:",
        err,
      );
    }
  };

  // =========================
  // SEARCH + FILTER
  // =========================
  const filteredData = data.filter(
    (item: any) => {
      const matchesSearch = item.barang
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesStage =
        filterStage === "All" ||
        item.stage === filterStage;

      return matchesSearch && matchesStage;
    },
  );

  const filteredWarehouse =
    filteredData.filter(
      (d) => d.stage === "Warehouse RM",
    );

  const filteredProses = filteredData.filter(
    (d) => d.stage === "Proses",
  );

  const filteredFinish = filteredData.filter(
    (d) => d.stage === "Finish Good",
  );

  // =========================
  // TOTAL STOCK
  // =========================
  const getTotal = (arr: any[]) =>
    arr.reduce(
      (acc, item) =>
        acc +
        (Number(item.in || 0) -
          Number(item.out || 0)),
      0,
    );

  // =========================
  // DATE
  // =========================
  const datenow = new Date().toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );

  return (
    <div className="wms-root">

      {/* HEADER */}
      <header className="wms-header">
        <div className="wms-header-left">
          <div>
            <div className="wms-title">
              Warehouse <span>Control</span>
            </div>

            <div className="wms-subtitle">
              Management System · v1.0
            </div>
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
              fontSize: 11,
            }}
          >
            {datenow}
          </div>

          <div className="wms-user-info">
            <span className="wms-user-name">
              {user?.nama}
            </span>

            <span className="wms-user-role">
              {user?.role}
            </span>
          </div>

          <button
            className="wms-logout-btn"
            onClick={logout}
          >
            KELUAR
          </button>
        </div>
      </header>

      {/* KPI */}
      <div className="wms-kpi-row">

        <div className="wms-kpi-card yellow">
          <div className="wms-kpi-label">
            Warehouse RM
          </div>

          <div className="wms-kpi-value">
            {getTotal(warehouseData)}
          </div>

          <div className="wms-kpi-tag">
            {warehouseData.length} transaksi
          </div>
        </div>

        <div className="wms-kpi-card green">
          <div className="wms-kpi-label">
            Proses
          </div>

          <div className="wms-kpi-value">
            {getTotal(prosesData)}
          </div>

          <div className="wms-kpi-tag">
            {prosesData.length} transaksi
          </div>
        </div>

        <div className="wms-kpi-card blue">
          <div className="wms-kpi-label">
            Finish Good
          </div>

          <div className="wms-kpi-value">
            {getTotal(finishData)}
          </div>

          <div className="wms-kpi-tag">
            {finishData.length} transaksi
          </div>
        </div>

      </div>

      {/* FORM */}
      <Form onAdd={handleAdd} />

      {/* SEARCH */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "20px",
        }}
      >

        <input
          type="text"
          placeholder="Cari barang..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
        />

        <select
          value={filterStage}
          onChange={(e) =>
            setFilterStage(e.target.value)
          }
        >
          <option value="All">
            Semua Stage
          </option>

          <option value="Warehouse RM">
            Warehouse RM
          </option>

          <option value="Proses">
            Proses
          </option>

          <option value="Finish Good">
            Finish Good
          </option>
        </select>

      </div>

      {/* TABLE */}
      <div className="wms-section">
        <h2>Warehouse RM</h2>
        <Table data={filteredWarehouse} />
      </div>

      <div className="wms-section">
        <h2>Proses</h2>
        <Table data={filteredProses} />
      </div>

      <div className="wms-section">
        <h2>Finish Good</h2>
        <Table data={filteredFinish} />
      </div>

    </div>
  );
}