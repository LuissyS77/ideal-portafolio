import { User } from './types';

// Array de usuarios autorizados
// Puedes agregar más usuarios aquí
export const AUTHORIZED_USERS: User[] = [];

export function authenticateUser(email: string, password: string): User | null {
  const user = AUTHORIZED_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  return user || null;
}

export function getUserById(id: string): User | null {
  return AUTHORIZED_USERS.find((u) => u.id === id) || null;
}
