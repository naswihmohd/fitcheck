import { useState } from 'react';
import { FiEdit } from 'react-icons/fi';
import CreateLoginModal from './CreateLoginModal';
import type { UserProps } from '../../../../login/data/userTypes';

const EditBranchUserButton = ({ user, branchId }: { user: UserProps, branchId: string }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleEditBranchUser = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <button
                onClick={handleEditBranchUser}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                title="Edit"
            >
                <FiEdit className="w-5 h-5" />
            </button>

            <CreateLoginModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                mode="edit"
                user={user}
                branchId={branchId}
            />
        </>
    );
};

export default EditBranchUserButton;
