import { useState } from 'react';
import { FiEdit2, FiTrash2, FiTag, FiEye } from 'react-icons/fi';
import type { ThirdCategoryProps } from '../../data/thirdCategoryTypes';
import ConfirmModal from '../../../../general/components/ConfirmModal';
import AddThirdCategoryModal from './AddThirdCategoryModal';
import ProfileAvatar from '../../../../general/components/ProfileAvatar';
import type { CategorySettingsProps } from '../../../categoryManagement/data/categoryTypes';
import { useNavigate, useParams } from 'react-router';
import toast from 'react-hot-toast';

interface ThirdCategoryTableProps {
    thirdCategories: ThirdCategoryProps[];
    categorySettings: CategorySettingsProps;
}

function ThirdCategoryTable({ thirdCategories, categorySettings }: ThirdCategoryTableProps) {
    const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
    const [showEditModal, setShowEditModal] = useState<string | null>(null);
    const { firstCategoryId, secondCategoryId } = useParams<{ firstCategoryId: string; secondCategoryId: string }>();
    const navigate = useNavigate();

    const selectedThirdCategory = thirdCategories.find(thirdCategory => thirdCategory.id === showDeleteModal || thirdCategory.id === showEditModal);

    const handleDelete = () => {
        if (showDeleteModal) {
            // Delete logic will be handled here
            setShowDeleteModal(null);
        }
    };

    const handleViewCategory = (thirdCategory: ThirdCategoryProps) => {
        if (categorySettings.fourthCategoryEnabled) {
            navigate(`/category-management/${firstCategoryId}/${secondCategoryId}/${thirdCategory.id}`);
        } else {
            toast.error('Fourth category is disabled. Please enable it in the category settings.');
        }
    };

    return (
        <>
            <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                No
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Image
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Category
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Category ID
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Created Date
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {thirdCategories.map((thirdCategory, index) => (
                            <tr
                                key={thirdCategory.id}
                                className="hover:bg-gray-50 transition-colors duration-150"
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {index + 1}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {thirdCategory.imageUrl ? (
                                        <ProfileAvatar
                                            name={thirdCategory.categoryName}
                                            imageUrl={thirdCategory.imageUrl}
                                            size="md"
                                            className="border-2 border-primary/20"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 border-2 border-primary/20">
                                            <FiTag className="w-5 h-5 text-primary/70" />
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-semibold text-gray-900">
                                        {thirdCategory.categoryName}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {thirdCategory.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {thirdCategory.createdAt ? (
                                        new Date(thirdCategory.createdAt.toMillis()).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })
                                    ) : (
                                        <span className="text-gray-400">N/A</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => setShowEditModal(thirdCategory.id)}
                                            className="p-2 rounded-lg bg-primary/5 hover:bg-primary hover:text-white text-gray-600 transition-all duration-200"
                                            title="Edit Category"
                                        >
                                            <FiEdit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteModal(thirdCategory.id)}
                                            className="p-2 rounded-lg bg-red-50 hover:bg-red-500 text-gray-600 hover:text-white transition-all duration-200"
                                            title="Delete Category"
                                        >
                                            <FiTrash2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleViewCategory(thirdCategory)}
                                            className="p-2 rounded-lg bg-blue-50 hover:bg-blue-500 text-gray-600 hover:text-white transition-all duration-200"
                                            title="View Category"
                                        >
                                            <FiEye className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Delete Confirmation Modal */}
            {selectedThirdCategory && showDeleteModal && (
                <ConfirmModal
                    isOpen={true}
                    onClose={() => setShowDeleteModal(null)}
                    onConfirm={handleDelete}
                    message={`Are you sure you want to delete "${selectedThirdCategory.categoryName}"? This action cannot be undone.`}
                />
            )}

            {/* Edit Category Modal */}
            {selectedThirdCategory && showEditModal && (
                <AddThirdCategoryModal
                    isOpen={true}
                    onClose={() => setShowEditModal(null)}
                    thirdCategoryData={selectedThirdCategory}
                />
            )}
        </>
    );
}

export default ThirdCategoryTable;
