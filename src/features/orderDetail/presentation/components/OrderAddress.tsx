
import { FiMapPin } from 'react-icons/fi'
import type { OrdersProps } from '../../../orders/data/orderTypes'

const OrderAddress = ({order}: {order: OrdersProps}) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <FiMapPin className="size-4 text-primary" />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">Shipping Address</h3>
            </div>
            <div className="mt-3 space-y-1.5 text-sm text-gray-700">
              <p>{order.deliveryDetails?.street || 'N/A'}</p>
              {order.deliveryDetails?.apartment ? <p>{order.deliveryDetails.apartment}</p> : null}
              <p>
                {order.deliveryDetails?.city || 'N/A'}, {order.deliveryDetails?.state || 'N/A'}{' '}
                {order.deliveryDetails?.zip || ''}
              </p>
            </div>
          </div>
  )
}

export default OrderAddress
