/**
 * Serialização global de tipos Prisma para compatibilidade com a API/frontend.
 *
 * - Decimal → number: garante que valores monetários cheguem ao frontend
 *   como números JSON (e não strings do decimal.js). Seguro porque todos os
 *   valores cabem em Number (máx 12 dígitos + 2 decimais < 2^53).
 *
 * - Date (meia-noite UTC) → "yyyy-MM-dd": campos `@db.Date` são lidos do
 *   banco como Date com tempo 00:00:00.000Z. O override serializa apenas
 *   a data, mantendo o contrato da API (que sempre usou strings de data).
 *   Timestamps reais (createdAt, updatedAt, timestamp) têm hora != 00
 *   e continuam serializando como ISO completo.
 */
import { Prisma } from '@prisma/client';

const originalDateToJSON = Date.prototype.toJSON;

(Prisma.Decimal.prototype as unknown as { toJSON: () => unknown }).toJSON = function (this: Prisma.Decimal) {
  return Number(this.toString());
};

Date.prototype.toJSON = function (this: Date) {
  if (
    this.getUTCHours() === 0 &&
    this.getUTCMinutes() === 0 &&
    this.getUTCSeconds() === 0 &&
    this.getUTCMilliseconds() === 0
  ) {
    return this.toISOString().slice(0, 10);
  }
  return originalDateToJSON.call(this);
};