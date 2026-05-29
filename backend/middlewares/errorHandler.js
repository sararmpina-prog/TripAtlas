/* O tratamento de erros é centralizado no middleware global para evitar repetição de lógica nos controllers, garantindo que todas as respostas de erro tenham um formato consistente e informativo.

Os controllers apenas definem códigos de erro específicos para cada tipo de erro esperado, e o middleware global garante que esses códigos sejam incluídos nas respostas de erro.
*/

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      message: 'Rota não encontrada',
      code: 'NOT_FOUND',
    },
  });
}

export const errorHandler = (err, req, res, next) => {
  console.error(err); // importante para debug

  const statusCode = err?.statusCode || 500;
  const code = err?.code || 'INTERNAL_SERVER_ERROR';
  const message = err?.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code,
    },
  });
};

/* 
Fluxo completo:
route → asyncHandler → controller → (erro) → next(err) → errorHandler

Este é um error middleware global do Express que recebe erros do next(err) e evita try/catch em todo o lado;

erros controlados → 400 (ex: validação)
erros inesperados → 500 (erros do servidor e que não queremos passar para frontend)
*/