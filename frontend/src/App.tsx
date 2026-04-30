import { useEffect, useState } from "react";
import Form from "./components/Form";
import Table from "./components/Table";
import "./App.css";

export default function App() {
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStage, setFilterStage] = useState("All");

  // 1. Fetch Data dari Backend
  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/User");
      if (!res.ok) throw new Error("Server bermasalah");
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("Error fetch:", err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // 2. Handle Tambah Data
  const handleAdd = async (item: any) => {
    try {
      const response = await fetch("http://localhost:5000/api/User", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (response.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Gagal menambah data:", err);
    }
  };

  // 3. LOGIKA FILTER UTAMA (DIPAKAI DI SEMUA TABEL)
  const filteredData = data.filter((item: any) => {
    const matchesSearch = item.barang.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = filterStage === "All" || item.stage === filterStage;
    return matchesSearch && matchesStage;
  });

  // Pisahkan data yang sudah difilter untuk KPI dan Section
  const warehouseData = filteredData.filter(d => d.stage === "Warehouse RM");
  const prosesData    = filteredData.filter(d => d.stage === "Proses");
  const finishData    = filteredData.filter(d => d.stage === "Finish Good");

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

      {/* KPI CARDS (Otomatis update saat di-search) */}
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

      {/* BOX FITUR SEARCH & FILTER (Hanya satu di sini saja) */}
      <div className="container" style={{ marginTop: '20px' }}>
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          marginBottom: '15px',
          backgroundColor: '#1a1d23', 
          padding: '10px', 
          borderRadius: '8px'
        }}>
          <input 
            type="text" 
            placeholder="🔍 Cari nama barang..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              flex: 2, 
              padding: '10px', 
              backgroundColor: '#0f111a', 
              color: 'white', 
              border: '1px solid #30363d',
              borderRadius: '5px' 
            }}
          />
          <select 
            value={filterStage} 
            onChange={(e) => setFilterStage(e.target.value)}
            style={{ 
              flex: 1, 
              padding: '10px', 
              backgroundColor: '#0f111a', 
              color: 'white', 
              border: '1px solid #30363d',
              borderRadius: '5px' 
            }}
          >
            <option value="All">Semua Stage</option>
            <option value="Warehouse RM">Warehouse RM</option>
            <option value="Proses">Proses</option>
            <option value="Finish Good">Finish Good</option>
          </select>
        </div>
      </div>

      {/* SECTIONS TABEL (Otomatis tersaring sesuai filter) */}
      <div className="wms-section">
        <div className="wms-section-header">
          <span className="wms-section-title">Warehouse RM</span>
          <span className="wms-section-badge">TOTAL: {getTotal(warehouseData)}</span>
        </div>
        <Table data={warehouseData} />
      </div>

      <div className="wms-section">
        <div className="wms-section-header">
          <span className="wms-section-title">Proses</span>
          <span className="wms-section-badge">TOTAL: {getTotal(prosesData)}</span>
        </div>
        <Table data={prosesData} />
      </div>

      <div className="wms-section">
        <div className="wms-section-header">
          <span className="wms-section-title">Finish Good</span>
          <span className="wms-section-badge">TOTAL: {getTotal(finishData)}</span>
        </div>
        <Table data={finishData} />
      </div>
    </div>
  );
}