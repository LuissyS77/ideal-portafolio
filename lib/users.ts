import { User } from './types';

// Array de usuarios autorizados
// Puedes agregar más usuarios aquí
export const AUTHORIZED_USERS: User[] = [
  {
    id: '1',
    name: 'Administrador',
    email: 'admin@ideal.com',
    password: 'admin123', // En producción usar hash
    role: 'admin',
  },
  {
    id: '2',
    name: 'Vendedor 1',
    email: 'vendedor1@ideal.com',
    password: 'vendedor123',
    role: 'vendedor',
  },
  {
    id: '3',
    name: 'Viewer',
    email: 'viewer@ideal.com',
    password: 'viewer123',
    role: 'viewer',
  },
];

export function authenticateUser(email: string, password: string): User | null {
  const user = AUTHORIZED_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  return user || null;
}

export function getUserById(id: string): User | null {
  return AUTHORIZED_USERS.find((u) => u.id === id) || null;
}
