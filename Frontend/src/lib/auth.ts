interface User {
  id: number;
  usuario: string;
  rol: string;
  rol_id: number;
}

export function setSession(token: string, user: User, remember: boolean) {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem('access_token', token);
  storage.setItem('user', JSON.stringify(user));
}

export function getToken(): string | null {
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
}

export function getUser(): User | null {
  const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('user');
}

export function isAuthed(): boolean {
  const token = getToken();
  if (!token) return false;
  
  if (isTokenExpired(token)) {
    clearSession();
    return false;
  }
  
  return true;
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;
    return Date.now() >= exp;
  } catch {
    return true;
  }
}

export function hasRole(...roles: string[]): boolean {
  const user = getUser();
  if (!user || !user.rol) return false;
  return roles.includes(user.rol);
}
