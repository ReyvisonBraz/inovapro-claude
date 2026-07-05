/**
 * Erros de domínio com status HTTP associado.
 * Lançados pelos services e traduzidos em resposta HTTP pelas rotas
 * (ou pelo error handler global).
 */

export class AppError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Registro não encontrado') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Este registro foi modificado por outro usuário. Revise as alterações antes de salvar novamente.') {
    super(message, 409);
  }
}

export class BusinessError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}
