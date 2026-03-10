import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiEdit2, FiTrash2, FiPower } from 'react-icons/fi';
import type { ProductProps } from '../../data/productTypes';
import LoadImage from '../../../../general/components/LoadImage';
import ConfirmModal from '../../../../general/components/ConfirmModal';

interface ProductCardProps {
  data: ProductProps;
  onEdit?: (product: ProductProps) => void;
  onDelete?: (productId: string) => void;
  onToggleActive?: (productId: string, isActive: boolean) => void;
}

function ProductCard({ data, onEdit, onDelete, onToggleActive }: ProductCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const variantData = Object.values(data.variants)[0];
  const unitData = variantData ? Object.values(variantData.units)[0] : null;
  const imageUrl = variantData?.productImages?.[0] || 'https://via.placeholder.com/300';

  const handleDelete = () => {
    if (onDelete) {
      onDelete(data.id);
    }
    setShowDeleteModal(false);
  };

  const handleToggleActive = async () => {
    if (onToggleActive) {
      setIsToggling(true);
      await onToggleActive(data.id, !data.isActive);
      setIsToggling(false);
    }
  };

  const discountPercentage = unitData && unitData.mrp > unitData.price
    ? Math.round(((unitData.mrp - unitData.price) / unitData.mrp) * 100)
    : 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex flex-col w-full border-2 rounded-lg overflow-hidden transition-all duration-300 ${
          data.isActive 
            ? 'border-primary/80 bg-white shadow-sm hover:shadow-md' 
            : 'border-gray-300 bg-gray-50 opacity-75'
        }`}
      >
        {/* Product Image */}
        <div className='aspect-square relative overflow-hidden bg-gray-100'>
          <LoadImage 
            index={0} 
            src={imageUrl} 
            alt={data.productDetails.productName} 
            className='object-cover w-full h-full' 
          />

          {/* Action Buttons Overlay */}
          <div className='absolute top-2 right-2 flex flex-col gap-2'>
            {/* Edit Button */}
            {onEdit && (
              <button
                onClick={() => onEdit(data)}
                className='p-2 bg-white rounded-lg shadow-md hover:bg-primary hover:text-white transition-colors duration-200'
                title="Edit Product"
              >
                <FiEdit2 className='w-4 h-4' />
              </button>
            )}

            {/* Delete Button */}
            {onDelete && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className='p-2 bg-white rounded-lg shadow-md hover:bg-red-500 hover:text-white transition-colors duration-200'
                title="Delete Product"
              >
                <FiTrash2 className='w-4 h-4' />
              </button>
            )}
          </div>

          {/* Active Status Badge */}
          <div className='absolute top-2 left-2'>
            <span
              className={`px-2 py-1 rounded-md text-xs font-medium ${
                data.isActive
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {data.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <div className='absolute bottom-2 left-2'>
              <span className='px-2 py-1 bg-red-500 text-white rounded-md text-xs font-semibold'>
                {discountPercentage}% OFF
              </span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className='flex flex-col px-3 py-3 gap-2 flex-grow'>
          {/* Product Name */}
          <h3 className='font-semibold text-sm text-gray-900 line-clamp-2 min-h-[2.5rem]'>
            {data.productDetails.productName}
          </h3>

          {/* Brand Name */}
          {data.brandDetails?.brandName && (
            <p className='text-xs text-gray-500'>
              {data.brandDetails.brandName}
            </p>
          )}

          {/* Product Description */}
          {data.productDetails.productDescription && data.productDetails.productDescription.length > 0 && (
            <p className='text-xs text-gray-600 line-clamp-2'>
              {data.productDetails.productDescription[0]?.mainHeading || 'No description'}
            </p>
          )}

          {/* Price Section */}
          {unitData && (
            <div className='flex flex-row gap-2 items-center mt-auto'>
              <span className='font-semibold text-base text-gray-900'>
                ₹{unitData.price}
              </span>
              {unitData.mrp > unitData.price && (
                <span className='font-medium text-xs text-gray-500 line-through'>
                  ₹{unitData.mrp}
                </span>
              )}
            </div>
          )}

          {/* Stock Info */}
          <div className='flex items-center justify-between'>
            <span className={`text-xs font-medium ${
              (unitData?.stock || 0) > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              Stock: {unitData?.stock || 0}
            </span>
            {data.isTrending && (
              <span className='px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium'>
                Trending
              </span>
            )}
          </div>
        </div>

        {/* Toggle Active Button */}
        {onToggleActive && (
          <div className='px-3 pb-3'>
            <button
              onClick={handleToggleActive}
              disabled={isToggling}
              className={`w-full py-2 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                data.isActive
                  ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
              } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FiPower className={`w-4 h-4 ${data.isActive ? 'text-green-600' : 'text-gray-500'}`} />
              {data.isActive ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        message={`Are you sure you want to delete "${data.productDetails.productName}"? This action cannot be undone.`}
      />
    </>
  );
}

export default ProductCard;
