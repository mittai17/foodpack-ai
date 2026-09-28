import { apiGet, apiPost } from './client';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: string;
}

export interface LoginResponse {
  data: {
    accessToken: string;
    user: AuthUser;
  };
}

export interface RegisterResponse {
  data: {
    accessToken: string;
    user: AuthUser;
  };
}

export const authApi = {
  login: (email: string, password: string) =>
    apiPost<LoginResponse>('/api/v1/auth/login', { email, password }),

  register: (email: string, password: string, name?: string) =>
    apiPost<RegisterResponse>('/api/v1/auth/register', { email, password, name }),

  profile: () => apiGet<{ data: AuthUser }>('/api/v1/auth/profile'),
};
