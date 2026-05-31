import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Form from "../components/Form";
import Table from "../components/Table";

export default function Dashboard() {
  const { token, user, logout } = useAuth();

  const [data, setData] = useState<any[]>([]);
  const [systemStatus, setSystemStatus] = useState("checking");
 

  // State untuk melacak ID item yang baru divalidasi admin secara real-time
  const [approvedIds, setApprovedIds] = useState<any[]>([]);

  // State Form Input Operator
  const [reqBarang, setReqBarang] = useState("");
  const [reqJumlah, setReqJumlah] = useState("");
  const [prodBarang, setProdBarang] = useState("");
  const [prodBerhasil, setProdBerhasil] = useState("");
  const [prodReject, setProdReject] = useState("");

  // =========================================================
  // FETCH DATA GLOBAL
  // =========================================================
  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:1337/api/data", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal fetch data");
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("Error fetch:", err);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  // Health Check Server
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch("http://localhost:1337/api/health");
        const resData = await res.json();
        setSystemStatus(resData.status);
      } catch {
        setSystemStatus("offline");
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handler Kirim Data Baru ke Backend
  const handleAdd = async (item: any) => {
    try {
      const payload = {
        ...item,
        operatorName: item.operatorName || user?.nama,
        rolePengirim: user?.role,
        tanggal: item.tanggal || new Date().toISOString()
      };
      const res = await fetch("http://localhost:1337/api/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        fetchData(); // Otomatis reload data agar riwayat langsung terupdate
      }
    } catch (err) {
      console.error("Gagal menyimpan ke database:", err);
    }
  };

  // =========================================================
  // ALUR 1: REQUEST BAHAN BAKU
  // =========================================================
  const handleOperatorRequestBahan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqBarang || !reqJumlah) return alert("Isi nama bahan dan jumlah!");

    await handleAdd({
      barang: reqBarang,
      in: 0,
      out: Number(reqJumlah),
      stage: "Request Bahan", 
      statusProduksi: "Pending", 
    });

    alert(`Request bahan ${reqBarang} berhasil dikirim!`);
    setReqBarang("");
    setReqJumlah("");
  };

  const handleAdminApproveBahan = async (item: any) => {
    try {
      

      // 2. Update status request lama di database berdasarkan ID-nya menjadi "Disetujui"
      if (item._id) {
        const resUpdate = await fetch(`http://localhost:1337/api/data/${item._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ statusProduksi: "Disetujui" }),
        });

        if (!resUpdate.ok) {
          console.error("Gagal memperbarui status request di database");
        }

        setApprovedIds((prev) => [...prev, item._id]);
         console.log("ID yang akan diupdate:", item._id);
      console.log(await resUpdate.text());
      }
      
      alert(`Validasi Berhasil!`);
      fetchData(); // Sync ulang data global setelah update status berhasil
    } catch (err) {
      console.error("Gagal memproses validasi bahan:", err);
    }
  };

  // =========================================================
  // ALUR 2: LAPORAN HASIL PRODUKSI
  // =========================================================
  const handleOperatorInputHasil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodBarang || !prodBerhasil || !prodReject) return alert("Lengkapi laporan produksi!");

    await handleAdd({
      barang: prodBarang,
      in: Number(prodBerhasil),
      out: 0,
      reject: Number(prodReject),
      stage: "Laporan Produksi", 
      statusProduksi: "Pending" 
    });

    alert(`Laporan hasil produksi ${prodBarang} terkirim ke Admin!`);
    setProdBarang("");
    setProdBerhasil("");
    setProdReject("");
  };

  const handleAdminApproveHasil = async (item: any) => {
    try {
      // 1. Masukkan barang berhasil ke Finish Good
      if (item.in > 0) {
        await handleAdd({
          barang: item.barang,
          in: item.in,
          out: 0,
          stage: "Finish Good",
          statusProduksi: "Selesai",
          operatorName: item.operatorName
        });
      }
      // 2. Masukkan barang reject ke Proses/Cacat
      if (item.reject > 0) {
        await handleAdd({
          barang: `${item.barang} (Cacat Produksi)`,
          in: 0,
          out: 0,
          reject: item.reject,
          stage: "Proses",
          statusProduksi: "Selesai",
          operatorName: item.operatorName
        });
      }

      // 3. Update status laporan produksi lama di database berdasarkan ID-nya menjadi "Selesai"
      if (item._id) {
        const resUpdate = await fetch(`http://localhost:1337/api/data/${item._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ statusProduksi: "Selesai" }),
        });

        if (!resUpdate.ok) {
          console.error("Gagal memperbarui status laporan di database");
        }

        setApprovedIds((prev) => [...prev, item._id]);
      }

      alert(`Laporan Produksi Ter-validasi!`);
      fetchData(); // Sync ulang data global setelah update status berhasil
    } catch (err) {
      console.error("Gagal memproses validasi laporan hasil:", err);
    }
  };

  const getTotal = (arr: any[]) =>
    arr.reduce((acc, item) => acc + (Number(item.in || 0) - Number(item.out || 0)), 0);

  // Helper fungsi untuk format tampilan tanggal biar seragam DD/MM/YYYY
  const formatTanggalTabel = (item: any) => {
    const rawDate = item.createdAt || item.tanggal;
    if (!rawDate) return new Date().toLocaleDateString('id-ID');
    return new Date(rawDate).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Filter Data Manajemen Global
  const warehouseData = data.filter((d) => d.stage === "Warehouse RM");
  const prosesData = data.filter((d) => d.stage === "Proses");
  const finishData = data.filter((d) => d.stage === "Finish Good");

  // Filter Sinkronisasi Antrean & Riwayat (Real-time DB)
  const allBahanRequests = data.filter((d) => d.stage === "Request Bahan");
  const allHasilRequests = data.filter((d) => d.stage === "Laporan Produksi");
  
  const pendingBahanRequests = allBahanRequests.filter((d) => d.statusProduksi === "Pending");
  const pendingHasilRequests = allHasilRequests.filter((d) => d.statusProduksi === "Pending");

  return (
    <div className="wms-root">
      {/* ── HEADER UTAMA ── */}
      <header className="wms-header">
        <div className="wms-header-left">
          <div>
            <div className="wms-title">Warehouse <span>Control</span></div>
            <div className="wms-subtitle">Management System · v1.0</div>
          </div>
        </div>
        <div className="wms-header-right">
          <div className="wms-status-dot" style={{ color: systemStatus === "online" ? "var(--green)" : "var(--red)" }}>
            {systemStatus === "online" ? "SYSTEM ONLINE" : "CHECKING..."}
          </div>
          <div className="wms-user-info">
            <span className="wms-user-name">{user?.nama}</span>
            <span className="wms-user-role" style={{ color: "var(--yellow)", fontWeight: "bold" }}> [{user?.role}]</span>
          </div>
          <button className="wms-logout-btn" onClick={logout}>KELUAR</button>
        </div>
      </header>

      {user?.role === "admin" ? (
        /* ════════════════════════════════════════════════════════════
           A. INTERFACE: ADMIN GUDANG
           ════════════════════════════════════════════════════════════ */
        <div className="admin-dashboard-layout">
          <div className="wms-section-title" style={{ color: "white", marginBottom: "20px" }}>
            <h3 style={{ margin: 0, fontSize: "22px", color: "var(--yellow)" }}>CONTROL PANEL: ADMIN GUDANG</h3>
            <p style={{ color: "var(--text-dim)", fontSize: "13px" }}>Validasi permohonan bahan baku lapangan dan hasil akhir produk masuk gudang.</p>
          </div>

          <div className="wms-kpi-row" style={{ marginBottom: "25px" }}>
            <div className="wms-kpi-card yellow"><div className="wms-kpi-label">Bahan Baku (Warehouse RM)</div><div className="wms-kpi-value">{getTotal(warehouseData)} Pcs</div></div>
            <div className="wms-kpi-card green"><div className="wms-kpi-label">Sedang Jalan (Proses)</div><div className="wms-kpi-value">{prosesData.length} Transaksi</div></div>
            <div className="wms-kpi-card blue"><div className="wms-kpi-label">Produk Jadi (Finish Good)</div><div className="wms-kpi-value">{getTotal(finishData)} Pcs</div></div>
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

          <div className="wms-section" style={{ marginBottom: "25px" }}><h4 style={{ color: "white" }}>📥 MANAJEMEN STOCK OPNAME PUSAT</h4><Form onAdd={handleAdd} /></div>
          <div className="wms-section"><h2>Daftar Persediaan Global: Warehouse RM</h2><Table data={warehouseData} /></div>
          <div className="wms-section"><h2>Daftar Persediaan Global: Finish Good</h2><Table data={finishData} /></div>
        </div>
      ) : (
        /* ════════════════════════════════════════════════════════════
           B. INTERFACE: OPERATOR PRODUKSI (DENGAN REKAP RIWAYAT)
           ════════════════════════════════════════════════════════════ */
        <div className="operator-dashboard-layout">
          <div className="wms-section-title" style={{ color: "white", marginBottom: "20px" }}>
            <h3 style={{ margin: 0, fontSize: "22px", color: "var(--green)" }}>WORKSPACE: OPERATOR PRODUKSI LAPANGAN</h3>
            <p style={{ color: "var(--text-dim)", fontSize: "13px" }}>Kelola pengajuan operational lapangan secara real-time ke Admin Gudang.</p>
          </div>

          {/* ALUR 1: INPUT REQUEST BAHAN BAKU */}
          <div className="wms-section" style={{ background: "rgba(255,255,255,0.02)", padding: "20px", border: "1px solid var(--border)", marginBottom: "25px" }}>
            <h4 style={{ margin: "0 0 15px 0", color: "var(--yellow)" }}>📝 1. AJUKAN REQUEST BAHAN BAKU KE ADMIN</h4>
            <form onSubmit={handleOperatorRequestBahan} style={{ display: "flex", gap: "12px" }}>
              <input 
                type="text" 
                placeholder="Nama bahan mentah..." 
                value={reqBarang} 
                onChange={(e) => setReqBarang(e.target.value)} 
                style={{ flex: 2, padding: "11px 16px", background: "#ffffff", border: "1px solid var(--border)", color: "#1a2240", fontSize: "14px", outline: "none" }} 
              />
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

          {/* ALUR 2: INPUT LAPOR HASIL PRODUKSI */}
          <div className="wms-section" style={{ background: "rgba(217, 64, 64, 0.02)", padding: "20px", border: "1px solid rgba(217, 64, 64, 0.3)", marginBottom: "25px" }}>
            <h4 style={{ margin: "0 0 15px 0", color: "var(--red)" }}>⚠️ 2. LAPOR HASIL AKHIR PRODUKSI (TOTAL BERHASIL & TOTAL CACAT)</h4>
            <form onSubmit={handleOperatorInputHasil} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <input 
                type="text" 
                placeholder="Nama produk jadi..." 
                value={prodBarang} 
                onChange={(e) => setProdBarang(e.target.value)} 
                style={{ flex: 2, padding: "11px 16px", background: "#ffffff", border: "1px solid var(--border)", color: "#1a2240", fontSize: "14px", outline: "none" }} 
              />
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

          {/* 📋 SEKSI: TABEL DAFTAR RIWAYAT AKTIVITAS OPERATOR */}
          <div className="wms-section" style={{ marginTop: "30px" }}>
            <h3 style={{ color: "black", borderBottom: "2px solid var(--border)", paddingBottom: "10px", marginBottom: "20px" }}>
              📋 TRACKING LIVE: RIWAYAT AKTIVITAS SAYA
            </h3>

            {/* A. Sub-Tabel Riwayat Request Bahan */}
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
                      {allBahanRequests.map((item) => (
                        <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
                          <td style={{ padding: "10px", color: "#555555", fontWeight: "500" }}>
                            {formatTanggalTabel(item)}
                          </td>
                          <td style={{ padding: "10px", color: "#1a2240", fontWeight: "500" }}>{item.barang}</td>
                          <td style={{ padding: "10px", color: "var(--yellow)", fontWeight: "bold" }}>{item.out} Pcs</td>
                          <td style={{ padding: "10px" }}>
                            <span style={{ 
                              padding: "3px 8px", 
                              fontSize: "11px", 
                              fontWeight: "bold", 
                              borderRadius: "3px",
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

            {/* B. Sub-Tabel Riwayat Laporan Produksi */}
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
                      {allHasilRequests.map((item) => (
                        <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
                          <td style={{ padding: "10px", color: "#555555", fontWeight: "500" }}>
                            {formatTanggalTabel(item)}
                          </td>
                          <td style={{ padding: "10px", color: "#1a2240", fontWeight: "500" }}>{item.barang}</td>
                          <td style={{ padding: "10px", color: "var(--green)", fontWeight: "bold" }}>{item.in} Pcs</td>
                          <td style={{ padding: "10px", color: "var(--red)", fontWeight: "bold" }}>{item.reject || 0} Pcs</td>
                          <td style={{ padding: "10px" }}>
                            <span style={{ 
                              padding: "3px 8px", 
                              fontSize: "11px", 
                              fontWeight: "bold", 
                              borderRadius: "3px",
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
      )}
    </div>
  );
}