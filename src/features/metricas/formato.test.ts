import { describe, expect, it } from 'vitest';
import { formatearDuracion, formatearVariacion } from './formato';

describe('formato de tiempo de uso', () => {
  it('duración en segundos o en minutos y segundos', () => {
    expect(formatearDuracion(0)).toBe('0 s');
    expect(formatearDuracion(45)).toBe('45 s');
    expect(formatearDuracion(120)).toBe('2 min');
    expect(formatearDuracion(512)).toBe('8 min 32 s');
  });

  it('redondea los segundos antes de mostrarlos', () => {
    expect(formatearDuracion(59.6)).toBe('1 min');
  });

  it('variación con signo y una cifra decimal', () => {
    expect(formatearVariacion(12.5)).toBe('+12,5 %');
    expect(formatearVariacion(-3.2)).toBe('-3,2 %');
    expect(formatearVariacion(0)).toBe('0 %');
  });
});
