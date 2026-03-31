import type { Timestamp } from "firebase/firestore";



export interface OrdersProps {
    // coupon: null | OrderCouponProps;
    totalAmount: number;
    deliveryChargeData: DeliveryProps | null;
    createdAt: Timestamp;
    deliveryDetails: ShippingAddress;
    items: Record<string, OrderItem>;
    orderId: string;
    orderStatus: OrderStatus;
    paymentStatus: PaymentStatus;
    userId: string;
    keywords: string[];
}

export interface OrderItem {
    productId: string;
    brandId: string;
    brandName: string;
    quantity: number;
    categoryIds: string[];
    gstPercentage: number;
    hsnCode: number;
    materialCode: string;
    isReviewed: boolean;
    productName: string;
    refundAvailable: boolean;
    returnAvailable: boolean;
    unitType: string;
    variant: OrderVariant;
    unit: OrderUnit;
}

export interface OrderVariant {
    color: string;
    colorCode: string;
    id: string;
    maxBuyQuantity: number;
    productImages: string[];
    variantId?: string;
}

export interface OrderUnit {
    id: string;
    index: number;
    mrp: number;
    price: number;
    stock: number;
    unit: string;
    unitId?: string;
}



export type DeliveryProps = {
    deliveryDays: number;
    deliverycharge: number;
    minOrderPrice: number;
    returnDays: number;
};

export type OrderStatusType = "pending" | "shipped" | "delivered" | "cancelled" | "replaced" | "rejected" | "returned" | "packed" | "accepted";

export interface OrderStatus {
    acceptedAt: Timestamp | null;
    createdAt: Timestamp;
    deliveredAt: Timestamp | null;
    message: string | null;
    orderStatus: OrderStatusType;
    packedAt: Timestamp | null;
    rejectedAt: Timestamp | null;
    returnedAt: Timestamp | null;
    shippedAt: Timestamp | null;
    cancelledAt: Timestamp | null;
    updatedAt: Timestamp | null;
}

export interface PaymentStatus {
    createdAt: Timestamp;
    failedAt: Timestamp | null;
    message: string | null;
    paidAt: Timestamp | null;
    paymentMethod: PaymentMethodType;
    paymentStatus: "pending" | "completed" | "failed" | "refunded";
    refundedAt: Timestamp | null;
}

export type PaymentMethodType = "COD" | "online" | "razorpay" | "paypal" | "HDFC";


export type ShippingAddress = {
    fullName: string;
    street: string;
    apartment?: string;
    phone: string;
    alternativePhone?: string;
    zip: string;
    city: string;
    state: string;
};