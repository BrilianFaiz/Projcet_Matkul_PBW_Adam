import React, { useState } from "react";
import "./Form.css";

const today = new Date().toISOString().split("T")[0];

interface FormProps {
  onAdd: (item: any) => void;
  warehouseData: any[]; // Data dengan stage: "Warehouse RM"
  finishData?: any[];    // Data dengan stage: "Finish Good"
}

export default function Form({ onAdd, warehouseData = [], finishData = [] }: FormProps) {
  const [form, setForm] = useState({
    tanggal: today,
    barang:   "", 
    stage:   "Warehouse RM",
    in:      "" as string | number,
    out:     "" as string | number,
  });

  const [isNewItem, setIsNewItem] = useState(false);

  // Ambil list nama barang unik berdasarkan STAGE yang sedang aktif dipilih
  const getUniqueItemsByStage = () => {
    if (form.stage === "Warehouse RM") {
      return Array.from(new Set(warehouseData.map((item) => item.barang).filter(Boolean)));
    } else if (form.stage === "Finish Good") {
      return Array.from(new Set(finishData.map((item) => item.barang).filter(Boolean)));
    } else {
      return Array.from(new Set([...warehouseData, ...finishData].map((item) => item.barang).filter(Boolean)));
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
        [name]: name === "in" || name === "out" ? (value === "" ? "" : Number(value)) : value,
      });
    }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!form.barang.trim()) {
      alert("Nama barang tidak boleh kosong!");
      return;
    }

    const namaBarangInput = form.barang.trim();
    const currentStage = form.stage;

    // 🟢 LOGIKA DETEKSI BARANG DUPLIKAT/EKSIS
    // Kita cari apakah barang dengan nama & stage yang sama sudah pernah diinput sebelumnya
    const currentDataPool = currentStage === "Warehouse RM" ? warehouseData : finishData;
    const existingItem = currentDataPool.find(
      (item) => item.barang.toLowerCase() === namaBarangInput.toLowerCase()
    );

    let payload: any = {
      ...form,
      barang: namaBarangInput,
      in: form.in === "" ? 0 : Number(form.in),
      out: form.out === "" ? 0 : Number(form.out),
      statusProduksi: "Selesai"
    };

    if (existingItem && !isNewItem) {
      // ⚠️ JIKA BARANG SUDAH ADA: Kita kirimkan ID data lama agar backend tahu ini aksi UPDATE kuantitas
      payload._id = existingItem._id; 
      payload.isUpdateQty = true; // Flag pembantu untuk backend/handler jika diperlukan
      
      // Akumulasikan nilai IN dan OUT yang baru dengan nilai yang sudah ada di DB
      payload.in = Number(existingItem.in || 0) + Number(payload.in);
      payload.out = Number(existingItem.out || 0) + Number(payload.out);
      
      alert(`Stok barang "${namaBarangInput}" di ${currentStage} berhasil di-update (Kuantitas ditambahkan)!`);
    } else {
      // ✨ JIKA BARANG BENAR-BENAR BARU
      alert(`Berhasil membuat master barang baru "${namaBarangInput}" di ${currentStage}!`);
    }

    // Panggil fungsi onAdd (yang memicu handleAdd di Dashboard.tsx)
    onAdd(payload);
    
    // Reset Form
    setForm({
      tanggal: today,
      barang: "",
      stage: "Warehouse RM",
      in: "",
      out: "",
    });
    setIsNewItem(false);
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
        <span className="wms-form-header-tag">FORM-001</span>
      </div>

      <form className="wms-form" onSubmit={handleSubmit}>
        <div className="wms-form-grid">

          <div className="wms-field">
            <label className="wms-label">TANGGAL</label>
            <input className="wms-input" type="date" name="tanggal" value={form.tanggal} onChange={handleChange} />
          </div>

          <div className="wms-field">
            <label className="wms-label">STAGE (KATEGORI STOK)</label>
            <select className="wms-select" name="stage" value={form.stage} onChange={handleChange}>
              <option value="Warehouse RM">Warehouse RM (Bahan Baku)</option>
              <option value="Finish Good">Finish Good (Produk Jadi)</option>
            </select>
          </div>

          <div className="wms-field">
            <label className="wms-label">BARANG</label>
            {!isNewItem ? (
              <select 
                className="wms-select" 
                name="barang" 
                value={form.barang} 
                onChange={handleChange}
                style={{ width: "100%" }}
              >
                <option value="">
                  {form.stage === "Warehouse RM" ? "-- Pilih Bahan Baku Eksis --" : "-- Pilih Produk Jadi Eksis --"}
                </option>
                {uniqueItems.map((namaBarang, idx) => (
                  <option key={idx} value={namaBarang}>
                    {namaBarang}
                  </option>
                ))}
                <option value="__NEW_ITEM__" style={{ fontStyle: "italic", color: "var(--blue)", fontWeight: "bold" }}>
                  ➕ (+ Ketik Master Barang Baru...)
                </option>
              </select>
            ) : (
              <div style={{ display: "flex", gap: "5px", width: "100%" }}>
                <input 
                  className="wms-input" 
                  type="text" 
                  name="barang" 
                  placeholder={form.stage === "Warehouse RM" ? "Ketik nama bahan baku baru..." : "Ketik nama produk jadi baru..."} 
                  value={form.barang} 
                  onChange={(e) => setForm({ ...form, barang: e.target.value })} 
                  autoComplete="off"
                  autoFocus
                />
                <button 
                  type="button" 
                  onClick={() => setIsNewItem(false)} 
                  style={{ background: "#e74c3c", color: "white", border: "none", padding: "0 10px", cursor: "pointer", borderRadius: "4px", fontSize: "12px" }}
                >
                  Batal
                </button>
              </div>
            )}
          </div>

          <div className="wms-field">
            <label className="wms-label">IN (TAMBAH QTY)</label>
            <input className="wms-input wms-input-green" type="number" name="in" value={form.in} placeholder="0" onChange={handleChange} />
          </div>

          <div className="wms-field">
            <label className="wms-label">OUT (KURANG QTY)</label>
            <input className="wms-input wms-input-red" type="number" name="out" value={form.out} placeholder="0" onChange={handleChange} />
          </div>

          <div className="wms-field wms-field-submit">
            <button className="wms-btn" type="submit">
              SINKRONKAN STOK
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}