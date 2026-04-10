import { motion } from "framer-motion";
import { FiStar } from "react-icons/fi";
import { Link } from "react-router";
import AddCartButton from "../AddCartButton";
import BuyNowButton from "../BuyNowButton";
import type { ProductProps, RatingModel } from "../../../../products/data/productTypes";
import ProductEditButton from "../../../../products/presentation/components/ProductEditButton";
import ProductDeleteButton from "../../../../products/presentation/components/ProductDeleteButton";
import LoadImage from "../../../../../general/components/LoadImage";

function formatPrice(value: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
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

function calculateAverageRating(ratingModel?: RatingModel): number {
    if (!ratingModel || !ratingModel.totalRatingUserCount) {
        return 4.8;
    }

    const totalUsers = ratingModel.totalRatingUserCount;
    const weightedTotal =
        (ratingModel.star1 ?? 0) * 1 +
        (ratingModel.star2 ?? 0) * 2 +
        (ratingModel.star3 ?? 0) * 3 +
        (ratingModel.star4 ?? 0) * 4 +
        (ratingModel.star5 ?? 0) * 5;

    const calculated = weightedTotal / totalUsers;
    return Number.isFinite(calculated) ? Number(calculated.toFixed(1)) : 4.8;
}

const ProductCard2 = ({ product, index, showActions }: { product: ProductProps; index: number; showActions?: boolean }) => {
    const { price, mrp, image, firstVariant, firstUnit } = getPriceData(product);
    const avgRating = calculateAverageRating(product.ratingModel);
    const sale = mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : null;
    const link = product.productDetails.linkUrl ?? `/product/${product.webLinkName}`;

    return (
        <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.28) }}
            className="group relative h-full flex flex-col"
        >

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
            <Link to={link} className="block flex-1">
                <div className="relative aspect-square mb-3 overflow-hidden rounded-sm bg-[#f4f4f4]">
                    {image ? (
                        <LoadImage
                            index={0}
                            src={image}
                            alt={product.productDetails.productName}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                            No image
                        </div>
                    )}
                </div>

                <h3 className="text-[13px] sm:text-sm font-medium text-[#2c2c2c] line-clamp-1">
                    {product.productDetails.productName}
                </h3>

                <div className="mt-1 flex items-center gap-1.5 text-[15px] font-semibold text-[#1f1f1f]">
                    <span>{formatPrice(price)}</span>
                    {mrp != null && mrp > price && (
                        <>
                            <span className="text-[12px] text-gray-400 line-through font-normal">
                                {formatPrice(mrp)}
                            </span>
                            {sale != null && (
                                <span className="text-[11px] text-[#c98c00] font-medium">{sale}%</span>
                            )}
                        </>
                    )}
                </div>

                <div className="mt-1.5 flex items-center gap-0.5 text-[#e0b500]">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                        <FiStar
                            key={`${product.id}-${starIndex}`}
                            className={`w-3.5 h-3.5 ${starIndex < Math.round(avgRating) ? "fill-current" : ""
                                }`}
                        />
                    ))}
                </div>
            </Link>

            {firstVariant && firstUnit && (
                <div className="mt-3 flex gap-2">
                    <AddCartButton
                        firstVariant={firstVariant} firstUnit={firstUnit} product={product}
                        className="text-gray-500 border-gray-200 border w-full py-2"
                        buttonText="Add to cart"
                    />
                    <BuyNowButton
                        firstVariant={firstVariant}
                        firstUnit={firstUnit} product={product}
                        className="text-white bg-primary w-full py-2"
                        buttonText="Buy now"
                    />
                </div>
            )}
        </motion.article>
    );
};

export default ProductCard2;
