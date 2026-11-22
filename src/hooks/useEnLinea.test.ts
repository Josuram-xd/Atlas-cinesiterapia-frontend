import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useEnLinea } from './useEnLinea';

afterEach(() => vi.restoreAllMocks());

const cambiarRed = (enLinea: boolean) => {
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(enLinea);
  act(() => void window.dispatchEvent(new Event(enLinea ? 'online' : 'offline')));
};

describe('useEnLinea', () => {
  it('parte del estado del navegador y sigue los eventos online y offline', () => {
    const { result } = renderHook(() => useEnLinea());
    expect(result.current).toBe(true);

    cambiarRed(false);
    expect(result.current).toBe(false);

    cambiarRed(true);
    expect(result.current).toBe(true);
  });
});
