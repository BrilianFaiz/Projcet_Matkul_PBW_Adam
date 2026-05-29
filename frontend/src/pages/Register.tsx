import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nama: "",
    username: "",
    role: "operator",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // validasi sederhana
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

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registrasi gagal");
        return;
      }

      setSuccess("Registrasi berhasil");

      // redirect ke login setelah 1.5 detik
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError("Server tidak dapat dihubungi");
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
        <h1 style={{ marginBottom: "20px" }}>Register Account</h1>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="nama"
            placeholder="Nama"
            value={form.nama}
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            style={inputStyle}
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="operator">Operator</option>
            <option value="admin">Admin</option>
          </select>

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Konfirmasi Password"
            value={form.confirmPassword}
            onChange={handleChange}
            style={inputStyle}
          />

          {error && (
            <p style={{ color: "#f87171", marginBottom: "10px" }}>
              {error}
            </p>
          )}

          {success && (
            <p style={{ color: "#4ade80", marginBottom: "10px" }}>
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              background: "#2563eb",
              border: "none",
              color: "white",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            {loading ? "Loading..." : "Daftar"}
          </button>
        </form>

        <p style={{ marginTop: "15px", fontSize: "14px" }}>
          Sudah punya akun? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "14px",
  borderRadius: "8px",
  border: "1px solid #374151",
  background: "#111827",
  color: "white",
  boxSizing: "border-box" as const,
};