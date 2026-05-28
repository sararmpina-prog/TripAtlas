/* Apanha erros de funções async e envia para next() -> errorHandler.js */
/*Eu passo uma função, e asyncHandler devolve outra função*/

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
