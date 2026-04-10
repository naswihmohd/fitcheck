import { Link } from "react-router";
import { motion } from "framer-motion";
import AddCartButton from "../AddCartButton";
import BuyNowButton from "../BuyNowButton";
import type { ProductProps } from "../../../../products/data/productTypes";
import LoadImage from "../../../../../general/components/LoadImage";
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

  return {
    price: firstUnit?.price ?? 0,
    mrp: firstUnit?.mrp,
    image: firstVariant?.productImages?.[0] ?? null,
    firstVariant,
    firstUnit,
  };
}

interface ProductCard3Props {
  product: ProductProps;
  index?: number;
  showActions?: boolean;
}

const ProductCard3 = ({ product, index = 0, showActions }: ProductCard3Props) => {
  const { price, mrp, image, firstVariant, firstUnit } = getPriceData(product);
  const link = product.productDetails.linkUrl ?? `/product/${product.webLinkName}`;
  const discountPercent =
    mrp != null && mrp > price && mrp > 0
      ? Math.round(((mrp - price) / mrp) * 100)
      : 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.36) }}
      className="group h-full flex flex-col"
    >
      <div className="relative overflow-hidden rounded-3xl bg-zinc-900  flex flex-col h-full">
        <Link
          to={link}
          className="relative block aspect-4/5 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
        >
          {image ? (
            <LoadImage
              index={0}
              src={image}
              alt={product.productDetails.productName}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 text-sm text-zinc-500">
              No image
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent opacity-90" />

          {discountPercent > 0 && (
            <span className="absolute top-4 left-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-zinc-900 shadow-sm">
              −{discountPercent}%
            </span>
          )}

          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 pointer-events-none">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              {product.brandDetails.brandName}
            </p>
            <h3 className="mt-1.5 text-base sm:text-lg font-semibold leading-snug text-white line-clamp-2">
              {product.productDetails.productName}
            </h3>
            <div className="mt-3 flex flex-wrap items-baseline gap-2">
              <span className="text-xl font-bold text-white tabular-nums">
                {formatPrice(price)}
              </span>
              {mrp != null && mrp > price && (
                <span className="text-sm text-white/50 line-through tabular-nums">
                  {formatPrice(mrp)}
                </span>
              )}
            </div>
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

        <div className="relative z-10 mt-auto flex gap-2 border-t border-white/10 bg-zinc-950/95 p-3 sm:p-4 backdrop-blur-sm">
          {firstVariant && firstUnit ? (
            <>
              <AddCartButton
                firstVariant={firstVariant}
                firstUnit={firstUnit}
                product={product}
                className="flex-1 min-w-0 rounded-md border border-white/20 bg-white/5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                buttonText="Cart"
              />
              <BuyNowButton
                firstVariant={firstVariant}
                firstUnit={firstUnit}
                product={product}
                className="flex-1 min-w-0 rounded-md bg-white py-2.5 text-sm font-semibold text-zinc-900 shadow-sm transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                buttonText="Buy now"
              />
            </>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
};

export default ProductCard3;
