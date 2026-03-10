import { useEffect } from 'react'
import type { ProductProps } from '../../data/productTypes';
import { useNavigate, useOutletContext } from 'react-router';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import { FiSearch } from 'react-icons/fi';
import type { AppDispatch, RootState } from '../../../../general/redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../redux/productSlice';
import ThreeDotLoading from '../../../../general/components/ThreeDotLoading';

function AllProducts() {

    const { searchQuery } = useOutletContext<{ searchQuery: string }>();
    const { products, loading, error, currentFilter, hasMore } = useSelector((state: RootState) => state.products);
    const dispatch: AppDispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (products.length > 0 && currentFilter === searchQuery) return;
        dispatch(fetchProducts({ params: { searchQuery } }));
    }, [searchQuery]);

    const handleLoadMore = () => {
        if (loading || !hasMore) return;
        dispatch(fetchProducts({ params: { searchQuery } }));
    }

    useEffect(() => {
        if (error) {
            console.error(error);
        }
    }, [error]);

    const handleEdit = (product: ProductProps) => {
        navigate(`/product-management/add-product/${product.id}`);
    };

    const handleDelete = (productId: string) => {
        console.log('Delete product:', productId);
        // Implement delete logic
    };

    const handleToggleActive = (productId: string, isActive: boolean) => {
        console.log('Toggle active:', productId, isActive);
        // Implement toggle logic
    };

    return (
        <>
            {/* Products Grid */}
            {products.length > 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                >
                    {products.map((product: ProductProps, index: number) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <ProductCard
                                data={product}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onToggleActive={handleToggleActive}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            ) : !loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-12 text-center"
                >
                    <FiSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                </motion.div>
            )}

            {loading && <ThreeDotLoading />}
        </>
    )
}

export default AllProducts
