import type { OrderStatusType } from "../../data/orderTypes";

export function OrderStatusBadge({ status }: { status: OrderStatusType }) {
    const common =
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset';
  
    switch (status) {
      case 'pending':
        return (
          <span className={`${common} bg-amber-50 text-amber-800 ring-amber-200/80`}>
            <span className="size-1.5 rounded-full bg-amber-500" />
            pending
          </span>
        );
      case 'shipped':
        return (
          <span className={`${common} bg-violet-50 text-violet-800 ring-violet-200/80`}>
            <span className="size-1.5 rounded-full bg-violet-500" />
            shipped
          </span>
        );
      case 'delivered':
        return (
          <span className={`${common} bg-emerald-50 text-emerald-800 ring-emerald-200/80`}>
            <span className="size-1.5 rounded-full bg-emerald-500" />
            delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className={`${common} bg-rose-50 text-rose-800 ring-rose-200/80`}>
            <span className="size-1.5 rounded-full bg-rose-500" />
            cancelled
          </span>
        );
      case 'replaced':
        return (
          <span className={`${common} bg-sky-50 text-sky-800 ring-sky-200/80`}>
            <span className="size-1.5 rounded-full bg-sky-500" />
            replaced
          </span>
        );
      case 'rejected':
        return (
          <span className={`${common} bg-gray-50 text-gray-800 ring-gray-200/80`}>
            <span className="size-1.5 rounded-full bg-gray-500" />
            rejected
          </span>
        );
      case 'returned':
        return (
          <span className={`${common} bg-orange-50 text-orange-800 ring-orange-200/80`}>
            <span className="size-1.5 rounded-full bg-orange-500" />
            returned
          </span>
        );
      case 'packed':
        return (
          <span className={`${common} bg-indigo-50 text-indigo-800 ring-indigo-200/80`}>
            <span className="size-1.5 rounded-full bg-indigo-500" />
            packed
          </span>
        );
      case 'accepted':
        return (
          <span className={`${common} bg-teal-50 text-teal-800 ring-teal-200/80`}>
            <span className="size-1.5 rounded-full bg-teal-500" />
            accepted
          </span>
        );
      default: {
        // Exhaustiveness guard
        const _exhaustive: never = status;
        return _exhaustive;
      }
    }
  }