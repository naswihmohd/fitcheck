import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router";
import AddCartButton from "../AddCartButton";
import BuyNowButton from "../BuyNowButton";
import type { ProductProps } from "../../../../products/data/productTypes";
import ProductEditButton from "../../../../products/presentation/components/ProductEditButton";
import ProductDeleteButton from "../../../../products/presentation/components/ProductDeleteButton";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function getPriceData(product: ProductProps) {
  const variants = Object.values(product.variants ?? {});
  const firstVariant = variants[0];
  const units = firstVariant ? Object.values(firstVariant.units ?? {}) : [];
  const firstUnit = units[0];

  const rawImages = firstVariant?.productImages?.filter(Boolean) ?? [];

  return {
    price: firstUnit?.price ?? 0,
    mrp: firstUnit?.mrp,
    images: rawImages,
    firstVariant,
    firstUnit,
  };
}

interface ProductCard4Props {
  product: ProductProps;
  index?: number;
  showActions?: boolean;
}

/** Time each image stays mostly visible before the next slow crossfade starts. */
const IMAGE_CYCLE_MS = 12_000;
/** Long crossfade so the swap feels gradual rather than obvious. */
const IMAGE_CROSSFADE_DURATION_S = 3.2;

const ProductCard4 = ({ product, index = 0, showActions }: ProductCard4Props) => {
  const { price, mrp, images, firstVariant, firstUnit } = getPriceData(product);
  const link = product.productDetails.linkUrl ?? `/product/${product.webLinkName}`;
  const discountPercent =
    mrp != null && mrp > price && mrp > 0
      ? Math.round(((mrp - price) / mrp) * 100)
      : 0;

  const [activeIndex, setActiveIndex] = useState(0);

  const safeIndex =
    images.length > 0 ? Math.min(activeIndex, images.length - 1) : 0;
  const currentSrc = images[safeIndex] ?? null;
  const hasMultiple = images.length > 1;

  useEffect(() => {
    if (!hasMultiple) return;
    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % images.length);
    }, IMAGE_CYCLE_MS);
    return () => window.clearInterval(id);
  }, [hasMultiple, images.length]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      className="group h-full flex flex-col"
    >
      <div className="flex flex-col h-full overflow-hidden rounded-t-lg duration-300">
        <div className="relative aspect-square shrink-0 overflow-hidden bg-stone-100">
          <Link
            to={link}
            className="absolute inset-0 z-0 block focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-stone-900"
          >
            {currentSrc ? (
              <AnimatePresence mode="sync" initial={false}>
                <motion.img
                  key={currentSrc}
                  src={currentSrc}
                  alt={`${product.productDetails.productName} — view ${safeIndex + 1}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: IMAGE_CROSSFADE_DURATION_S,
                    ease: [0.45, 0, 0.55, 1],
                  }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </AnimatePresence>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-stone-400">
                No image
              </div>
            )}

            {discountPercent > 0 && (
              <span className="pointer-events-none absolute left-3 top-3 z-1 rounded-md bg-stone-900 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                −{discountPercent}%
              </span>
            )}
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
        </div>

        <div className="flex flex-1 flex-col pt-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
            {product.brandDetails.brandName}
          </p>
          <h3 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug text-stone-900">
            {product.productDetails.productName}
          </h3>
          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            <span className="text-lg font-bold tabular-nums text-stone-900">
              {formatPrice(price)}
            </span>
            {mrp != null && mrp > price && (
              <span className="text-sm text-stone-400 line-through tabular-nums">
                {formatPrice(mrp)}
              </span>
            )}
          </div>

          {firstVariant && firstUnit ? (
            <div className="mt-auto pt-2 flex">
              <AddCartButton
                firstVariant={firstVariant}
                firstUnit={firstUnit}
                product={product}
                className="w-full border border-stone-200 bg-stone-50 py-2.5 text-sm font-semibold text-stone-800 transition-colors hover:bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2"
                buttonText="Cart"
              />
              <BuyNowButton
                firstVariant={firstVariant}
                firstUnit={firstUnit}
                product={product}
                className="w-full border border-stone-200 bg-stone-50 py-2.5 text-sm font-semibold text-stone-800 transition-colors hover:bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2"
                buttonText="Buy"
              />
            </div>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
};

export default ProductCard4;
