import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { getStoredUser, getStoredToken } from '../utils/authStorage';
import { 
    validateChangePasswordForm, 
    getChangePasswordErrorState, 
    hasValidationErrors 
} from '../validators/authValidator';
import PasswordField from './PasswordField';
import { updateUserPassword } from '../api';
import { useToast } from '../context/ToastContext';
import { triggerGlobalErrorToast } from '../utils/formHelpers';
import SubmitButton from '../components/SubmitButton'; 

export default function PasswordForm() {
    const user = getStoredUser();
    const token = getStoredToken();
    const toast = useToast();

    const [formData, setFormData] = useState({
        current_password: '',
        new_password: '',
    });

    const [fieldErrors, setFieldErrors] = useState({});
    const [formError, setFormError] = useState('');

    const hasChanges = formData.current_password.trim() !== '' && formData.new_password.trim() !== '';

    const mutation = useMutation({
        mutationFn: (payload) => updateUserPassword(user.id, payload, token),
        onSuccess: () => {
            toast('Password updated successfully!', 'success');
            setFormData({ current_password: '', new_password: '' });
        },
        onError: (err) => {
            const result = getChangePasswordErrorState(err);
            setFieldErrors(result.fieldErrors);
            setFormError(result.formError);

            // Helper para não repetir Toasts quando já existem erros inline
            triggerGlobalErrorToast(toast, result, 'Failed to update password. Please check the fields.');
        }
    });

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setFieldErrors(prev => ({ ...prev, [name]: '' }));
        setFormError('');
    }

    function handleSubmit(e) {
        e.preventDefault();
        setFormError('');
        setFieldErrors({});

        if (!hasChanges) return;

        const validationError = validateChangePasswordForm(formData);
        if (hasValidationErrors(validationError)) {
            setFieldErrors(validationError);
            // Mantemos este aviso local porque impede o envio ao servidor
            toast('Please check the password requirements.', 'warning');
            return;
        }

        mutation.mutate(formData);
    }

    return (
        <form className="auth-form edit-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-form-field">
                <PasswordField
                    name="current_password"
                    placeholder="Current Password *"
                    value={formData.current_password}
                    onChange={handleChange}
                    aria-invalid={Boolean(fieldErrors.current_password)}
                    inputClassName={fieldErrors.current_password ? 'auth-input-error' : undefined}
                />
                {fieldErrors.current_password && <p className="auth-form-error">{fieldErrors.current_password}</p>}
            </div>

            <div className="auth-form-field">
                <PasswordField
                    name="new_password"
                    placeholder="New Password *"
                    value={formData.new_password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    aria-invalid={Boolean(fieldErrors.new_password)}
                    inputClassName={fieldErrors.new_password ? 'auth-input-error' : undefined}
                />
                {fieldErrors.new_password && <p className="auth-form-error">{fieldErrors.new_password}</p>}
            </div>

            {formError && <p className="auth-form-error global-profile-error">{formError}</p>}

            <div className="profile-form-actions">
                <SubmitButton 
                    isPending={mutation.isPending} 
                    hasChanges={hasChanges} 
                    label="Update Password"
                    pendingLabel="Updating password..."
                />
            </div>
        </form>
    );
}
