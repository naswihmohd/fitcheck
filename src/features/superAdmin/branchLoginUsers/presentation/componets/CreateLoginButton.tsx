import { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import type { BranchProps } from '../../../addBranch/data/branchTypes';
import CreateLoginModal from './CreateLoginModal';

const CreateLoginButton = ({ branch }: { branch: BranchProps }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCreateLogin = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <button
                onClick={handleCreateLogin}
                className="px-4 py-2 bg-primary/20 text-primary rounded-xl hover:bg-primary/90 hover:text-white transition-colors duration-300 text-sm font-medium flex items-center gap-2"
            >
                <FiPlus className="w-4 h-4" /> Create Login
            </button>
            <CreateLoginModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                mode="create"
                branchId={branch.id}
            />
        </>
    );
};

export default CreateLoginButton;
