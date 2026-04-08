import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { api } from '../api/axios';

interface AuthContextType {
  token: string | null;
  role: string | null;
  isCompanion: boolean;
  setIsCompanion: (value: boolean) => void;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const storedToken = localStorage.getItem('sensara_token');
if (storedToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
}

function decodeRole(jwtToken: string): string | null {
  try {
    const decoded: any = jwtDecode(jwtToken);
    return decoded.role || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(storedToken);
  const [role, setRole] = useState<string | null>(() =>
    storedToken ? decodeRole(storedToken) : null
  );
  const [isCompanion, setIsCompanion] = useState(false);

  // Valida expiração e verifica se é acompanhante na inicialização
  useEffect(() => {
    if (!token) return;

    try {
      const decoded: any = jwtDecode(token);
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        handleLogout();
        return;
      }
    } catch {
      handleLogout();
      return;
    }

    // Verifica se tem perfil de acompanhante
    api.get('/companions/me')
      .then(() => setIsCompanion(true))
      .catch(() => setIsCompanion(false));
  }, [token]);

  const processToken = (jwtToken: string) => {
    try {
      const decoded: any = jwtDecode(jwtToken);
      setRole(decoded.role || null);
      setToken(jwtToken);
      localStorage.setItem('sensara_token', jwtToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
    } catch {
      handleLogout();
    }
  };

  const handleLogout = () => {
    setToken(null);
    setRole(null);
    setIsCompanion(false);
    localStorage.removeItem('sensara_token');
    delete api.defaults.headers.common['Authorization'];
  };

  const login = (newToken: string) => processToken(newToken);
  const logout = () => handleLogout();

  return (
    <AuthContext.Provider value={{ token, role, isCompanion, setIsCompanion, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);