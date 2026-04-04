import { Timestamp } from "firebase/firestore";

export interface CouponProps {
    id: string;
    couponCode: string;
    coupontTitle: string;
    couponDescription: string;
    couponType: 'product' | 'category' | 'brand' | 'all'; // Expand as needed

    categoryId?: string | null;
    brandId?: string | null;
    productId?: string | null;

    discountType: 'amount' | 'percentage';
    discountValue: number;
    couponAllowedUsersNumber: number | null;
    maximumCalimableValue: number;
    minimumOrderValue: number;

    usersType: 'all' | 'single' | 'multiple';
    singleUserId: string | null;
    multipleUserIds: string[] | null;

    couponUsedLimit: "oneTime" | "unlimited";

    image: string;
    keywords: string[];
    createdAt: Timestamp;

    startAt: Timestamp;
    expiryAt: Timestamp;
    isShownPublic: boolean;
}
