/* =============================================================================
   CommerceOS — Auth API
   ============================================================================= */

import api, { tokenStore, type AuthTokens } from './axios';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  roleName: string;
}

export interface SignUpRequest {
  username: string;
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Auth API
// ---------------------------------------------------------------------------

export async function login(request: LoginRequest): Promise<AuthTokens> {
  const { data } = await api.post<AuthTokens>('/auth/login', request);
  tokenStore.setTokens(data);
  return data;
}

export async function refreshToken(
  refreshToken: string,
): Promise<AuthTokens> {
  const { data } = await api.post<AuthTokens>('/auth/refresh', {
    refreshToken,
  });
  return data;
}

export async function logout(refreshToken: string): Promise<void> {
  await api.post('/auth/logout', { refreshToken });
  tokenStore.clearTokens();
}

export async function logoutAll(): Promise<void> {
  await api.post('/auth/logout-all');
  tokenStore.clearTokens();
}

export async function getCurrentUser(): Promise<UserResponse> {
  const { data } = await api.get<UserResponse>('/auth/me');
  return data;
}

export async function createUser(
  request: CreateUserRequest,
): Promise<UserResponse> {
  const { data } = await api.post<UserResponse>('/admin/users', request);
  return data;
}

export async function signUp(request: SignUpRequest): Promise<AuthTokens> {
  const { data } = await api.post<AuthTokens>('/auth/signup', request);
  tokenStore.setTokens(data);
  return data;
}
