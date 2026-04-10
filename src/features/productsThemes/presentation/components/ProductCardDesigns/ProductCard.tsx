import { Link } from "react-router";
import { motion } from "framer-motion";
import AddCartButton from "../AddCartButton";
import BuyNowButton from "../BuyNowButton";
import type { ProductProps } from "../../../../products/data/productTypes";
import ProductEditButton from "../../../../products/presentation/components/ProductEditButton";
import ProductDeleteButton from "../../../../products/presentation/components/ProductDeleteButton";
import LoadImage from "../../../../../general/components/LoadImage";

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 0.61, 0.36, 1] as const },
  },
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function getDiscountPercent(price: number, compareAtPrice: number): number {
  if (compareAtPrice <= 0) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

interface ProductCardProps {
  product: ProductProps;
  showActions?: boolean;
}

export function ProductCard({ product, showActions }: ProductCardProps) {
  const variants = Object.values(product.variants ?? {});
  const firstVariant = variants[0];
  const units = firstVariant ? Object.values(firstVariant.units ?? {}) : [];
  const firstUnit = units[0];

  const price = firstUnit?.price ?? 0;
  const mrp = firstUnit?.mrp;
  const image = firstVariant?.productImages?.[0];

  const discountPercent =
    mrp != null && mrp > price ? getDiscountPercent(price, mrp) : 0;

  const link = product.productDetails.linkUrl ?? `/product/${product.webLinkName}`;

  return (
    <motion.article
      variants={itemVariants}
      className="group h-full flex flex-col"
    >
      <div className="relative overflow-hidden rounded-2xl bg-neutral-100 ring-1 ring-black/5 shadow-md flex flex-col h-full">
        <Link
          to={link}
          className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary rounded-t-2xl shrink-0"
        >
          <div className="aspect-square relative">
            {image ? (
              <LoadImage
                index={0}
                src={image}
                alt={product.productDetails.productName}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-neutral-200 text-xs text-neutral-500">
                No image
              </div>
            )}
            {discountPercent > 0 && (
              <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold text-white bg-red-500 shadow-sm">
                -{discountPercent}%
              </span>
            )}
          </div>
        </Link>

        {/* Action Buttons Overlay — visible on card hover / focus-within */}
        {showActions && (
          <div className="absolute top-2 right-2 z-10 flex flex-col gap-2 opacity-0 pointer-events-none transition-opacity duration-200 ease-out group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto">
            {/* Edit Button */}
            <ProductEditButton product={product} />

            <ProductDeleteButton
              productId={product.id}
              productName={product.productDetails.productName}
            />
          </div>
        )}

        <div className="p-3 sm:p-4 flex flex-col flex-1 min-h-0">
          <Link
            to={link}
            className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded shrink-0"
          >
            <h3
              className="text-sm sm:text-base font-semibold line-clamp-2 leading-snug hover:opacity-80 transition-opacity text-black"
            >
              {product.productDetails.productName}
            </h3>
          </Link>

          <p
            className="mt-1.5 text-xs sm:text-sm line-clamp-2 opacity-80 flex-1 min-h-0 text-black"
          >
            {product.productDetails.productDescription[0]?.mainHeading ??
              product.brandDetails.brandName}
          </p>

          <div className="mt-2 flex items-center gap-2 flex-wrap shrink-0">
            <span
              className="text-base font-bold text-black"
            >
              {formatPrice(price)}
            </span>
            {mrp != null && mrp > price && (
              <>
                <span className="text-xs text-neutral-500 line-through">
                  {formatPrice(mrp)}
                </span>
                <span className="text-xs font-semibold text-red-600">
                  Save {discountPercent}%
                </span>
              </>
            )}
          </div>

          <div className="mt-auto pt-3 flex gap-2 shrink-0">
            <BuyNowButton
              firstVariant={firstVariant}
              firstUnit={firstUnit}
              product={product}
              className="flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-sm font-semibold text-black border border-black transition-all hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
              buttonText="Buy now"
            />
            <AddCartButton
              firstVariant={firstVariant}
              firstUnit={firstUnit}
              product={product}
              className="flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-sm font-semibold border transition-all hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
              buttonText="Add to cart"
            />
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default ProductCard;
