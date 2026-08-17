import { createContext, useContext, useState, type ReactNode } from 'react';
import { login as apiLogin, logout as apiLogout, isAuthenticated } from '../lib/api';

interface AuthValue { authed: boolean; login: (email: string, password: string) => Promise<void>; logout: () => void; error: string | null; loading: boolean; }
const AuthContext = createContext<AuthValue | null>(null);
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authed, setAuthed] = useState(isAuthenticated()); const [error, setError] = useState<string | null>(null); const [loading, setLoading] = useState(false);
  const login = async (email:string,password:string) => { try { setLoading(true); setError(null); await apiLogin(email,password); setAuthed(true); } catch(e:any){ setError(e?.message||'Login failed'); throw e; } finally { setLoading(false); } };
  const logout=()=>{apiLogout();setAuthed(false)};
  return <AuthContext.Provider value={{authed,login,logout,error,loading}}>{children}</AuthContext.Provider>;
};
export const useAuth=()=>{const v=useContext(AuthContext);if(!v)throw new Error('useAuth must be used within AuthProvider');return v;};
