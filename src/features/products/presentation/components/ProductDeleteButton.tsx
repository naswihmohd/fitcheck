import { useState } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { FiTrash2 } from 'react-icons/fi';
import ConfirmModal from '../../../../general/components/ConfirmModal';
import type { AppDispatch } from '../../../../general/redux/store';
import { deleteProduct } from '../../redux/productSlice';

interface ProductDeleteButtonProps {
  productId: string;
  productName: string;
}

function ProductDeleteButton({ productId, productName }: ProductDeleteButtonProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const handleConfirm = () => {
    void dispatch(deleteProduct(productId))
      .unwrap()
      .then(() => {
        toast.success('Product deleted');
      })
      .catch(() => {
        toast.error('Failed to delete product');
      });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowDeleteModal(true)}
        className="p-2 bg-white rounded-lg shadow-md hover:bg-red-500 hover:text-white transition-colors duration-200"
        title="Delete Product"
      >
        <FiTrash2 className="w-4 h-4" />
      </button>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirm}
        message={`Are you sure you want to delete "${productName}"? This action cannot be undone.`}
      />
    </>
  );
}

export default ProductDeleteButton;
