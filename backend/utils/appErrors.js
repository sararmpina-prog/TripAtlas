/* Ficheiro de utilitários para erros personalizados da aplicação. Permite criar erros específicos com mensagens e códigos de status HTTP, facilitando o tratamento de erros em toda a aplicação.
*/

// Classe Base para erros conhecidos da aplicação
export class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.name = new.target.name; // cada erro herda o nome da sua classe (ex: ValidationError, NotFoundError)
    this.statusCode = statusCode;
    this.code = code;
  }
}

// Erro de Validação (Ex: Zod, inputs inválidos) -> HTTP 400
export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400, 'VALIDATION_ERROR');
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