
import { doc, updateDoc } from 'firebase/firestore';
import { updateBranchData } from '../../redux/branchesSlice';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import type { AppDispatch, RootState } from '../../../../../general/redux/store';
import type { BranchProps } from '../../../addBranch/data/branchTypes';
import { db } from '../../../../../firebaseConfig';
import { setBranchData } from '../../../../login/redux/authSlice';

const BranchActiveButton = ({ branch }: { branch: BranchProps }) => {

    const { branchData } = useSelector((state: RootState) => state.user);
    const dispatch: AppDispatch = useDispatch();
    const handleToggle = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        const newState = !branch.isActive;
        try {
            const branchRef = doc(db, "branches", branch.id);
            await updateDoc(branchRef, { isActive: newState });
            dispatch(updateBranchData({ ...branch, isActive: newState }));
            if(branchData?.id === branch.id) {
                dispatch(setBranchData({ ...branchData, isActive: newState }));
            }
            toast.success(newState ? "Branch enabled successfully!" : "Branch disabled successfully!");
        } catch (error) {
            console.error("Error updating branch:", error);
        }
    };

    return (
        <div className="flex flex-col items-center gap-1" >
            <span className={`text-xs font-medium ${branch.isActive ? 'text-[#0A8316]' : 'text-gray-400'}`}>
                {branch.isActive ? 'Enable' : 'Disable'}
            </span>
            <button
                onClick={handleToggle}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer ${branch.isActive ? 'bg-[#0A8316]' : 'bg-gray-300'
                    }`}
            >
                <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${branch.isActive ? 'translate-x-6' : 'translate-x-0'
                        }`}
                />
            </button>
        </div>
    )
}

export default BranchActiveButton
