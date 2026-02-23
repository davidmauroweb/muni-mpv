import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Lock, User as UserIcon, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { user, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await login(username, password);
    if (!res.success) {
      setError(res.error || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Glassmorphism Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-40"></div>
        <div className="absolute top-[20%] right-[-10%] w-[35rem] h-[35rem] bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-40"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[45rem] h-[45rem] bg-indigo-600 rounded-full mix-blend-screen filter blur-[100px] opacity-40"></div>
      </div>

      <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] max-w-md w-full p-10 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
            <img 
                src="https://azuldigital.gob.ar/wp-content/uploads/2024/02/logo-png-blanco-02.png" 
                alt="Logo" 
                className="h-16 mx-auto mb-6 drop-shadow-md"
            />
            <h1 className="text-2xl font-black text-white uppercase tracking-tight drop-shadow-sm">Mesa de Entradas</h1>
            <p className="text-blue-200/80 font-medium">Inicie sesión para continuar</p>
        </div>

        {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl flex items-center gap-3 text-red-200 text-sm font-bold backdrop-blur-md">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-[10px] font-black text-blue-200/70 uppercase tracking-widest mb-2 ml-1">Usuario</label>
                <div className="relative">
                    <UserIcon className="absolute left-4 top-3.5 text-white/50 w-5 h-5" />
                    <input 
                        required
                        type="text" 
                        className="w-full pl-12 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all font-medium text-white placeholder:text-white/30 backdrop-blur-sm"
                        placeholder="Ej: jperon"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-black text-blue-200/70 uppercase tracking-widest mb-2 ml-1">Contraseña</label>
                <div className="relative">
                    <Lock className="absolute left-4 top-3.5 text-white/50 w-5 h-5" />
                    <input 
                        required
                        type="password" 
                        className="w-full pl-12 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all font-medium text-white placeholder:text-white/30 backdrop-blur-sm"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                </div>
            </div>

            <button 
                type="submit"
                className="w-full py-4 bg-white/10 border border-white/20 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-[0_4px_16px_0_rgba(31,38,135,0.2)] hover:bg-white/20 transition-all active:scale-[0.98] backdrop-blur-md"
            >
                Ingresar al Sistema
            </button>
        </form>

        <div className="mt-10 text-center">
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Municipalidad de Azul - 2026</p>
        </div>
      </div>
    </div>
  );
};