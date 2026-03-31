import type { Timestamp } from "firebase/firestore";


export type ProductProps = {
  id: string;
  webLinkName: string;
  brandDetails: BrandDetail;
  categoryIds: string[];
  keywordIds?: string[];
  isActive: boolean;
  taxDetails: {
    gstPercentage: number;
    hsnCode: number;
  };
  productDetails: {
    productName: string;
    productDescription: ProductDescription[];
    materialCode: string;
    linkUrl: string | null;
    returnAvailable: boolean;
    reviewAvailable: boolean;
    cashOnDeliveryAvailable: boolean;
  };
  createdAt: Timestamp;
  isTrending: boolean;
  keywords: string[];
  variants: Record<string, ProductVariant>;
  unitType: string;
  ratingModel?: RatingModel;
};

export interface BrandDetail {
  brandId: string;
  brandName: string;
  brandImage: string | null;
}

export type ProductDescription = {
  mainHeading: string;
  details: Record<string, string>;
};

export interface ProductVariant {
  id: string;
  variantId?: string; // color/variant id from color selection (SelectVariantModal)
  color: string;
  colorCode: string;
  maxBuyQuantity: number;
  productImages: string[];
  units: Record<string, VariantUnit>;
}

export interface VariantUnit {
  id: string;
  index: number;
  mrp: number;
  price: number;
  stock: number;
  unit: string;
  unitId?: string;
}

export interface RatingModel {
  star1?: number;
  star2?: number;
  star3?: number;
  star4?: number;
  star5?: number;
  totalRating: number;
  totalRatingUserCount: number;
}
