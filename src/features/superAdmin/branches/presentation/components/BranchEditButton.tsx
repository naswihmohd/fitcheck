import { FaRegEdit } from "react-icons/fa";
import type { BranchProps } from '../../../addBranch/data/branchTypes'
import { useState } from 'react';
import AddBranchModal from '../../../addBranch/presentation/AddBranchModal';

const BranchEditButton = ({ branch }: { branch: BranchProps }) => {
    const [editModalOpen, setEditModalOpen] = useState(false);

    return (
        <>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setEditModalOpen(true);
                }}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                title="Edit"
            >
                <FaRegEdit className="w-5 h-5" />
            </button>

            <AddBranchModal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                mode="edit"
                branch={branch}
            />
        </>
    )
}

export default BranchEditButton
