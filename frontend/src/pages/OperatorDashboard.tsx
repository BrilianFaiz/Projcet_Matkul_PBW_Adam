import React, { useState } from "react";

interface OperatorDashboardProps {
  masterData: any[];
  warehouseData: any[];
  prosesData: any[];
  finishData: any[];
  getTotal: (arr: any[]) => number;
  formatTanggalTabel: (item: any) => string;
  handleOperatorSubmitBahan: (item: any) => Promise<void>; // Submit request bahan baku
  handleOperatorSubmitHasil: (item: any) => Promise<void>; // Submit hasil produksi
}

export default function OperatorDashboard({
  masterData = [],
  warehouseData = [],
  prosesData = [],
  finishData = [],
  getTotal,
  formatTanggalTabel,
  handleOperatorSubmitBahan,
  handleOperatorSubmitHasil,
}: OperatorDashboardProps) {

  // State Form Request Bahan Baku
  const [bahanBarang, setBahanBarang] = useState("");
  const [bahanJumlah, setBahanJumlah] = useState("");

  // State Form Laporan Hasil Produksi
  const [hasilBarang, setHasilBarang] = useState("");
  const [hasilBagus, setHasilBagus] = useState("");
  const [hasilReject, setHasilReject] = useState("");

  // Handle pengajuan bahan baku
  const onSubmitBahan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bahanBarang || !bahanJumlah) return alert("Semua kolom request bahan wajib diisi!");
    
    await handleOperatorSubmitBahan({
      barang: bahanBarang,
      out: Number(bahanJumlah),
      in: 0,
      stage: "Proses Produksi",
      statusProduksi: "Pending Admin", // Menunggu validasi admin logistik
    });

    setBahanBarang("");
    setBahanJumlah("");
    alert("Permintaan bahan baku berhasil dikirim!");
  };

  // Handle pelaporan hasil produksi
  const onSubmitHasil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasilBarang || !hasilBagus) return alert("Nama produk dan jumlah berhasil wajib diisi!");

    await handleOperatorSubmitHasil({
      barang: hasilBarang,
      in: Number(hasilBagus),
      out: 0,
      reject: Number(hasilReject) || 0,
      stage: "Finish Good",
      statusProduksi: "Pending Hasil Admin", // Menunggu validasi admin
    });

    setHasilBarang("");
    setHasilBagus("");
    setHasilReject("");
    alert("Laporan hasil produksi berhasil dikirim!");
  };

  // Memfilter riwayat aktivitas khusus aktivitas produksi yang sedang berjalan
  const aktivitasProses = prosesData || [];

  return (
    <div style={{ 
      padding: "40px", 
      background: "#f8fafc", 
      backgroundImage: "none", 
      color: "#1e293b", 
      minHeight: "100vh", 
      width: "100%",
      boxSizing: "border-box",
      fontFamily: "'Inter', system-ui, sans-serif" 
    }}>
      
      {/* 📄 HEADER PANEL */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: "700", color: "#0f172a", margin: "0 0 6px 0", letterSpacing: "-0.5px" }}>
          Operator Production Panel
        </h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
          Sistem pelaporan pemakaian material pabrik dan input hasil output batch produksi berkala.
        </p>
      </div>

      {/* 📊 FORM KANBAN GRID (Dua Kolom: Request & Report) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        
        {/* KOLOM 1: REQUEST BAHAN BAKU */}
        <div style={sectionBoxStyle}>
          <h3 style={{ ...sectionTitleStyle, color: "#d97706", marginBottom: "4px" }}>1. Request Bahan Baku</h3>
          <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 20px 0" }}>Ambil material dari Warehouse RM untuk mulai produksi.</p>
          
          <form onSubmit={onSubmitBahan} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Nama Bahan Baku</label>
              <input
                type="text"
                value={bahanBarang}
                onChange={(e) => setBahanBarang(e.target.value)}
                placeholder="Contoh: Semen Portland / Pasir Silika"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Jumlah Keluar (Out)</label>
              <input
                type="number"
                value={bahanJumlah}
                onChange={(e) => setBahanJumlah(e.target.value)}
                placeholder="0"
                style={inputStyle}
              />
            </div>
            <button type="submit" style={{ ...btnPrimaryStyle, background: "#d97706", marginTop: "8px" }}>
              Ajukan Ambil Bahan
            </button>
          </form>
        </div>

        {/* KOLOM 2: LAPOR HASIL PRODUKSI */}
        <div style={sectionBoxStyle}>
          <h3 style={{ ...sectionTitleStyle, color: "#10b981", marginBottom: "4px" }}>2. Laporan Hasil Output</h3>
          <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 20px 0" }}>Laporkan jumlah produk jadi yang selesai diproduksi.</p>
          
          <form onSubmit={onSubmitHasil} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Nama Produk Jadi (FG)</label>
              <input
                type="text"
                value={hasilBarang}
                onChange={(e) => setHasilBarang(e.target.value)}
                placeholder="Contoh: Batako Tipe A / Paving Block"
                style={inputStyle}
              />
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Jumlah Bagus (In)</label>
                <input
                  type="number"
                  value={hasilBagus}
                  onChange={(e) => setHasilBagus(e.target.value)}
                  placeholder="0"
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Jumlah Cacat (Reject)</label>
                <input
                  type="number"
                  value={hasilReject}
                  onChange={(e) => setHasilReject(e.target.value)}
                  placeholder="0"
                  style={inputStyle}
                />
              </div>
            </div>
            <button type="submit" style={{ ...btnPrimaryStyle, background: "#10b981", marginTop: "8px" }}>
              Laporkan Hasil Selesai
            </button>
          </form>
        </div>

      </div>

      {/* 📋 MONITORING LIVE BATCH PRODUKSI SAYA */}
      <div style={sectionBoxStyle}>
        <h3 style={{ ...sectionTitleStyle, marginBottom: "20px" }}>
          Status Antrean Batch Produksi Berjalan ({aktivitasProses.length})
        </h3>
        
        {aktivitasProses.length === 0 ? (
          <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>Tidak ada proses pemesanan/produksi aktif saat ini.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr style={{ borderBottom: "1px solid #edf2f7" }}>
                  <th style={thStyle}>Waktu Mulai</th>
                  <th style={thStyle}>Deskripsi Item</th>
                  <th style={thStyle}>Kuantitas Alokasi</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Status Jalur</th>
                </tr>
              </thead>
              <tbody>
                {aktivitasProses.map((item, idx) => (
                  <tr key={item._id || idx} style={trStyle}>
                    <td style={tdStyle}>{typeof formatTanggalTabel === 'function' ? formatTanggalTabel(item) : "-"}</td>
                    <td style={{ ...tdStyle, fontWeight: "500", color: "#0f172a" }}>{item.barang}</td>
                    <td style={tdStyle}>
                      {item.out > 0 ? (
                        <span style={{ color: "#d97706" }}>{item.out} unit digunakan</span>
                      ) : (
                        <span style={{ color: "#10b981" }}>{item.in} unit diproses</span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <span style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        background: item.statusProduksi?.includes("Pending") ? "#fffbeb" : "#eff6ff",
                        color: item.statusProduksi?.includes("Pending") ? "#d97706" : "#2563eb",
                      }}>
                        {item.statusProduksi || "Dalam Proses"}
                      </span>
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
// CLEAN SYSTEM STYLES (FLAT DESIGN, NO BACKGROUND GRID)
// =========================================================
const sectionBoxStyle: React.CSSProperties = {
  background: "#ffffff",
  padding: "28px",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.015)",
  border: "1px solid #e2e8f0",
  boxSizing: "border-box"
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#0f172a",
  margin: 0
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "6px",
  fontSize: "13px",
  color: "#64748b",
  fontWeight: "500",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  background: "#f8fafc",
  color: "#0f172a",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};

const btnPrimaryStyle: React.CSSProperties = {
  padding: "12px 20px",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontWeight: "600",
  fontSize: "14px",
  cursor: "pointer",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  textAlign: "left",
  fontSize: "14px",
};

const thStyle: React.CSSProperties = {
  padding: "12px 8px",
  color: "#94a3b8",
  fontWeight: "600",
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.5px"
};

const tdStyle: React.CSSProperties = {
  padding: "16px 8px",
  color: "#475569",
  verticalAlign: "middle"
};

const trStyle: React.CSSProperties = {
  borderBottom: "1px solid #f1f5f9",
};