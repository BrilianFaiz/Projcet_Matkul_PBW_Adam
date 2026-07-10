import React, { useState } from "react";
import "./Form.css";

const today = new Date().toISOString().split("T")[0];

interface FormProps {
  onSuccess: () => void; // 🟢 Diubah jadi onSuccess untuk mentrigger refresh data tabel di dashboard induk
  warehouseData: any[]; 
  finishData?: any[];    
  processData?: any[];   
}

export default function Form({ onSuccess, warehouseData = [], finishData = [], processData = [] }: FormProps) {
  // Ambil data session user dari localStorage
  const userRole = localStorage.getItem("role") || "operator";
  const userNama = localStorage.getItem("nama") || "Staff Lapangan";

  const [form, setForm] = useState({
    tanggal: today,
    barang: "",
    stage: "Warehouse RM",
    in: "" as string | number,
    out: "" as string | number,
    reject: "" as string | number,
  });

  const [isNewItem, setIsNewItem] = useState(false);
  const [loading, setLoading] = useState(false); // 🟢 State loading saat request API

  const getUniqueItemsByStage = () => {
    // 🟢 Ditambahkan fallback penanganan jika array bernilai undefined/null saat fetch delay
    const safeWarehouse = warehouseData || [];
    const safeFinish = finishData || [];
    const safeProcess = processData || [];

    if (form.stage === "Warehouse RM") {
      return Array.from(new Set(safeWarehouse.map((item) => item.barang).filter(Boolean)));
    } else if (form.stage === "Finish Good") {
      return Array.from(new Set(safeFinish.map((item) => item.barang).filter(Boolean)));
    } else if (form.stage === "Proses") {
      return Array.from(new Set(safeProcess.map((item) => item.barang).filter(Boolean)));
    } else {
      return Array.from(new Set([...safeWarehouse, ...safeFinish, ...safeProcess].map((item) => item.barang).filter(Boolean)));
    }
  };

  const uniqueItems = getUniqueItemsByStage();

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    
    if (name === "barang") {
      if (value === "__NEW_ITEM__") {
        setIsNewItem(true);
        setForm({ ...form, barang: "" });
      } else {
        setIsNewItem(false);
        setForm({ ...form, barang: value });
      }
    } else if (name === "stage") {
      setIsNewItem(false);
      setForm({
        ...form,
        stage: value,
        barang: "" 
      });
    } else {
      setForm({
        ...form,
        [name]: name === "in" || name === "out" || name === "reject" 
          ? (value === "" ? "" : Number(value)) 
          : value,
      });
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!form.barang.trim()) {
      alert("Nama barang tidak boleh kosong!");
      return;
    }

    const namaBarangInput = form.barang.trim();
    const currentStage = form.stage;

    // Tentukan data pool pembanding berdasarkan stage aktif
    const safeWarehouse = warehouseData || [];
    const safeFinish = finishData || [];
    const safeProcess = processData || [];
    let currentDataPool = safeWarehouse;
    if (currentStage === "Finish Good") currentDataPool = safeFinish;
    if (currentStage === "Proses") currentDataPool = safeProcess;

    const existingItem = currentDataPool.find(
      (item) => item.barang.toLowerCase() === namaBarangInput.toLowerCase()
    );

    // Otomatisasi status approval: Jika tipenya 'Request Bahan', statusnya 'Pending' agar divalidasi admin
    const determinedStatus = currentStage === "Request Bahan" ? "Pending" : "Selesai";

    const numIn = form.in === "" ? 0 : Number(form.in);
    const numOut = form.out === "" ? 0 : Number(form.out);
    const numReject = form.reject === "" ? 0 : Number(form.reject);

    if (numIn === 0 && numOut === 0 && numReject === 0) {
      alert("Peringatan: Nilai IN, OUT, dan REJECT tidak boleh semuanya kosong atau bernilai 0.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      let res;
      // Kasus A: Jika barang sudah ada dan ini bukan paksaan barang baru, gunakan metode PUT (Update)
      if (existingItem && !isNewItem) {
        // Akumulasikan nilai lama dengan input transaksi baru
        const payloadUpdate = {
          in: Number(existingItem.in || 0) + numIn,
          out: Number(existingItem.out || 0) + numOut,
          reject: Number(existingItem.reject || 0) + numReject,
          statusProduksi: determinedStatus
        };

        res = await fetch(`http://localhost:1337/api/data/${existingItem._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payloadUpdate)
        });

        if (!res.ok) throw new Error("Gagal mengupdate akumulasi stok.");
        alert(`Stok barang "${namaBarangInput}" di ${currentStage} berhasil di-update!`);
      } 
      // Kasus B: Jika barang baru atau sengaja dimasukkan sebagai baris data baru, gunakan POST (Add)
      else {
        const payloadNew = {
          barang: namaBarangInput,
          stage: currentStage,
          in: numIn,
          out: numOut,
          reject: numReject,
          statusProduksi: determinedStatus
        };

        res = await fetch("http://localhost:1337/api/data/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payloadNew)
        });

        if (!res.ok) throw new Error("Gagal menambahkan master data baru.");
        alert(`Berhasil membuat master barang baru "${namaBarangInput}" di ${currentStage}!`);
      }

      // Reset Form & Memicu penarikan ulang data tabel di dashboard induk
      setForm({
        tanggal: today,
        barang: "",
        stage: "Warehouse RM",
        in: "",
        out: "",
        reject: "",
      });
      setIsNewItem(false);
      onSuccess(); // 🟢 Beri tahu induk komponen bahwa data telah berubah

    } catch (err: any) {
      alert(`Terjadi kesalahan: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wms-form-panel">
      <div className="wms-form-header">
        <div className="wms-form-header-left">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          INPUT / UPDATE STOK MASTER
        </div>
        <span className="wms-form-header-tag">ROLE: {userRole.toUpperCase()}</span>
      </div>

      <form className="wms-form" onSubmit={handleSubmit}>
        <div className="wms-form-grid">

          {/* 📅 TANGGAL */}
          <div className="wms-field">
            <label className="wms-label">TANGGAL</label>
            <input className="wms-input" type="date" name="tanggal" value={form.tanggal} onChange={handleChange} disabled={loading} />
          </div>

          {/* 🗂️ STAGE (KATEGORI STOK) */}
          <div className="wms-field">
            <label className="wms-label">STAGE (KATEGORI STOK)</label>
            <select className="wms-select" name="stage" value={form.stage} onChange={handleChange} disabled={loading}>
              <option value="Warehouse RM">Warehouse RM (Bahan Baku)</option>
              <option value="Proses">Proses (Lini Produksi)</option>
              <option value="Finish Good">Finish Good (Produk Jadi)</option>
              <option value="Request Bahan">⚠️ Request Bahan (Butuh Approval)</option>
              <option value="Laporan Produksi">📋 Laporan Produksi</option>
            </select>
          </div>

          {/* 📦 BARANG */}
          <div className="wms-field">
            <label className="wms-label">BARANG</label>
            {!isNewItem ? (
              <select 
                className="wms-select" 
                name="barang" 
                value={form.barang} 
                onChange={handleChange}
                style={{ width: "100%" }}
                disabled={loading}
              >
                <option value="">-- Pilih Barang Eksis --</option>
                {uniqueItems.map((namaBarang, idx) => (
                  <option key={idx} value={namaBarang}>
                    {namaBarang}
                  </option>
                ))}
                {userRole !== "manager" && (
                  <option value="__NEW_ITEM__" style={{ color: "var(--red)", fontWeight: "bold" }}>
                    ➕ (+ Masukan Barang Baru...)
                  </option>
                )}
              </select>
            ) : (
              <div style={{ display: "flex", gap: "5px", width: "100%" }}>
                <input 
                  className="wms-input" 
                  type="text" 
                  name="barang" 
                  placeholder={form.stage === "Warehouse RM" ? "Nama bahan baku baru..." : "Nama produk baru..."} 
                  value={form.barang} 
                  onChange={(e) => setForm({ ...form, barang: e.target.value })} 
                  autoComplete="off"
                  disabled={loading}
                  autoFocus
                />
                <button 
                  type="button" 
                  onClick={() => setIsNewItem(false)} 
                  style={{ background: "#e74c3c", color: "white", border: "none", padding: "0 10px", cursor: "pointer", borderRadius: "4px", fontSize: "12px" }}
                  disabled={loading}
                >
                  Batal
                </button>
              </div>
            )}
          </div>

          {/* 📥 IN (TAMBAH QTY) */}
          <div className="wms-field">
            <label className="wms-label">IN (TAMBAH QTY)</label>
            <input 
              className="wms-input wms-input-green" 
              type="number" 
              name="in" 
              value={form.in} 
              placeholder="0" 
              onChange={handleChange} 
              disabled={form.stage === "Request Bahan" || loading} 
            />
          </div>

          {/* 📤 OUT (KURANG QTY) */}
          <div className="wms-field">
            <label className="wms-label">OUT (KURANG QTY)</label>
            <input 
              className="wms-input wms-input-red" 
              type="number" 
              name="out" 
              value={form.out} 
              placeholder="0" 
              onChange={handleChange} 
              disabled={loading}
            />
          </div>

          {/* 🟠 REJECT (BARANG CACAT) */}
          <div className="wms-field">
            <label className="wms-label">REJECT (QTY CACAT)</label>
            <input 
              className="wms-input wms-input-orange" 
              type="number" 
              name="reject" 
              value={form.reject} 
              placeholder="0" 
              onChange={handleChange}
              disabled={form.stage === "Warehouse RM" || loading}
            />
          </div>

          {/* 🚀 SUBMIT BUTTON */}
          <div className="wms-field wms-field-submit">
            <button 
              className="wms-btn" 
              type="submit"
              disabled={userRole === "manager" || loading}
            >
              {userRole === "manager" ? "VIEW ONLY" : (loading ? "MENSINKRONKAN..." : "SINKRONKAN STOK")}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}