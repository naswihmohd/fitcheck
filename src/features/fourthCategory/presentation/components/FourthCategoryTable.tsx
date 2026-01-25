import { useState } from 'react';
import { FiEdit2, FiTrash2, FiTag } from 'react-icons/fi';
import type { FourthCategoryProps } from '../../data/fourthCategoryTypes';
import ConfirmModal from '../../../../general/components/ConfirmModal';
import AddFourthCategoryModal from './AddFourthCategoryModal';
import ProfileAvatar from '../../../../general/components/ProfileAvatar';

interface FourthCategoryTableProps {
    fourthCategories: FourthCategoryProps[];
}

function FourthCategoryTable({ fourthCategories }: FourthCategoryTableProps) {
    const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
    const [showEditModal, setShowEditModal] = useState<string | null>(null);

    const selectedFourthCategory = fourthCategories.find(fourthCategory => fourthCategory.id === showDeleteModal || fourthCategory.id === showEditModal);

    const handleDelete = () => {
        if (showDeleteModal) {
            // Delete logic will be handled here
            setShowDeleteModal(null);
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
                        {fourthCategories.map((fourthCategory, index) => (
                            <tr
                                key={fourthCategory.id}
                                className="hover:bg-gray-50 transition-colors duration-150"
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {index + 1}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {fourthCategory.imageUrl ? (
                                        <ProfileAvatar
                                            name={fourthCategory.categoryName}
                                            imageUrl={fourthCategory.imageUrl}
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
                                        {fourthCategory.categoryName}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {fourthCategory.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {fourthCategory.createdAt ? (
                                        new Date(fourthCategory.createdAt.toMillis()).toLocaleDateString('en-US', {
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
                                            onClick={() => setShowEditModal(fourthCategory.id)}
                                            className="p-2 rounded-lg bg-primary/5 hover:bg-primary hover:text-white text-gray-600 transition-all duration-200"
                                            title="Edit Category"
                                        >
                                            <FiEdit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteModal(fourthCategory.id)}
                                            className="p-2 rounded-lg bg-red-50 hover:bg-red-500 text-gray-600 hover:text-white transition-all duration-200"
                                            title="Delete Category"
                                        >
                                            <FiTrash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Delete Confirmation Modal */}
            {selectedFourthCategory && showDeleteModal && (
                <ConfirmModal
                    isOpen={true}
                    onClose={() => setShowDeleteModal(null)}
                    onConfirm={handleDelete}
                    message={`Are you sure you want to delete "${selectedFourthCategory.categoryName}"? This action cannot be undone.`}
                />
            )}

            {/* Edit Category Modal */}
            {selectedFourthCategory && showEditModal && (
                <AddFourthCategoryModal
                    isOpen={true}
                    onClose={() => setShowEditModal(null)}
                    fourthCategoryData={selectedFourthCategory}
                />
            )}
        </>
    );
}

export default FourthCategoryTable;
