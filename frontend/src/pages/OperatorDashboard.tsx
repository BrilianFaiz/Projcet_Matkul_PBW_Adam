import React from "react";
import Table from "../components/Table";

interface OperatorDashboardProps {
  allBahanRequests: any[];
  allHasilRequests: any[];
  warehouseData: any[];
  finishData: any[]; // 🟢 1. Menambahkan prop finishData untuk produk jadi
  reqBarang: string;
  setReqBarang: (v: string) => void;
  reqJumlah: string;
  setReqJumlah: (v: string) => void;
  prodBarang: string;
  setProdBarang: (v: string) => void;
  prodBerhasil: string;
  setProdBerhasil: (v: string) => void;
  prodReject: string;
  setProdReject: (v: string) => void;
  handleOperatorRequestBahan: (e: React.FormEvent) => Promise<void>;
  handleOperatorInputHasil: (e: React.FormEvent) => Promise<void>;
  formatTanggalTabel: (item: any) => string;
}

export default function OperatorDashboard({
  allBahanRequests,
  allHasilRequests,
  warehouseData,
  finishData = [], // 🟢 Default value array kosong menghindari error map jika data belum load
  reqBarang,
  setReqBarang,
  reqJumlah,
  setReqJumlah,
  prodBarang,
  setProdBarang,
  prodBerhasil,
  setProdBerhasil,
  prodReject,
  setProdReject,
  handleOperatorRequestBahan,
  handleOperatorInputHasil,
  formatTanggalTabel,
}: OperatorDashboardProps) {
  
  // 🟢 2. Filter list unik bahan mentah dari Warehouse RM (Alur 1)
  const uniqueWarehouseItems = Array.from(
    new Set(warehouseData.map((item) => item.barang).filter(Boolean))
  );

  // 🟢 3. Filter list unik produk jadi dari Finish Good (Alur 2)
  const uniqueFinishItems = Array.from(
    new Set(finishData.map((item) => item.barang).filter(Boolean))
  );

  return (
    <div className="operator-dashboard-layout">
      <div className="wms-section-title" style={{ color: "white", marginBottom: "20px" }}>
        <h3 style={{ margin: 0, fontSize: "22px", color: "var(--green)" }}>WORKSPACE: OPERATOR PRODUKSI LAPANGAN</h3>
        <p style={{ color: "var(--text-dim)", fontSize: "13px" }}>Kelola pengajuan operational lapangan secara real-time ke Admin Gudang.</p>
      </div>

      {/* 📝 ALUR 1: INPUT REQUEST BAHAN BAKU */}
      <div className="wms-section" style={{ background: "rgba(255,255,255,0.02)", padding: "20px", border: "1px solid var(--border)", marginBottom: "25px" }}>
        <h4 style={{ margin: "0 0 15px 0", color: "var(--yellow)" }}>📝 1. AJUKAN REQUEST BAHAN BAKU KE ADMIN</h4>
        <form onSubmit={handleOperatorRequestBahan} style={{ display: "flex", gap: "12px" }}>
          
          {/* Dropdown Bahan Mentah (Membaca uniqueWarehouseItems) */}
          <select 
            value={reqBarang} 
            onChange={(e) => setReqBarang(e.target.value)} 
            style={{ flex: 2, padding: "11px 16px", background: "#ffffff", border: "1px solid var(--border)", color: "#1a2240", fontSize: "14px", outline: "none" }}
          >
            <option value="">-- Pilih Bahan Mentah --</option>
            {uniqueWarehouseItems.map((namaBarang, idx) => (
              <option key={idx} value={namaBarang}>
                {namaBarang}
              </option>
            ))}
          </select>

          <input 
            type="number" 
            placeholder="Jumlah..." 
            value={reqJumlah} 
            onChange={(e) => setReqJumlah(e.target.value)} 
            style={{ flex: 1, padding: "11px 16px", background: "#ffffff", border: "1px solid var(--border)", color: "#1a2240", fontSize: "14px", outline: "none" }} 
          />
          <button type="submit" style={{ padding: "11px 24px", background: "var(--yellow)", color: "var(--navy)", fontWeight: "bold", border: "none", cursor: "pointer", borderRadius: "4px" }}>KIRIM REQUEST</button>
        </form>
      </div>

      {/* ⚠️ ALUR 2: INPUT LAPOR HASIL PRODUKSI */}
      <div className="wms-section" style={{ background: "rgba(217, 64, 64, 0.02)", padding: "20px", border: "1px solid rgba(217, 64, 64, 0.3)", marginBottom: "25px" }}>
        <h4 style={{ margin: "0 0 15px 0", color: "var(--red)" }}>⚠️ 2. LAPOR HASIL AKHIR PRODUKSI (TOTAL BERHASIL & TOTAL CACAT)</h4>
        <form onSubmit={handleOperatorInputHasil} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          
          {/* 🟢 Dropdown Produk Jadi (Sekarang membaca DATA PRODUK JADI murni dari uniqueFinishItems) */}
          <select 
            value={prodBarang} 
            onChange={(e) => setProdBarang(e.target.value)} 
            style={{ flex: 2, padding: "11px 16px", background: "#ffffff", border: "1px solid var(--border)", color: "#1a2240", fontSize: "14px", outline: "none" }}
          >
            <option value="">-- Pilih Produk Jadi --</option>
            {uniqueFinishItems.map((namaProduk, idx) => (
              <option key={idx} value={namaProduk}>
                {namaProduk}
              </option>
            ))}
          </select>

          <input 
            type="number" 
            placeholder="Jumlah Berhasil..." 
            value={prodBerhasil} 
            onChange={(e) => setProdBerhasil(e.target.value)} 
            style={{ flex: 1, padding: "11px 16px", background: "#ffffff", border: "1px solid var(--border)", color: "#1a2240", fontSize: "14px", outline: "none" }} 
          />
          <input 
            type="number" 
            placeholder="Jumlah Cacat/Reject..." 
            value={prodReject} 
            onChange={(e) => setProdReject(e.target.value)} 
            style={{ flex: 1, padding: "11px 16px", background: "#ffffff", border: "1px solid var(--border)", color: "#1a2240", fontSize: "14px", outline: "none" }} 
          />
          <button type="submit" style={{ padding: "11px 24px", background: "var(--red)", color: "white", fontWeight: "bold", border: "none", cursor: "pointer", borderRadius: "4px", whiteSpace: "nowrap" }}>KIRIM REKAP HASIL</button>
        </form>
      </div>

      {/* TRACKING LIVE */}
      <div className="wms-section" style={{ marginTop: "30px" }}>
        <h3 style={{ color: "black", borderBottom: "2px solid var(--border)", paddingBottom: "10px", marginBottom: "20px" }}>
          📋 TRACKING LIVE: RIWAYAT AKTIVITAS SAYA
        </h3>

        {/* Sub-Tabel Riwayat Request Bahan */}
        <div style={{ marginBottom: "25px" }}>
          <h4 style={{ color: "var(--yellow)", marginBottom: "10px" }}>• Riwayat Pengajuan Bahan Baku</h4>
          {allBahanRequests.length === 0 ? (
            <p style={{ color: "var(--text-dim)", fontStyle: "italic", fontSize: "13px" }}>Belum ada riwayat pengajuan bahan baku.</p>
          ) : (
            <div className="wms-table-responsive" style={{ background: "#ffffff", padding: "10px", border: "1px solid var(--border)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", color: "#1a2240", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "rgba(0,0,0,0.05)", textAlign: "left", color: "#1a2240" }}>
                    <th style={{ padding: "10px", width: "120px" }}>Tanggal</th>
                    <th style={{ padding: "10px" }}>Nama Bahan</th>
                    <th style={{ padding: "10px" }}>Jumlah Diminta</th>
                    <th style={{ padding: "10px" }}>Status Validasi Admin</th>
                  </tr>
                </thead>
                <tbody>
                  {allBahanRequests.map((item, index) => (
                    <tr key={item._id || index} style={{ borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
                      <td style={{ padding: "10px", color: "#555555", fontWeight: "500" }}>{formatTanggalTabel(item)}</td>
                      <td style={{ padding: "10px", color: "#1a2240", fontWeight: "500" }}>{item.barang}</td>
                      <td style={{ padding: "10px", color: "var(--yellow)", fontWeight: "bold" }}>{item.out} Pcs</td>
                      <td style={{ padding: "10px" }}>
                        <span style={{ 
                          padding: "3px 8px", fontSize: "11px", fontWeight: "bold", borderRadius: "3px",
                          background: item.statusProduksi === "Pending" ? "rgba(232,160,32,0.2)" : "rgba(46,204,113,0.2)",
                          color: item.statusProduksi === "Pending" ? "rgba(180,110,10,1)" : "var(--green)"
                        }}>
                          {item.statusProduksi === "Pending" ? "⏳ PENDING" : "✅ DISETUJUI"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sub-Tabel Riwayat Laporan Produksi */}
        <div style={{ marginBottom: "25px" }}>
          <h4 style={{ color: "var(--blue)", marginBottom: "10px" }}>• Riwayat Laporan Hasil Produksi Akhir</h4>
          {allHasilRequests.length === 0 ? (
            <p style={{ color: "var(--text-dim)", fontStyle: "italic", fontSize: "13px" }}>Belum ada riwayat laporan hasil produksi.</p>
          ) : (
            <div className="wms-table-responsive" style={{ background: "#ffffff", padding: "10px", border: "1px solid var(--border)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", color: "#1a2240", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "rgba(0,0,0,0.05)", textAlign: "left", color: "#1a2240" }}>
                    <th style={{ padding: "10px", width: "120px" }}>Tanggal</th>
                    <th style={{ padding: "10px" }}>Nama Produk</th>
                    <th style={{ padding: "10px" }}>Jumlah Berhasil</th>
                    <th style={{ padding: "10px" }}>Jumlah Reject</th>
                    <th style={{ padding: "10px" }}>Status Gudang Utama</th>
                  </tr>
                </thead>
                <tbody>
                  {allHasilRequests.map((item, index) => (
                    <tr key={item._id || index} style={{ borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
                      <td style={{ padding: "10px", color: "#555555", fontWeight: "500" }}>{formatTanggalTabel(item)}</td>
                      <td style={{ padding: "10px", color: "#1a2240", fontWeight: "500" }}>{item.barang}</td>
                      <td style={{ padding: "10px", color: "var(--green)", fontWeight: "bold" }}>{item.in} Pcs</td>
                      <td style={{ padding: "10px", color: "var(--red)", fontWeight: "bold" }}>{item.reject || 0} Pcs</td>
                      <td style={{ padding: "10px" }}>
                        <span style={{ 
                          padding: "3px 8px", fontSize: "11px", fontWeight: "bold", borderRadius: "3px",
                          background: item.statusProduksi === "Pending" ? "rgba(232,160,32,0.2)" : "rgba(52,152,219,0.2)",
                          color: item.statusProduksi === "Pending" ? "rgba(180,110,10,1)" : "var(--blue)"
                        }}>
                          {item.statusProduksi === "Pending" ? "⏳ PROSES CHECK" : "📦 DIVALIDASI"}
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

      <div className="wms-section" style={{ marginTop: "20px" }}>
        <h4 style={{ margin: "0 0 15px 0", color: "black" }}>📋 4. DAFTAR BAHAN BAKU TERSEDIA DI GUDANG UTAMA</h4>
        <Table data={warehouseData} />
      </div>
    </div>
  );
}