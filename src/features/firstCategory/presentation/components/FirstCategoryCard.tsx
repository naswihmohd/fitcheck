import { useState } from 'react';
import { FiEdit2, FiTrash2, FiTag, FiMoreVertical, FiArrowUp } from 'react-icons/fi';
import type { FirstCategoryProps } from '../../data/firstCategoryTypes';
import ConfirmModal from '../../../../general/components/ConfirmModal';
import AddFirstCategoryModal from './AddFirstCategoryModal';
import LoadImage from '../../../../general/components/LoadImage';
import { useNavigate } from 'react-router';
import type { CategorySettingsProps } from '../../../categoryManagement/data/categoryTypes';
import toast from 'react-hot-toast';

interface FirstCategoryCardProps {
    data: FirstCategoryProps;
    isSquaredBorder?: boolean;
    categorySettings: CategorySettingsProps;
}

function FirstCategoryCard({ data, isSquaredBorder = false, categorySettings }: FirstCategoryCardProps) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showIcons, setShowIcons] = useState(false);
    const navigate = useNavigate()

    const handleDelete = () => {
        setShowDeleteModal(false);
    };

    const handleCardClick = (e: React.MouseEvent) => {
        // Don't trigger onClick if clicking on action buttons
        if ((e.target as HTMLElement).closest('.action-buttons')) {
            return;
        }
        if (categorySettings.secondCategoryEnabled) {
            navigate(`/category-management/${data.id}`)
        } else {
            toast.error('Second category is disabled. Please enable it in the category settings.');
        }
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowEditModal(true);
        setShowIcons(false);
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowDeleteModal(true);
        setShowIcons(false);
    };

    const handleMoveToTopClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowIcons(false);
        // No action implemented - just a button
    };

    const handleThreeDotClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowIcons(!showIcons);
    };

    return (
        <>
            <div
                onClick={handleCardClick}
                className={`group relative md:min-w-[150px] md:max-w-[150px] min-w-[120px] max-w-[120px] cursor-pointer w-full flex flex-col gap-3 p-3 border border-gray-200 rounded-xl bg-white hover:border-primary/30 transition-all duration-200`}
            >
                {/* Action Buttons */}
                <div className='action-buttons absolute top-2 right-2 z-10 flex items-center gap-1'>
                    {/* Edit, Move to Top, and Delete Icons */}
                    {showIcons && (
                        <div className='flex items-center gap-1 mr-1'>
                            <button
                                onClick={handleMoveToTopClick}
                                className='p-1.5 rounded-lg bg-white/80 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all duration-200 shadow-sm'
                                title="Move to top"
                            >
                                <FiArrowUp className='w-4 h-4' />
                            </button>
                            <button
                                onClick={handleEditClick}
                                className='p-1.5 rounded-lg bg-white/80 hover:bg-primary/10 text-gray-600 hover:text-primary transition-all duration-200 shadow-sm'
                                title="Edit"
                            >
                                <FiEdit2 className='w-4 h-4' />
                            </button>
                            <button
                                onClick={handleDeleteClick}
                                className='p-1.5 rounded-lg bg-white/80 hover:bg-red-50 text-gray-600 hover:text-red-600 transition-all duration-200 shadow-sm'
                                title="Delete"
                            >
                                <FiTrash2 className='w-4 h-4' />
                            </button>
                        </div>
                    )}

                    {/* Three Dot Menu Button */}
                    <button
                        onClick={handleThreeDotClick}
                        className='p-1.5 rounded-lg bg-white/80 hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-all duration-200 shadow-sm'
                        title="More options"
                    >
                        <FiMoreVertical className='w-4 h-4' />
                    </button>
                </div>

                {/* Category Image */}
                <div className='relative w-full'>
                    {data.imageUrl ? (
                        <LoadImage
                            index={0}
                            className={`w-full object-cover category-shadow aspect-square ${isSquaredBorder ? "rounded-2xl" : "rounded-full"}`}
                            src={data.imageUrl}
                            alt={data.categoryName}
                        />
                    ) : (
                        <div className={`w-full aspect-square flex items-center justify-center bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 category-shadow ${isSquaredBorder ? "rounded-2xl" : "rounded-full"}`}>
                            <FiTag className='w-7 h-7 text-primary/70' />
                        </div>
                    )}
                </div>

                {/* Category Name */}
                <p className='text-center text-sm line-clamp-2 text-ellipsis'>{data.categoryName}</p>
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                message={`Are you sure you want to delete "${data.categoryName}"? This action cannot be undone.`}
            />

            {/* Edit Category Modal */}
            <AddFirstCategoryModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                firstCategoryData={data}
            />
        </>
    );
}

export default FirstCategoryCard;
