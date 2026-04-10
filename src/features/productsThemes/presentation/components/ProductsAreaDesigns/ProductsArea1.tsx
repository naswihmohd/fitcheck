
import type { ProductProps } from '../../../../products/data/productTypes'
import { motion } from "framer-motion"
import ProductCard from '../ProductCardDesigns/ProductCard'

const ProductsArea1 = ({ products, showActions }: { products: ProductProps[]; showActions?: boolean }) => {
    return (
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
                    <ProductCard product={product} showActions={showActions} />
                </motion.div>
            ))}
        </motion.div>
    )
}

export default ProductsArea1
