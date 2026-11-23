import { describe, expect, it } from 'vitest';
import { ApiError, NetworkError } from '@/lib/api';
import { describirError } from './erroresAdmin';
import { ArchivoInvalidoError } from './media/subida';

describe('describirError', () => {
  it('FICHA_INCOMPLETA devuelve los campos faltantes en el orden del backend', () => {
    const e = new ApiError(422, {
      code: 'FICHA_INCOMPLETA',
      message: 'La ficha tiene campos obligatorios pendientes',
      fieldErrors: [
        { field: 'objetivoTerapeutico', message: 'Campo obligatorio' },
        { field: 'dosificacion.series', message: 'Campo obligatorio' },
        { field: 'media', message: 'Agrega al menos una imagen o un video' },
      ],
    });
    const r = describirError(e);
    expect(r.faltantes).toEqual(['objetivoTerapeutico', 'dosificacion.series', 'media']);
    expect(r.campos['media']).toBe('Agrega al menos una imagen o un video');
    expect(r.mensaje).toMatch(/obligatorios/);
  });

  it('VALIDATION_ERROR devuelve el texto por campo', () => {
    const r = describirError(
      new ApiError(400, {
        code: 'VALIDATION_ERROR',
        fieldErrors: [{ field: 'nombre', message: 'No debe estar vacio' }],
      }),
    );
    expect(r.campos).toEqual({ nombre: 'No debe estar vacio' });
    expect(r.faltantes).toEqual([]);
  });

  it('traduce códigos estables y no muestra el mensaje crudo del servidor', () => {
    const r = describirError(
      new ApiError(409, { code: 'ESTADO_INVALIDO', message: 'texto interno sin tildes' }),
    );
    expect(r.mensaje).not.toContain('sin tildes');
    expect(r.mensaje).toMatch(/estado/);
    expect(
      describirError(new ApiError(404, { code: 'MEDIA_NO_ENCONTRADA' })).mensaje,
    ).toMatch(/archivo/);
  });

  it('distingue red, sesión, límite de intentos y servidor', () => {
    expect(describirError(new NetworkError()).mensaje).toMatch(/conectar/);
    expect(describirError(new ApiError(403)).mensaje).toMatch(/permiso/);
    expect(describirError(new ApiError(429)).mensaje).toMatch(/Demasiadas/);
    expect(describirError(new ApiError(500)).mensaje).toMatch(/servidor/);
    expect(describirError(new Error('x')).mensaje).toMatch(/Inténtalo/);
  });

  it('reutiliza el motivo de un archivo inválido', () => {
    expect(
      describirError(new ArchivoInvalidoError('Formato no permitido.')).mensaje,
    ).toBe('Formato no permitido.');
  });
});
