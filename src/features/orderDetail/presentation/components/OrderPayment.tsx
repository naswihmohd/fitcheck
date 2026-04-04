import { FiCalendar } from 'react-icons/fi';
import type { OrdersProps } from '../../../orders/data/orderTypes';
import { formatCurrency } from '../../../../general/utils/formatCurrency';
import OrderPaymentStatusButton from './OrderPaymentStatusButton';

const OrderPayment = ({
  order,
  setOrder,
}: {
  order: OrdersProps;
  setOrder?: (order: OrdersProps) => void;
}) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-2">
        <FiCalendar className="size-4 text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">Payment</h3>
      </div>
      <div className="mt-3 space-y-2 text-sm text-gray-700">
        <p>
          Method:{' '}
          <span className="font-medium uppercase">{order.paymentStatus.paymentMethod || 'N/A'}</span>
        </p>
        <p>
          Status:{' '}
          <span className="font-medium capitalize">{order.paymentStatus.paymentStatus || 'N/A'}</span>
        </p>
        <p className="font-semibold text-gray-900">Total: {formatCurrency(order.totalAmount)}</p>
      </div>
      <OrderPaymentStatusButton order={order} setOrder={setOrder} />
    </div>
  );
};

export default OrderPayment;
