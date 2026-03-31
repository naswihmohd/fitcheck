import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { HiX } from 'react-icons/hi';
import type { OrdersProps, OrderStatusType } from '../../data/orderTypes';
import { OrderStatusBadge } from './OrderStatusBadge';
import ConfirmModal from '../../../../general/components/ConfirmModal';

interface OrderStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: OrdersProps;
    onChangeStatus: (newStatus: OrderStatusType) => Promise<void>;
}

function formatTimestamp(value: any): string {
    if (!value) return '—';
    try {
        const millis = typeof value?.toMillis === 'function' ? value.toMillis() : value;
        const date = new Date(millis);
        if (Number.isNaN(date.getTime())) return '—';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
        return '—';
    }
}

function getTimelineColor(status: OrderStatusType): {
    dot: string;
    text: string;
} {
    switch (status) {
        case 'pending':
            return { dot: 'bg-amber-500', text: 'text-amber-800' };
        case 'accepted':
            return { dot: 'bg-teal-500', text: 'text-teal-800' };
        case 'packed':
            return { dot: 'bg-indigo-500', text: 'text-indigo-800' };
        case 'shipped':
            return { dot: 'bg-violet-500', text: 'text-violet-800' };
        case 'delivered':
            return { dot: 'bg-emerald-500', text: 'text-emerald-800' };
        case 'cancelled':
            return { dot: 'bg-rose-500', text: 'text-rose-800' };
        case 'rejected':
            return { dot: 'bg-gray-500', text: 'text-gray-800' };
        case 'returned':
            return { dot: 'bg-orange-500', text: 'text-orange-800' };
        case 'replaced':
            return { dot: 'bg-sky-500', text: 'text-sky-800' };
        default: {
            const _exhaustive: never = status;
            return _exhaustive;
        }
    }
}

function getStatusChangeButtonClasses(status: OrderStatusType): string {
    switch (status) {
        case 'pending':
            return 'border-amber-200/80 bg-amber-50/80 text-amber-800 hover:bg-amber-50';
        case 'accepted':
            return 'border-teal-200/80 bg-teal-50/80 text-teal-800 hover:bg-teal-50';
        case 'packed':
            return 'border-indigo-200/80 bg-indigo-50/80 text-indigo-800 hover:bg-indigo-50';
        case 'shipped':
            return 'border-violet-200/80 bg-violet-50/80 text-violet-800 hover:bg-violet-50';
        case 'delivered':
            return 'border-emerald-200/80 bg-emerald-50/80 text-emerald-800 hover:bg-emerald-50';
        case 'cancelled':
            return 'border-rose-200/80 bg-rose-50/80 text-rose-800 hover:bg-rose-50';
        case 'replaced':
            return 'border-sky-200/80 bg-sky-50/80 text-sky-800 hover:bg-sky-50';
        case 'rejected':
            return 'border-gray-200/80 bg-gray-50/80 text-gray-800 hover:bg-gray-50';
        case 'returned':
            return 'border-orange-200/80 bg-orange-50/80 text-orange-800 hover:bg-orange-50';
        default: {
            const _exhaustive: never = status;
            return _exhaustive;
        }
    }
}

