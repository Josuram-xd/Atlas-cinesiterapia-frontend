import { describe, expect, it } from 'vitest';
import type { EjercicioAdmin } from '@/lib/api';
import {
  etiquetaCampo,
  fichaAForm,
  formARequest,
  formVacio,
  hayCambios,
  pasoDeCampo,
  validarBorrador,
} from './fichaForm';

const ficha = (extra: Partial<EjercicioAdmin> = {}): EjercicioAdmin => ({
  id: 5,
  estado: 'BORRADOR',
  nombre: 'Puente',
  region: { id: 9, nombre: 'Columna lumbar', svgId: 'posterior-lumbar' },
  categoria: { id: 6, nombre: 'Fortalecimiento isométrico' },
  objetivoTerapeutico: 'Activar glúteos',
  estructurasIntervenidas: null,
  indicaciones: null,
  precaucionesContraindicaciones: null,
  posicionPaciente: null,
  posicionFisioterapeuta: null,
  ejecucion: null,
  comandosVerbales: null,
  dosificacion: { series: '3', repeticiones: null },
  progresion: null,
  erroresComunes: null,
  estudiantesCreadores: ['Ana'],
  cohorte: '2025-1',
  profesoraRevisora: null,
  media: [],
  creadoPor: { id: 1, correo: 'a@a.co' },
  actualizadoPor: null,
  creadoEn: '2026-10-01T00:00:00Z',
  actualizadoEn: '2026-10-01T00:00:00Z',
  publicadoEn: null,
  archivadoEn: null,
  camposFaltantes: [],
  version: 1,
  ...extra,
});

describe('fichaAForm / formARequest', () => {
  it('convierte nulls en cadenas vacías y completa la dosificación', () => {
    const f = fichaAForm(ficha());
    expect(f.estructurasIntervenidas).toBe('');
    expect(f.dosificacion.series).toBe('3');
    expect(f.dosificacion.frecuencia).toBe('');
    expect(f.regionId).toBe(9);
    expect(f.estudiantesCreadores).toEqual(['Ana']);
  });

  it('el request recorta los textos y manda null para los vacíos', () => {
    const f = { ...formVacio(), nombre: '  Puente  ', regionId: 9, categoriaId: 6 };
    f.objetivoTerapeutico = '  Activar  ';
    f.estudiantesCreadores = ['  Ana  ', '   ', ''];
    const r = formARequest(f);
    expect(r.nombre).toBe('Puente');
    expect(r.objetivoTerapeutico).toBe('Activar');
    expect(r.indicaciones).toBeNull();
    expect(r.estudiantesCreadores).toEqual(['Ana']);
    expect(r.dosificacion).toEqual({
      series: null,
      repeticiones: null,
      intensidad: null,
      tiempo: null,
      descanso: null,
      frecuencia: null,
    });
    expect(r.cohorte).toBeNull();
  });

  it('ida y vuelta de una ficha completa no pierde datos', () => {
    const e = ficha({ indicaciones: 'Dolor controlado' });
    expect(formARequest(fichaAForm(e)).indicaciones).toBe('Dolor controlado');
  });
});

describe('hayCambios', () => {
  it('ignora espacios sobrantes y detecta ediciones reales', () => {
    const base = fichaAForm(ficha());
    expect(hayCambios(base, { ...base, nombre: 'Puente ' })).toBe(false);
    expect(hayCambios(base, { ...base, nombre: 'Otro' })).toBe(true);
    expect(hayCambios(base, { ...base, estudiantesCreadores: ['Ana', ''] })).toBe(false);
  });
});

describe('validarBorrador', () => {
  it('exige nombre, región y categoría', () => {
    expect(Object.keys(validarBorrador(formVacio())).sort()).toEqual([
      'categoriaId',
      'nombre',
      'regionId',
    ]);
  });

  it('valida la cohorte y los largos máximos', () => {
    const f = { ...formVacio(), nombre: 'x', regionId: 1, categoriaId: 1 };
    expect(validarBorrador({ ...f, cohorte: '2025-1' })).toEqual({});
    expect(validarBorrador({ ...f, cohorte: '25-1' }).cohorte).toBeTruthy();
    expect(validarBorrador({ ...f, nombre: 'x'.repeat(201) }).nombre).toBeTruthy();
    expect(validarBorrador({ ...f, ejecucion: 'x'.repeat(5001) }).ejecucion).toBeTruthy();
    expect(
      validarBorrador({ ...f, estudiantesCreadores: Array(21).fill('a') })
        .estudiantesCreadores,
    ).toBeTruthy();
  });
});

describe('campos del backend', () => {
  it('lleva cada campo faltante a su paso', () => {
    expect(pasoDeCampo('objetivoTerapeutico')).toBe('general');
    expect(pasoDeCampo('indicaciones')).toBe('protocolo');
    expect(pasoDeCampo('comandosVerbales')).toBe('ejecucion');
    expect(pasoDeCampo('dosificacion.series')).toBe('dosificacion');
    expect(pasoDeCampo('media')).toBe('multimedia');
    expect(pasoDeCampo('estudiantesCreadores[0]')).toBe('metadatos');
    expect(pasoDeCampo('cohorte')).toBe('metadatos');
  });

  it('da una etiqueta legible, con respaldo para campos desconocidos', () => {
    expect(etiquetaCampo('dosificacion.series')).toBe('Series');
    expect(etiquetaCampo('precaucionesContraindicaciones')).toBe(
      'Precauciones y contraindicaciones',
    );
    expect(etiquetaCampo('algoNuevo')).toBe('algoNuevo');
  });
});
