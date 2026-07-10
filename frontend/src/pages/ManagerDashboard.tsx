import React from "react";

interface ManagerDashboardProps {
  masterData: any[];
  warehouseData: any[];
  prosesData: any[];
  finishData: any[];
  pendingManagerRequests: any[];
  approvedIds: any[];
  getTotal: (arr: any[]) => number;
  formatTanggalTabel: (item: any) => string;
  handleManagerApprove: (item: any) => Promise<void>;
  handleManagerReject?: (item: any) => Promise<void>;
}

export default function ManagerDashboard({
  masterData = [],
  warehouseData = [],
  prosesData = [],
  finishData = [],
  pendingManagerRequests = [],
  approvedIds = [],
  getTotal,
  formatTanggalTabel,
  handleManagerApprove,
  handleManagerReject,
}: ManagerDashboardProps) {

  const totalRM = typeof getTotal === "function" ? getTotal(warehouseData) : 0;
  const totalFG = typeof getTotal === "function" ? getTotal(finishData) : 0;
  const totalProses = (prosesData && prosesData.length) || 0;

  // Kalkulasi persentase untuk Grafik Bar Proporsi
  const totalSemuaItem = totalRM + totalProses + totalFG || 1; 
  const pctRM = Math.round((totalRM / totalSemuaItem) * 100);
  const pctProses = Math.round((totalProses / totalSemuaItem) * 100);
  const pctFG = Math.round((totalFG / totalSemuaItem) * 100);

  // Ambil 5 data transaksi terakhir untuk mini-log tren
  const trenTerakhir = masterData && masterData.length > 0 ? masterData.slice(-5).reverse() : [];

  return (
    <div style={{ 
      padding: "40px", 
      background: "#f8fafc", 
      color: "#1e293b", 
      minHeight: "100vh", 
      width: "100%",
      boxSizing: "border-box",
      fontFamily: "'Inter', system-ui, sans-serif" 
    }}>
      
      {/* 📄 HEADER PANEL */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: "700", color: "#0f172a", margin: "0 0 6px 0", letterSpacing: "-0.5px" }}>
          Manager Approval Panel
        </h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
          Otorisasi tingkat tinggi untuk validasi perilisan batch produksi dan monitoring alokasi aset pabrik.
        </p>
      </div>

      {/* 📊 RINGKASAN EKSEKUTIF CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        <div style={cardStyle}>
          <span style={cardLabelStyle}>TOTAL TRANSAKSI SISTEM</span>
          <p style={cardValueStyle}>{(masterData && masterData.length) || 0} <span style={cardUnitStyle}>Log</span></p>
        </div>
        
        <div style={cardStyle}>
          <span style={cardLabelStyle}>VOLUME BAHAN BAKU (RM)</span>
          <p style={{ ...cardValueStyle, color: "#0f172a" }}>{totalRM} <span style={cardUnitStyle}>unit</span></p>
        </div>

        <div style={cardStyle}>
          <span style={cardLabelStyle}>PRODUKSI SEDANG BERJALAN</span>
          <p style={{ ...cardValueStyle, color: "#2563eb" }}>{totalProses} <span style={cardUnitStyle}>Batch</span></p>
        </div>

        <div style={cardStyle}>
          <span style={cardLabelStyle}>BARANG JADI TERSEDIA (FG)</span>
          <p style={{ ...cardValueStyle, color: "#16a34a" }}>{totalFG} <span style={cardUnitStyle}>unit</span></p>
        </div>
      </div>

      {/* 📉 GRAFIK CLEAN (PURE HTML/CSS - 100% AMAN ANTI-CRASH) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        
        {/* Visualisasi 1: Komposisi Distribusi Material / Produk */}
        <div style={sectionBoxStyle}>
          <h3 style={sectionTitleStyle}>Proporsi Distribusi Item</h3>
          <p style={{ color: "#64748b", fontSize: "13px", margin: "4px 0 24px 0" }}>Persentase perbandingan kapasitas muatan aset.</p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Bar Warehouse RM */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px", fontWeight: "500" }}>
                <span>Warehouse RM</span>
                <span style={{ color: "#f59e0b" }}>{pctRM}% ({totalRM} unit)</span>
              </div>
              <div style={{ width: "100%", height: "8px", background: "#f1f5f9", borderRadius: "99px", overflow: "hidden" }}>
                <div style={{ width: `${pctRM}%`, height: "100%", background: "#f59e0b", borderRadius: "99px" }}></div>
              </div>
            </div>

            {/* Bar Proses Produksi */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px", fontWeight: "500" }}>
                <span>Proses Produksi</span>
                <span style={{ color: "#2563eb" }}>{pctProses}% ({totalProses} batch)</span>
              </div>
              <div style={{ width: "100%", height: "8px", background: "#f1f5f9", borderRadius: "99px", overflow: "hidden" }}>
                <div style={{ width: `${pctProses}%`, height: "100%", background: "#2563eb", borderRadius: "99px" }}></div>
              </div>
            </div>

            {/* Bar Finish Good */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px", fontWeight: "500" }}>
                <span>Finish Good</span>
                <span style={{ color: "#16a34a" }}>{pctFG}% ({totalFG} unit)</span>
              </div>
              <div style={{ width: "100%", height: "8px", background: "#f1f5f9", borderRadius: "99px", overflow: "hidden" }}>
                <div style={{ width: `${pctFG}%`, height: "100%", background: "#16a34a", borderRadius: "99px" }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Visualisasi 2: Mini Timeline Tren Alur Arus Logistik */}
        <div style={sectionBoxStyle}>
          <h3 style={sectionTitleStyle}>Aktivitas Arus Logistik Terakhir</h3>
          <p style={{ color: "#64748b", fontSize: "13px", margin: "4px 0 16px 0" }}>Rekapan real-time mutasi gudang.</p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {trenTerakhir.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: "13px" }}>Belum ada log aktivitas.</p>
            ) : (
              trenTerakhir.map((log: any, idx: number) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "#f8fafc", borderRadius: "6px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "500", color: "#334155" }}>{log.barang}</span>
                  <div>
                    {log.in > 0 ? (
                      <span style={{ fontSize: "12px", background: "#dcfce7", color: "#15803d", padding: "2px 8px", borderRadius: "4px", fontWeight: "600" }}>+{log.in} Masuk</span>
                    ) : (
                      <span style={{ fontSize: "12px", background: "#fee2e2", color: "#b91c1c", padding: "2px 8px", borderRadius: "4px", fontWeight: "600" }}>-{log.out} Keluar</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 🔐 SEKSI UTAMA: ANTRIAN APPROVAL MANAGER */}
      <div style={sectionBoxStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h3 style={{ ...sectionTitleStyle, margin: 0 }}>
            Gerbang Otorisasi & Persetujuan Rilis ({(pendingManagerRequests && pendingManagerRequests.length) || 0})
          </h3>
          <span style={{ fontSize: "11px", background: "#eff6ff", color: "#2563eb", padding: "4px 10px", borderRadius: "12px", fontWeight: "600" }}>
            Tingkat Manajer
          </span>
        </div>

        {(!pendingManagerRequests || pendingManagerRequests.length === 0) ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
            <span style={{ fontSize: "24px", display: "block", marginBottom: "8px" }}>🍃</span>
            <p style={{ fontSize: "14px", margin: 0 }}>Semua pengajuan telah bersih. Tidak ada antrean rilis kritis.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr style={{ borderBottom: "1px solid #edf2f7" }}>
                  <th style={thStyle}>Tanggal Request</th>
                  <th style={thStyle}>Divisi / Pemohon</th>
                  <th style={thStyle}>Spesifikasi Item</th>
                  <th style={thStyle}>Kuantitas Alokasi</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Keputusan Eksekutif</th>
                </tr>
              </thead>
              <tbody>
                {pendingManagerRequests.map((item) => {
                  const isApproved = approvedIds && approvedIds.includes(item._id);
                  return (
                    <tr key={item._id} style={trStyle}>
                      <td style={tdStyle}>{typeof formatTanggalTabel === 'function' ? formatTanggalTabel(item) : "-"}</td>
                      <td style={{ ...tdStyle, fontWeight: "500", color: "#0f172a" }}>
                        {item.operatorName || "Staf Administrasi"}
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: "500", color: "#334155" }}>{item.barang}</div>
                        <div style={{ fontSize: "12px", color: "#94a3b8" }}>Stage: {item.stage || "N/A"}</div>
                      </td>
                      <td style={tdStyle}>
                        {item.in > 0 ? (
                          <span style={{ color: "#16a34a", fontWeight: "600" }}>+{item.in} In</span>
                        ) : (
                          <span style={{ color: "#dc2626", fontWeight: "600" }}>-{item.out} Out</span>
                        )}
                      </td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "8px" }}>
                          {!isApproved && handleManagerReject && (
                            <button
                              onClick={() => handleManagerReject(item)}
                              style={{ ...btnActionStyle, background: "#fef2f2", color: "#ef4444" }}
                            >
                              Tolak
                            </button>
                          )}
                          
                          <button 
                            onClick={() => handleManagerApprove(item)} 
                            disabled={isApproved}
                            style={{
                              ...btnActionStyle,
                              background: isApproved ? "#f1f5f9" : "#2563eb",
                              color: isApproved ? "#94a3b8" : "#ffffff",
                              cursor: isApproved ? "not-allowed" : "pointer"
                            }}
                          >
                            {isApproved ? "✓ Authorized" : "Berikan Izin / Rilis"}
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