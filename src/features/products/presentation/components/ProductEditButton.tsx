import { FiEdit2 } from 'react-icons/fi';
import type { ProductProps } from '../../data/productTypes';
import { useNavigate } from 'react-router';

interface ProductEditButtonProps {
  product: ProductProps;
}

function ProductEditButton({ product }: ProductEditButtonProps) {
  const navigate = useNavigate();
  
  const handleEdit = () => {
    navigate(`/product-management/add-product/${product.id}`);
  };


  return (
    <button
      type="button"
      onClick={handleEdit}
      className="p-2 bg-white rounded-lg shadow-md hover:bg-primary hover:text-white transition-colors duration-200"
      title="Edit Product"
    >
      <FiEdit2 className="w-4 h-4" />
    </button>
  );
}

export default ProductEditButton;
