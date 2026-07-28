/* =============================================================================
   CommerceOS — Auth API Tests
   ============================================================================= */

import { describe, it, expect, beforeEach } from 'vitest';
import { tokenStore } from '../../api/axios';
import type { AuthTokens } from '../../api/axios';

// Mock the axios module
vi.mock('../../api/axios', async () => {
  const actual = await vi.importActual('../../api/axios');
  const mockApi = {
    post: vi.fn(),
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn(() => 1) },
      response: { use: vi.fn(() => 1) },
    },
  };

  return {
    ...actual,
    default: mockApi,
    __esModule: true,
  };
});

import api from '../../api/axios';
import {
  login,
  logout,
  logoutAll,
  getCurrentUser,
  createUser,
  type LoginRequest,
  type CreateUserRequest,
  type UserResponse,
} from '../../api/auth';

// Silence console errors
console.error = vi.fn();

describe('auth API', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should call POST /auth/login and store tokens', async () => {
      const mockTokens: AuthTokens = {
        accessToken: 'access-123',
        refreshToken: 'refresh-456',
      };

      (api.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        data: mockTokens,
      });

      const request: LoginRequest = {
        email: 'admin@test.com',
        password: 'password123',
      };

      const result = await login(request);

      expect(api.post).toHaveBeenCalledWith('/auth/login', request);
      expect(result).toEqual(mockTokens);
      expect(tokenStore.getAccessToken()).toBe('access-123');
      expect(tokenStore.getRefreshToken()).toBe('refresh-456');
    });

    it('should throw on API error', async () => {
      const error = new Error('Network error');
      (api.post as ReturnType<typeof vi.fn>).mockRejectedValueOnce(error);

      const request: LoginRequest = {
        email: 'admin@test.com',
        password: 'wrong',
      };

      await expect(login(request)).rejects.toThrow('Network error');
      expect(tokenStore.getAccessToken()).toBeNull();
    });
  });

  describe('logout', () => {
    it('should call POST /auth/logout and clear tokens', async () => {
      tokenStore.setTokens({
        accessToken: 'access-123',
        refreshToken: 'refresh-456',
      });

      (api.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({});

      await logout('refresh-456');

      expect(api.post).toHaveBeenCalledWith('/auth/logout', {
        refreshToken: 'refresh-456',
      });
      expect(tokenStore.getAccessToken()).toBeNull();
      expect(tokenStore.getRefreshToken()).toBeNull();
    });

    it('should rethrow API error without clearing tokens (handled by AuthContext)', async () => {
      tokenStore.setTokens({
        accessToken: 'access-123',
        refreshToken: 'refresh-456',
      });

      (api.post as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Network error'),
      );

      // The raw logout function throws on failure, leaving tokens intact.
      // The AuthContext wrapper handles clearing via try/catch/finally.
      await expect(logout('refresh-456')).rejects.toThrow('Network error');
      expect(tokenStore.getAccessToken()).toBe('access-123');
      expect(tokenStore.getRefreshToken()).toBe('refresh-456');
    });
  });

  describe('logoutAll', () => {
    it('should call POST /auth/logout-all and clear tokens', async () => {
      tokenStore.setTokens({
        accessToken: 'access-123',
        refreshToken: 'refresh-456',
      });

      (api.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({});

      await logoutAll();

      expect(api.post).toHaveBeenCalledWith('/auth/logout-all');
      expect(tokenStore.getAccessToken()).toBeNull();
      expect(tokenStore.getRefreshToken()).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should call GET /auth/me and return user data', async () => {
      const mockUser: UserResponse = {
        id: 'user-1',
        username: 'admin',
        email: 'admin@commerceos.com',
        roles: ['ADMIN'],
        permissions: ['users:read', 'inventory:read'],
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-01T00:00:00',
      };

      (api.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        data: mockUser,
      });

      const result = await getCurrentUser();

      expect(api.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockUser);
      expect(result.roles).toContain('ADMIN');
    });

    it('should throw on 401', async () => {
      const error = { response: { status: 401 } };
      (api.get as ReturnType<typeof vi.fn>).mockRejectedValueOnce(error);

      await expect(getCurrentUser()).rejects.toEqual(error);
    });
  });

  describe('createUser', () => {
    it('should call POST /admin/users with user data', async () => {
      const mockUser: UserResponse = {
        id: 'user-2',
        username: 'newguy',
        email: 'newguy@test.com',
        roles: ['VIEWER'],
        permissions: ['inventory:read'],
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-01T00:00:00',
      };

      (api.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        data: mockUser,
      });

      const request: CreateUserRequest = {
        username: 'newguy',
        email: 'newguy@test.com',
        password: 'password123',
        roleName: 'VIEWER',
      };

      const result = await createUser(request);

      expect(api.post).toHaveBeenCalledWith('/admin/users', request);
      expect(result).toEqual(mockUser);
      expect(result.roles).toContain('VIEWER');
    });
  });
});
