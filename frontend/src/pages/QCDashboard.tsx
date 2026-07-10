import React from "react";

interface QCDashboardProps {
  masterData: any[];
  prosesData: any[];
  finishData: any[];
  pendingQCRequests: any[]; // Antrean data yang perlu dicek kualitasnya oleh QC
  approvedIds: any[];
  formatTanggalTabel: (item: any) => string;
  handleQCApprove: (item: any) => Promise<void>; // Fungsi jika produk lolos standar QC
  handleQCReject: (item: any) => Promise<void>;  // Fungsi jika produk gagal / masuk reject
}

export default function QCDashboard({
  masterData = [],
  prosesData = [],
  finishData = [],
  pendingQCRequests = [],
  approvedIds = [],
  formatTanggalTabel,
  handleQCApprove,
  handleQCReject,
}: QCDashboardProps) {

  // 📊 KALKULASI STATISTIK KUALITAS PRODUKSI (Pure HTML/CSS Metrics)
  let totalBagus = 0;
  let totalReject = 0;

  masterData.forEach((item) => {
    if (item.in) totalBagus += Number(item.in);
    if (item.reject) totalReject += Number(item.reject);
  });

  const totalProduksiSelesai = totalBagus + totalReject || 1;
  const akurasiProduksi = Math.round((totalBagus / totalProduksiSelesai) * 100);
  const rasioDefect = Math.round((totalReject / totalProduksiSelesai) * 100);

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
          Quality Control (QC) Panel
        </h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
          Audit kelayakan mutu output produksi, validasi produk gagal, dan standarisasi penjaminan mutu batch.
        </p>
      </div>

      {/* 📊 MATRIKS KUALITAS CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        <div style={cardStyle}>
          <span style={cardLabelStyle}>AKURASI PRODUKSI LOLOS</span>
          <p style={{ ...cardValueStyle, color: "#16a34a" }}>{akurasiProduksi}%</p>
        </div>
        
        <div style={cardStyle}>
          <span style={cardLabelStyle}>TOTAL PRODUK LAYAK (PASS)</span>
          <p style={{ ...cardValueStyle, color: "#0f172a" }}>{totalBagus} <span style={cardUnitStyle}>unit</span></p>
        </div>

        <div style={cardStyle}>
          <span style={cardLabelStyle}>RASIO CACAT PRODUKSI (DEFECT)</span>
          <p style={{ ...cardValueStyle, color: "#dc2626" }}>{rasioDefect}%</p>
        </div>

        <div style={cardStyle}>
          <span style={cardLabelStyle}>TOTAL REJECTED MATERIAL</span>
          <p style={{ ...cardValueStyle, color: "#b91c1c" }}>{totalReject} <span style={cardUnitStyle}>unit</span></p>
        </div>
      </div>

      {/* 📉 VISUALISASI KELAYAKAN MUTU */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        
        <div style={sectionBoxStyle}>
          <h3 style={sectionTitleStyle}>Indikator Batas Toleransi Defect</h3>
          <p style={{ color: "#64748b", fontSize: "13px", margin: "4px 0 20px 0" }}>Batas maksimal cacat produksi yang diizinkan sistem adalah 10%.</p>
          
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px", fontWeight: "500" }}>
              <span>Persentase Defect Saat Ini</span>
              <span style={{ color: rasioDefect > 10 ? "#dc2626" : "#2563eb", fontWeight: "600" }}>{rasioDefect}%</span>
            </div>
            <div style={{ width: "100%", height: "12px", background: "#f1f5f9", borderRadius: "99px", overflow: "hidden", position: "relative" }}>
              <div style={{ 
                width: `${Math.min(rasioDefect, 100)}%`, 
                height: "100%", 
                background: rasioDefect > 10 ? "#dc2626" : "#2563eb", 
                borderRadius: "99px",
                transition: "width 0.3s ease"
              }}></div>
              {/* Garis Batas Toleransi 10% */}
              <div style={{ position: "absolute", left: "10%", top: 0, bottom: 0, width: "2px", background: "#ef4444", opacity: 0.6 }} title="Batas Toleransi 10%"></div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#94a3b8", marginTop: "6px" }}>
              <span>0% (Sempurna)</span>
              <span style={{ color: "#ef4444", fontWeight: "600" }}>Batas Aman 10%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        <div style={sectionBoxStyle}>
          <h3 style={sectionTitleStyle}>Catatan Standar Operasional Mutu</h3>
          <p style={{ color: "#475569", fontSize: "13px", lineHeight: "1.6", margin: "12px 0 0 0" }}>
            Setiap item yang masuk ke tabel pemeriksaan di bawah wajib ditinjau secara fisik terlebih dahulu. 
            Jika jumlah komponen yang rusak melebihi ambang batas toleransi, harap berikan catatan koordinasi ke unit Operator melalui jalur supervisor.
          </p>
        </div>

      </div>

      {/* 🔍 SEKSI UTAMA: ANTREAN INSPEKSI QUALITY CONTROL */}
      <div style={sectionBoxStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h3 style={{ ...sectionTitleStyle, margin: 0 }}>
            Antrean Validasi Kelayakan Batch ({pendingQCRequests.length})
          </h3>
          <span style={{ fontSize: "11px", background: "#f0fdf4", color: "#16a34a", padding: "4px 10px", borderRadius: "12px", fontWeight: "600" }}>
            Ready to Inspect
          </span>
        </div>

        {pendingQCRequests.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
            <span style={{ fontSize: "24px", display: "block", marginBottom: "8px" }}>✨</span>
            <p style={{ fontSize: "14px", margin: 0 }}>Semua produk selesai di-inspect. Antrean kosong.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr style={{ borderBottom: "1px solid #edf2f7" }}>
                  <th style={thStyle}>Tanggal Masuk</th>
                  <th style={thStyle}>Nama Operator</th>
                  <th style={thStyle}>Spesifikasi Item</th>
                  <th style={thStyle}>Jumlah Bagus</th>
                  <th style={thStyle}>Jumlah Cacat</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Aksi Otoritas QC</th>
                </tr>
              </thead>
              <tbody>
                {pendingQCRequests.map((item) => {
                  const isChecked = approvedIds.includes(item._id);
                  return (
                    <tr key={item._id} style={trStyle}>
                      <td style={tdStyle}>{typeof formatTanggalTabel === "function" ? formatTanggalTabel(item) : "-"}</td>
                      <td style={{ ...tdStyle, fontWeight: "500", color: "#0f172a" }}>{item.operatorName || "Operator Pabrik"}</td>
                      <td style={{ ...tdStyle, fontWeight: "600", color: "#1e293b" }}>{item.barang}</td>
                      <td style={{ ...tdStyle, color: "#16a34a", fontWeight: "600" }}>{item.in || 0} unit</td>
                      <td style={{ ...tdStyle, color: "#dc2626", fontWeight: "600" }}>{item.reject || 0} unit</td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "8px" }}>
                          <button
                            onClick={() => handleQCReject(item)}
                            disabled={isChecked}
                            style={{
                              ...btnActionStyle,
                              background: isChecked ? "#f1f5f9" : "#fee2e2",
                              color: isChecked ? "#94a3b8" : "#dc2626",
                            }}
                          >
                            Reject Batch
                          </button>
                          
                          <button
                            onClick={() => handleQCApprove(item)}
                            disabled={isChecked}
                            style={{
                              ...btnActionStyle,
                              background: isChecked ? "#f1f5f9" : "#16a34a",
                              color: isChecked ? "#94a3b8" : "#ffffff",
                            }}
                          >
                            {isChecked ? "Verified" : "Lolos QC (Pass)"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

// =========================================================
// CLEAN SYSTEM STYLES
// =========================================================
const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  padding: "24px",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.015)",
  border: "1px solid #e2e8f0"
};

const cardLabelStyle: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: "600",
  color: "#94a3b8",
  letterSpacing: "0.5px",
  display: "block",
  marginBottom: "8px"
};

const cardValueStyle: React.CSSProperties = {
  fontSize: "32px",
  fontWeight: "700",
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
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.015)",
  border: "1px solid #e2e8f0",
  boxSizing: "border-box"
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: "600",
  color: "#0f172a",
  margin: 0
};

const btnActionStyle: React.CSSProperties = {
  padding: "8px 16px",
  border: "none",
  borderRadius: "6px",
  fontSize: "13px",
  fontWeight: "600",
  cursor: "pointer"
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