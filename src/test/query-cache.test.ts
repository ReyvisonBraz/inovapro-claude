import { describe, expect, it } from 'vitest';
import { mergeSavedRecord, removeCachedRecord, upsertCachedRecord } from '../lib/query-cache';

describe('cache de mutacoes', () => {
  it('combina o payload enviado com o id retornado pela API', () => {
    expect(mergeSavedRecord(
      { firstName: 'Ana', phone: '55999999999' },
      { id: 42 },
    )).toEqual({ firstName: 'Ana', phone: '55999999999', id: 42 });
  });

  it('preserva campos enriquecidos retornados pelo servidor', () => {
    expect(mergeSavedRecord(
      { customerId: 7, totalValue: 100 },
      { id: 9, customerName: 'Ana Silva', status: 'Pendente' },
    )).toEqual({
      customerId: 7,
      totalValue: 100,
      id: 9,
      customerName: 'Ana Silva',
      status: 'Pendente',
    });
  });

  it('insere um cadastro imediatamente em listas paginadas', () => {
    const result = upsertCachedRecord(
      { data: [{ id: 1, firstName: 'Bia' }], meta: { total: 1, page: 1 } },
      { id: 2, firstName: 'Ana' },
    );

    expect(result).toEqual({
      data: [{ id: 2, firstName: 'Ana' }, { id: 1, firstName: 'Bia' }],
      meta: { total: 2, page: 1 },
    });
  });

  it('atualiza um cadastro existente sem duplicar', () => {
    expect(upsertCachedRecord(
      [{ id: 1, name: 'Antigo' }],
      { id: 1, name: 'Novo' },
    )).toEqual([{ id: 1, name: 'Novo' }]);
  });

  it('remove uma OS da lista e atualiza totais imediatamente', () => {
    expect(removeCachedRecord(
      {
        data: [{ id: 9, status: 'Aguardando Análise' }, { id: 8, status: 'Concluído' }],
        meta: { total: 2, statusCounts: { 'Aguardando Análise': 1, Concluído: 1 } },
      },
      9,
    )).toEqual({
      data: [{ id: 8, status: 'Concluído' }],
      meta: { total: 1, statusCounts: { 'Aguardando Análise': 0, Concluído: 1 } },
    });
  });
});
