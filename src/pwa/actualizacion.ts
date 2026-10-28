import { create } from 'zustand';

interface EstadoActualizacion {
  /** Hay una versión nueva descargada, a la espera de que la persona la aplique. */
  disponible: boolean;
  aplicar: (() => void) | null;
  anunciar: (aplicar: () => void) => void;
  descartar: () => void;
}

export const useActualizacion = create<EstadoActualizacion>((set) => ({
  disponible: false,
  aplicar: null,
  anunciar: (aplicar) => set({ disponible: true, aplicar }),
  descartar: () => set({ disponible: false, aplicar: null }),
}));
