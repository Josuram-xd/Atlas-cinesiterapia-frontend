/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  /** `mock` (por defecto) o `http`: de dónde salen los datos del atlas. */
  readonly VITE_ATLAS_API?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
