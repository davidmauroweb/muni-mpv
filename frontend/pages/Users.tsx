import React, { useState, useEffect } from 'react';
import { fakeUserService } from '../services/fakeUserService';
import { User, UserRole } from '../types';
import { UserPlus, Edit3, Trash2, X, Save, Shield, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Users: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({
    nombre: '', apellido: '', dni: '', area: '', cargo: '', name: '', rol: UserRole.PERSONAL, activo: true, password: ''
  });

  useEffect(() => {
    const fetchUsers = async () => {
      const usersData = await fakeUserService.getUsers();
      setUsers(usersData);
    };
  
    fetchUsers();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ nombre: '', apellido: '', dni: '', area: '', cargo: '', name: '', rol: UserRole.PERSONAL, activo: true, password: '' });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const user: User = {
      ...formData as User,
      //id: editingId || crypto.randomUUID(),
      id: editingId,
      password: formData.password || (editingId ? (users.find(u => u.id === editingId)?.password) : '123'),
      debe_cambiar_password: !editingId,
      created_at: editingId ? (users.find(u => u.id === editingId)?.created_at || new Date().toISOString()) : new Date().toISOString()
    };

    const savedUser = await fakeUserService.saveUser(user);

    const updatedUsers = await fakeUserService.getUsers();
    setUsers(updatedUsers);

    setIsModalOpen(false);

  } catch (error: any) {
    alert("Error al guardar usuario");
    console.error(error);
  }
};

  return (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Gestión de Usuarios</h1>
                <p className="text-slate-500 font-medium">Administración de accesos y personal municipal.</p>
            </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="flex justify-end">
                <button 
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg hover:bg-indigo-700 transition-transform hover:scale-105"
                >
                    <UserPlus className="w-4 h-4" /> Nuevo Usuario
                </button>
            </div>

            <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuario</th>
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rol</th>
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Área</th>
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Estado</th>
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-6">
                                    <p className="font-bold text-slate-900">{u.nombre} {u.apellido}</p>
                                    <p className="text-xs text-slate-500 font-medium">@{u.name}</p>
                                </td>
                                <td className="p-6">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                        <Shield className="w-3 h-3" /> {u.rol}
                                    </span>
                                </td>
                                <td className="p-6 text-sm font-medium text-slate-600">{u.area}</td>
                                <td className="p-6 text-center">
                                    {u.activo ? (
                                        <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100">ACTIVO</span>
                                    ) : (
                                        <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded border border-slate-200">INACTIVO</span>
                                    )}
                                </td>
                                <td className="p-6 text-right space-x-2">
                                    <button onClick={() => { setEditingId(u.id); setFormData(u); setIsModalOpen(true); }} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"><Edit3 className="w-5 h-5"/></button>
                                    <button onClick={() => { if(confirm('¿Eliminar usuario?')) { fakeUserService.deleteUser(u.id); setUsers(prev => prev.filter(user => user.id !== u.id)); } }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-5 h-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {isModalOpen && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full p-8 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{editingId ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
                        <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><X className="w-5 h-5 text-slate-500"/></button>
                    </div>
                    <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                            <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-wider">Nombre</label>
                            <input required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})}/>
                        </div>
                        <div className="col-span-1">
                            <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-wider">Apellido</label>
                            <input required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.apellido} onChange={e => setFormData({...formData, apellido: e.target.value})}/>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-wider">Usuario</label>
                            <input required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}/>
                        </div>
                        <div className="col-span-1">
                            <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-wider">Rol</label>
                            <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.rol} onChange={e => setFormData({...formData, rol: e.target.value as UserRole})}>
                                {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div className="col-span-1">
                            <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-wider">Área</label>
                            <input required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})}/>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-wider">Contraseña {editingId && '(Dejar en blanco para no cambiar)'}</label>
                            <input 
                                type="password"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                                value={formData.password || ''} 
                                onChange={e => setFormData({...formData, password: e.target.value})}
                                placeholder={editingId ? "********" : "123"}
                            />
                        </div>
                        <div className="col-span-2 flex justify-end gap-3 pt-6 border-t border-slate-100 mt-4">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-xs font-black text-slate-500 uppercase hover:bg-slate-100 rounded-xl transition-colors">Cancelar</button>
                            <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase shadow-lg hover:bg-blue-700 transition-transform hover:scale-105"><Save className="w-4 h-4 inline mr-2" /> Guardar</button>
                        </div>
                    </form>
                    {!editingId && <div className="mt-4 p-4 bg-blue-50 rounded-2xl flex items-center gap-3 text-blue-700 text-[10px] font-black uppercase border border-blue-100">
                        <Key className="w-4 h-4"/> Contraseña por defecto: 123
                    </div>}
                </div>
            </div>
        )}
    </div>
  );
};