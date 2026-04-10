import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router';
import { motion } from 'framer-motion';
import { FiSearch, FiSliders } from 'react-icons/fi';
import type { AppDispatch, RootState } from '../../../../general/redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { clearProducts, fetchProducts } from '../../redux/productSlice';
import ThreeDotLoading from '../../../../general/components/ThreeDotLoading';
import type { StoreThemeProps } from '../../../storeTheme/data/themeTypes';
import {
    themeSections,
    type ProductCardThemeId,
} from '../../../productsThemes/presentation/ProductCardThemes';

interface ListProductsProps {
    status?: boolean;
    isTrending?: boolean;
}

function ListProducts({ status, isTrending }: ListProductsProps) {

    const { searchQuery, storeTheme } = useOutletContext<{ searchQuery: string, storeTheme: StoreThemeProps }>();
    const { products, loading, error, hasMore } = useSelector((state: RootState) => state.products);
    const dispatch: AppDispatch = useDispatch();
    const navigate = useNavigate();
    const [theme, setTheme] = useState<ProductCardThemeId>("card-1");

    useEffect(() => {
        if (isTrending) {
            if (storeTheme?.trendingProductCardTheme) {
                setTheme(storeTheme.trendingProductCardTheme);
            }
        } else {
            if (storeTheme?.productCardTheme) {
                setTheme(storeTheme.productCardTheme);
            }
        }
    }, [isTrending, storeTheme]);

    useEffect(() => {
        dispatch(clearProducts());
        dispatch(fetchProducts({ params: { searchQuery, status, isTrending } }));
    }, [searchQuery, status, isTrending]);

    const handleLoadMore = () => {
        if (loading || !hasMore) return;
        dispatch(fetchProducts({ params: { searchQuery, status, isTrending } }));
    };

    const handleChangeTheme = () => {
        navigate(
            isTrending
                ? '/product-management/trending/product-themes'
                : '/product-management/product-themes'
        );
    };

    useEffect(() => {
        if (error) {
            console.error(error);
        }
    }, [error]);

    const activeThemeSection =
        themeSections.find((s) => s.id === theme) ?? themeSections[0];
    const ProductsArea = activeThemeSection.RenderComponent;

    return (
        <>
            {/* Products grid: uses same theme sections as ProductCardThemes (ProductsArea 1–4) */}
            {products.length > 0 ? (
                <section className="space-y-4">
                    <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-base font-semibold text-gray-900">
                                {activeThemeSection.title}
                            </h2>
                            <button
                                type="button"
                                onClick={handleChangeTheme}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                            >
                                <FiSliders className="h-3.5 w-3.5" aria-hidden />
                                Change theme
                            </button>
                        </div>
                        <span className="text-xs font-medium uppercase text-neutral-500">
                            {theme}
                        </span>
                    </header>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                    >
                        <ProductsArea products={products} showActions={true} />
                    </motion.div>
                </section>
            ) : !loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-12 text-center"
                >
                    <FiSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                    <button
                        type="button"
                        onClick={handleChangeTheme}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                    >
                        <FiSliders className="h-4 w-4" aria-hidden />
                        Change product card theme
                    </button>
                </motion.div>
            )}

            {loading && <ThreeDotLoading />}

            {/* Load More Button */}
            {hasMore && products.length > 0 && !loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-center"
                >
                    <button
                        onClick={handleLoadMore}
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium"
                    >
                        Load More
                    </button>
                </motion.div>
            )}
        </>
    )
}

export default ListProducts
