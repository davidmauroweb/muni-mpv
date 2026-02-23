import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export const ChangePassword: React.FC = () => {
  const { updatePassword } = useAuth();
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass.length < 4) return setError('La contraseña debe tener al menos 4 caracteres');
    if (newPass !== confirmPass) return setError('Las contraseñas no coinciden');
    
    updatePassword(newPass);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 border border-slate-100">
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Seguridad Obligatoria</h1>
            <p className="text-slate-500 font-medium mt-2">Por política municipal, debe cambiar su contraseña temporal antes de continuar.</p>
        </div>

        {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 text-sm font-bold">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nueva Contraseña</label>
                <input 
                    required
                    type="password" 
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100"
                    value={newPass}
                    onChange={e => setNewPass(e.target.value)}
                />
            </div>

            <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Confirmar Contraseña</label>
                <input 
                    required
                    type="password" 
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100"
                    value={confirmPass}
                    onChange={e => setConfirmPass(e.target.value)}
                />
            </div>

            <button 
                type="submit"
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-blue-700 transition-all"
            >
                Actualizar y Comenzar
            </button>
        </form>
      </div>
    </div>
  );
};