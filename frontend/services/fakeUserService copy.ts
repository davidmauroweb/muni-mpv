import { User, ApiResponse, UserRole } from '../types';

const USERS_KEY = 'muni_users';

const INITIAL_USERS: User[] = [
  {
    id: 'u1',
    nombre: 'Admin',
    apellido: 'Sistema',
    dni: '123',
    area: 'Sistemas',
    cargo: 'Administrador',
    username: 'admin',
    password: '123', // In real app, hashed
    rol: UserRole.ADMIN,
    activo: true,
    debe_cambiar_password: false,
    created_at: new Date().toISOString()
  },
  {
    id: 'u2',
    nombre: 'Maria',
    apellido: 'Mesa',
    dni: '456',
    area: 'Mesa de Entradas',
    cargo: 'Operadora',
    username: 'mesa',
    password: '123',
    rol: UserRole.MESA_ENTRADAS,
    activo: true,
    debe_cambiar_password: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'u3',
    nombre: 'Juan',
    apellido: 'Social',
    dni: '789',
    area: 'Acción Social',
    cargo: 'Trabajador Social',
    username: 'personal',
    password: '123',
    rol: UserRole.PERSONAL,
    activo: true,
    debe_cambiar_password: false,
    created_at: new Date().toISOString()
  }
];

export const fakeUserService = {
  getUsers: (): User[] => {
    const stored = localStorage.getItem(USERS_KEY);
    if (!stored) {
      localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(stored);
  },

  saveUser: (user: User): ApiResponse<User> => {
    const users = fakeUserService.getUsers();
    
    // Check username uniqueness
    const existing = users.find(u => u.username === user.username && u.id !== user.id);
    if (existing) return { success: false, error: 'El nombre de usuario ya existe', status: 400 };

    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = { ...users[index], ...user };
    } else {
      users.push({ ...user, created_at: new Date().toISOString() });
    }

    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return { success: true, data: user, status: 200 };
  },

  deleteUser: (id: string): ApiResponse<null> => {
    const users = fakeUserService.getUsers().filter(u => u.id !== id);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return { success: true, status: 200 };
  },

  getPersonalActivo: (): User[] => {
    return fakeUserService.getUsers().filter(u => u.activo && (u.rol === UserRole.PERSONAL || u.rol === UserRole.SUPERVISOR));
  }
};