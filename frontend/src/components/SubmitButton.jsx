// src/components/SubmitButton.jsx
export default function SubmitButton({ 
  isPending, 
  hasChanges = true, 
  label = 'Save Changes', 
  pendingLabel = 'Saving updates...',
  className = 'btn-orange' // Permite mudar a cor para btn-blue se precisares noutro lado
}) {
  
  // O botão bloqueia se estiver a enviar para a API OU se não houver alterações nos campos
  const isDisabled = isPending || !hasChanges;

  return (
    <div className="form-actions-wrapper">
      <button 
        type="submit" 
        disabled={isDisabled} 
        className={`btn-base ${className} ${isDisabled ? 'btn-disabled' : ''}`}
      >
        {isPending ? pendingLabel : label}
      </button>
    </div>
  );
}
