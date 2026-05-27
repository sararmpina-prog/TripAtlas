export class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFoundError";
    this.statusCode = 404;
  }
}

/*
Erro customizado para recursos não encontrados;
Retorna status code 404 em vez de 400.
Deve ser usado quando um utilizador, tarefa, tag, etc não existe.
*/
