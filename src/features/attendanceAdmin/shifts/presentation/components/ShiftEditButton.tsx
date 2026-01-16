import { useState } from 'react'
import type { Shift } from '../../data/shiftTypes'
import { FiEdit } from 'react-icons/fi';
import AddShiftModal from './AddShiftModal';

const ShiftEditButton = ({ shift, branchId, companyId }: { shift: Shift, branchId: string, companyId: string }) => {
    const [isOpen, setIsOpen] = useState(false);


    const handleEditShift = () => {
        setIsOpen(true);
    }
    return (
        <>
            <button
                onClick={handleEditShift}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors font-medium text-sm"
            >
                <FiEdit className="w-4 h-4" />
            </button>


            <AddShiftModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                shiftData={shift}
                branchId={branchId}
                companyId={companyId}
                isEdit={true}
            />
        </>
    )
}

export default ShiftEditButton
