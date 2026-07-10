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

  // =========================================================
  // HANDLER ACTION UNTUK KOMPONEN ANAK
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
          fetchData();
        } else {
          console.error("Gagal mengupdate kuantitas stok di database");
        }
      } else {
        const res = await fetch("http://localhost:1337/api/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        
        if (res.ok) {
          fetchData();
        } else {
          console.error("Gagal menyimpan data baru ke database");
        }
      }
    } catch (err) {
      console.error("Gagal memproses ke database:", err);
    }
  };

  // Handler Aksi Spesifik Manager
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
        fetchData();
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
        fetchData();
      }
    } catch (err) {
      console.error("Manager gagal reject:", err);
    }
  };

  // Handler Aksi Spesifik Quality Control (QC)
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
        fetchData();
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
        fetchData();
      }
    } catch (err) {
      console.error("QC gagal reject:", err);
    }
  };

  // =========================================================
  // UTILITIES & DATA PIPELINES
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

  // Klasifikasi data berdasarkan tahapan alur logistik
  const warehouseData = data.filter((d) => d.stage === "Warehouse RM");
  const prosesData = data.filter((d) => d.stage === "Proses Produksi" || d.stage === "Proses");
  const finishData = data.filter((d) => d.stage === "Finish Good");
  
  // Antrean Dinamis untuk Dashboard Tertentu
  const pendingBahanRequests = data.filter((d) => d.stage === "Request Bahan" && d.statusProduksi === "Pending");
  const pendingHasilRequests = data.filter((d) => d.stage === "Laporan Produksi" && d.statusProduksi === "Pending");
  const pendingManagerRequests = data.filter((d) => d.statusProduksi === "Pending Admin" || d.statusProduksi === "Pending");
  const pendingQCRequests = data.filter((d) => d.statusProduksi === "Pending Hasil Admin" || d.statusProduksi === "Pending");

  // =========================================================
  // ROUTER SWITCH DASHBOARD BERDASARKAN ROLE
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
            handleAdminApproveBahan={handleAdminApproveBahan} // Gunakan handler bawaan Anda
            handleAdminApproveHasil={handleAdminApproveHasil} // Gunakan handler bawaan Anda
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
            handleOperatorSubmitBahan={handleAdd} // Pemetaan aksi form request bahan baku
            handleOperatorSubmitHasil={handleAdd} // Pemetaan aksi form hasil output produksi
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

  // Handler Placeholder warisan backend untuk Admin Dashboard
  async function handleAdminApproveBahan(item: any) {
    if (item._id) {
      await fetch(`http://localhost:1337/api/data/${item._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ statusProduksi: "Disetujui" }),
      });
      setApprovedIds((prev) => [...prev, item._id]);
    }
    fetchData();
  }

  async function handleAdminApproveHasil(item: any) {
    if (item._id) {
      await fetch(`http://localhost:1337/api/data/${item._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ statusProduksi: "Selesai" }),
      });
      setApprovedIds((prev) => [...prev, item._id]);
    }
    fetchData();
  }

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

      {/* ── EKSEKUSI FUNGSI ROUTER SWITCH ROLE ── */}
      {renderRoleDashboard()}
    </div>
  );
}