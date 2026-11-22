import type { ReactNode } from 'react';
import type { ComentariosApi } from './comentariosApi';
import { ComentariosApiContext } from './contexto';

export function ComentariosApiProvider({
  api,
  children,
}: {
  api: ComentariosApi;
  children: ReactNode;
}) {
  return (
    <ComentariosApiContext.Provider value={api}>
      {children}
    </ComentariosApiContext.Provider>
  );
}
