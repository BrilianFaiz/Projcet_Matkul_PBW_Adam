import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import AdminDashboard from "./AdminDashboard";
import OperatorDashboard from "./OperatorDashboard";

export default function Dashboard() {
  const { token, user, logout } = useAuth();

  const [data, setData] = useState<any[]>([]);
  const [systemStatus, setSystemStatus] = useState("checking");
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

  // =========================================================
  // HANDLER SIMPAN / UPDATE DATA (DIPERBARUI 🟢)
  // =========================================================
  const handleAdd = async (item: any) => {
    try {
      const payload = {
        ...item,
        operatorName: item.operatorName || user?.nama,
        rolePengirim: user?.role,
        tanggal: item.tanggal || new Date().toISOString()
      };

      // 🟢 JIKA TERDETEKSI UPDATE QTY (Barang sudah ada di database)
      if (item.isUpdateQty && item._id) {
        // Hapus property pembantu sebelum dikirim ke backend agar bersih
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
      } 
      // ➕ JIKA BARANG BARU (Aksi POST biasa)
      else {
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

  // =========================================================
  // LOGIKA ALUR 1 & 2
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
      if (item._id) {
        const resUpdate = await fetch(`http://localhost:1337/api/data/${item._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ statusProduksi: "Disetujui" }),
        });

        if (!resUpdate.ok) console.error("Gagal memperbarui status request di database");

        setApprovedIds((prev) => [...prev, item._id]);
      }
      alert(`Validasi Berhasil!`);
      fetchData();
    } catch (err) {
      console.error("Gagal memproses validasi bahan:", err);
    }
  };

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

        if (!resUpdate.ok) console.error("Gagal memperbarui status laporan di database");
        setApprovedIds((prev) => [...prev, item._id]);
      }

      alert(`Laporan Produksi Ter-validasi!`);
      fetchData();
    } catch (err) {
      console.error("Gagal memproses validasi laporan hasil:", err);
    }
  };

  // =========================================================
  // UTILITIES & FILTERS
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

  const warehouseData = data.filter((d) => d.stage === "Warehouse RM");
  const prosesData = data.filter((d) => d.stage === "Proses");
  const finishData = data.filter((d) => d.stage === "Finish Good");
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

      {/* ── PERCABANGAN INTERFACE BERDASARKAN ROLE ── */}
      {user?.role === "admin" ? (
        <AdminDashboard 
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
      ) : (
        <OperatorDashboard 
          allBahanRequests={allBahanRequests}
          allHasilRequests={allHasilRequests}
          warehouseData={warehouseData}
          finishData={finishData}
          reqBarang={reqBarang}
          setReqBarang={setReqBarang}
          reqJumlah={reqJumlah}
          setReqJumlah={setReqJumlah}
          prodBarang={prodBarang}
          setProdBarang={setProdBarang}
          prodBerhasil={prodBerhasil}
          setProdBerhasil={setProdBerhasil}
          prodReject={prodReject}
          setProdReject={setProdReject}
          handleOperatorRequestBahan={handleOperatorRequestBahan}
          handleOperatorInputHasil={handleOperatorInputHasil}
          formatTanggalTabel={formatTanggalTabel}
        />
      )}
    </div>
  );
}