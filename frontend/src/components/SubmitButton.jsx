export default function SubmitButton({ 
  isPending, 
  hasChanges = true, 
  label = 'Save Changes', 
  pendingLabel = 'Saving updates...',
  className = 'btn-orange'
}) {
  
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
