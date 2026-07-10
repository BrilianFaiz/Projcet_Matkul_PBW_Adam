import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import AdminDashboard from "./AdminDashboard";
import OperatorDashboard from "./OperatorDashboard";
import SuperadminDashboard from "./SuperAdminDashboard"; 
import ManagerDashboard from "./ManagerDashboard";       
import ProcurementDashboard from "./ProcurenmentDashboard"; 
import QcDashboard from "./QCDashboard";               

export default function Dashboard() {
  const { token, user, logout } = useAuth();

  const [data, setData] = useState<any[]>([]);
  const [systemStatus, setSystemStatus] = useState("checking");
  const [approvedIds, setApprovedIds] = useState<any[]>([]);

// =========================================================
// FETCH DATA GLOBAL & REAL-TIME POLLING (3 DETIK)
// =========================================================
const fetchData = async () => {
  if (!token) return;
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
    if (token) {
      // Ambil data pertama kali saat halaman di-load
      fetchData();

      // 🔄 Polling otomatis setiap 3 detik supaya sinkronisasi data real-time
      const dataInterval = setInterval(() => {
        fetchData();
      }, 3000);

      return () => clearInterval(dataInterval);
    }
  }, [token]);

  // Health Check Server Berkala
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

  // =========================================================
  // HANDLER AKSI SIMPAN / UPDATE GLOBAL (DATABASE INTEGRATION)
  // =========================================================
  const handleAdd = async (item: any) => {
    try {
      const payload = {
        ...item,
        operatorName: item.operatorName || user?.nama,
        rolePengirim: user?.role,
        tanggal: item.tanggal || new Date().toISOString()
      };

      if (item.isUpdateQty && item._id) {
        delete payload.isUpdateQty;

        const res = await fetch(`http://localhost:1337/api/data/${item._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            in: payload.in,
            out: payload.out,
            tanggal: payload.tanggal,
            statusProduksi: payload.statusProduksi
          }),
        });
        
        if (res.ok) {
          await fetchData(); // Tarik ulang data real-time setelah update qty
        } else {
          console.error("Gagal mengupdate kuantitas stok di database");
        }
      } else {
        const res = await fetch("http://localhost:1337/api/data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        
        if (res.ok) {
          await fetchData(); // Tarik ulang data real-time setelah barang baru masuk
        } else {
          console.error("Gagal menyimpan data baru ke database");
        }
      }
    } catch (err) {
      console.error("Gagal memproses ke database:", err);
    }
  };

  // =========================================================
  // HANDLER AKSI SPESIFIK TIAP DASHBOARD ROLE
  // =========================================================
  
  // Handler Validasi Admin (Bahan Baku)
  const handleAdminApproveBahan = async (item: any) => {
    if (!item._id) return;
    try {
      const res = await fetch(`http://localhost:1337/api/data/${item._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ statusProduksi: "Disetujui" }),
      });

      if (res.ok) {
        setApprovedIds((prev) => [...prev, item._id]);
        alert(`Validasi Bahan Berhasil!`);
        await fetchData();
      }
    } catch (err) {
      console.error("Gagal memproses validasi bahan:", err);
    }
  };

  // Handler Validasi Admin (Hasil Output Produksi)
  const handleAdminApproveHasil = async (item: any) => {
    try {
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

      if (item._id) {
        const resUpdate = await fetch(`http://localhost:1337/api/data/${item._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ statusProduksi: "Selesai" }),
        });

        if (resUpdate.ok) {
          setApprovedIds((prev) => [...prev, item._id]);
        }
      }

      alert(`Laporan Hasil Produksi Ter-validasi!`);
      await fetchData();
    } catch (err) {
      console.error("Gagal memproses validasi laporan hasil:", err);
    }
  };

  // Handler Otorisasi Tingkat Manager
  const handleManagerApprove = async (item: any) => {
    if (!item._id) return;
    try {
      const res = await fetch(`http://localhost:1337/api/data/${item._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ statusProduksi: "Rilis Resmi Manager" }),
      });
      if (res.ok) {
        setApprovedIds((prev) => [...prev, item._id]);
        alert("Batch produksi disetujui resmi oleh Manager!");
        await fetchData();
      }
    } catch (err) {
      console.error("Manager gagal approve:", err);
    }
  };

  const handleManagerReject = async (item: any) => {
    if (!item._id) return;
    try {
      const res = await fetch(`http://localhost:1337/api/data/${item._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ statusProduksi: "Ditolak Manager" }),
      });
      if (res.ok) {
        alert("Batch pengajuan ditolak oleh Manager.");
        await fetchData();
      }
    } catch (err) {
      console.error("Manager gagal reject:", err);
    }
  };

  // Handler Pengujian Mutu Quality Control (QC)
  const handleQCApprove = async (item: any) => {
    if (!item._id) return;
    try {
      const res = await fetch(`http://localhost:1337/api/data/${item._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ statusProduksi: "Lolos QC (Pass)" }),
      });
      if (res.ok) {
        setApprovedIds((prev) => [...prev, item._id]);
        alert("Batch dinyatakan lolos standar mutu (PASS)!");
        await fetchData();
      }
    } catch (err) {
      console.error("QC gagal approve:", err);
    }
  };

  const handleQCReject = async (item: any) => {
    if (!item._id) return;
    try {
      const res = await fetch(`http://localhost:1337/api/data/${item._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ statusProduksi: "Gagal Standar (Rejected)" }),
      });
      if (res.ok) {
        alert("Batch dibuang ke penampungan material gagal.");
        await fetchData();
      }
    } catch (err) {
      console.error("QC gagal reject:", err);
    }
  };

  // =========================================================
  // UTILITIES & DATA PIPELINES FILTERING
  // =========================================================
  const getTotal = (arr: any[]) =>
    arr.reduce((acc, item) => acc + (Number(item.in || 0) - Number(item.out || 0)), 0);

  const formatTanggalTabel = (item: any) => {
    const rawDate = item.createdAt || item.tanggal;
    if (!rawDate) return new Date().toLocaleDateString('id-ID');
    return new Date(rawDate).toLocaleDateString('id-ID', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  // Klasifikasi data pipeline alur logistik
  const warehouseData = data.filter((d) => d.stage === "Warehouse RM");
  const prosesData = data.filter((d) => d.stage === "Proses Produksi" || d.stage === "Proses");
  const finishData = data.filter((d) => d.stage === "Finish Good");
  
  // Antrean khusus dashboard approval operasional
  const pendingBahanRequests = data.filter((d) => d.stage === "Request Bahan" && d.statusProduksi === "Pending");
  const pendingHasilRequests = data.filter((d) => d.stage === "Laporan Produksi" && d.statusProduksi === "Pending");
  const pendingManagerRequests = data.filter((d) => d.statusProduksi === "Pending Admin" || d.statusProduksi === "Pending");
  const pendingQCRequests = data.filter((d) => d.statusProduksi === "Pending Hasil Admin" || d.statusProduksi === "Pending");

  // =========================================================
  // ROUTER SWITCH DASHBOARD BERDASARKAN ROLE USER
  // =========================================================
  const renderRoleDashboard = () => {
    const currentRole = user?.role?.toLowerCase();

    switch (currentRole) {
      case "admin":
        return (
          <AdminDashboard 
            masterData={data}
            warehouseData={warehouseData}
            prosesData={prosesData}
            finishData={finishData}
            pendingBahanRequests={pendingBahanRequests}
            pendingHasilRequests={pendingHasilRequests}
            approvedIds={approvedIds}
            getTotal={getTotal}
            formatTanggalTabel={formatTanggalTabel}
            handleAdminApproveBahan={handleAdminApproveBahan}
            handleAdminApproveHasil={handleAdminApproveHasil}
            handleAdd={handleAdd}
          />
        );

      case "operator":
        return (
          <OperatorDashboard 
            masterData={data}
            warehouseData={warehouseData}
            prosesData={prosesData}
            finishData={finishData}
            getTotal={getTotal}
            formatTanggalTabel={formatTanggalTabel}
            handleOperatorSubmitBahan={handleAdd} // Hubungkan form requset bahan ke handleAdd
            handleOperatorSubmitHasil={handleAdd} // Hubungkan form lapor hasil ke handleAdd
          />
        );

      case "superadmin":
        return (
          <SuperadminDashboard 
            masterData={data}
            warehouseData={warehouseData}
            prosesData={prosesData}
            finishData={finishData}
            formatTanggalTabel={formatTanggalTabel}
          />
        );

      case "manager":
        return (
          <ManagerDashboard 
            masterData={data}
            warehouseData={warehouseData}
            prosesData={prosesData}
            finishData={finishData}
            pendingManagerRequests={pendingManagerRequests}
            approvedIds={approvedIds}
            getTotal={getTotal}
            formatTanggalTabel={formatTanggalTabel}
            handleManagerApprove={handleManagerApprove}
            handleManagerReject={handleManagerReject}
          />
        );

      case "procurement":
        return (
          <ProcurementDashboard 
            warehouseData={warehouseData}
            handleAdd={handleAdd}
            formatTanggalTabel={formatTanggalTabel}
          />
        );

      case "qc":
        return (
          <QcDashboard 
            masterData={data}
            prosesData={prosesData}
            finishData={finishData}
            pendingQCRequests={pendingQCRequests}
            approvedIds={approvedIds}
            formatTanggalTabel={formatTanggalTabel}
            handleQCApprove={handleQCApprove}
            handleQCReject={handleQCReject}
          />
        );

      default:
        return (
          <div style={{ color: "white", padding: "40px", textAlign: "center", background: "#1f2937", borderRadius: "8px", margin: "20px" }}>
            <h3>⚠️ Akses Terbatas</h3>
            <p style={{ color: "#9ca3af" }}>Role akun "{user?.role}" belum dikonfigurasi di sistem.</p>
          </div>
        );
    }
  };

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
          <div className="wms-status-dot" style={{ color: systemStatus === "online" ? "var(--green, #10b981)" : "var(--red, #ef4444)" }}>
            {systemStatus === "online" ? "SYSTEM ONLINE" : "CHECKING..."}
          </div>
          <div className="wms-user-info">
            <span className="wms-user-name">{user?.nama}</span>
            <span className="wms-user-role" style={{ color: "var(--yellow, #eab308)", fontWeight: "bold" }}> [{user?.role}]</span>
          </div>
          <button className="wms-logout-btn" onClick={logout}>KELUAR</button>
        </div>
      </header>

      {/* ── EKSEKUSI ROUTER SWITCH ── */}
      {renderRoleDashboard()}
    </div>
  );
}