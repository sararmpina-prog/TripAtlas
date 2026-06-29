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

export default function PasswordForm() {
    const user = getStoredUser();
    const token = getStoredToken();

    const [formData, setFormData] = useState({
        current_password: '',
        new_password: '',
    });

    const [fieldErrors, setFieldErrors] = useState({});
    const [formError, setFormError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const mutation = useMutation({
        mutationFn: (payload) => updateUserPassword(user.id, payload, token),
        onSuccess: () => {
            setSuccessMessage('Password updated successfully!');
            setFormData({ current_password: '', new_password: '' });
            setTimeout(() => setSuccessMessage(''), 4000);
        },
        onError: (err) => {
            const result = getChangePasswordErrorState(err);
            setFieldErrors(result.fieldErrors);
            setFormError(result.formError);
        }
    });

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setFieldErrors(prev => ({ ...prev, [name]: '' }));
        setFormError('');
        setSuccessMessage('');
    }

    function handleSubmit(e) {
        e.preventDefault();
        setFormError('');
        setFieldErrors({});
        setSuccessMessage('');

        const validationError = validateChangePasswordForm(formData);
        if (hasValidationErrors(validationError)) {
            setFieldErrors(validationError);
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

            <div className="auth-form-field" style={{ marginTop: '16px' }}>
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

            {formError && <p className="auth-form-error global-profile-error" style={{ marginTop: '16px' }}>{formError}</p>}
            {successMessage && <p style={{ color: 'green', fontWeight: '500', marginTop: '16px', fontSize: '0.9rem' }}>{successMessage}</p>}

            <div className="profile-form-actions">
                <button type="submit" disabled={mutation.isPending} className="btn-base btn-orange">
                    {mutation.isPending ? 'Updating password...' : 'Update Password'}
                </button>
            </div>
        </form>
    );
}
