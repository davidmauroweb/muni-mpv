import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, FileText, Users, UserCog, Menu, X, LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

const NavItem = ({ to, icon: Icon, label, onClick }: { to: string; icon: any; label: string, onClick?: () => void }) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 font-bold uppercase tracking-wider text-[10px] lg:text-xs ${
          isActive
            ? 'bg-white text-blue-900 shadow-lg scale-105'
            : 'text-blue-100 hover:bg-blue-800 hover:text-white'
        }`
      }
    >
      <Icon className="w-4 h-4" />
      <span className="hidden lg:inline">{label}</span>
      <span className="lg:hidden">{label.split(' ')[0]}</span>
    </NavLink>
  );
};

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-blue-900 text-white shadow-2xl z-50 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 gap-4">
            <div className="flex items-center gap-3 flex-shrink-0">
               <img src="https://azuldigital.gob.ar/wp-content/uploads/2024/02/logo-png-blanco-02.png" alt="Muni Azul" className="h-7 lg:h-9 w-auto object-contain" />
               <div className="leading-tight border-l border-blue-700/50 pl-3 hidden xl:block">
                 <h1 className="font-black text-sm tracking-widest text-white">DESARROLLO DE LA COMUNIDAD</h1>
                 <p className="text-[8px] text-blue-200 uppercase tracking-widest font-medium">MESA DE ENTRADAS</p>
               </div>
            </div>

            <nav className="hidden md:flex items-center gap-1 bg-blue-950/30 p-1 rounded-2xl overflow-x-auto no-scrollbar">
              <NavItem to="/" icon={LayoutDashboard} label="Panel" />
              {(user.rol !== UserRole.ADMIN) && <NavItem to="/nueva-atencion" icon={PlusCircle} label="Nueva Atención" />}
              <NavItem to="/atenciones" icon={FileText} label="Atenciones" />
              <NavItem to="/solicitantes" icon={Users} label="Solicitantes" />
              {(user.rol === UserRole.ADMIN) && <NavItem to="/usuarios" icon={ShieldAlert} label="Usuarios" />}
            </nav>

            <div className="hidden md:flex items-center gap-4 pl-4 border-l border-blue-800 flex-shrink-0">
               <div className="text-right hidden lg:block">
                 <p className="text-xs font-bold text-white uppercase tracking-tight">{user.id} {user.nombre} {user.apellido}</p>
                 <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">{user.rol}</p>
               </div>
               <button onClick={logout} className="p-2.5 bg-blue-800 text-blue-200 hover:text-white hover:bg-red-600 rounded-xl transition-all shadow-lg group">
                 <LogOut className="w-5 h-5 group-hover:scale-110" />
               </button>
            </div>

            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 rounded-xl text-blue-200 hover:text-white hover:bg-blue-800"><Menu /></button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className={`md:hidden bg-blue-900 overflow-hidden transition-all duration-300 border-t border-blue-800 ${isMobileMenuOpen ? 'max-h-[32rem]' : 'max-h-0'}`}>
          <div className="p-4 space-y-2">
              <NavItem to="/" icon={LayoutDashboard} label="Panel Principal" />
              {(user.rol !== UserRole.ADMIN) && <NavItem to="/nueva-atencion" icon={PlusCircle} label="Nueva Atención" />}
              <NavItem to="/atenciones" icon={FileText} label="Atenciones" />
              <NavItem to="/solicitantes" icon={Users} label="Solicitantes" />
              {(user.rol === UserRole.ADMIN) && <NavItem to="/usuarios" icon={ShieldAlert} label="Usuarios" />}
              <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-3 bg-red-600/20 text-red-200 rounded-xl font-bold uppercase tracking-wider text-xs mt-4">
                <LogOut className="w-4 h-4" /> Cerrar Sesión
              </button>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">{children}</main>
    </div>
  );
};