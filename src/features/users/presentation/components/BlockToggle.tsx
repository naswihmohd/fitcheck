
import { useEffect, useState } from 'react';
import type { CustomerProps } from '../../data/customerType';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../../general/redux/store';
import { updateCustomerActiveStatus } from '../../redux/customerSlice';
import ConfirmModal from '../../../../general/components/ConfirmModal';

interface BlockToggleProps {
    customer: CustomerProps;
}

const BlockToggle = ({ customer }: BlockToggleProps) => {
    const [isActive, setIsActive] = useState(customer.isActive);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const dispatch: AppDispatch = useDispatch();

    useEffect(() => {
        setIsActive(customer.isActive);
    }, [customer.isActive]);

    const handleToggle = async (nextIsActive: boolean) => {
        setIsActive(nextIsActive);
        setIsUpdating(true);

        try {
            await dispatch(
                updateCustomerActiveStatus({
                    customerId: customer.id,
                    isActive: nextIsActive,
                })
            ).unwrap();
        } catch (error) {
            console.error(error);
            setIsActive(!nextIsActive);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleToggleClick = () => {
        if (isUpdating) return;

        const nextIsActive = !isActive;
        if (!nextIsActive) {
            setIsConfirmOpen(true);
            return;
        }

        void handleToggle(nextIsActive);
    };

    return (
        <>
            <button
                type="button"
                onClick={handleToggleClick}
                disabled={isUpdating}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${
                    isActive ? 'bg-primary' : 'bg-gray-300'
                }`}
                role="switch"
                aria-checked={isActive}
                aria-label={`Set ${customer.name} as ${isActive ? 'blocked' : 'active'}`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                        isActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
            </button>
            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={() => {
                    void handleToggle(false);
                }}
                message={`Are you sure you want to block ${customer.name}?`}
            />
        </>
    );
};

export default BlockToggle;
