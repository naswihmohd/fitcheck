import { motion } from "framer-motion";
import type { ProductProps } from "../../../../products/data/productTypes";
import ProductCard3 from "../ProductCardDesigns/ProductCard3";

const ProductsArea3 = ({ products, showActions }: { products: ProductProps[]; showActions?: boolean }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="mx-auto w-full max-w-7xl px-1 sm:px-0"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
        {products.map((product: ProductProps, index: number) => (
          <ProductCard3 key={product.id} product={product} index={index} showActions={showActions} />
        ))}
      </div>
    </motion.div>
  );
};

export default ProductsArea3;
