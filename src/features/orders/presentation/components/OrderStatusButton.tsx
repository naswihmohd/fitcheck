import { useState } from 'react';
import { useDispatch } from 'react-redux';
import type { OrdersProps, OrderStatusType } from '../../data/orderTypes';
import type { AppDispatch } from '../../../../general/redux/store';
import { changeOrderStatus } from '../../redux/orderSlice';
import OrderStatusModal from './OrderStatusModal';
import { FiEdit2 } from 'react-icons/fi';

const OrderStatusButton = ({
    order,
    setOrder,
}: {
    order: OrdersProps;
    setOrder?: (order: OrdersProps) => void;
}) => {
    const dispatch: AppDispatch = useDispatch();
    const [isOpen, setIsOpen] = useState(false);
    const [isChanging, setIsChanging] = useState(false);

    const handleChangeStatus = async (newStatus: OrderStatusType) => {
        if (isChanging) return;
        setIsChanging(true);
        try {
            await dispatch(
                changeOrderStatus({
                    orderId: order.orderId,
                    newStatus,
                    currentOrderStatus: order.orderStatus,
                }),
            ).unwrap();

            setOrder?.({
                ...order,
                orderStatus: {
                    ...order.orderStatus,
                    orderStatus: newStatus,
                },
            });
            
        } finally {
            setIsChanging(false);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 text-xs flex items-center gap-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium"
                aria-label={`Change status for order ${order.orderId}`}
            >
                <FiEdit2 />
                Change Status
            </button>

            <OrderStatusModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                order={order}
                onChangeStatus={handleChangeStatus}
            />
        </>
    );
};

export default OrderStatusButton;
