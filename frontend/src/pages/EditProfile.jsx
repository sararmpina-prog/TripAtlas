// src/pages/EditProfile.jsx
import { Link } from 'react-router';
import Header from '../components/Header';
import DashboardCard from '../components/DashboardCard';
import ProfileForm from '../components/ProfileForm';
import PasswordForm from '../components/PasswordForm';
import { FaArrowLeft } from 'react-icons/fa';
import '../styles/EditProfile.css';

export default function EditProfile() {
    return (
        <div className="profile-edit-page">
            <Header />

            <main className="profile-edit-content">
                
                <div className="profile-edit-container-wrapper">
                    
                    <Link 
                        to="/dashboard" 
                        className="btn-back-dashboard">
                        <FaArrowLeft /> Back to Dashboard
                    </Link>

                    {/* BLOCO 1: CONTA */}
                    <DashboardCard actions={null}>
                        <div className="profile-card-header">
                            <h2>Account Settings</h2>
                            <p>Update your personal information and contact details</p>
                        </div>
                        <ProfileForm />
                    </DashboardCard>

                    {/* BLOCO 2: SEGURANÇA */}
                    <div className="profile-card-wrapper">
                        <DashboardCard actions={null}>
                            <div className="profile-card-header">
                                <h2>Security Settings</h2>
                                <p>Update your password to keep your account protected</p>
                            </div>
                            <PasswordForm />
                        </DashboardCard>
                    </div>

                </div>

            </main>
        </div>
    );
}
