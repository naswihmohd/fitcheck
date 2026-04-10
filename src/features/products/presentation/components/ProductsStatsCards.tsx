import { motion } from 'framer-motion'
import { getProductCountsFromServer } from '../../utils/getProductCountsFromServer'
import { useEffect, useState } from 'react';

const ProductsStatsCards = () => {
    const [loading, setLoading] = useState(true);

    const [counts, setCounts] = useState({
        totalProducts: 0,
        activeProducts: 0,
        inactiveProducts: 0,
        trendingProducts: 0,
    });


    useEffect(() => {
        const fetchProductCounts = async () => {
            try {
                const counts = await getProductCountsFromServer();
                setCounts(counts);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        fetchProductCounts();
    }, []);


    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-4 gap-4"
        >
            <div className="bg-white rounded-lg border border-primary/10 p-4 shadow-sm" aria-busy={loading}>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900 mt-1 min-h-8 flex items-center">
                    {loading ? (
                        <span className="h-7 w-7 shrink-0 rounded-full border-2 border-gray-200 border-t-primary animate-spin" aria-hidden />
                    ) : (
                        counts.totalProducts
                    )}
                </p>
            </div>
            <div className="bg-white rounded-lg border border-primary/10 p-4 shadow-sm" aria-busy={loading}>
                <p className="text-sm text-gray-600">Active Products</p>
                <p className="text-2xl font-bold text-green-600 mt-1 min-h-8 flex items-center">
                    {loading ? (
                        <span className="h-7 w-7 shrink-0 rounded-full border-2 border-gray-200 border-t-green-600 animate-spin" aria-hidden />
                    ) : (
                        counts.activeProducts
                    )}
                </p>
            </div>
            <div className="bg-white rounded-lg border border-primary/10 p-4 shadow-sm" aria-busy={loading}>
                <p className="text-sm text-gray-600">Inactive Products</p>
                <p className="text-2xl font-bold text-gray-500 mt-1 min-h-8 flex items-center">
                    {loading ? (
                        <span className="h-7 w-7 shrink-0 rounded-full border-2 border-gray-200 border-t-gray-500 animate-spin" aria-hidden />
                    ) : (
                        counts.inactiveProducts
                    )}
                </p>
            </div>
            <div className="bg-white rounded-lg border border-orange-100 p-4 shadow-sm" aria-busy={loading}>
                <p className="text-sm text-gray-600">Trending Products</p>
                <p className="text-2xl font-bold text-orange-600 mt-1 min-h-8 flex items-center">
                    {loading ? (
                        <span className="h-7 w-7 shrink-0 rounded-full border-2 border-orange-100 border-t-orange-600 animate-spin" aria-hidden />
                    ) : (
                        counts.trendingProducts
                    )}
                </p>
            </div>
        </motion.div>
    )
}

export default ProductsStatsCards
