import { useEffect, useState } from "react";
import Form from "./components/Form";
import Table from "./components/Table";
import "./App.css";

export default function App() {
  const [data, setData] = useState<any[]>([]);
  
  const warehouseData = data.filter(d => d.stage === "Warehouse RM");
  const prosesData    = data.filter(d => d.stage === "Proses");
  const finishData    = data.filter(d => d.stage === "Finish Good");

  // 1. Perbaikan Fetch Data (Arahkan ke Port 5000)
  const fetchData = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/User");
    
    // Cek dulu apakah responsenya sukses (200 OK)
    if (!res.ok) throw new Error("Server bermasalah");

    const result = await res.json();
    setData(result); // Masukkan data ke state
  } catch (err) {
    console.error("Error fetch:", err);
  }
};

  useEffect(() => { fetchData(); }, []);
  // 2. Perbaikan Handle Add (Arahkan ke Port 5000)
  const handleAdd = async (item: any) => {
  try {
    // Gunakan await pada fetch agar sinkron
    const response = await fetch("http://localhost:5000/api/User", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });

    if (response.ok) {
      fetchData(); // Panggil ulang data agar tabel terupdate
    }
  } catch (err) {
    console.error("Gagal menambah data:", err);
  }
};

  const getTotal = (arr: any[]) =>
    arr.reduce((acc, item) => acc + (Number(item.in || 0) - Number(item.out || 0)), 0);

  const now = new Date().toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
  });

  return (
    <div className="wms-root">

      <header className="wms-header">
        <div className="wms-header-left">
          <div className="wms-logo-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="1"/>
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
              <line x1="12" y1="12" x2="12" y2="17"/>
              <line x1="9" y1="14.5" x2="15" y2="14.5"/>
            </svg>
          </div>
          <div>
            <div className="wms-title">Warehouse <span>Control</span></div>
            <div className="wms-subtitle">Management System · v1.0</div>
          </div>
        </div>
        <div className="wms-header-right">
          <div className="wms-status-dot">SYSTEM ONLINE</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.1em" }}>
            {now}
          </div>
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

      <div className="wms-section">
        <div className="wms-section-header">
          <div className="wms-section-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>
          </div>
          <span className="wms-section-title">Warehouse RM</span>
          <span className="wms-section-badge">TOTAL: {getTotal(warehouseData)}</span>
        </div>
        <Table data={warehouseData} />
      </div>

      <div className="wms-section">
        <div className="wms-section-header">
          <div className="wms-section-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
            </svg>
          </div>
          <span className="wms-section-title">Proses</span>
          <span className="wms-section-badge">TOTAL: {getTotal(prosesData)}</span>
        </div>
        <Table data={prosesData} />
      </div>

      <div className="wms-section">
        <div className="wms-section-header">
          <div className="wms-section-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="20 12 20 22 4 22 4 12"/>
              <rect x="2" y="7" width="20" height="5"/>
              <line x1="12" y1="22" x2="12" y2="7"/>
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
            </svg>
          </div>
          <span className="wms-section-title">Finish Good</span>
          <span className="wms-section-badge">TOTAL: {getTotal(finishData)}</span>
        </div>
        <Table data={finishData} />
      </div>

    </div>
  );
}