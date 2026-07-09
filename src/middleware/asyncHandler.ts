import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Envolve um handler async para que rejeições (throw/await reject) sejam
 * encaminhadas ao error-handler global via next(err), eliminando o
 * try/catch boilerplate de cada rota.
 *
 * Uso:
 *   router.get('/', asyncHandler(async (req, res) => { ... }));
 *   router.post('/', validate(Schema), asyncHandler(async (req, res) => { ... }));
 */
export function asyncHandler<T extends Request = Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req as T, res, next)).catch(next);
  };
}