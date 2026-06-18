/* Ficheiro de utilitários para erros personalizados da aplicação. Permite criar erros específicos com mensagens e códigos de status HTTP, facilitando o tratamento de erros em toda a aplicação.
*/

// Classe Base para erros conhecidos da aplicação
export class AppError extends Error {
  constructor(message, statusCode, code, details = undefined) {
    super(message);
    this.name = new.target.name; // cada erro herda o nome da sua classe (ex: ValidationError, NotFoundError)
    this.statusCode = statusCode;
    this.code = code;

    if (details) {
      this.details = details;
    }
  }
}

// Erro de Validação (Ex: Zod, inputs inválidos) -> HTTP 400
export class ValidationError extends AppError {
  constructor(message, details = undefined, code = 'VALIDATION_ERROR') {
    super(message, 400, code, details);
  }
}

// Erro de Recurso Não Encontrado (Ex: ID de voo inexistente) -> HTTP 404
export class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404, 'NOT_FOUND');
  }
}

// Erro de Acesso Proibido (Ex: utilizador tenta aceder a recurso de outro utilizador) -> HTTP 403
export class ForbiddenError extends AppError {
  constructor(message) {
    super(message, 403, 'FORBIDDEN');
  }
}

// Erro de Autenticação Falhada (Ex: Sem token, sessão expirada, credenciais erradas) -> HTTP 401
export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required. Please log in again.') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

// Erro de Token Inválido ou Adulterado -> HTTP 401
export class InvalidTokenError extends AppError {
  constructor(message = 'Session expired or invalid. Please log in again.') {
    super(message, 401, 'INVALID_TOKEN');
  }
}