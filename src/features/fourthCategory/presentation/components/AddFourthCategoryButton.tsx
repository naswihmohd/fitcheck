import React, { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import AddFourthCategoryModal from './AddFourthCategoryModal';

const AddFourthCategoryButton: React.FC = () => {
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
                className="flex text-nowrap items-center text-sm gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium"
            >
                <FiPlus className="w-5 h-5" />
                Add 4th Category
            </button>

            <AddFourthCategoryModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </>
    );
};

export default AddFourthCategoryButton;
