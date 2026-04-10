
import { motion } from "framer-motion";
import type { ProductProps } from "../../../../products/data/productTypes";
import ProductCard2 from "../ProductCardDesigns/ProductCard2";

const ProductsArea2 = ({ products, showActions }: { products: ProductProps[]; showActions?: boolean }) => {



  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="grid grid-cols-2 py-3 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-7"
    >
      {products.map((product: ProductProps, index: number) => (
        <ProductCard2 key={product.id} product={product} index={index} showActions={showActions} />
      ))}
    </motion.div>
  );
};

export default ProductsArea2;
