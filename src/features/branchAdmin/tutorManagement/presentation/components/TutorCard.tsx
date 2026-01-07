import { useState } from 'react';
import { motion } from 'framer-motion';
import ProfileAvatar from '../../../../../general/components/ProfileAvatar';
import type { TutorProps } from '../../data/tutorTypes';
import toast from 'react-hot-toast';
import { updateTutorDisabled } from '../../redux/tutorSlice';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../../../general/redux/store';
import TutorEditButton from './TutorEditButton';


interface TutorCardProps {
    tutor: TutorProps;
    index: number;
}

const TutorCard: React.FC<TutorCardProps> = ({ tutor, index }) => {
    const [isUpdatingDisabled, setIsUpdatingDisabled] = useState(false);
    const dispatch: AppDispatch = useDispatch();


    const handleToggle = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click from triggering
        if (!tutor.branchId) {
            toast.error('Branch ID is required');
            return;
        }

        try {
            setIsUpdatingDisabled(true);
            const newDisabledValue = !tutor.isActive;
            await dispatch(updateTutorDisabled({
                tutorId: tutor.id,
                branchId: tutor.branchId,
                isActive: newDisabledValue,
            })).unwrap();
            toast.success(`${tutor.name} ${newDisabledValue ? 'disabled' : 'enabled'} successfully`);
        } catch (error: any) {
            console.error('Error updating admission counsellor disabled status:', error);
            toast.error(error.message || 'Failed to update admission counsellor status');
        } finally {
            setIsUpdatingDisabled(false);
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.5,
                delay: index * 0.1
            }}
            style={{
                boxShadow: '0px 0.92px 2.75px 0px #0051AF1A',
            }}
            className="bg-white rounded-lg p-6 flex items-start gap-6"
        >
            {/* Profile Picture */}
            <div className="flex-shrink-0">
                <ProfileAvatar
                    name={tutor.name}
                    imageUrl={tutor.imageUrl}
                    size="xl"
                    bgColor="bg-primary"
                />
            </div>

            {/* Tutor Details */}
            <div className="flex-1 space-y-1 min-w-0">

                <div className="flex text-sm">
                    <span className="w-32 font-normal text-gray-500">Name</span>
                    <span className="mr-2">:</span>
                    <span className="font-normal text-black">{tutor.name}</span>
                </div>

                <div className="flex text-sm">
                    <span className="w-32 font-normal text-gray-500">Tutor ID</span>
                    <span className="mr-2">:</span>
                    <span className="font-normal text-black">{tutor.tutorId}</span>
                </div>

                <div className="flex text-sm">
                    <span className="w-32 font-normal text-gray-500">Grade</span>
                    <span className="mr-2">:</span>
                    <span className="font-normal text-black">{tutor.grade}</span>
                </div>

                <div className="flex text-sm">
                    <span className="w-32 font-normal text-gray-500">Email</span>
                    <span className="mr-2">:</span>
                    <span className="font-normal text-black">{tutor.email}</span>
                </div>

                <div className="flex text-sm">
                    <span className="w-32 font-normal text-gray-500">Phone</span>
                    <span className="mr-2">:</span>
                    <span className="font-normal text-black">{tutor.phone}</span>
                </div>

                <div className="flex text-sm">
                    <span className="w-32 font-normal text-gray-500">Course</span>
                    <span className="mr-2">:</span>
                    <span className="font-normal text-black">{tutor.courseId}</span>
                </div>
            </div>

            {/* Right Section - Action Buttons */}
            <div className="flex-shrink-0 flex items-center gap-3">
                {/* Disabled Toggle */}
                <div className="flex flex-col items-center gap-1">
                    <span className={`text-xs font-medium ${tutor.isActive ? 'text-[#0A8316]' : 'text-red-500'}`}>
                        {tutor.isActive ? 'Enabled' : 'Disabled'}
                    </span>
                    <button
                        onClick={handleToggle}
                        disabled={isUpdatingDisabled}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer ${tutor.isActive ? 'bg-[#0A8316]' : 'bg-red-300'
                            } ${isUpdatingDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <span
                            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${tutor.isActive ? 'translate-x-6' : 'translate-x-0'}`}
                        />
                    </button>
                </div>

                {/* Delete Icon */}
                {/* <button
                    onClick={handleDelete}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete"
                >
                    <FiTrash2 className="w-5 h-5" />
                </button> */}

                {/* Edit Icon */}
                <TutorEditButton tutor={tutor} />
            </div>
        </motion.div>
    );
};

export default TutorCard;

