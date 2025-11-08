/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useHash } from '../index';

describe('useHash Hook', () => {
  beforeEach(() => {
    // Reset hash before each test
    window.location.hash = '';
  });

  it('should return empty string initially', () => {
    const { result } = renderHook(() => useHash());
    expect(result.current).toBe('');
  });

  it('should return current hash on mount', () => {
    window.location.hash = '#section';
    const { result } = renderHook(() => useHash());
    expect(result.current).toBe('#section');
  });

  it('should update when hash changes', () => {
    const { result } = renderHook(() => useHash());

    expect(result.current).toBe('');

    act(() => {
      window.location.hash = '#intro';
      // Trigger hashchange event manually
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });

    expect(result.current).toBe('#intro');
  });

  it('should update on multiple hash changes', () => {
    const { result } = renderHook(() => useHash());

    act(() => {
      window.location.hash = '#section1';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(result.current).toBe('#section1');

    act(() => {
      window.location.hash = '#section2';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(result.current).toBe('#section2');

    act(() => {
      window.location.hash = '';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(result.current).toBe('');
  });

  it('should cleanup listener on unmount', () => {
    const { unmount } = renderHook(() => useHash());

    unmount();

    // After unmount, changing hash should not cause issues
    act(() => {
      window.location.hash = '#test';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });

    // No error should occur
    expect(window.location.hash).toBe('#test');
  });
});
