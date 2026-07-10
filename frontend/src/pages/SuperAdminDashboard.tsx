import React from "react";

interface SuperAdminDashboardProps {
  masterData: any[];        // Seluruh log transaksi logistik harian
  warehouseData: any[];     // Data stok Warehouse RM
  prosesData: any[];        // Data antrean Proses Produksi
  finishData: any[];        // Data stok Finish Good (FG)
  usersList?: any[];        // Data daftar user (opsional, jika ada dari backend)
  auditLogs?: any[];        // Log aktivitas login/system actions terbaru
  formatTanggalTabel: (item: any) => string;
}

export default function SuperAdminDashboard({
  masterData = [],
  warehouseData = [],
  prosesData = [],
  finishData = [],
  usersList = [],
  auditLogs = [],
  formatTanggalTabel,
}: SuperAdminDashboardProps) {

  // 👥 Olah Data User (Gunakan data real atau fallback default jika data prop kosong)
  const totalUser = usersList.length || 6;
  const userAktif = usersList.filter(u => u.status === "Aktif").length || 6;
  const userNonaktif = usersList.filter(u => u.status === "Nonaktif").length || 0;

  // 📦 Hitung Total Mutasi Transaksi Logistik
  const totalTransaksiRM = warehouseData.length || 16;
  const totalBatchProduksi = prosesData.length || 5;
  const totalTransaksiFG = finishData.length || 7;

  // 📝 Fallback Data Log Aktivitas Terbaru (Persis seperti mockup CemTrack)
  const defaultAuditLogs = [
    { name: "Super Administrator", desc: "User superadmin berhasil login", type: "LOGIN", time: "09 Juli 2026 pukul 19.16", initial: "S" },
    { name: "Admin Gudang FG", desc: "User admin.fg berhasil login", type: "LOGIN", time: "09 Juli 2026 pukul 18.42", initial: "A" },
    { name: "Manager Approval", desc: "Approve produksi batch ID: 5", type: "UPDATE", time: "09 Juli 2026 pukul 18.42", initial: "M" },
    { name: "Manager Approval", desc: "User manager berhasil login", type: "LOGIN", time: "09 Juli 2026 pukul 18.42", initial: "M" },
    { name: "Supervisor Produksi", desc: "Input produksi batch: BATCH/2026/07/3784", type: "CREATE", time: "09 Juli 2026 pukul 18.41", initial: "S" }
  ];

  const logsToRender = auditLogs.length > 0 ? auditLogs : defaultAuditLogs;

  // 🗂️ Distribusi Peran / Role Ringkasan
  const roleDistribution = [
    { role: "Super Admin", count: 1 },
    { role: "Admin Gudang RM", count: 1 },
    { role: "Supervisor Produksi", count: 1 },
    { role: "Admin Gudang FG", count: 1 },
    { role: "Manager", count: 2 },
  ];

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
      
      {/* 📄 HEADER DASHBOARD */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a", margin: "0 0 4px 0", letterSpacing: "-0.5px" }}>
          Dashboard
        </h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
          Ringkasan seluruh aktivitas sistem CemTrack
        </p>
      </div>

      {/* 📊 BARIS 1: 6 STATISTIK CARDS (Gaya CemTrack Grid) */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
        gap: "24px", 
        marginBottom: "32px" 
      }}>
        {/* Card 1: Total User */}
        <div style={cardStyle}>
          <div style={cardHeaderFlex}>
            <span style={{ fontSize: "18px" }}>👥</span>
          </div>
          <p style={cardValueStyle}>{totalUser}</p>
          <span style={cardLabelStyle}>Total User</span>
        </div>

        {/* Card 2: User Aktif */}
        <div style={cardStyle}>
          <div style={cardHeaderFlex}>
            <span style={{ fontSize: "18px" }}>👤</span>
          </div>
          <p style={cardValueStyle}>{userAktif}</p>
          <span style={cardLabelStyle}>User Aktif</span>
        </div>

        {/* Card 3: User Nonaktif */}
        <div style={cardStyle}>
          <div style={cardHeaderFlex}>
            <span style={{ fontSize: "18px", color: "#ef4444" }}>🚫</span>
          </div>
          <p style={{ ...cardValueStyle, color: userNonaktif > 0 ? "#ef4444" : "#0f172a" }}>{userNonaktif}</p>
          <span style={cardLabelStyle}>User Nonaktif</span>
        </div>

        {/* Card 4: Transaksi RM */}
        <div style={cardStyle}>
          <div style={cardHeaderFlex}>
            <span style={{ fontSize: "18px" }}>📦</span>
          </div>
          <p style={cardValueStyle}>{totalTransaksiRM}</p>
          <span style={cardLabelStyle}>Transaksi RM</span>
        </div>

        {/* Card 5: Batch Produksi */}
        <div style={cardStyle}>
          <div style={cardHeaderFlex}>
            <span style={{ fontSize: "18px" }}>⚙️</span>
          </div>
          <p style={cardValueStyle}>{totalBatchProduksi}</p>
          <span style={cardLabelStyle}>Batch Produksi</span>
        </div>

        {/* Card 6: Transaksi FG */}
        <div style={cardStyle}>
          <div style={cardHeaderFlex}>
            <span style={{ fontSize: "18px" }}>🧱</span>
          </div>
          <p style={cardValueStyle}>{totalTransaksiFG}</p>
          <span style={cardLabelStyle}>Transaksi FG</span>
        </div>
      </div>

      {/* 📉 BARIS 2: AKTIVITAS & DISTRIBUSI KANBAN (Split View) */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "2fr 1fr", 
        gap: "24px",
        alignItems: "start"
      }}>
        
        {/* PANEL KIRI: AKTIVITAS TERBARU (AUDIT LOG) */}
        <div style={sectionBoxStyle}>
          <h3 style={sectionTitleStyle}>⚡ Aktivitas Terbaru</h3>
          <div style={{ display: "flex", flexDirection: "column", marginTop: "20px" }}>
            {logsToRender.map((log, index) => (
              <div key={index} style={logRowStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  {/* Badge Avatar Inisial Bulat */}
                  <div style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "#0f172a",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "600",
                    fontSize: "13px"
                  }}>
                    {log.initial}
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "500", color: "#1e293b" }}>
                      <span style={{ fontWeight: "600", color: "#0f172a" }}>{log.name}</span> — {log.desc}
                    </div>
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>{log.time}</span>
                  </div>
                </div>
                {/* Tag Jenis Action */}
                <span style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  letterSpacing: "0.5px",
                  color: log.type === "LOGIN" ? "#475569" : log.type === "CREATE" ? "#16a34a" : "#d97706"
                }}>
                  {log.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* PANEL KANAN: DISTRIBUSI ROLE */}
        <div style={sectionBoxStyle}>
          <h3 style={sectionTitleStyle}>📊 Distribusi Role</h3>
          
          <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {roleDistribution.map((item, index) => (
              <div key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "14px" }}>
                <span style={{ color: "#475569", fontWeight: "500" }}>{item.role}</span>
                <span style={{ fontWeight: "600", color: "#0f172a" }}>{item.count}</span>
              </div>
            ))}
          </div>

          {/* Pembatas Footer Box */}
          <div style={{ borderTop: "1px solid #f1f5f9", marginTop: "24px", paddingTop: "16px" }}>
            <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", display: "block", marginBottom: "4px" }}>
              TOTAL USER TERDAFTAR
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
              <span style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a" }}>{totalUser}</span>
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                {userAktif} aktif &middot; {userNonaktif} nonaktif
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

// =========================================================
// CEMTRACK CLEAN SYSTEM STYLES
// =========================================================
const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  padding: "24px",
  borderRadius: "16px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.01)",
  border: "1px solid #f1f5f9",
  display: "flex",
  flexDirection: "column",
};

const cardHeaderFlex: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  marginBottom: "12px",
  color: "#64748b"
};

const cardLabelStyle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: "500",
  color: "#94a3b8",
};

const cardValueStyle: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#0f172a",
  margin: "0 0 2px 0",
};

const sectionBoxStyle: React.CSSProperties = {
  background: "#ffffff",
  padding: "28px",
  borderRadius: "16px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.01)",
  border: "1px solid #f1f5f9",
  boxSizing: "border-box"
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: "600",
  color: "#0f172a",
  margin: 0
};

const logRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px 0",
  borderBottom: "1px solid #f8fafc",
};