/* Compara os dados atuais do formulário com os dados originais.
   Devolve 'true' se o utilizador alterou alguma coisa.
 */
export function hasFormChanged(currentData, originalData) {
  if (!currentData || !originalData) return false;
  
  // Percorre apenas os campos que existem no teu formulário atual
  return Object.keys(currentData).some(key => {
    const currentVal = String(currentData[key] || '').trim();
    const originalVal = String(originalData[key] || '').trim();
    
    return currentVal !== originalVal;
  });
}

// Filtra e dispara Toasts de erro apenas para falhas globais do servidor, evitando duplicar erros que já aparecem inline nos campos.

export function triggerGlobalErrorToast(toastTrigger, errorState, fallbackMessage = "An error occurred. Please try again.") {
  if (!toastTrigger || !errorState) return;

  // Se a API devolveu um erro global (ex: credenciais erradas ou servidor em baixo), dispara o Toast
  if (errorState.formError) {
    toastTrigger(errorState.formError, "error");
  } 
  // Se não há erro global mas os fieldErrors também estão vazios (ex: falha de rede/API offline)
  else if (!errorState.fieldErrors || Object.keys(errorState.fieldErrors).length === 0) {
    toastTrigger(fallbackMessage, "error");
  }
  
  // Se existirem apenas fieldErrors, a função não faz NADA (deixa os erros aparecerem inline)
}
