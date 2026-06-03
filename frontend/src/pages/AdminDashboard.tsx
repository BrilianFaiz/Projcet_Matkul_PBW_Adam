import React from "react";
import Form from "../components/Form";
import Table from "../components/Table";

interface AdminDashboardProps {
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
  return (
    <div className="admin-dashboard-layout">
      <div className="wms-section-title" style={{ color: "white", marginBottom: "20px" }}>
        <h3 style={{ margin: 0, fontSize: "22px", color: "var(--yellow)" }}>
          CONTROL PANEL: ADMIN GUDANG
        </h3>
        <p style={{ color: "var(--text-dim)", fontSize: "13px" }}>
          Validasi permohonan bahan baku lapangan dan hasil akhir produk masuk gudang.
        </p>
      </div>

      <div className="wms-kpi-row" style={{ marginBottom: "25px" }}>
        <div className="wms-kpi-card yellow">
          <div className="wms-kpi-label">Bahan Baku (Warehouse RM)</div>
          <div className="wms-kpi-value">{getTotal(warehouseData)} Pcs</div>
        </div>
        <div className="wms-kpi-card green">
          <div className="wms-kpi-label">Sedang Jalan (Proses)</div>
          <div className="wms-kpi-value">{prosesData.length} Transaksi</div>
        </div>
        <div className="wms-kpi-card blue">
          <div className="wms-kpi-label">Produk Jadi (Finish Good)</div>
          <div className="wms-kpi-value">{getTotal(finishData)} Pcs</div>
        </div>
      </div>

      {/* VALIDASI REQUEST BAHAN */}
      <div className="wms-section" style={{ background: "rgba(232, 160, 32, 0.05)", padding: "20px", border: "1px solid var(--yellow)", marginBottom: "25px" }}>
        <h4 style={{ margin: "0 0 15px 0", color: "var(--yellow)" }}>🔔 VALIDASI PERMINTAAN BAHAN BAKU OPERATOR</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {pendingBahanRequests.length === 0 ? (
            <div style={{ color: "white", fontSize: "14px", fontStyle: "italic" }}>Tidak ada permintaan bahan baku masuk.</div>
          ) : (
            pendingBahanRequests.map((req) => {
              const isApproved = approvedIds.includes(req._id) || req.statusProduksi === "Disetujui";
              return (
                <div key={req._id || req.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#ffffff", padding: "12px 16px", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "14px", color: "#1a2240" }}>
                    <span style={{ color: "#777", marginRight: "10px" }}>[{formatTanggalTabel(req)}]</span>
                    Operator <strong>{req.operatorName || "Lapangan"}</strong> memerlukan bahan <strong>{req.out} pcs</strong> dari: <u>{req.barang}</u>
                  </div>
                  {isApproved ? (
                    <span style={{ color: "#2ec4b6", fontWeight: "bold", fontSize: "14px" }}>
                      ✓ DISETUJUI & STOK RM TERPOTONG
                    </span>
                  ) : (
                    <button onClick={() => handleAdminApproveBahan(req)} style={{ padding: "8px 16px", background: "var(--yellow)", color: "var(--navy)", fontWeight: "bold", border: "none", cursor: "pointer", borderRadius: "4px" }}>
                      VALIDASI & KELUARKAN BAHAN
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* VALIDASI LAPORAN PRODUKSI */}
      <div className="wms-section" style={{ background: "rgba(0, 180, 216, 0.05)", padding: "20px", border: "1px solid var(--blue)", marginBottom: "25px" }}>
        <h4 style={{ margin: "0 0 15px 0", color: "var(--blue)" }}>📦 VALIDASI HASIL AKHIR PRODUKSI (MASUK GUDANG FINISH GOOD)</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {pendingHasilRequests.length === 0 ? (
            <div style={{ color: "white", fontSize: "14px", fontStyle: "italic" }}>Tidak ada laporan hasil produksi masuk.</div>
          ) : (
            pendingHasilRequests.map((hasil) => {
              const isApproved = approvedIds.includes(hasil._id) || hasil.statusProduksi === "Selesai";
              return (
                <div key={hasil._id || hasil.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#ffffff", padding: "12px 16px", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "14px", color: "#1a2240" }}>
                    <span style={{ color: "#777", marginRight: "10px" }}>[{formatTanggalTabel(hasil)}]</span>
                    Hasil Production item <strong>{hasil.barang}</strong> oleh <strong>{hasil.operatorName || "Lapangan"}</strong>: 
                    <span style={{ color: "var(--green)", fontWeight: "bold" }}> {hasil.in} Berhasil</span> | 
                    <span style={{ color: "var(--red)", fontWeight: "bold" }}> {hasil.reject || 0} Reject</span>
                  </div>
                  {isApproved ? (
                    <span style={{ color: "var(--green)", fontWeight: "bold", fontSize: "14px" }}>
                      ✓ BERHASIL DI VALIDASI & FG BERTAMBAH
                    </span>
                  ) : (
                    <button onClick={() => handleAdminApproveHasil(hasil)} style={{ padding: "8px 16px", background: "var(--blue)", color: "white", fontWeight: "bold", border: "none", cursor: "pointer", borderRadius: "4px" }}>
                      VALIDASI HASIL PRODUKSI
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 🟢 PERBAIKAN DI SINI: Data warehouseData dimasukkan ke dalam komponen Form */}
      <div className="wms-section" style={{ marginBottom: "25px" }}>
        <h4 style={{ color: "white" }}>📥 MANAJEMEN STOCK OPNAME PUSAT</h4>
        <Form onAdd={handleAdd} warehouseData={warehouseData} />
      </div>

      <div className="wms-section"><h2>Daftar Persediaan Global: Warehouse RM</h2><Table data={warehouseData} /></div>
      <div className="wms-section"><h2>Daftar Persediaan Global: Finish Good</h2><Table data={finishData} /></div>
    </div>
  );
}