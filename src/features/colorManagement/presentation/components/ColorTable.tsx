import { useState } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import type { ColorProps } from '../../data/colorTypes';
import ConfirmModal from '../../../../general/components/ConfirmModal';
import AddColorModal from './AddColorModal';

interface ColorTableProps {
    colors: ColorProps[];
}

function ColorTable({ colors }: ColorTableProps) {
    const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
    const [showEditModal, setShowEditModal] = useState<string | null>(null);

    const selectedColor = colors.find(color => color.id === showDeleteModal || color.id === showEditModal);

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
                                Color
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Hex Code
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
                        {colors.map((color, index) => (
                            <tr
                                key={color.id}
                                className="hover:bg-gray-50 transition-colors duration-150"
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {index + 1}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div 
                                        className="w-10 h-10 rounded-lg border-2 border-gray-200"
                                        style={{ backgroundColor: color.hexCode }}
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-semibold text-gray-900">
                                        {color.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {color.hexCode}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {color.createdAt ? (
                                        new Date(color.createdAt.toMillis()).toLocaleDateString('en-US', {
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
                                            onClick={() => setShowEditModal(color.id)}
                                            className="p-2 rounded-lg bg-primary/5 hover:bg-primary hover:text-white text-gray-600 transition-all duration-200"
                                            title="Edit Color"
                                        >
                                            <FiEdit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteModal(color.id)}
                                            className="p-2 rounded-lg bg-red-50 hover:bg-red-500 text-gray-600 hover:text-white transition-all duration-200"
                                            title="Delete Color"
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
            {selectedColor && showDeleteModal && (
                <ConfirmModal
                    isOpen={true}
                    onClose={() => setShowDeleteModal(null)}
                    onConfirm={handleDelete}
                    message={`Are you sure you want to delete "${selectedColor.name}"? This action cannot be undone.`}
                />
            )}

            {/* Edit Color Modal */}
            {selectedColor && showEditModal && (
                <AddColorModal
                    isOpen={true}
                    onClose={() => setShowEditModal(null)}
                    colorData={selectedColor}
                />
            )}
        </>
    );
}

export default ColorTable;
