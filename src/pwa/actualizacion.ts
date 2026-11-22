import { create } from 'zustand';

interface EstadoActualizacion {
  /** Aplica la versión nueva ya descargada; `null` si no hay ninguna esperando. */
  aplicar: (() => void) | null;
  anunciar: (aplicar: () => void) => void;
  descartar: () => void;
}

export const useActualizacion = create<EstadoActualizacion>((set) => ({
  aplicar: null,
  anunciar: (aplicar) => set({ aplicar }),
  descartar: () => set({ aplicar: null }),
}));
