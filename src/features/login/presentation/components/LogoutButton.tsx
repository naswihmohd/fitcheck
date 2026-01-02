import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../../../firebaseConfig';
import { clearUser } from '../../redux/authSlice';
import type { AppDispatch } from '../../../../general/redux/store';
import ConfirmModal from '../../../../general/components/ConfirmModal';

const LogoutButton = () => {
    const dispatch: AppDispatch = useDispatch();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);


    const handleLogout = async () => {
        setIsProcessing(true);
        try {
            await signOut(auth);
            dispatch(clearUser());
            navigate('/login', { replace: true });
        } catch (error) {
            console.error('Error signing out:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            <button
                type="button"
                disabled={isProcessing}
                onClick={() => setShowLogoutModal(true)}
                className='w-full cursor-pointer font-medium hover:text-red-400 text-red-600 gap-2 flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all duration-200 hover:bg-gray-100'
            >
                {isProcessing ? 'Signing out...' : 'Logout'}
            </button>

            <ConfirmModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={handleLogout}
                message="Are you sure you want to logout?"
            />
        </>
    );
};

export default LogoutButton;

