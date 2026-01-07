import React, { useState } from 'react'
import type { TutorProps } from '../../data/tutorTypes'
import AddTutorModal from './AddTutorModal';
import { FiEdit } from 'react-icons/fi';

const TutorEditButton = ({ tutor }: { tutor: TutorProps }) => {
    const [isOpen, setIsOpen] = useState(false);
    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(true);
    }
    return (
        <>
            <div className='px-2'>
                <button
                    onClick={handleEdit}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit"
                >
                    <FiEdit className="w-5 h-5" />
                </button>
            </div>

            <AddTutorModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                tutor={tutor}
                mode="edit"
            />

        </>
    )
}

export default TutorEditButton
