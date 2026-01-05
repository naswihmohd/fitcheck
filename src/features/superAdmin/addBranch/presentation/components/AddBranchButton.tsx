import { useState } from 'react';
import { IoMdAddCircle } from 'react-icons/io';
import AddBranchModal from '../AddBranchModal';

const AddBranchButton = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCreateBranch = () => {
        setIsModalOpen(true);
    };

    return (
        <>
            {/* Create Branch Button */}
            <button
                onClick={handleCreateBranch}
                className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer"
            >
                <IoMdAddCircle className="w-5 h-5" />
                Create Branch
            </button>

            
            <AddBranchModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mode="create"
            />
        </>
    );
};

export default AddBranchButton;
