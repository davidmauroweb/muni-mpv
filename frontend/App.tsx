import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { NewAttention } from './pages/NewAttention';
import { AttentionsList } from './pages/AttentionsList';
import { Applicants } from './pages/Applicants';
import { Users } from './pages/Users';
import { Login } from './pages/Login';
import { ChangePassword } from './pages/ChangePassword';
import { UserRole } from './types';

const AppContent = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="h-screen flex items-center justify-center font-black text-blue-900 animate-pulse">CARGANDO SISTEMA...</div>;

  if (!user) return <Login />;

  if (user.debe_cambiar_password) return <ChangePassword />;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        {(user.rol !== UserRole.ADMIN) && (
          <Route path="/nueva-atencion" element={<NewAttention />} />
        )}
        
        <Route path="/atenciones" element={<AttentionsList />} />
        <Route path="/solicitantes" element={<Applicants />} />
        
        {/* Protected Users/Staff Route */}
        {(user.rol === UserRole.ADMIN) && (
          <Route path="/usuarios" element={<Users />} />
        )}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </HashRouter>
  );
}

export default App;