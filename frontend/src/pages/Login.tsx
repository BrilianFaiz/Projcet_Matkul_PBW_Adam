import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:1337/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login gagal");
        return;
      }

      login(data.token, data.user);
      navigate("/");
    } catch (err) {
      setError("Server tidak bisa dihubungi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div className="login-left">
        <div className="login-brand">
          <div className="login-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="1" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              <line x1="12" y1="12" x2="12" y2="17" />
              <line x1="9" y1="14.5" x2="15" y2="14.5" />
            </svg>
          </div>
          <div>
            <div className="login-brand-title">Warehouse <span>Control</span></div>
            <div className="login-brand-sub">Management System · v1.0</div>
          </div>
        </div>
        <div className="login-left-content">
          <h2>Kelola gudang lebih<br />efisien & terstruktur</h2>
          <p>Monitor stok, kelola transaksi, dan pantau alur barang dari Warehouse RM hingga Finish Good dalam satu platform.</p>
          <div className="login-stats">
            <div className="login-stat">
              <div className="login-stat-value">3</div>
              <div className="login-stat-label">Stage Tracking</div>
            </div>
            <div className="login-stat">
              <div className="login-stat-value">2</div>
              <div className="login-stat-label">Role Akses</div>
            </div>
            <div className="login-stat">
              <div className="login-stat-value">∞</div>
              <div className="login-stat-label">Transaksi</div>
            </div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-box">
          <div className="login-box-header">
            <div className="login-box-tag">SISTEM AKSES</div>
            <h3>Masuk ke Dashboard</h3>
            <p>Masukkan kredensial akun kamu</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label className="login-label">USERNAME</label>
              <div className="login-input-wrap">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  className="login-input"
                  type="text"
                  name="username"
                  placeholder="Masukkan username"
                  value={form.username}
                  onChange={handleChange}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="login-field">
              <label className="login-label">PASSWORD</label>
              <div className="login-input-wrap">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  className="login-input"
                  type="password"
                  name="password"
                  placeholder="Masukkan password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className="login-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? "MEMPROSES..." : "MASUK →"}
            </button>
          </form>

          <div className="login-footer">
            <span>Lupa password? Hubungi Administrator</span>
          </div>
        </div>
      </div>
    </div>
  );
}