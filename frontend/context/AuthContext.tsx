import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ApiResponse } from '../types';
import { fakeUserService } from '../services/fakeUserService';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (username: string, pass: string) => Promise<ApiResponse<User>>;
  logout: () => void;
  updatePassword: (newPass: string) => Promise<ApiResponse<User>>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('muni_session');
    if (saved) {
      setUser(JSON.parse(saved));
    }
    setIsLoading(false);
  }, []);

  const login = async (name: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { name, password });
      const { user, token } = response.data;
  
      localStorage.setItem("token", token);
      setUser(user);
      return { success: true };
    } catch (error: any) {
      console.log('Error completo:', error);
      console.log('Response data:', error.response?.data);
      return { success: false,  error: error.response?.data?.message || error.message || 'Credenciales inválidas', status: error.response?.status || 500 };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('muni_session');
  };

  const updatePassword = async (newPass: string): Promise<ApiResponse<User>> => {
    if (!user) return { success: false, status: 401 };
    const allUsers = await fakeUserService.getUsers();
    const idx = allUsers.findIndex(u => u.id === user.id);
    
    allUsers[idx].password = newPass;
    allUsers[idx].debe_cambiar_password = false;
    
    fakeUserService.saveUser(allUsers[idx]);
    
    const updatedUser = { ...allUsers[idx] };
    delete updatedUser.password;
    
    setUser(updatedUser);
    localStorage.setItem('muni_session', JSON.stringify(updatedUser));
    return { success: true, data: updatedUser, status: 200 };
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updatePassword, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
};