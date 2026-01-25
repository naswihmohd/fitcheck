import { useState } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import type { ColorProps } from '../../data/colorTypes';
import ConfirmModal from '../../../../general/components/ConfirmModal';
import AddColorModal from './AddColorModal';

interface ColorCardProps {
    data: ColorProps;
}

function ColorCard({ data }: ColorCardProps) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const handleDelete = () => {
        setShowDeleteModal(false);
    };

    return (
        <>
            <div
                className="group relative flex items-center gap-4 w-full p-4 border rounded-2xl transition-all duration-300 border-gray-200 bg-white shadow-sm"
            >
                {/* Color Swatch */}
                <div className='relative flex-shrink-0'>
                    <div 
                        className='w-14 h-14 rounded-xl border-2 border-gray-200 shadow-md group-hover:shadow-lg transition-shadow duration-300'
                        style={{ backgroundColor: data.hexCode }}
                    />
                    <div className='absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white'></div>
                </div>

                {/* Color Details */}
                <div className='flex-1 min-w-0 flex flex-col justify-center'>
                    {/* Color Name */}
                    <h3 className='font-bold text-base text-gray-900 break-words leading-tight mb-1 transition-colors duration-200'>
                        {data.name}
                    </h3>

                    {/* Hex Code */}
                    <div className='flex items-center gap-1'>
                        <p className='text-xs text-gray-500 font-medium'>
                            {data.hexCode}
                        </p>
                    </div>

                    {/* Created Date */}
                    {data.createdAt && (
                        <div className='flex items-center gap-1 mt-1'>
                            <p className='text-xs text-gray-500 font-medium'>
                                {new Date(data.createdAt.toMillis()).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </p>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className='flex flex-shrink-0 gap-1.5'>
                    {/* Edit Button */}
                    <button
                        onClick={() => setShowEditModal(true)}
                        className='p-2.5 rounded-xl bg-primary/5 hover:bg-primary hover:text-white text-gray-600 transition-all duration-200'
                        title="Edit Color"
                    >
                        <FiEdit2 className='w-4 h-4' />
                    </button>

                    {/* Delete Button */}
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className='p-2.5 rounded-xl bg-red-50 hover:bg-red-500 text-gray-600 hover:text-white transition-all duration-200 '
                        title="Delete Color"
                    >
                        <FiTrash2 className='w-4 h-4' />
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                message={`Are you sure you want to delete "${data.name}"? This action cannot be undone.`}
            />

            {/* Edit Color Modal */}
            <AddColorModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                colorData={data}
            />
        </>
    );
}

export default ColorCard;