const OrderStatusModal: React.FC<OrderStatusModalProps> = ({ isOpen, onClose, order, onChangeStatus }) => {
    const [mounted, setMounted] = useState(false);
    const [confirmToStatus, setConfirmToStatus] = useState<OrderStatusType | null>(null);
    const [isChanging, setIsChanging] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const currentStatus = order.orderStatus.orderStatus;

    const progressionSteps = useMemo<OrderStatusType[]>(
        () => ['pending', 'accepted', 'packed', 'shipped', 'delivered'],
        [],
    );
    const terminalSteps = useMemo<OrderStatusType[]>(() => ['cancelled', 'replaced', 'rejected', 'returned'], []);

    const allStatuses = useMemo<OrderStatusType[]>(
        () => ['pending', 'accepted', 'packed', 'shipped', 'delivered', 'cancelled', 'replaced', 'rejected', 'returned'],
        [],
    );

    const availableStatuses = useMemo(() => allStatuses.filter((s) => s !== currentStatus), [allStatuses, currentStatus]);

    const atFieldByStatus: Partial<Record<OrderStatusType, keyof OrdersProps['orderStatus']>> = useMemo(
        () => ({
            accepted: 'acceptedAt',
            packed: 'packedAt',
            shipped: 'shippedAt',
            delivered: 'deliveredAt',
            cancelled: 'cancelledAt',
            rejected: 'rejectedAt',
            returned: 'returnedAt',
            // replaced: no replacedAt in schema
        }),
        [],
    );

    const currentProgressIndex = progressionSteps.indexOf(currentStatus);

    const handleConfirm = async () => {
        if (!confirmToStatus || isChanging) return;
        setIsChanging(true);
        try {
            await onChangeStatus(confirmToStatus);
            onClose();
        } catch (error) {
            // Keep the modal open on failures; the parent thunk already logs/handles error state.
            console.error(error);
        } finally {
            setIsChanging(false);
            setConfirmToStatus(null);
        }
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-50 flex items-center justify-end">
                        <motion.div
                            className="absolute inset-0 bg-black/50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                        />

                        <motion.div
                            className="relative z-10 h-full w-full max-w-[560px] rounded-l-[14px] bg-white shadow-xl overflow-y-auto"
                            initial={{ opacity: 0, x: 560 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 560 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                        >
                            <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-5 py-4">
                                <div className="space-y-1">
                                    <h2 className="text-sm font-semibold text-gray-900">Order Status</h2>
                                    <p className="text-xs text-gray-500">
                                        Order <span className="font-medium text-gray-800">{order.orderId}</span>
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
                                    aria-label="Close"
                                >
                                    <HiX className="size-4 text-gray-600" />
                                </button>
                            </div>

                            <div className="px-5 py-4 space-y-5">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-medium text-gray-500">Current</span>
                                            <OrderStatusBadge status={currentStatus} />
                                        </div>

                                        {order.orderStatus.message && (
                                            <p className="text-xs text-gray-600 whitespace-pre-line">
                                                {order.orderStatus.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="text-sm">
                                        <p className="text-xs text-gray-500">Customer</p>
                                        <p className="font-medium text-gray-900">{order.deliveryDetails?.fullName || 'N/A'}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Updated: {formatTimestamp(order.orderStatus.updatedAt)}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">Status flow</p>
                                        {currentProgressIndex === -1 ? (
                                            <p className="text-xs text-gray-500 mt-1">
                                                This status is an outcome/terminal state (not part of the main flow).
                                            </p>
                                        ) : null}
                                    </div>

                                    <div className="overflow-x-auto pb-1">
                                        <div className="flex min-w-max items-start gap-3">
                                            {progressionSteps.map((step, idx) => {
                                                const isActive = step === currentStatus;
                                                const isDone = currentProgressIndex !== -1 && idx < currentProgressIndex;
                                                const theme = getTimelineColor(step);

                                                return (
                                                    <React.Fragment key={step}>
                                                        <div className="flex w-24 flex-col items-center text-center">
                                                            <div
                                                                className={[
                                                                    'size-9 rounded-full flex items-center justify-center text-xs font-semibold ring-1',
                                                                    isActive || isDone
                                                                        ? `${theme.dot} text-white ring-transparent`
                                                                        : 'bg-gray-100 text-gray-400 ring-gray-200',
                                                                ].join(' ')}
                                                            >
                                                                {isDone ? (
                                                                    <span className="text-[10px]">✓</span>
                                                                ) : isActive ? (
                                                                    <span className="text-[10px]">•</span>
                                                                ) : (
                                                                    <span className="text-[10px]">{idx + 1}</span>
                                                                )}
                                                            </div>

                                                            <p
                                                                className={[
                                                                    'mt-2 text-sm font-medium capitalize',
                                                                    isActive || isDone ? theme.text : 'text-gray-600',
                                                                ].join(' ')}
                                                            >
                                                                {step}
                                                            </p>
                                                            <p className="mt-1 text-xs text-gray-500">
                                                                {(() => {
                                                                    const atField = atFieldByStatus[step];
                                                                    return atField ? formatTimestamp(order.orderStatus[atField]) : '—';
                                                                })()}
                                                            </p>
                                                        </div>

                                                        {idx !== progressionSteps.length - 1 ? (
                                                            <div className="mt-4 h-px w-8 flex-shrink-0 bg-gray-200" />
                                                        ) : null}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-gray-100">
                                        <p className="text-sm font-semibold text-gray-900 mb-2">Outcomes</p>
                                        <div className="flex flex-wrap gap-2">
                                            {terminalSteps.map((status) => (
                                                <div
                                                    key={status}
                                                    className={status === currentStatus ? 'ring-2 ring-primary/30 rounded-full' : ''}
                                                >
                                                    <OrderStatusBadge status={status} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 border-t border-gray-200 pt-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-sm font-semibold text-gray-900">Change status</p>
                                        {isChanging ? (
                                            <p className="text-xs text-gray-500">Updating...</p>
                                        ) : (
                                            <p className="text-xs text-gray-500">Select a new status</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        {availableStatuses.map((status) => {
                                            const theme = getTimelineColor(status);
                                            return (
                                                <button
                                                    key={status}
                                                    type="button"
                                                    disabled={isChanging}
                                                    onClick={() => setConfirmToStatus(status)}
                                                    className={[
                                                        'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors duration-200',
                                                        getStatusChangeButtonClasses(status),
                                                        'disabled:opacity-50 disabled:cursor-not-allowed',
                                                    ].join(' ')}
                                                >
                                                    <span className={['size-2 rounded-full', theme.dot].join(' ')} />
                                                    <span className="capitalize">{status}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <ConfirmModal
                        isOpen={confirmToStatus !== null}
                        onClose={() => setConfirmToStatus(null)}
                        onConfirm={() => {
                            void handleConfirm();
                        }}
                        message={`Change status from ${currentStatus} to ${confirmToStatus ?? ''}?`}
                    />
                </>
            )}
        </AnimatePresence>,
        document.body,
    );
};

export default OrderStatusModal;
