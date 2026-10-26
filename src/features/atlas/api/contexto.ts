import { createContext, useContext } from 'react';
import type { AtlasApi } from './atlasApi';

export const AtlasApiContext = createContext<AtlasApi | null>(null);

export function useAtlasApi(): AtlasApi {
  const api = useContext(AtlasApiContext);
  if (!api) throw new Error('useAtlasApi debe usarse dentro de AtlasApiProvider');
  return api;
}
