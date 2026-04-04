import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiPackage,
  FiPhone,
  FiShoppingCart,
  FiUser,
} from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../general/redux/store';
import type { OrdersProps, OrderStatusType } from '../../orders/data/orderTypes';
import { OrderStatusBadge } from '../../orders/presentation/components/OrderStatusBadge';
import fetchOrderById from '../utils/fetchOrderById';
import ThreeDotLoading from '../../../general/components/ThreeDotLoading';
import OrderStatusButton from '../../orders/presentation/components/OrderStatusButton';
import OrderAddress from './components/OrderAddress';
import OrderPayment from './components/OrderPayment';
import { formatCurrency } from '../../../general/utils/formatCurrency';


function formatDate(value: unknown): string {
  if (!value) return 'N/A';
  try {
    const millis =
      typeof (value as { toMillis?: () => number }).toMillis === 'function'
        ? (value as { toMillis: () => number }).toMillis()
        : value;
    const date = new Date(millis as number | string);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return 'N/A';
  }
}

function getProgressSteps(status: OrderStatusType) {
  const flow: OrderStatusType[] = ['pending', 'accepted', 'packed', 'shipped', 'delivered'];
  const activeIndex = flow.indexOf(status);
  return { flow, activeIndex };
}

function OrderDetail() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState<OrdersProps | null>(null);
  const [loading, setLoading] = useState(false);
  const { orders } = useSelector((state: RootState) => state.orders);

  useEffect(() => {
    if (!orderId) return;
    let isMounted = true;

    const loadOrder = async () => {
      setLoading(true);
      try {
        const existingOrder = orders.find((item) => item.orderId === orderId);
        if (existingOrder) {
          if (isMounted) setOrder(existingOrder);
          return;
        }

        const fetchedOrder = await fetchOrderById(orderId);
        if (isMounted) setOrder(fetchedOrder);
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void loadOrder();
    return () => {
      isMounted = false;
    };
  }, [orderId, orders]);

  const orderItems = useMemo(() => {
    if (!order?.items) return [];
    return Object.values(order.items);
  }, [order]);

  const totalItems = useMemo(
    () => orderItems.reduce((sum, item) => sum + (item.quantity || 0), 0),
    [orderItems],
  );

  if (loading) {
    return (
      <div className="py-8">
        <ThreeDotLoading />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
        <p className="text-base font-semibold text-gray-900">Order not found</p>
        <p className="mt-1 text-sm text-gray-500">The requested order could not be loaded.</p>
        <button
          type="button"
          onClick={() => navigate('/orders')}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary/90"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const { flow, activeIndex } = getProgressSteps(order.orderStatus.orderStatus);

  return (
    <div className="space-y-6 pb-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="rounded-lg border border-gray-200 p-2 text-gray-600 transition-colors hover:bg-gray-50"
            aria-label="Back to orders"
          >
            <FiArrowLeft className="size-4" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-bold text-gray-900">Order-{order.orderId}</h1>
              <OrderStatusBadge status={order.orderStatus.orderStatus} />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Order date: {formatDate(order.createdAt)} | Total: {formatCurrency(order.totalAmount)}
            </p>
          </div>
        </div>
        <OrderStatusButton
          order={order}
          setOrder={setOrder}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-1 gap-6 xl:grid-cols-12"
      >
        <section className="space-y-6 xl:col-span-8">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-5 flex items-center gap-2">
              <FiPackage className="size-4 text-primary" />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">Order Journey</h2>
            </div>

            <div className="overflow-x-auto pb-1">
              <div className="flex min-w-max items-center gap-2">
                {flow.map((step, index) => {
                  const isDone = activeIndex !== -1 && index < activeIndex;
                  const isCurrent = step === order.orderStatus.orderStatus;
                  return (
                    <div key={step} className="flex items-center gap-2">
                      <div
                        className={[
                          'inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold capitalize',
                          isCurrent
                            ? 'bg-primary text-white'
                            : isDone
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-gray-100 text-gray-600',
                        ].join(' ')}
                      >
                        {step}
                      </div>
                      {index < flow.length - 1 ? <div className="h-px w-7 bg-gray-200" /> : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <FiShoppingCart className="size-4 text-primary" />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">Products</h2>
              </div>
              <p className="text-sm text-gray-500">{totalItems} units</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-5 py-3">Product</th>
                    <th className="px-5 py-3">Variant</th>
                    <th className="px-5 py-3">Unit</th>
                    <th className="px-5 py-3">Qty</th>
                    <th className="px-5 py-3 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orderItems.map((item) => (
                    <tr key={`${item.productId}-${item.unit.id}`} className="transition hover:bg-primary/5">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-gray-900">{item.productName || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{item.brandName || 'Unknown brand'}</p>
                      </td>
                      <td className="px-5 py-3.5 text-gray-700">
                        <span className="capitalize">{item.variant?.color || 'N/A'}</span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-700">{item.unit?.unit || item.unitType || 'N/A'}</td>
                      <td className="px-5 py-3.5 font-medium text-gray-800">{item.quantity}</td>
                      <td className="px-5 py-3.5 text-right font-semibold tabular-nums text-gray-900">
                        {formatCurrency((item.unit?.price || 0) * (item.quantity || 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <aside className="space-y-6 xl:col-span-4">

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <FiUser className="size-4 text-primary" />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">Customer</h3>
            </div>
            <p className="mt-3 text-sm font-semibold text-gray-900">{order.deliveryDetails?.fullName || 'N/A'}</p>
            <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
              <FiPhone className="size-4" />
              {order.deliveryDetails?.phone || 'N/A'}
            </p>
          </div>

          <OrderAddress order={order} />

          <OrderPayment order={order} setOrder={setOrder} />
        </aside>
      </motion.div>
    </div>
  );
}

export default OrderDetail;
