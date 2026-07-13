import { Prisma } from '@prisma/client';

export function getPrismaErrorCode(error: unknown): string | null {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code;
  }
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: unknown }).code;
    return typeof code === 'string' ? code : null;
  }
  return null;
}

export function isPrismaNotFoundError(error: unknown): boolean {
  return getPrismaErrorCode(error) === 'P2025';
}

export function isPrismaUniqueConstraintError(error: unknown): boolean {
  return getPrismaErrorCode(error) === 'P2002';
}
