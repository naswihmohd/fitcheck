import React, { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import AddFirstCategoryModal from './AddFirstCategoryModal';

const AddFirstCategoryButton: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <button
                onClick={handleOpenModal}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium"
            >
                <FiPlus className="w-5 h-5" />
                Add First Category
            </button>

            <AddFirstCategoryModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </>
    );
};

export default AddFirstCategoryButton;
