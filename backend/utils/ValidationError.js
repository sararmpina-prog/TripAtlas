export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

/*
Classe para erros de validação;
estende / herda da classe nativa Error do JavaScript.
Permite criar erros específicos de validação com uma mensagem personalizada, facilitando a identificação e tratamento desses erros no middleware errorHandler.js
*/