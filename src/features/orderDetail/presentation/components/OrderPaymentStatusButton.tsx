import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FiCheckCircle } from 'react-icons/fi';
import type { OrdersProps } from '../../../orders/data/orderTypes';
import type { AppDispatch } from '../../../../general/redux/store';
import { changePaymentStatus } from '../../../orders/redux/orderSlice';
import ConfirmModal from '../../../../general/components/ConfirmModal';

const OrderPaymentStatusButton = ({
  order,
  setOrder,
}: {
  order: OrdersProps;
  setOrder?: (order: OrdersProps) => void;
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const status = order.paymentStatus.paymentStatus;
  if (status === 'completed' || status === 'refunded') return null;

  const handleMarkCompleted = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const { paymentStatusUpdate } = await dispatch(
        changePaymentStatus({ orderId: order.orderId }),
      ).unwrap();

      setOrder?.({
        ...order,
        paymentStatus: {
          ...order.paymentStatus,
          ...paymentStatusUpdate,
        },
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirmModal(true)}
        disabled={isUpdating}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        aria-label="Mark payment as completed"
      >
        <FiCheckCircle className="size-4 shrink-0" />
        {isUpdating ? 'Updating…' : 'Mark payment completed'}
      </button>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => void handleMarkCompleted()}
        message="Mark this order's payment as completed?"
      />
    </>
  );
};

export default OrderPaymentStatusButton;
