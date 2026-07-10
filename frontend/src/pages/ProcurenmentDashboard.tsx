import React, { useState } from "react";

interface ProcurementProps {
  warehouseData: any[];
  handleAdd: (item: any) => Promise<void>;
  formatTanggalTabel: (item: any) => string;
}

export default function ProcurementDashboard({ 
  warehouseData, 
  handleAdd, 
  formatTanggalTabel 
}: ProcurementProps) {
  const [bahan, setBahan] = useState("");
  const [jumlah, setJumlah] = useState("");

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bahan || !jumlah) return alert("Lengkapi nama bahan baku dan kuantitas pengadaan!");

    await handleAdd({
      barang: bahan,
      in: Number(jumlah),
      out: 0,
      stage: "Warehouse RM",
      statusProduksi: "Selesai",
    });

    setBahan("");
    setJumlah("");
    alert("Data restock pengadaan berhasil diteruskan ke logistik!");
  };

  return (
    <div style={{ padding: "20px", background: "#111827", color: "white", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <h2 style={{ color: "#fb923c", borderBottom: "1px solid #374151", paddingBottom: "10px" }}>
        🛒 Procurement Supply Chain Management
      </h2>

      {/* Form Pengadaan Pengisian Bahan Baku (Restock) */}
      <div style={{ background: "#1f2937", padding: "20px", borderRadius: "8px", margin: "20px 0", border: "1px solid #374151" }}>
        <h3 style={{ margin: "0 0 15px 0", fontSize: "16px" }}>Form Pengadaan Pengisian Bahan Baku (Restock)</h3>
        <form onSubmit={handleRestock} style={{ display: "flex", gap: "15px", alignItems: "flex-end", flexWrap: "wrap" }}>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}>Material Name</label>
            <input type="text" value={bahan} onChange={(e) => setBahan(e.target.value)} style={inputStyle} placeholder="Contoh: Polyethylene" />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}>Qty Supply</label>
            <input type="number" value={jumlah} onChange={(e) => setJumlah(e.target.value)} style={inputStyle} placeholder="0" />
          </div>
          <button type="submit" style={{ ...btnStyle, background: "#fb923c" }}>Submit ke Gudang RM</button>
        </form>
      </div>

      <h3 style={{ fontSize: "16px", marginBottom: "12px" }}>Status Inventory Pengadaan Berjalan (Warehouse RM)</h3>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#1f2937" }}>
          <thead>
            <tr style={{ background: "#374151" }}>
              <th style={thStyle}>Tanggal Kedatangan</th>
              <th style={thStyle}>Material</th>
              <th style={thStyle}>Jumlah Masuk</th>
            </tr>
          </thead>
          <tbody>
            {warehouseData.map((item) => (
              <tr key={item._id} style={{ borderBottom: "1px solid #374151" }}>
                <td style={tdStyle}>{formatTanggalTabel(item)}</td>
                <td style={tdStyle}>{item.barang}</td>
                <td style={{ ...tdStyle, color: "#4ade80", fontWeight: "bold" }}>+{item.in} unit</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// =========================================================
// SAFE INLINE STYLES FOR TYPESCRIPT
// =========================================================
const inputStyle: React.CSSProperties = {
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #4b5563",
  background: "#111827",
  color: "white",
};

const btnStyle: React.CSSProperties = {
  padding: "10px 20px",
  color: "white",
  border: "none",
  borderRadius: "6px",
  fontWeight: "bold",
  cursor: "pointer",
};

const thStyle: React.CSSProperties = { 
  padding: "12px", 
  textAlign: "left", 
  color: "#9ca3af" 
};

const tdStyle: React.CSSProperties = { 
  padding: "12px" 
};