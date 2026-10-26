import type { ReactNode } from 'react';
import type { AtlasApi } from './atlasApi';
import { AtlasApiContext } from './contexto';

export function AtlasApiProvider({
  api,
  children,
}: {
  api: AtlasApi;
  children: ReactNode;
}) {
  return <AtlasApiContext.Provider value={api}>{children}</AtlasApiContext.Provider>;
}
