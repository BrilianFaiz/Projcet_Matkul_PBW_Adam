import "./Table.css";

export default function Table({ data }: any) {
  let cumulative = 0;

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
          </tr>
        </thead>
        <tbody>
          {data.map((item: any, i: number) => {
            const balance = item.in - item.out;
            cumulative += balance;
            return (
              <tr key={i}>
                <td className="wms-td-dim">{String(i + 1).padStart(2, "0")}</td>
                <td className="wms-td-mono">{item.tanggal}</td>
                <td className="wms-td-bold">{item.barang}</td>
                <td>
                  <span className={`wms-stage-badge wms-stage-${item.stage === "Warehouse RM" ? "wh" : item.stage === "Proses" ? "pr" : "fg"}`}>
                    {item.stage}
                  </span>
                </td>
                <td className="wms-td-green">+{item.in}</td>
                <td className="wms-td-red">-{item.out}</td>
                <td className={balance >= 0 ? "wms-td-green" : "wms-td-red"}>
                  {balance >= 0 ? `+${balance}` : balance}
                </td>
                <td className="wms-td-cumulative">{cumulative}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}