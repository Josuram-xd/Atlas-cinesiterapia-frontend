import type { ReactNode } from 'react';
import type { ModeracionApi } from './moderacionApi';
import { ModeracionApiContext } from './contexto';

export function ModeracionApiProvider({
  api,
  children,
}: {
  api: ModeracionApi;
  children: ReactNode;
}) {
  return (
    <ModeracionApiContext.Provider value={api}>{children}</ModeracionApiContext.Provider>
  );
}
