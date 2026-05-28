
/* Erro customizado para recursos não encontrados (trip, flight, etc);
Retorna status code 404 em vez de 400.
Este erro nasce dentro de service ou controllers, e é apanhado pelo errorHandler para enviar uma resposta padronizada ao cliente. 
*/


export class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFoundError";
    this.statusCode = 404;
    this.code = 'NOT_FOUND';
  }
}
