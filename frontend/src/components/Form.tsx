import { useState } from "react";
import "./Form.css";

const today = new Date().toISOString().split("T")[0];

export default function Form({ onAdd }: any) {
  const [form, setForm] = useState({
    tanggal: today,
    barang:  "", // 🔴 Diubah dari "Batu 1" menjadi string kosong
    stage:   "Warehouse RM",
    in:      "" as string | number,
    out:     "" as string | number,
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "in" || name === "out" ? Number(value) : value,
    });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!form.barang.trim()) {
      alert("Nama barang tidak boleh kosong!");
      return;
    }
    onAdd(form);
    // 🔴 Setelah submit, form in & out dikosongkan, barang juga dikosongkan biar bisa input barang baru lagi
    setForm(prev => ({ ...prev, barang: "", in: "", out: "" }));
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
          INPUT TRANSAKSI BARU
        </div>
        <span className="wms-form-header-tag">FORM-001</span>
      </div>

      <form className="wms-form" onSubmit={handleSubmit}>
        <div className="wms-form-grid">

          <div className="wms-field">
            <label className="wms-label">TANGGAL</label>
            <input className="wms-input" type="date" name="tanggal" value={form.tanggal} onChange={handleChange} />
          </div>

          {/* 🔴 BAGIAN BARANG SEKARANG SUDAH MENJADI INPUT TEXT BEBAS */}
          <div className="wms-field">
            <label className="wms-label">BARANG</label>
            <input 
              className="wms-input" 
              type="text" 
              name="barang" 
              placeholder="Ketik nama barang..." 
              value={form.barang} 
              onChange={handleChange} 
              autoComplete="off"
            />
          </div>

          <div className="wms-field">
            <label className="wms-label">STAGE</label>
            <select className="wms-select" name="stage" value={form.stage} onChange={handleChange}>
              <option>Warehouse RM</option>
              <option>Proses</option>
              <option>Finish Good</option>
            </select>
          </div>

          <div className="wms-field">
            <label className="wms-label">IN (QTY)</label>
            <input className="wms-input wms-input-green" type="number" name="in" value={form.in} placeholder="0" onChange={handleChange} />
          </div>

          <div className="wms-field">
            <label className="wms-label">OUT (QTY)</label>
            <input className="wms-input wms-input-red" type="number" name="out" value={form.out} placeholder="0" onChange={handleChange} />
          </div>

          <div className="wms-field wms-field-submit">
            <button className="wms-btn" type="submit">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              TAMBAH DATA
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}