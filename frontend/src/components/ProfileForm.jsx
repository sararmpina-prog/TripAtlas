import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { getStoredUser, getStoredToken, saveAuthSession } from '../utils/authStorage';
import { 
    validateProfileForm, 
    normalizeProfilePayload, 
    getProfileErrorState, 
    hasValidationErrors 
} from '../validators/authValidator';
import { updateUserProfile } from '../api';

export default function ProfileForm() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const user = getStoredUser();
    const token = getStoredToken();

    const [formData, setFormData] = useState({
        first_name: user?.first_name || '',
        surname: user?.surname || '',
        email: user?.email || '',
        mobile_phone: user?.mobile_phone || '',
    });

    const [fieldErrors, setFieldErrors] = useState({});
    const [formError, setFormError] = useState('');

    const mutation = useMutation({
        mutationFn: (cleanPayload) => updateUserProfile(user.id, cleanPayload, token),
        onSuccess: (response) => {
            const updatedUser = response?.data || response;
            saveAuthSession({ token, user: updatedUser });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            navigate('/dashboard');
        },
        onError: (err) => {
            const result = getProfileErrorState(err);
            setFieldErrors(result.fieldErrors);
            setFormError(result.formError);
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

        const validationError = validateProfileForm(formData);
        if (hasValidationErrors(validationError)) {
            setFieldErrors(validationError);
            return;
        }

        const cleanPayload = normalizeProfilePayload(formData);
        mutation.mutate(cleanPayload);
    }

    return (
        <form className="auth-form edit-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-form-row">
                <div className="auth-form-field">
                    <input
                        type="text"
                        name="first_name"
                        placeholder="First Name *"
                        value={formData.first_name}
                        onChange={handleChange}
                        aria-invalid={Boolean(fieldErrors.first_name)}
                        className={fieldErrors.first_name ? 'auth-input-error' : undefined}
                    />
                    {fieldErrors.first_name && <p className="auth-form-error">{fieldErrors.first_name}</p>}
                </div>

                <div className="auth-form-field">
                    <input
                        type="text"
                        name="surname"
                        placeholder="Surname *"
                        value={formData.surname}
                        onChange={handleChange}
                        aria-invalid={Boolean(fieldErrors.surname)}
                        className={fieldErrors.surname ? 'auth-input-error' : undefined}
                    />
                    {fieldErrors.surname && <p className="auth-form-error">{fieldErrors.surname}</p>}
                </div>
            </div>

            <div className="auth-form-field">
                <input
                    type="email"
                    name="email"
                    placeholder="Email *"
                    value={formData.email}
                    onChange={handleChange}
                    aria-invalid={Boolean(fieldErrors.email)}
                    className={fieldErrors.email ? 'auth-input-error' : undefined}
                />
                {fieldErrors.email && <p className="auth-form-error">{fieldErrors.email}</p>}
            </div>

            <div className="auth-form-field">
                <input
                    type="tel"
                    name="mobile_phone"
                    placeholder="Phone number"
                    value={formData.mobile_phone}
                    onChange={handleChange}
                    aria-invalid={Boolean(fieldErrors.mobile_phone)}
                    className={fieldErrors.mobile_phone ? 'auth-input-error' : undefined}
                />
                {fieldErrors.mobile_phone && <p className="auth-form-error">{fieldErrors.mobile_phone}</p>}
            </div>

            {formError && <p className="auth-form-error global-profile-error">{formError}</p>}

            <div className="profile-form-actions">
                <button type="submit" disabled={mutation.isPending} className="btn-base btn-orange">
                    {mutation.isPending ? 'Saving updates...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
}
