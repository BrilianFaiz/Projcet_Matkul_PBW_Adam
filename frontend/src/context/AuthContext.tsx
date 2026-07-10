import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react"; 

// Blueprint struktur data user sistem ISOMRS
interface UserType {
  id?: string;
  nama: string;
  role: "superadmin" | "admin" | "operator" | "manager" | "procurement" | "qc" | string;
}

interface AuthContextType {
  user: UserType | null;
  token: string | null;
  login: (token: string, user: UserType) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // 🟢 Membaca sesi login saat aplikasi pertama kali dimuat
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    
    if (savedToken && savedUser) {
      try {
        // Bersihkan token dari kemungkinan karakter kutip sisa pembungkus string
        const cleanToken = savedToken.replace(/'/g, "").trim();
        
        // Proteksi parsing JSON yang aman
        const parsedUser = JSON.parse(savedUser);
        
        setToken(cleanToken);
        setUser(parsedUser);
      } catch (error) {
        console.error("Gagal memulihkan sesi user dari localStorage:", error);
        // Jika data di localStorage korup, langsung bersihkan agar tidak loop crash
        localStorage.clear();
        setToken(null);
        setUser(null);
      }
    }
  }, []);

  // 🟢 Fungsi login menyimpan data ke state dan localStorage
  const login = (token: string, user: UserType) => {
    const cleanToken = token.replace(/'/g, "").trim();
    
    localStorage.setItem("token", cleanToken);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("role", user.role.toLowerCase()); // Paksa lowercase agar konsisten
    localStorage.setItem("nama", user.nama);

    setToken(cleanToken);
    setUser(user);
  };

  // 🟢 Fungsi logout membersihkan seluruh sisa sesi
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role"); 
    localStorage.removeItem("nama"); 
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }
  return context;
};