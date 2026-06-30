import { Link } from 'react-router';
import Header from '../components/Header';
import DashboardCard from '../components/DashboardCard';
import ProfileForm from '../components/ProfileForm';
import PasswordForm from '../components/PasswordForm';
import { FaArrowLeft } from 'react-icons/fa';
import { MdManageAccounts } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import '../styles/EditProfile.css';

export default function EditProfile() {
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

                </div>
            </main>
        </div>
    );
}
