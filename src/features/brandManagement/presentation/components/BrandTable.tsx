import { useState } from 'react';
import { FiEdit2, FiTrash2, FiTag } from 'react-icons/fi';
import type { BrandProps } from '../../data/brandTypes';
import ConfirmModal from '../../../../general/components/ConfirmModal';
import AddBrandModal from './AddBrandModal';
import ProfileAvatar from '../../../../general/components/ProfileAvatar';

interface BrandTableProps {
    brands: BrandProps[];
}

function BrandTable({ brands }: BrandTableProps) {
    const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
    const [showEditModal, setShowEditModal] = useState<string | null>(null);

    const selectedBrand = brands.find(brand => brand.id === showDeleteModal || brand.id === showEditModal);

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
                                Brand
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
                        {brands.map((brand, index) => (
                            <tr
                                key={brand.id}
                                className="hover:bg-gray-50 transition-colors duration-150"
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {index + 1}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {brand.imageUrl ? (
                                        <ProfileAvatar
                                            name={brand.brandName}
                                            imageUrl={brand.imageUrl}
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
                                        {brand.brandName}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {brand.createdAt ? (
                                        new Date(brand.createdAt.toMillis()).toLocaleDateString('en-US', {
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
                                            onClick={() => setShowEditModal(brand.id)}
                                            className="p-2 rounded-lg bg-primary/5 hover:bg-primary hover:text-white text-gray-600 transition-all duration-200"
                                            title="Edit Brand"
                                        >
                                            <FiEdit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteModal(brand.id)}
                                            className="p-2 rounded-lg bg-red-50 hover:bg-red-500 text-gray-600 hover:text-white transition-all duration-200"
                                            title="Delete Brand"
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
            {selectedBrand && showDeleteModal && (
                <ConfirmModal
                    isOpen={true}
                    onClose={() => setShowDeleteModal(null)}
                    onConfirm={handleDelete}
                    message={`Are you sure you want to delete "${selectedBrand.brandName}"? This action cannot be undone.`}
                />
            )}

            {/* Edit Brand Modal */}
            {selectedBrand && showEditModal && (
                <AddBrandModal
                    isOpen={true}
                    onClose={() => setShowEditModal(null)}
                    brandData={selectedBrand}
                />
            )}
        </>
    );
}

export default BrandTable;
