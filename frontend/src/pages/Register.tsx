import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nama: "",
    username: "",
    role: "operator", // Peran default awal
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !form.nama ||
      !form.username ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("Semua field wajib diisi");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Konfirmasi password tidak sama");
      return;
    }

    try {
      setError("");
      setSuccess("");
      setLoading(true);

      const res = await fetch("http://localhost:1337/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama: form.nama,
          username: form.username,
          password: form.password,
          role: form.role,
        }),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          `Server merespons dengan format non-JSON (Status: ${res.status}).`
        );
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registrasi gagal");
        return;
      }

      setSuccess("Registrasi berhasil! Mengalihkan ke halaman login...");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err: any) {
      console.error("Register Error:", err);
      setError(err.message || "Server tidak dapat dihubungi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#111827",
        color: "white",
      }}
    >
      <div
        style={{
          width: "400px",
          background: "#1f2937",
          padding: "30px",
          borderRadius: "12px",
        }}
      >
        <h1 style={{ marginBottom: "20px", fontSize: "24px", fontWeight: "bold" }}>
          Register Account
        </h1>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="nama"
            placeholder="Nama Lengkap"
            value={form.nama}
            onChange={handleChange}
            style={inputStyle}
            disabled={loading}
          />

          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            style={inputStyle}
            disabled={loading}
          />

          {/* 🟢 PENYESUAIAN ROLE: Menghilangkan logistic, menggantinya dengan procurement agar klop dengan Dashboard.tsx */}
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            style={inputStyle}
            disabled={loading}
          >
            <option value="operator">Operator Gudang</option>
            <option value="admin">Admin Administrasi</option>
            <option value="superadmin">Superadmin System</option>
            <option value="qc">Quality Control (QC)</option>
            <option value="procurement">Procurement (Pengadaan)</option>
            <option value="manager">Manager Gudang</option>
          </select>

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            style={inputStyle}
            disabled={loading}
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Konfirmasi Password"
            value={form.confirmPassword}
            onChange={handleChange}
            style={inputStyle}
            disabled={loading}
          />

          {error && (
            <p style={{ color: "#f87171", marginBottom: "10px", fontSize: "14px" }}>
              ⚠️ {error}
            </p>
          )}

          {success && (
            <p style={{ color: "#4ade80", marginBottom: "10px", fontSize: "14px" }}>
              ✅ {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              background: loading ? "#4b5563" : "#2563eb",
              border: "none",
              color: "white",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "bold",
              transition: "background 0.2s",
            }}
          >
            {loading ? "Memproses..." : "Daftar Akun"}
          </button>
        </form>

        <p style={{ marginTop: "15px", fontSize: "14px", color: "#9ca3af" }}>
          Sudanya punya akun?{" "}
          <Link to="/login" style={{ color: "#3b82f6", textDecoration: "none", fontWeight: "bold" }}>
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  );
}

// =========================================================
// SAFE INLINE STYLES FOR TYPESCRIPT
// =========================================================
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  marginBottom: "14px",
  borderRadius: "8px",
  border: "1px solid #374151",
  background: "#111827",
  color: "white",
  boxSizing: "border-box",
};