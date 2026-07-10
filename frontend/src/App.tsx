import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard"; // 🟢 1. Impor halaman Dashboard kamu

// 🔒 Komponen Proteksi Rute (Mencegah user yang belum login masuk ke Dashboard)
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  
  if (!token) {
    // Jika tidak ada token, paksa ke halaman login
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// 🔓 Komponen Proteksi Rute Terbuka (Mencegah user yang SUDAH login balik ke halaman Login/Register)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  
  if (token) {
    // Jika sudah login, langsung lempar ke halaman utama dashboard
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

export default function App() {
  return (
    // 🟢 2. Bungkus dengan AuthProvider agar state user dan token aktif di semua rute
    <AuthProvider>
      <Routes>
        {/* 🟢 3. Rute Utama "/" diarahkan ke halaman Dashboard dengan proteksi Login */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Rute untuk halaman Login dengan proteksi PublicRoute */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        
        {/* Rute untuk halaman Register Akun Baru dengan proteksi PublicRoute */}
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        
        {/* Fallback jika user mengetik alamat asal-asalan, otomatis balik ke halaman utama */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}