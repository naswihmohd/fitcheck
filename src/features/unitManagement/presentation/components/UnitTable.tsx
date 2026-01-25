import { useState } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import type { UnitProps } from '../../data/unitTypes';
import ConfirmModal from '../../../../general/components/ConfirmModal';
import AddUnitModal from './AddUnitModal';

interface UnitTableProps {
    units: UnitProps[];
}

function UnitTable({ units }: UnitTableProps) {
    const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
    const [showEditModal, setShowEditModal] = useState<string | null>(null);

    const selectedUnit = units.find(unit => unit.id === showDeleteModal || unit.id === showEditModal);

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
                                Name
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
                        {units.map((unit, index) => (
                            <tr
                                key={unit.id}
                                className="hover:bg-gray-50 transition-colors duration-150"
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {index + 1}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-semibold text-gray-900">
                                        {unit.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {unit.createdAt ? (
                                        new Date(unit.createdAt.toMillis()).toLocaleDateString('en-US', {
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
                                            onClick={() => setShowEditModal(unit.id)}
                                            className="p-2 rounded-lg bg-primary/5 hover:bg-primary hover:text-white text-gray-600 transition-all duration-200"
                                            title="Edit Unit"
                                        >
                                            <FiEdit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteModal(unit.id)}
                                            className="p-2 rounded-lg bg-red-50 hover:bg-red-500 text-gray-600 hover:text-white transition-all duration-200"
                                            title="Delete Unit"
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
            {selectedUnit && showDeleteModal && (
                <ConfirmModal
                    isOpen={true}
                    onClose={() => setShowDeleteModal(null)}
                    onConfirm={handleDelete}
                    message={`Are you sure you want to delete "${selectedUnit.name}"? This action cannot be undone.`}
                />
            )}

            {/* Edit Unit Modal */}
            {selectedUnit && showEditModal && (
                <AddUnitModal
                    isOpen={true}
                    onClose={() => setShowEditModal(null)}
                    unitData={selectedUnit}
                />
            )}
        </>
    );
}

export default UnitTable;
