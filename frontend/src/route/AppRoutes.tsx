import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import { Dashboard } from "../App";
import Register from "../pages/Register";
import { useAuth } from "../context/AuthContext";

function PrivateRoute({ children }: any) {
  const { token } = useAuth();

  return token ? children : <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}