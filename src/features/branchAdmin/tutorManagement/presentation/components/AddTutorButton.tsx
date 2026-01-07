
import { IoMdAddCircle } from 'react-icons/io'
import AddTutorModal from './AddTutorModal'
import { useState } from 'react'

const AddTutorButton = () => {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer"
            >
                <IoMdAddCircle className="w-5 h-5" />
                Add New Tutor
            </button>

            <AddTutorModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                mode="create"
            />
        </>
    )
}

export default AddTutorButton
