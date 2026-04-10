import { motion } from "framer-motion";
import type { ProductProps } from "../../../../products/data/productTypes";
import ProductCard4 from "../ProductCardDesigns/ProductCard4";

const ProductsArea4 = ({ products, showActions }: { products: ProductProps[]; showActions?: boolean }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-2 gap-4 py-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-6"
    >
      {products.map((product: ProductProps, index: number) => (
        <ProductCard4 key={product.id} product={product} index={index} showActions={showActions} />
      ))}
    </motion.div>
  );
};

export default ProductsArea4;
