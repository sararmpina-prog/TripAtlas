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
  console.error(err); // Importante para debug

   if (err.code === 'ER_DUP_ENTRY') {
    let message = 'Duplicate entry';

    if (err.message.includes('users.email')) {
      message = 'This email is already registered.';
    }

    if (err.message.includes('users.mobile_phone')) {
      message = 'This mobile phone number is already registered.';
    }

    return res.status(409).json({
      success: false,
      error: {
        message,
        code: 'DUPLICATE_ENTRY'
      }
    });
  }

  // Corrigido para CamelCase para ler corretamente da sua classe AppError
  const statusCode = err?.statusCode || 500;
  const code = err?.code || 'INTERNAL_SERVER_ERROR';
  
  // Se for 500, esconde a mensagem real para segurança
  const message = statusCode === 500 
    ? 'Internal Server Error' 
    : (err?.message || 'An error occurred');

  res.status(statusCode).json({
    success: false,
    error: { message, code },
  });
};

/* 
Fluxo completo:
route → asyncHandler → controller → (erro) → next(err) → errorHandler

Este é um error middleware global do Express que recebe erros do next(err) e evita try/catch em todo o lado;

erros controlados → 400 (ex: validação)
erros inesperados → 500 (erros do servidor e que não queremos passar para frontend)
*/