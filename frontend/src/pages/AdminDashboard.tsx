import React, { useState } from "react";

interface AdminDashboardProps {
  masterData: any[];
  warehouseData: any[];
  prosesData: any[];
  finishData: any[];
  pendingBahanRequests: any[];
  pendingHasilRequests: any[];
  approvedIds: any[];
  getTotal: (arr: any[]) => number;
  formatTanggalTabel: (item: any) => string;
  handleAdminApproveBahan: (item: any) => Promise<void>;
  handleAdminApproveHasil: (item: any) => Promise<void>;
  handleAdd: (item: any) => Promise<void>;
}

export default function AdminDashboard({
  masterData,
  warehouseData,
  prosesData,
  finishData,
  pendingBahanRequests,
  pendingHasilRequests,
  approvedIds,
  getTotal,
  formatTanggalTabel,
  handleAdminApproveBahan,
  handleAdminApproveHasil,
  handleAdd,
}: AdminDashboardProps) {
  
  const master = masterData;

  // State Form Manajemen Stok Awal / Penyesuaian
  const [inputBarang, setInputBarang] = useState("");
  const [inputIn, setInputIn] = useState("");
  const [inputOut, setInputOut] = useState("");

  const handleSubmitAdminForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputBarang) return alert("Nama barang wajib diisi!");

    await handleAdd({
      barang: inputBarang,
      in: Number(inputIn) || 0,
      out: Number(inputOut) || 0,
      stage: "Warehouse RM",
      statusProduksi: "Selesai",
    });

    setInputBarang("");
    setInputIn("");
    setInputOut("");
    alert("Stok berhasil diperbarui!");
  };

  return (
    <div style={{ padding: "24px", background: "#f8fafc", color: "#1e293b", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      
      {/* 📄 TITLE & SUBTITLE HEADER */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "600", color: "#0f172a", margin: "0 0 4px 0" }}>
          Dashboard Admin Administrasi
        </h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
          Ringkasan seluruh aktivitas validasi logistik bahan baku dan hasil produksi.
        </p>
      </div>

      {/* 📊 STATS GRID CARDS (Gaya CemTrack dengan latar putih + shadow halus) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "24px" }}>
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <span style={cardLabelStyle}>TOTAL LOG TRANSAKSI</span>
            <span style={{ fontSize: "18px" }}>📦</span>
          </div>
          <p style={cardValueStyle}>{master.length}</p>
        </div>
        
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <span style={cardLabelStyle}>STOK WAREHOUSE RM</span>
            <span style={{ fontSize: "18px" }}>🏭</span>
          </div>
          <p style={cardValueStyle}>{getTotal(warehouseData)} <span style={cardUnitStyle}>unit</span></p>
        </div>

        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <span style={cardLabelStyle}>BATCH PROSES PRODUKSI</span>
            <span style={{ fontSize: "18px" }}>⏳</span>
          </div>
          <p style={cardValueStyle}>{prosesData.length} <span style={cardUnitStyle}>item</span></p>
        </div>

        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <span style={cardLabelStyle}>TOTAL FINISH GOOD</span>
            <span style={{ fontSize: "18px" }}>✅</span>
          </div>
          <p style={cardValueStyle}>{getTotal(finishData)} <span style={cardUnitStyle}>unit</span></p>
        </div>
      </div>

      {/* 📥 FORM PENGINPUTAN / PENYESUAIAN STOK */}
      <div style={sectionBoxStyle}>
        <h3 style={sectionTitleStyle}>Manajemen & Koreksi Stok Awal (Warehouse RM)</h3>
        <form onSubmit={handleSubmitAdminForm} style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: "2", minWidth: "260px" }}>
            <label style={labelStyle}>Nama Barang/Bahan Baku</label>
            <input
              type="text"
              value={inputBarang}
              onChange={(e) => setInputBarang(e.target.value)}
              placeholder="Contoh: Biji Plastik / Silika"
              style={inputStyle}
            />
          </div>
          <div style={{ flex: "1", minWidth: "120px" }}>
            <label style={labelStyle}>Barang Masuk (In)</label>
            <input
              type="number"
              value={inputIn}
              onChange={(e) => setInputIn(e.target.value)}
              placeholder="0"
              style={inputStyle}
            />
          </div>
          <div style={{ flex: "1", minWidth: "120px" }}>
            <label style={labelStyle}>Barang Keluar (Out)</label>
            <input
              type="number"
              value={inputOut}
              onChange={(e) => setInputOut(e.target.value)}
              placeholder="0"
              style={inputStyle}
            />
          </div>
          <button type="submit" style={btnPrimaryStyle}>
            Simpan Data
          </button>
        </form>
      </div>

      {/* ⚠️ SEKSI TABEL 1: PERSETUJUAN PERMINTAAN BAHAN OPERATOR */}
      <div style={sectionBoxStyle}>
        <h3 style={{ ...sectionTitleStyle, color: "#d97706", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>⚠️</span> Persetujuan Request Bahan Baku Operator ({pendingBahanRequests.length})
        </h3>
        {pendingBahanRequests.length === 0 ? (
          <p style={{ color: "#64748b", fontSize: "14px", margin: "8px 0 0 0" }}>Tidak ada permintaan bahan baku yang tertunda.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <th style={thStyle}>Tanggal Pengajuan</th>
                  <th style={thStyle}>Nama Operator</th>
                  <th style={thStyle}>Nama Bahan</th>
                  <th style={thStyle}>Jumlah Diminta</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pendingBahanRequests.map((item) => (
                  <tr key={item._id} style={trStyle}>
                    <td style={tdStyle}>{formatTanggalTabel(item)}</td>
                    <td style={{ ...tdStyle, fontWeight: "500", color: "#0f172a" }}>{item.operatorName || "-"}</td>
                    <td style={tdStyle}>{item.barang}</td>
                    <td style={{ ...tdStyle, color: "#dc2626", fontWeight: "600" }}>-{item.out}</td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <button 
                        onClick={() => handleAdminApproveBahan(item)} 
                        disabled={approvedIds.includes(item._id)}
                        style={{
                          ...btnActionStyle,
                          background: approvedIds.includes(item._id) ? "#f1f5f9" : "#f59e0b",
                          color: approvedIds.includes(item._id) ? "#94a3b8" : "#ffffff",
                        }}
                      >
                        {approvedIds.includes(item._id) ? "Disetujui" : "Validasi Keluar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ✅ SEKSI TABEL 2: VALIDASI LAPORAN HASIL PRODUKSI */}
      <div style={sectionBoxStyle}>
        <h3 style={{ ...sectionTitleStyle, color: "#059669", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>✅</span> Validasi Laporan Hasil Produksi ({pendingHasilRequests.length})
        </h3>
        {pendingHasilRequests.length === 0 ? (
          <p style={{ color: "#64748b", fontSize: "14px", margin: "8px 0 0 0" }}>Tidak ada laporan hasil produksi baru.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <th style={thStyle}>Tanggal Selesai</th>
                  <th style={thStyle}>Nama Operator</th>
                  <th style={thStyle}>Nama Produk</th>
                  <th style={thStyle}>Berhasil (In)</th>
                  <th style={thStyle}>Cacat (Reject)</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pendingHasilRequests.map((item) => (
                  <tr key={item._id} style={trStyle}>
                    <td style={tdStyle}>{formatTanggalTabel(item)}</td>
                    <td style={{ ...tdStyle, fontWeight: "500", color: "#0f172a" }}>{item.operatorName || "-"}</td>
                    <td style={tdStyle}>{item.barang}</td>
                    <td style={{ ...tdStyle, color: "#16a34a", fontWeight: "600" }}>+{item.in}</td>
                    <td style={{ ...tdStyle, color: "#dc2626", fontWeight: "600" }}>{item.reject || 0}</td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <button 
                        onClick={() => handleAdminApproveHasil(item)} 
                        disabled={approvedIds.includes(item._id)}
                        style={{
                          ...btnActionStyle,
                          background: approvedIds.includes(item._id) ? "#f1f5f9" : "#10b981",
                          color: approvedIds.includes(item._id) ? "#94a3b8" : "#ffffff",
                        }}
                      >
                        {approvedIds.includes(item._id) ? "Selesai" : "Validasi Masuk Gudang"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

// =========================================================
// CEMTRACK INSPIRED CLEAN LIGHT THEME STYLES
// =========================================================
const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  padding: "20px",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
};

const cardHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "12px",
};

const cardLabelStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: "600",
  color: "#64748b",
  letterSpacing: "0.5px",
};

const cardValueStyle: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#0f172a",
  margin: 0,
};

const cardUnitStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: "400",
  color: "#64748b",
};

const sectionBoxStyle: React.CSSProperties = {
  background: "#ffffff",
  padding: "24px",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
  marginBottom: "24px",
};

const sectionTitleStyle: React.CSSProperties = {
  margin: "0 0 20px 0",
  fontSize: "16px",
  fontWeight: "600",
  color: "#0f172a",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "6px",
  fontSize: "13px",
  color: "#475569",
  fontWeight: "500",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "6px",
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};

const btnPrimaryStyle: React.CSSProperties = {
  padding: "10px 20px",
  background: "#f59e0b", // Warna aksen kuning oranye khas CemTrack
  color: "#white",
  border: "none",
  borderRadius: "6px",
  fontWeight: "600",
  fontSize: "14px",
  cursor: "pointer",
};

const btnActionStyle: React.CSSProperties = {
  padding: "6px 14px",
  border: "none",
  borderRadius: "4px",
  fontSize: "13px",
  fontWeight: "600",
  cursor: "pointer",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  textAlign: "left",
  fontSize: "14px",
  marginTop: "8px",
};

const thStyle: React.CSSProperties = {
  padding: "12px 8px",
  color: "#64748b",
  fontWeight: "600",
  fontSize: "13px",
};

const tdStyle: React.CSSProperties = {
  padding: "14px 8px",
  color: "#475569",
};

const trStyle: React.CSSProperties = {
  borderBottom: "1px solid #f1f5f9",
};