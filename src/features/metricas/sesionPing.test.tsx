import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSesionPing } from './sesionPing';
import { PingDeSesion } from './PingDeSesion';
import { MetricasApiProvider } from './api/MetricasApiProvider';
import { crearMockMetricasApi } from './api/mockMetricasApi';
import { useSession } from '../auth/sessionStore';

function Sonda({ activa, enviar }: { activa: boolean; enviar: () => Promise<unknown> }) {
  useSesionPing(activa, enviar, 60_000);
  return null;
}

function visibilidad(valor: 'visible' | 'hidden') {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => valor,
  });
  document.dispatchEvent(new Event('visibilitychange'));
}

beforeEach(() => {
  vi.useFakeTimers();
  visibilidad('visible');
});
afterEach(() => {
  vi.useRealTimers();
  visibilidad('visible');
});

describe('useSesionPing', () => {
  it('envía un ping al iniciar y otro cada 60 s con la pestaña visible', () => {
    const enviar = vi.fn(() => Promise.resolve());
    render(<Sonda activa enviar={enviar} />);
    expect(enviar).toHaveBeenCalledTimes(1);
    act(() => void vi.advanceTimersByTime(60_000));
    expect(enviar).toHaveBeenCalledTimes(2);
    act(() => void vi.advanceTimersByTime(120_000));
    expect(enviar).toHaveBeenCalledTimes(4);
  });

  it('se detiene con la pestaña oculta y se reanuda al volver', () => {
    const enviar = vi.fn(() => Promise.resolve());
    render(<Sonda activa enviar={enviar} />);
    act(() => visibilidad('hidden'));
    act(() => void vi.advanceTimersByTime(300_000));
    expect(enviar).toHaveBeenCalledTimes(1);
    act(() => visibilidad('visible'));
    expect(enviar).toHaveBeenCalledTimes(2);
    act(() => void vi.advanceTimersByTime(60_000));
    expect(enviar).toHaveBeenCalledTimes(3);
  });

  it('no envía nada sin sesión y se detiene al cerrarla', () => {
    const enviar = vi.fn(() => Promise.resolve());
    const { rerender } = render(<Sonda activa={false} enviar={enviar} />);
    act(() => void vi.advanceTimersByTime(120_000));
    expect(enviar).not.toHaveBeenCalled();
    rerender(<Sonda activa enviar={enviar} />);
    expect(enviar).toHaveBeenCalledTimes(1);
    rerender(<Sonda activa={false} enviar={enviar} />);
    act(() => void vi.advanceTimersByTime(300_000));
    expect(enviar).toHaveBeenCalledTimes(1);
  });

  it('un ping fallido no rompe el latido', () => {
    const enviar = vi.fn(() => Promise.reject(new Error('caído')));
    render(<Sonda activa enviar={enviar} />);
    act(() => void vi.advanceTimersByTime(60_000));
    expect(enviar).toHaveBeenCalledTimes(2);
  });
});

describe('PingDeSesion', () => {
  it('sigue el estado de la sesión', () => {
    const api = crearMockMetricasApi();
    const espia = vi.spyOn(api, 'registrarPing');
    render(
      <MetricasApiProvider api={api}>
        <PingDeSesion />
      </MetricasApiProvider>,
    );
    expect(espia).not.toHaveBeenCalled();
    act(() => useSession.setState({ estado: 'autenticado' }));
    expect(espia).toHaveBeenCalledTimes(1);
    act(() => useSession.setState({ estado: 'anonimo' }));
    act(() => void vi.advanceTimersByTime(180_000));
    expect(espia).toHaveBeenCalledTimes(1);
  });
});
