import { updateEmployee, updateEmployeeDisabled } from '../../redux/employeesSlice';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import type { AppDispatch, RootState } from '../../../../../general/redux/store';
import type { EmployeeProps } from '../../data/employeeType';

interface EmployeeActiveButtonProps {
    employee: EmployeeProps;
    setEmployee?: (employee: EmployeeProps) => void;
}

const EmployeeActiveButton = ({ employee, setEmployee }: EmployeeActiveButtonProps) => {
    const { companyId } = useSelector((state: RootState) => state.user);
    const dispatch: AppDispatch = useDispatch();

    const handleToggle = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        const newState = !employee.isActive;

        if (!companyId) {
            toast.error('Company information not found');
            return;
        }

        try {
            // Update Redux state and Firestore using the thunk
            await dispatch(updateEmployeeDisabled({
                employeeId: employee.id,
                companyId: companyId,
                isActive: newState,
            })).unwrap();

            // Update local state if callback provided
            const updatedEmployee = { ...employee, isActive: newState };
            dispatch(updateEmployee({
                branchId: employee.branchDetails.branchId,
                employee: updatedEmployee,
            }));
            setEmployee?.(updatedEmployee);
            toast.success(newState ? 'Employee enabled successfully!' : 'Employee disabled successfully!');
        } catch (error) {
            console.error('Error updating employee:', error);
            toast.error('Failed to update employee status');
        }
    };

    return (
        <div className="flex flex-col items-center gap-1">
            <span className={`text-xs font-medium ${employee.isActive ? 'text-[#0A8316]' : 'text-gray-400'}`}>
                {employee.isActive ? 'Enable' : 'Disable'}
            </span>
            <button
                onClick={handleToggle}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer ${employee.isActive ? 'bg-[#0A8316]' : 'bg-gray-300'
                    }`}
                type="button"
            >
                <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${employee.isActive ? 'translate-x-6' : 'translate-x-0'
                        }`}
                />
            </button>
        </div>
    );
};

export default EmployeeActiveButton;
