import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { enviarCierrePendiente, useSessionLifecycle } from './sessionLifecycle';
import { useSession } from './sessionStore';
import { authDemo } from '@/test/fixtures';

function Montador() {
  useSessionLifecycle();
  return null;
}

function eventoPageshow(persisted: boolean) {
  const evento = new Event('pageshow');
  Object.defineProperty(evento, 'persisted', { value: persisted });
  return evento;
}

describe('cierre de sesión al cerrar la pestaña', () => {
  const beacon = vi.fn(() => true);
  const fetchMock = vi.fn();

  beforeEach(() => {
    Object.defineProperty(navigator, 'sendBeacon', { value: beacon, configurable: true });
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => {
    beacon.mockClear();
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it('envía el cierre pendiente con sendBeacon en pagehide', async () => {
    useSession.getState().iniciar(authDemo({ refreshToken: 'r1' }));
    render(<Montador />);

    window.dispatchEvent(new Event('pagehide'));

    expect(beacon).toHaveBeenCalledOnce();
    const [url, blob] = beacon.mock.calls[0] as unknown as [string, Blob];
    expect(url).toMatch(/\/auth\/cierre-pendiente$/);
    expect(blob.type).toBe('application/json');
    expect(JSON.parse(await blob.text())).toEqual({ refreshToken: 'r1' });
  });

  it('si el navegador rechaza el beacon, lo reenvía con fetch keepalive', async () => {
    beacon.mockReturnValueOnce(false);
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    useSession.getState().iniciar(authDemo({ refreshToken: 'r1' }));

    expect(enviarCierrePendiente()).toBe(true);

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toMatch(/\/auth\/cierre-pendiente$/);
    expect(init.keepalive).toBe(true);
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>)['Content-Type']).toBe(
      'application/json',
    );
    expect(JSON.parse(init.body as string)).toEqual({ refreshToken: 'r1' });
  });

  it('no envía nada si no hay sesión', () => {
    render(<Montador />);
    window.dispatchEvent(new Event('pagehide'));
    expect(beacon).not.toHaveBeenCalled();
    expect(enviarCierrePendiente()).toBe(false);
  });

  it('tras cerrar sesión manualmente ya no hay nada que avisar', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    useSession.getState().iniciar(authDemo({ refreshToken: 'r1' }));
    render(<Montador />);
    await useSession.getState().cerrarSesion();
    window.dispatchEvent(new Event('pagehide'));
    expect(beacon).not.toHaveBeenCalled();
  });

  it('un refresh al volver desde la caché de retroceso cancela el cierre', async () => {
    useSession.getState().iniciar(authDemo({ refreshToken: 'r1' }));
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(authDemo({ accessToken: 'b', refreshToken: 'r2' })), {
        status: 200,
      }),
    );
    render(<Montador />);

    window.dispatchEvent(eventoPageshow(true));

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/auth\/refresh$/);
  });

  it('un pageshow normal (carga nueva) no hace refresh extra', () => {
    useSession.getState().iniciar(authDemo({ refreshToken: 'r1' }));
    render(<Montador />);
    window.dispatchEvent(eventoPageshow(false));
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
