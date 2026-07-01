// src/pages/EditProfile.jsx
import { Link, useNavigate } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import Header from '../components/Header';
import DashboardCard from '../components/DashboardCard';
import ProfileForm from '../components/ProfileForm';
import PasswordForm from '../components/PasswordForm';
import { FaArrowLeft, FaTrashAlt } from 'react-icons/fa';
import { MdManageAccounts } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { useConfirm } from '../context/ConfirmContext'; 
import { useToast } from '../context/ToastContext';
import { getStoredUser, getStoredToken, clearAuthSession } from '../utils/authStorage';
import { deleteUserAccount } from '../api';
import '../styles/EditProfile.css';

export default function EditProfile() {
    const navigate = useNavigate();
    const confirm = useConfirm();
    const toast = useToast();
    const user = getStoredUser();
    const token = getStoredToken();

    // MUTAÇÃO CRÍTICA: Apagar conta do Servidor
    const deleteMutation = useMutation({
        mutationFn: () => deleteUserAccount(user.id, token),
        onSuccess: () => {
            clearAuthSession(); // Destrói o Token e o User dos storages locais
            toast('Your account was permanently deleted.', 'info');
            navigate('/login'); // Redireciona para o login de forma segura
        },
        onError: (err) => {
            toast(err?.message || 'Failed to delete account. Try again later.', 'error');
        }
    });

    // Função de gatilho que abre o teu InfoCard Modal centralizado
    const handleDeleteClick = async () => {
        const confirmed = await confirm(
            "Delete Your Account Permanently?",
            "WARNING: This action cannot be undone. All your travels, itineraries, logged flights, and accommodations will be permanently destroyed."
        );

        if (confirmed) {
            deleteMutation.mutate();
        }
    };

    return (
        <div className="profile-edit-page">
            <Header />

            <main className="profile-edit-content">
                <div className="profile-edit-container-wrapper">
                    
                    <Link to="/dashboard" className="btn-back-dashboard">
                        <FaArrowLeft /> Back to Dashboard
                    </Link>

                    {/* BLOCO 1: CONTA */}
                    <DashboardCard actions={null}>
                        <div className="profile-card-header">
                            <MdManageAccounts className='profile-icon' size={40} />
                            <div className="profile-card-header-text">
                                <h2>Account Settings</h2>
                                <p>Update your personal information and contact details</p>
                            </div>
                        </div>
                        <ProfileForm />
                    </DashboardCard>

                    {/* BLOCO 2: SEGURANÇA */}
                    <DashboardCard actions={null}>
                        <div className="profile-card-header">
                            <RiLockPasswordFill className='profile-icon' size={40} />
                            <div className="profile-card-header-text">
                                <h2>Security Settings</h2>
                                <p>Update your password to keep your account protected</p>
                            </div>
                        </div>
                        <PasswordForm />
                    </DashboardCard>

                    {/* NOVO BLOCO 3: ZONA DE PERIGO (DELETE ACCOUNT) */}
                    <DashboardCard actions={null}>
                        <div className="profile-card-header danger-zone-header">
                            <FaTrashAlt className='profile-icon danger-icon' size={32} />
                            <div className="profile-card-header-text">
                                <h2 className="danger-title">Delete Account</h2>
                                <p>Permanently delete your TripAtlas profile and all associated logs</p>
                            </div>
                        </div>
                        <div className="danger-zone-content">
                            <p className="danger-text">
                                Once you delete your account, there is no going back.
                                <br />
                                Please be certain before proceeding.
                            </p>
                            <div className="danger-actions">
                                <button 
                                    type="button" 
                                    className="btn-base btn-danger-action"
                                    onClick={handleDeleteClick}
                                    disabled={deleteMutation.isPending}
                                >
                                    {deleteMutation.isPending ? 'Deleting Account...' : 'Delete Account'}
                                </button>
                            </div>
                        </div>
                    </DashboardCard>

                </div>
            </main>
        </div>
    );
}
