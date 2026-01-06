
import { doc, updateDoc } from 'firebase/firestore';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import type { AppDispatch } from '../../../../../general/redux/store';
import { db } from '../../../../../firebaseConfig';
import type { UserProps } from '../../../../login/data/userTypes';
import { updateBranchUser } from '../../redux/branchUsersSlice';

const BranchUserAccessButton = ({ user, branchId }: { user: UserProps, branchId: string }) => {

    const dispatch: AppDispatch = useDispatch();
    const handleToggle = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        const newState = !user.isActive;
        try {
            const branchRef = doc(db, "users", user.id);
            await updateDoc(branchRef, { isActive: newState });
            dispatch(updateBranchUser({ branchId, user: { ...user, isActive: newState } }));
            toast.success(newState ? "User enabled successfully!" : "User disabled successfully!");
        } catch (error) {
            console.error("Error updating user:", error);
        }
    };

    return (
        <div className="flex flex-col items-center gap-1" >
            <span className={`text-xs font-medium ${user.isActive ? 'text-[#0A8316]' : 'text-gray-400'}`}>
                {user.isActive ? 'Enable' : 'Disable'}
            </span>
            <button
                onClick={handleToggle}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer ${user.isActive ? 'bg-[#0A8316]' : 'bg-gray-300'
                    }`}
            >
                <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${user.isActive ? 'translate-x-6' : 'translate-x-0'
                        }`}
                />
            </button>
        </div>
    )
}

export default BranchUserAccessButton
