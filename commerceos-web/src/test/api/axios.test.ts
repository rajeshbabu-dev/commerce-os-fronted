/* =============================================================================
   CommerceOS — Axios API Client Tests
   ============================================================================= */

import { describe, it, expect, beforeEach } from 'vitest';
import { tokenStore } from '../../api/axios';

// Mock localStorage
beforeEach(() => {
  localStorage.clear();
});

describe('tokenStore', () => {
  it('should start with no tokens', () => {
    expect(tokenStore.getAccessToken()).toBeNull();
    expect(tokenStore.getRefreshToken()).toBeNull();
  });

  it('should store access and refresh tokens', () => {
    tokenStore.setTokens({
      accessToken: 'access-123',
      refreshToken: 'refresh-456',
    });

    expect(tokenStore.getAccessToken()).toBe('access-123');
    expect(tokenStore.getRefreshToken()).toBe('refresh-456');
  });

  it('should overwrite tokens on subsequent calls', () => {
    tokenStore.setTokens({
      accessToken: 'access-old',
      refreshToken: 'refresh-old',
    });
    tokenStore.setTokens({
      accessToken: 'access-new',
      refreshToken: 'refresh-new',
    });

    expect(tokenStore.getAccessToken()).toBe('access-new');
    expect(tokenStore.getRefreshToken()).toBe('refresh-new');
  });

  it('should clear tokens', () => {
    tokenStore.setTokens({
      accessToken: 'access-123',
      refreshToken: 'refresh-456',
    });
    tokenStore.clearTokens();

    expect(tokenStore.getAccessToken()).toBeNull();
    expect(tokenStore.getRefreshToken()).toBeNull();
  });

  it('should persist tokens across multiple get/set cycles', () => {
    tokenStore.setTokens({
      accessToken: 'test-access',
      refreshToken: 'test-refresh',
    });

    // Read back multiple times
    expect(tokenStore.getAccessToken()).toBe('test-access');
    expect(tokenStore.getAccessToken()).toBe('test-access');
    expect(tokenStore.getRefreshToken()).toBe('test-refresh');
    expect(tokenStore.getRefreshToken()).toBe('test-refresh');
  });

  it('should handle the onLogout callback', () => {
    let called = false;
    tokenStore.onLogout = () => {
      called = true;
    };

    tokenStore.onLogout?.();

    expect(called).toBe(true);

    // Reset
    tokenStore.onLogout = null;
  });

  it('should replace onLogout when reassigned', () => {
    const calls: string[] = [];
    tokenStore.onLogout = () => calls.push('first');
    tokenStore.onLogout?.();
    expect(calls).toEqual(['first']);

    tokenStore.onLogout = () => calls.push('second');
    tokenStore.onLogout?.();
    expect(calls).toEqual(['first', 'second']);

    tokenStore.onLogout = null;
  });
});
