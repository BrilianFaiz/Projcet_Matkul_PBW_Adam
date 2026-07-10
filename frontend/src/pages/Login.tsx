import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom"; 
import "./login.css"; 

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate(); 
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      return setError("Username dan password wajib diisi!");
    }

    try {
      setError("");
      setLoading(true);

      const res = await fetch("http://localhost:1337/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          `Server merespons dengan format non-JSON (Status: ${res.status}). Pastikan endpoint API sudah benar dan server backend telah aktif.`
        );
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal masuk ke sistem. Periksa kembali kredensial Anda.");
      }

      // 1. Simpan token dan data user ke dalam AuthContext (dan localStorage)
      login(data.token, data.user);
      
      // 2. 🟢 FIX REDIRECT: Ambil role langsung dari data respons API untuk akurasi instan
      const userRole = data.user?.role?.toLowerCase();

      if (userRole) {
        // Jika kamu menggunakan file central Dashboard.tsx sebagai pembungkus semua role di path "/",
        // maka cukup panggil:
        navigate("/");
        
        // 💡 Catatan: Jika nanti kamu memisahkan rute url di AppRoutes.tsx (misal: /admin, /operator),
        // kamu bisa mengaktifkan logika switch di bawah ini:
        /*
        switch (userRole) {
          case "admin":
            navigate("/admin");
            break;
          case "operator":
            navigate("/operator");
            break;
          case "superadmin":
            navigate("/superadmin");
            break;
          default:
            navigate("/");
        }
        */
      } else {
        // Fallback jika login sukses tapi properti role tidak ditemukan
        navigate("/");
      }
      
    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err.message || "Terjadi kesalahan koneksi ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      
      {/* ── LEFT PANEL (Branding & Info Sistem) ── */}
      <div className="login-left">
        <div className="login-brand">
          <div className="login-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
          </div>
          <div>
            <div className="login-brand-title">
              Warehouse <span>Control</span>
            </div>
            <div className="login-brand-sub">MANAGEMENT SYSTEM</div>
          </div>
        </div>

        <div className="login-left-content">
          <h2>
            Efisiensi Produksi <br />
            & Stok Terintegrasi.
          </h2>
          <p>
            Pantau pergerakan raw material, antrean proses produksi, hingga validasi finish goods dalam satu platform dashboard terpusat.
          </p>
          
          <div className="login-stats">
            <div>
              <div className="login-stat-value">v1.0</div>
              <div className="login-stat-label">SYSTEM VERSION</div>
            </div>
            <div>
              <div className="login-stat-value">REALTIME</div>
              <div className="login-stat-label">DATA SYNC</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (Sign In Portal) ── */}
      <div className="login-right">
        <div className="login-box">
          <div className="login-box-header">
            <span className="login-box-tag">SECURE ACCESS</span>
            <h3>Selamat Datang</h3>
            <p>Silakan masuk menggunakan kredensial akun Anda.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {/* Field Username */}
            <div className="login-field">
              <label className="login-label">USERNAME</label>
              <div className="login-input-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <input
                  type="text"
                  className="login-input"
                  placeholder="Masukkan username anda..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Field Password */}
            <div className="login-field">
              <label className="login-label">PASSWORD</label>
              <div className="login-input-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <input
                  type={showPassword ? "text" : "password"}
                  className="login-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  disabled={loading}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Balon Informasi Error */}
            {error && (
              <div className="login-error">
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Tombol Aksi Masuk */}
            <button 
              type="submit" 
              className="login-btn" 
              disabled={loading}
            >
              {loading ? "AUTHENTICATING..." : "MASUK KE DASHBOARD"}
            </button>
          </form>

          {/* ── FOOTER & OPSIONAL REGISTRASI ── */}
          <div className="login-footer" style={{ marginTop: "24px", textAlign: "center", fontSize: "13px" }}>
            <div style={{ marginBottom: "12px", color: "#ccc" }}>
              Belum punya akun?{" "}
              <a 
                href="/register" 
                style={{ 
                  color: "var(--yellow, #e8a020)", 
                  textDecoration: "none", 
                  fontWeight: "bold",
                  marginLeft: "4px"
                }}
              >
                Daftar Akun Baru
              </a>
            </div>
            
            <div style={{ opacity: 0.5, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "12px" }}>
              &copy; 2026 IT Infrastructure. All Rights Reserved.
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}