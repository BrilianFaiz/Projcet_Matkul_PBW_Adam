import React from "react";
import "./Table.css";

// 🟢 Tambahkan Interface untuk kejelasan tipe data prop
interface TableProps {
  data: any[];
  showApprovalAction?: boolean; // True jika dirender oleh Admin/Superadmin
  onApproveSuccess?: () => void; // Fungsi callback untuk me-refresh data tabel setelah disetujui
}

export default function Table({ data, showApprovalAction = false, onApproveSuccess }: TableProps) {
  let cumulative = 0;

  // Fungsi helper untuk format tampilan tanggal biar seragam DD/MM/YYYY
  const formatTanggal = (item: any) => {
    const rawDate = item.createdAt || item.tanggal;
    if (!rawDate) return "-";
    
    return new Date(rawDate).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // 🟢 Fungsi Handler untuk menembak API Approval backend
  const handleAction = async (id: string, endpoint: "approve" | "reject") => {
    const konfirmasi = window.confirm(`Apakah Anda yakin ingin melakukan ${endpoint} pada data ini?`);
    if (!konfirmasi) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:1337/api/data/${endpoint}/${id}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || `Gagal melakukan ${endpoint}`);

      alert(`Transaksi berhasil di-${endpoint}!`);
      if (onApproveSuccess) onApproveSuccess(); // Refresh tabel data utama di halaman induk
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  if (data.length === 0) {
    return (
      <div className="wms-table-empty">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <rect x="3" y="3" width="18" height="18" rx="1"/>
          <path d="M3 9h18M9 21V9"/>
        </svg>
        <span>Belum ada data jurnal stok</span>
      </div>
    );
  }

  return (
    <div className="wms-table-wrapper">
      <table className="wms-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Tanggal</th>
            <th>Barang</th>
            <th>Stage</th>
            <th>In</th>
            <th>Out</th>
            <th>Balance</th>
            <th>Cumulative</th>
            <th>Status</th>
            <th>Reject</th>
            <th>PIC / Operator</th>
            {showApprovalAction && <th>Otorisasi Panel</th>} {/* 🟢 Header kolom aksi baru */}
          </tr>
        </thead>
        <tbody>
          {data.map((item: any, i: number) => {
            const isPendingRequest = item.stage === "Request Bahan" && item.statusProduksi?.toLowerCase() === "pending";
            
            // 📊 KALKULASI: Jika masih berstatus 'Pending Request Bahan', tidak mengubah nominal balance berjalan
            const balance = isPendingRequest ? 0 : (Number(item.in) || 0) - (Number(item.out) || 0);
            cumulative += balance;

            // Logika pewarnaan badge status produksi (Proses, Selesai, Pending, Ditolak)
            const statusLower = item.statusProduksi?.toLowerCase() || "selesai";
            const statusClass = 
              statusLower === "proses" ? "wms-status-process" : 
              statusLower === "pending" ? "wms-status-pending" : 
              statusLower === "rejected" || statusLower === "ditolak" ? "wms-status-rejected" : "wms-status-done";

            // 🎨 LOGIKA KELAS STAGE: Mengakomodasi 5 jenis alur logistik ISOMRS
            let stageClass = "wms-stage-wh";
            if (item.stage === "Proses") stageClass = "wms-stage-pr";
            if (item.stage === "Finish Good") stageClass = "wms-stage-fg";
            if (item.stage === "Request Bahan") stageClass = "wms-stage-rq";
            if (item.stage === "Laporan Produksi") stageClass = "wms-stage-lp";

            return (
              <tr key={item._id || item.id || i}>
                <td className="wms-td-dim">{String(i + 1).padStart(2, "0")}</td>
                
                <td className="wms-td-mono">{formatTanggal(item)}</td>
                
                <td className="wms-td-bold">{item.barang}</td>
                
                {/* Kolom Badge Kategori Alur */}
                <td>
                  <span className={`wms-stage-badge ${stageClass}`}>
                    {item.stage}
                  </span>
                </td>
                
                <td className="wms-td-green">+{item.in || 0}</td>
                <td className="wms-td-red">-{item.out || 0}</td>
                
                {/* Kolom Balance Aktual Per Baris */}
                <td className={isPendingRequest ? "wms-td-dim" : balance >= 0 ? "wms-td-green" : "wms-td-red"}>
                  {isPendingRequest ? "Menunggu" : balance >= 0 ? `+${balance}` : balance}
                </td>
                
                <td className="wms-td-cumulative">{cumulative}</td>

                {/* Status Alur/Produksi */}
                <td>
                  <span className={`wms-status-badge ${statusClass}`}>
                    {item.statusProduksi || (item.stage === "Warehouse RM" ? "Ready" : "Selesai")}
                  </span>
                </td>

                {/* Kuantitas Reject/Cacat Produksi */}
                <td className={Number(item.reject) > 0 ? "wms-td-orange wms-td-bold" : "wms-td-dim"}>
                  {item.reject && Number(item.reject) > 0 ? `${item.reject} Pcs` : "-"}
                </td>

                {/* Identitas PIC Lapangan */}
                <td className="wms-td-bold" style={{ color: "var(--yellow)", fontSize: "12px" }}>
                  {item.operatorName || "Admin Gudang"}
                </td>

                {/* 🟢 Kolom Tombol Aksi Tombol Validasi Admin */}
                {showApprovalAction && (
                  <td>
                    {isPendingRequest ? (
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button 
                          onClick={() => handleAction(item._id, "approve")}
                          style={{ background: "#22c55e", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "11px", fontWeight: "bold" }}
                        >
                          ✔ Setuju
                        </button>
                        <button 
                          onClick={() => handleAction(item._id, "reject")}
                          style={{ background: "#ef4444", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "11px", fontWeight: "bold" }}
                        >
                          ❌ Tolak
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: "#6b7280", fontSize: "11px" }}>No Action</span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}