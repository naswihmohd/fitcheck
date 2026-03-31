
import { useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../../general/redux/store';
import { clearOrders, fetchOrders } from '../../redux/orderSlice';
import ThreeDotLoading from '../../../../general/components/ThreeDotLoading';
import OrderStatusButton from './OrderStatusButton';
import type { OrdersProps, OrderStatusType } from '../../data/orderTypes';
import { OrderStatusBadge } from './OrderStatusBadge';

function formatOrderDate(dateValue: OrdersProps['createdAt']): string {
    if (!dateValue) return 'N/A';
    try {
        const millis =
            typeof (dateValue as any).toMillis === 'function' ? (dateValue as any).toMillis() : null;
        const date = millis != null ? new Date(millis) : new Date(dateValue as any);
        if (Number.isNaN(date.getTime())) return 'N/A';
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    } catch {
        return 'N/A';
    }
}

function formatCurrency(amount: number): string {
    if (!Number.isFinite(amount)) return 'N/A';
    try {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    } catch {
        return `₹${amount.toFixed(2)}`;
    }
}

const OrdersTable = ({ status }: { status: OrderStatusType | null }) => {
    const navigate = useNavigate();
    const { searchQuery } = useOutletContext<{ searchQuery: string }>();
    const { orders, loading, error, hasMore } = useSelector(
        (state: RootState) => state.orders
    );
    const dispatch: AppDispatch = useDispatch();

    useEffect(() => {
        dispatch(clearOrders())
        if (status) {
            dispatch(fetchOrders({ params: { searchQuery: searchQuery || null, status } }));
        } else {
            dispatch(fetchOrders({ params: { searchQuery: searchQuery || null, status: null } }));
        }
    }, [searchQuery, status]);

    const handleLoadMore = () => {
        if (loading || !hasMore) return;
        if (status) {
            dispatch(fetchOrders({ params: { searchQuery: searchQuery || null, status } }));
        } else {
            dispatch(fetchOrders({ params: { searchQuery: searchQuery || null, status: null } }));
        }
    };

    useEffect(() => {
        if (error) console.error(error);
    }, [error]);

    return (
        <>
            <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm">
                <div className="flex flex-col gap-2 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <p className="text-sm font-medium text-gray-700">
                        Showing <span className="text-gray-900">All Orders</span>
                    </p>
                    <p className="text-sm text-gray-500">{orders.length} orders</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-h-[200px] min-w-[720px] border-collapse text-left text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/80 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                <th className="px-4 py-3">Order</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Customer</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Total</th>
                                <th className="px-4 py-3">Items</th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {orders.length === 0 ? (
                                !loading && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-6 text-center text-sm text-gray-500">
                                            No orders found.
                                        </td>
                                    </tr>
                                )
                            ) : (
                                orders.map((order) => {
                                    const itemCount = Object.keys(order.items || {}).length;
                                    return (
                                        <tr onClick={() => navigate(`/orders/${order.orderId}`)} key={order.orderId} className="transition hover:bg-primary/5">
                                            <td className="px-4 py-3.5 font-semibold text-gray-900">{order.orderId}</td>
                                            <td className="px-4 py-3.5 text-gray-600">
                                                {formatOrderDate(order.createdAt)}
                                            </td>
                                            <td className="px-4 py-3.5 font-medium text-gray-800">
                                                {order.deliveryDetails?.fullName || 'N/A'}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <OrderStatusBadge status={order.orderStatus.orderStatus} />
                                            </td>
                                            <td className="px-4 py-3.5 font-semibold tabular-nums text-gray-900">
                                                {formatCurrency(order.totalAmount)}
                                            </td>
                                            <td className="px-4 py-3.5 text-gray-600">{itemCount} items</td>
                                            <td className="px-4 py-3.5">
                                                <div className="flex justify-end gap-1">
                                                    <OrderStatusButton
                                                        order={order}
                                                        searchQuery={searchQuery || null}
                                                        statusFilter={status}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {loading && (
                    <div className="p-6">
                        <ThreeDotLoading />
                    </div>
                )}

                {hasMore && orders.length > 0 && !loading && (
                    <div className="flex justify-center p-4">
                        <button
                            onClick={handleLoadMore}
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium"
                            type="button"
                        >
                            Load More
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default OrdersTable;
