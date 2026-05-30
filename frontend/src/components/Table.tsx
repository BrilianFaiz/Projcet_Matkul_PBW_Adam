import "./Table.css";

export default function Table({ data }: any) {
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

  if (data.length === 0) {
    return (
      <div className="wms-table-empty">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <rect x="3" y="3" width="18" height="18" rx="1"/>
          <path d="M3 9h18M9 21V9"/>
        </svg>
        <span>Belum ada data</span>
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
            {/* KOLOM TAMBAHAN UNTUK JOBDESK ISOMRS */}
            <th>Status</th>
            <th>Reject</th>
            <th>PIC / Operator</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item: any, i: number) => {
            const balance = (Number(item.in) || 0) - (Number(item.out) || 0);
            cumulative += balance;

            // Logika pewarnaan badge status produksi (Proses, Selesai, Pending)
            const statusLower = item.statusProduksi?.toLowerCase() || "selesai";
            const statusClass = 
              statusLower === "proses" ? "wms-status-process" : 
              statusLower === "pending" ? "wms-status-pending" : "wms-status-done";

            return (
              <tr key={item._id || item.id || i}>
                <td className="wms-td-dim">{String(i + 1).padStart(2, "0")}</td>
                
                {/* 🛠️ PERBAIKAN DI SINI: Sekarang menggunakan helper formatTanggal */}
                <td className="wms-td-mono">{formatTanggal(item)}</td>
                
                <td className="wms-td-bold">{item.barang}</td>
                <td>
                  <span className={`wms-stage-badge wms-stage-${item.stage === "Warehouse RM" ? "wh" : item.stage === "Proses" ? "pr" : "fg"}`}>
                    {item.stage}
                  </span>
                </td>
                <td className="wms-td-green">+{item.in || 0}</td>
                <td className="wms-td-red">-{item.out || 0}</td>
                <td className={balance >= 0 ? "wms-td-green" : "wms-td-red"}>
                  {balance >= 0 ? `+${balance}` : balance}
                </td>
                <td className="wms-td-cumulative">{cumulative}</td>

                {/* 1. STATUS PRODUKSI (Proses / Selesai / Pending) */}
                <td>
                  <span className={`wms-status-badge ${statusClass}`}>
                    {item.statusProduksi || (item.stage === "Warehouse RM" ? "Ready" : "Selesai")}
                  </span>
                </td>

                {/* 2. JUMLAH BARANG REJECT / CACAT */}
                <td className={Number(item.reject) > 0 ? "wms-td-red wms-td-bold" : "wms-td-dim"}>
                  {item.reject && Number(item.reject) > 0 ? `${item.reject} Pcs` : "-"}
                </td>

                {/* 3. NAMA OPERATOR YANG BERTANGGUNG JAWAB */}
                <td className="wms-td-bold" style={{ color: "var(--yellow)", fontSize: "12px" }}>
                  {item.operatorName || "Admin Gudang"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}