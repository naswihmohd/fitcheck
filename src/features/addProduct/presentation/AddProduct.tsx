import React, { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import type { Control, UseFormRegister, FieldErrors } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { HiShoppingBag, HiTag, HiCurrencyRupee, HiCube, HiLink, HiCheckCircle, HiXCircle, HiPlus, HiTrash } from 'react-icons/hi';
import { FiPackage, FiFileText, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import type { BrandDetail, ProductDescription, VariantUnit } from '../../products/data/productTypes';
import { productStoreToDatabase, getProductFromDatabase } from '../utils/productDatabase';
import { addProduct, updateProduct } from '../../products/redux/productSlice';
import type { AppDispatch } from '../../../general/redux/store';

export interface VariantFormData {
  id: string;
  color: string;
  colorCode: string;
  maxBuyQuantity: number;
  productImages: string[];
  units: VariantUnit[];
}

export interface AddProductFormData {
  webLinkName: string;
  brandDetails: BrandDetail;
  categoryIds: string[];
  taxDetails: {
    cgst: number;
    sgst: number;
    gstPercentage: number;
    hsnCode: number;
  };
  productDetails: {
    productName: string;
    productPrice: number;
    productStock: number;
    productDescription: ProductDescription[];
    materialCode: string;
    linkUrl: string;
    returnAvailable: boolean;
    reviewAvailable: boolean;
  };
  isTrending: boolean;
  keywords: string[];
  variants: VariantFormData[];
  unitType: string;
}

interface VariantCardProps {
  variantIndex: number;
  control: Control<AddProductFormData>;
  register: UseFormRegister<AddProductFormData>;
  errors: FieldErrors<AddProductFormData>;
  removeVariant: (index: number) => void;
  generateUnitId: () => string;
}

const VariantCard: React.FC<VariantCardProps> = ({
  variantIndex,
  control,
  register,
  errors,
  removeVariant,
  generateUnitId,
}) => {
  const { fields: unitFields, append: appendUnit, remove: removeUnit } = useFieldArray({
    control,
    name: `variants.${variantIndex}.units`,
  });

  const addUnit = () => {
    appendUnit({
      id: generateUnitId(),
      index: unitFields.length,
      mrp: 0,
      price: 0,
      stock: 0,
      unit: '',
    });
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Variant {variantIndex + 1}</h3>
        <button
          type="button"
          onClick={() => removeVariant(variantIndex)}
          className="flex items-center gap-2 rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-200"
        >
          <HiTrash className="h-4 w-4" />
          Remove Variant
        </button>
      </div>

      <div className="space-y-4">
        {/* Variant Color */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Color Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register(`variants.${variantIndex}.color`, { required: 'Color name is required' })}
              placeholder="e.g., Red, Blue, Black"
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
            />
            {errors.variants?.[variantIndex]?.color && (
              <p className="mt-1 text-sm text-red-600">{errors.variants[variantIndex]?.color?.message}</p>
            )}
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Color Code <span className="text-red-500">*</span>
            </label>
            <Controller
              name={`variants.${variantIndex}.colorCode`}
              control={control}
              rules={{ required: 'Color code is required' }}
              render={({ field }) => (
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={field.value || '#000000'}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="h-10 w-20 cursor-pointer rounded-lg border border-gray-200"
                  />
                  <input
                    type="text"
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value)}
                    placeholder="#000000"
                    className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                  />
                </div>
              )}
            />
            {errors.variants?.[variantIndex]?.colorCode && (
              <p className="mt-1 text-sm text-red-600">{errors.variants[variantIndex]?.colorCode?.message}</p>
            )}
          </div>
        </div>

        {/* Max Buy Quantity */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Max Buy Quantity <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            {...register(`variants.${variantIndex}.maxBuyQuantity`, {
              required: 'Max buy quantity is required',
              min: { value: 1, message: 'Must be at least 1' },
            })}
            placeholder="Maximum quantity a customer can buy"
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
          />
          {errors.variants?.[variantIndex]?.maxBuyQuantity && (
            <p className="mt-1 text-sm text-red-600">{errors.variants[variantIndex]?.maxBuyQuantity?.message}</p>
          )}
        </div>

        {/* Product Images */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Product Images</label>
          <Controller
            name={`variants.${variantIndex}.productImages`}
            control={control}
            render={({ field }) => (
              <div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter image URL"
                    className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        if (input.value.trim()) {
                          field.onChange([...field.value, input.value.trim()]);
                          input.value = '';
                        }
                      }
                    }}
                  />
                </div>
                {field.value && field.value.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {field.value.map((image, imgIndex) => (
                      <div key={imgIndex} className="relative group">
                        <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-sm text-primary">
                          <FiImage className="h-4 w-4" />
                          <span className="max-w-[200px] truncate">{image}</span>
                          <button
                            type="button"
                            onClick={() => {
                              field.onChange(field.value.filter((_, i) => i !== imgIndex));
                            }}
                            className="text-primary hover:text-red-600"
                          >
                            <HiXCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          />
        </div>

        {/* Units Section */}
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-base font-semibold text-gray-900">Units</h4>
            <button
              type="button"
              onClick={addUnit}
              className="flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white transition hover:bg-primary/90"
            >
              <HiPlus className="h-4 w-4" />
              Add Unit
            </button>
          </div>

          {unitFields.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
              <HiCube className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">No units added. Add a unit to set pricing and stock.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {unitFields.map((unit, unitIndex) => (
                <div key={unit.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h5 className="text-sm font-semibold text-gray-900">Unit {unitIndex + 1}</h5>
                    <button
                      type="button"
                      onClick={() => removeUnit(unitIndex)}
                      className="flex items-center gap-1 rounded-lg bg-red-100 px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-200"
                    >
                      <HiTrash className="h-3 w-3" />
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Unit */}
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-700">
                        Unit <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        {...register(`variants.${variantIndex}.units.${unitIndex}.unit`, {
                          required: 'Unit is required',
                        })}
                        placeholder="e.g., 1kg, 500g, 1L"
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                      />
                      {errors.variants?.[variantIndex]?.units?.[unitIndex]?.unit && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.variants[variantIndex]?.units?.[unitIndex]?.unit?.message}
                        </p>
                      )}
                    </div>

                    {/* Index */}
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-700">
                        Index <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        {...register(`variants.${variantIndex}.units.${unitIndex}.index`, {
                          required: 'Index is required',
                          valueAsNumber: true,
                        })}
                        placeholder="Display order"
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                      />
                      {errors.variants?.[variantIndex]?.units?.[unitIndex]?.index && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.variants[variantIndex]?.units?.[unitIndex]?.index?.message}
                        </p>
                      )}
                    </div>

                    {/* MRP */}
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-700">
                        MRP (₹) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <HiCurrencyRupee className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          step="0.01"
                          {...register(`variants.${variantIndex}.units.${unitIndex}.mrp`, {
                            required: 'MRP is required',
                            min: { value: 0, message: 'MRP must be 0 or greater' },
                            valueAsNumber: true,
                          })}
                          placeholder="0.00"
                          className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                        />
                      </div>
                      {errors.variants?.[variantIndex]?.units?.[unitIndex]?.mrp && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.variants[variantIndex]?.units?.[unitIndex]?.mrp?.message}
                        </p>
                      )}
                    </div>

                    {/* Price */}
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-700">
                        Price (₹) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <HiCurrencyRupee className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          step="0.01"
                          {...register(`variants.${variantIndex}.units.${unitIndex}.price`, {
                            required: 'Price is required',
                            min: { value: 0, message: 'Price must be 0 or greater' },
                            valueAsNumber: true,
                          })}
                          placeholder="0.00"
                          className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                        />
                      </div>
                      {errors.variants?.[variantIndex]?.units?.[unitIndex]?.price && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.variants[variantIndex]?.units?.[unitIndex]?.price?.message}
                        </p>
                      )}
                    </div>

                    {/* Stock */}
                    <div className="col-span-2">
                      <label className="mb-1 block text-xs font-medium text-gray-700">
                        Stock <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        {...register(`variants.${variantIndex}.units.${unitIndex}.stock`, {
                          required: 'Stock is required',
                          min: { value: 0, message: 'Stock cannot be negative' },
                          valueAsNumber: true,
                        })}
                        placeholder="Available stock quantity"
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                      />
                      {errors.variants?.[variantIndex]?.units?.[unitIndex]?.stock && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.variants[variantIndex]?.units?.[unitIndex]?.stock?.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AddProduct: React.FC = () => {
  const { productId } = useParams<{ productId?: string }>();
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!productId;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<AddProductFormData>({
    defaultValues: {
      webLinkName: '',
      brandDetails: { brandId: '', brandName: '' },
      categoryIds: [],
      taxDetails: {
        cgst: 0,
        sgst: 0,
        gstPercentage: 0,
        hsnCode: 0,
      },
      productDetails: {
        productName: '',
        productPrice: 0,
        productStock: 0,
        productDescription: [],
        materialCode: '',
        linkUrl: '',
        returnAvailable: false,
        reviewAvailable: false,
      },
      isTrending: false,
      keywords: [],
      variants: [],
      unitType: '',
    },
    mode: 'onTouched',
  });

  const { fields: descriptionFields, append: appendDescription, remove: removeDescription } = useFieldArray({
    control,
    name: 'productDetails.productDescription',
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: 'variants',
  });

  const watchedKeywords = watch('keywords');
  const [keywordInput, setKeywordInput] = useState('');

  const addKeyword = () => {
    if (keywordInput.trim()) {
      const currentKeywords = watchedKeywords || [];
      if (!currentKeywords.includes(keywordInput.trim())) {
        setValue('keywords', [...currentKeywords, keywordInput.trim()]);
        setKeywordInput('');
      } else {
        toast.error('Keyword already exists');
      }
    }
  };

  const removeKeyword = (index: number) => {
    const currentKeywords = watchedKeywords || [];
    setValue('keywords', currentKeywords.filter((_, i) => i !== index));
  };

  // Helper function to generate unique IDs
  const generateId = () => {
    return `variant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const generateUnitId = () => {
    return `unit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const addVariant = () => {
    appendVariant({
      id: generateId(),
      color: '',
      colorCode: '#000000',
      maxBuyQuantity: 1,
      productImages: [],
      units: [],
    });
  };

  // Load product data when in edit mode
  useEffect(() => {
    const loadProductData = async () => {
      if (!productId) return;

      setIsLoading(true);
      try {
        const productData = await getProductFromDatabase(productId);
        
        if (!productData) {
          toast.error('Product not found');
          navigate('/product-management/add-product');
          return;
        }

        // Convert variants Record to array format for form
        const variantsArray: VariantFormData[] = Object.values(productData.variants).map((variant) => ({
          id: variant.id,
          color: variant.color,
          colorCode: variant.colorCode,
          maxBuyQuantity: variant.maxBuyQuantity,
          productImages: variant.productImages,
          units: Object.values(variant.units), // Convert Record to array
        }));

        // Reset form with product data
        reset({
          webLinkName: productData.webLinkName,
          brandDetails: productData.brandDetails,
          categoryIds: productData.categoryIds,
          taxDetails: productData.taxDetails,
          productDetails: {
            productName: productData.productDetails.productName,
            productPrice: productData.productDetails.productPrice,
            productStock: productData.productDetails.productStock,
            productDescription: productData.productDetails.productDescription,
            materialCode: productData.productDetails.materialCode || '',
            linkUrl: productData.productDetails.linkUrl || '',
            returnAvailable: productData.productDetails.returnAvailable,
            reviewAvailable: productData.productDetails.reviewAvailable,
          },
          isTrending: productData.isTrending,
          keywords: productData.keywords || [],
          variants: variantsArray,
          unitType: productData.unitType,
        });
      } catch (error) {
        console.error('Error loading product:', error);
        toast.error('Failed to load product data');
      } finally {
        setIsLoading(false);
      }
    };

    loadProductData();
  }, [productId, reset, navigate]);

  const onSubmit = async (data: AddProductFormData) => {
    setIsSubmitting(true);
    try {
      const savedProductId = await productStoreToDatabase(data, productId);
      
      // Fetch the saved product to update Redux
      const savedProduct = await getProductFromDatabase(savedProductId);
      
      if (savedProduct) {
        // Update Redux store
        if (isEditMode) {
          dispatch(updateProduct({ product: savedProduct }));
        } else {
          dispatch(addProduct({ product: savedProduct }));
        }
      }
      
      if (isEditMode) {
        toast.success('Product updated successfully!');
      } else {
        toast.success('Product added successfully!');
      }
      
      // Navigate to products list
      navigate('/product-management');
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(isEditMode ? 'Failed to update product. Please try again.' : 'Failed to add product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">Loading product data...</p>
        </div>
      </div>
    );
  }

  return (
    <div >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900">
          {isEditMode ? 'Edit Product' : 'Add New Product'}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {isEditMode 
            ? 'Update the product details below' 
            : 'Fill in the details to add a new product to your store'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information Section */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <HiShoppingBag className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
          </div>
          <div className="space-y-5">
            {/* Web Link Name */}
            <div>
              <label htmlFor="webLinkName" className="mb-2 block text-sm font-medium text-gray-700">
                Web Link Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <HiLink className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="webLinkName"
                  type="text"
                  {...register('webLinkName', { required: 'Web link name is required' })}
                  placeholder="e.g., premium-cotton-shirt"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-12 py-3 text-sm text-gray-900 transition focus:border-primary focus:bg-white  outline-none"
                />
              </div>
              {errors.webLinkName && <p className="mt-1 text-sm text-red-600">{errors.webLinkName.message}</p>}
            </div>

            {/* Brand Details */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Brand Details <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    {...register('brandDetails.brandId', { required: 'Brand ID is required' })}
                    placeholder="Brand ID"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 transition focus:border-primary focus:bg-white  outline-none"
                  />
                  {errors.brandDetails?.brandId && (
                    <p className="mt-1 text-sm text-red-600">{errors.brandDetails.brandId.message}</p>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    {...register('brandDetails.brandName', { required: 'Brand name is required' })}
                    placeholder="Brand Name"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 transition focus:border-primary focus:bg-white  outline-none"
                  />
                  {errors.brandDetails?.brandName && (
                    <p className="mt-1 text-sm text-red-600">{errors.brandDetails.brandName.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Categories <span className="text-red-500">*</span>
              </label>
              <Controller
                name="categoryIds"
                control={control}
                rules={{ required: 'At least one category is required' }}
                render={({ field }) => (
                  <div>
                    <input
                      type="text"
                      value={field.value?.join(', ') || ''}
                      onChange={(e) => {
                        const categories = e.target.value.split(',').map((cat) => cat.trim()).filter(Boolean);
                        field.onChange(categories);
                      }}
                      placeholder="Enter categories separated by commas (e.g., Electronics, Mobile)"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 transition focus:border-primary focus:bg-white  outline-none"
                    />
                    {errors.categoryIds && <p className="mt-1 text-sm text-red-600">{errors.categoryIds.message}</p>}
                  </div>
                )}
              />
            </div>

            {/* Unit Type */}
            <div>
              <label htmlFor="unitType" className="mb-2 block text-sm font-medium text-gray-700">
                Unit Type <span className="text-red-500">*</span>
              </label>
              <select
                id="unitType"
                {...register('unitType', { required: 'Unit type is required' })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 transition focus:border-primary focus:bg-white  outline-none"
              >
                <option value="">Select unit type</option>
                <option value="piece">Piece</option>
                <option value="kg">Kilogram</option>
                <option value="gram">Gram</option>
                <option value="liter">Liter</option>
                <option value="ml">Milliliter</option>
                <option value="meter">Meter</option>
                <option value="cm">Centimeter</option>
              </select>
              {errors.unitType && <p className="mt-1 text-sm text-red-600">{errors.unitType.message}</p>}
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <FiPackage className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold text-gray-900">Product Details</h2>
          </div>

          <div className="space-y-5">
            {/* Product Name */}
            <div>
              <label htmlFor="productName" className="mb-2 block text-sm font-medium text-gray-700">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                id="productName"
                type="text"
                {...register('productDetails.productName', { required: 'Product name is required' })}
                placeholder="Enter product name"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 transition focus:border-primary focus:bg-white  outline-none"
              />
              {errors.productDetails?.productName && (
                <p className="mt-1 text-sm text-red-600">{errors.productDetails.productName.message}</p>
              )}
            </div>

            {/* Product Price */}
            <div>
              <label htmlFor="productPrice" className="mb-2 block text-sm font-medium text-gray-700">
                Product Price (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <HiCurrencyRupee className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="productPrice"
                  type="number"
                  step="0.01"
                  {...register('productDetails.productPrice', {
                    required: 'Product price is required',
                    min: { value: 0, message: 'Price must be greater than 0' },
                  })}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-12 py-3 text-sm text-gray-900 transition focus:border-primary focus:bg-white  outline-none"
                />
              </div>
              {errors.productDetails?.productPrice && (
                <p className="mt-1 text-sm text-red-600">{errors.productDetails.productPrice.message}</p>
              )}
            </div>

            {/* Product Stock */}
            <div>
              <label htmlFor="productStock" className="mb-2 block text-sm font-medium text-gray-700">
                Product Stock <span className="text-red-500">*</span>
              </label>
              <input
                id="productStock"
                type="number"
                {...register('productDetails.productStock', {
                  required: 'Product stock is required',
                  min: { value: 0, message: 'Stock cannot be negative' },
                })}
                placeholder="Enter available stock"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 transition focus:border-primary focus:bg-white  outline-none"
              />
              {errors.productDetails?.productStock && (
                <p className="mt-1 text-sm text-red-600">{errors.productDetails.productStock.message}</p>
              )}
            </div>

            {/* Material Code */}
            <div>
              <label htmlFor="materialCode" className="mb-2 block text-sm font-medium text-gray-700">
                Material Code
              </label>
              <input
                id="materialCode"
                type="text"
                {...register('productDetails.materialCode')}
                placeholder="Enter material code"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 transition focus:border-primary focus:bg-white  outline-none"
              />
            </div>

            {/* Link URL */}
            <div>
              <label htmlFor="linkUrl" className="mb-2 block text-sm font-medium text-gray-700">
                Product Link URL
              </label>
              <div className="relative">
                <HiLink className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="linkUrl"
                  type="url"
                  {...register('productDetails.linkUrl')}
                  placeholder="https://example.com/product"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-12 py-3 text-sm text-gray-900 transition focus:border-primary focus:bg-white  outline-none"
                />
              </div>
            </div>

            {/* Product Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Product Description</label>
              {descriptionFields.map((field, index) => (
                <div key={field.id} className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="mb-3">
                    <input
                      type="text"
                      {...register(`productDetails.productDescription.${index}.mainHeading`)}
                      placeholder="Main Heading"
                      className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary  outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Controller
                      name={`productDetails.productDescription.${index}.details`}
                      control={control}
                      render={({ field: descField }) => {
                        // Convert Record<string, string> to string format (key: value, one per line)
                        const recordToString = (record: Record<string, string>): string => {
                          return Object.entries(record)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join('\n');
                        };

                        // Convert string back to Record<string, string>
                        const stringToRecord = (str: string): Record<string, string> => {
                          const record: Record<string, string> = {};
                          str.split('\n').forEach((line) => {
                            const trimmed = line.trim();
                            if (trimmed) {
                              const colonIndex = trimmed.indexOf(':');
                              if (colonIndex > 0) {
                                const key = trimmed.substring(0, colonIndex).trim();
                                const value = trimmed.substring(colonIndex + 1).trim();
                                if (key) {
                                  record[key] = value;
                                }
                              }
                            }
                          });
                          return record;
                        };

                        return (
                          <textarea
                            value={recordToString(descField.value || {})}
                            onChange={(e) => {
                              descField.onChange(stringToRecord(e.target.value));
                            }}
                            onBlur={descField.onBlur}
                            name={descField.name}
                            ref={descField.ref}
                            placeholder="Enter details (key: value format, one per line)"
                            rows={3}
                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary  outline-none"
                          />
                        );
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDescription(index)}
                    className="mt-2 flex items-center gap-2 text-sm text-red-600 transition hover:text-red-700"
                  >
                    <HiTrash className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => appendDescription({ mainHeading: '', details: {} })}
                className="flex items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                <HiPlus className="h-4 w-4" />
                Add Description Section
              </button>
            </div>

            {/* Return & Review Availability */}
            <div className="flex gap-6">
              <div className="flex items-center gap-3">
                <Controller
                  name="productDetails.returnAvailable"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <button
                      type="button"
                      onClick={() => onChange(!value)}
                      className={`flex h-12 w-12 items-center justify-center rounded-xl transition ${value ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}
                    >
                      {value ? <HiCheckCircle className="h-6 w-6" /> : <HiXCircle className="h-6 w-6" />}
                    </button>
                  )}
                />
                <div>
                  <label className="text-sm font-medium text-gray-700">Return Available</label>
                  <p className="text-xs text-gray-500">Allow customers to return this product</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Controller
                  name="productDetails.reviewAvailable"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <button
                      type="button"
                      onClick={() => onChange(!value)}
                      className={`flex h-12 w-12 items-center justify-center rounded-xl transition ${value ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}
                    >
                      {value ? <HiCheckCircle className="h-6 w-6" /> : <HiXCircle className="h-6 w-6" />}
                    </button>
                  )}
                />
                <div>
                  <label className="text-sm font-medium text-gray-700">Review Available</label>
                  <p className="text-xs text-gray-500">Allow customers to review this product</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tax & Pricing Section */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <HiCurrencyRupee className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold text-gray-900">Tax & Pricing Details</h2>
          </div>

          <div className="space-y-5">
            {/* HSN Code */}
            <div>
              <label htmlFor="hsnCode" className="mb-2 block text-sm font-medium text-gray-700">
                HSN Code <span className="text-red-500">*</span>
              </label>
              <input
                id="hsnCode"
                type="number"
                {...register('taxDetails.hsnCode', {
                  required: 'HSN code is required',
                  min: { value: 0, message: 'HSN code must be valid' },
                })}
                placeholder="Enter HSN code"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 transition focus:border-primary focus:bg-white  outline-none"
              />
              {errors.taxDetails?.hsnCode && (
                <p className="mt-1 text-sm text-red-600">{errors.taxDetails.hsnCode.message}</p>
              )}
            </div>

            {/* GST Percentage */}
            <div>
              <label htmlFor="gstPercentage" className="mb-2 block text-sm font-medium text-gray-700">
                GST Percentage (%) <span className="text-red-500">*</span>
              </label>
              <input
                id="gstPercentage"
                type="number"
                step="0.01"
                {...register('taxDetails.gstPercentage', {
                  required: 'GST percentage is required',
                  min: { value: 0, message: 'GST percentage must be 0 or greater' },
                  max: { value: 100, message: 'GST percentage cannot exceed 100' },
                })}
                placeholder="e.g., 18"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 transition focus:border-primary focus:bg-white  outline-none"
              />
              {errors.taxDetails?.gstPercentage && (
                <p className="mt-1 text-sm text-red-600">{errors.taxDetails.gstPercentage.message}</p>
              )}
            </div>

            {/* CGST */}
            <div>
              <label htmlFor="cgst" className="mb-2 block text-sm font-medium text-gray-700">
                CGST (%) <span className="text-red-500">*</span>
              </label>
              <input
                id="cgst"
                type="number"
                step="0.01"
                {...register('taxDetails.cgst', {
                  required: 'CGST is required',
                  min: { value: 0, message: 'CGST must be 0 or greater' },
                })}
                placeholder="e.g., 9"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 transition focus:border-primary focus:bg-white  outline-none"
              />
              {errors.taxDetails?.cgst && (
                <p className="mt-1 text-sm text-red-600">{errors.taxDetails.cgst.message}</p>
              )}
            </div>

            {/* SGST */}
            <div>
              <label htmlFor="sgst" className="mb-2 block text-sm font-medium text-gray-700">
                SGST (%) <span className="text-red-500">*</span>
              </label>
              <input
                id="sgst"
                type="number"
                step="0.01"
                {...register('taxDetails.sgst', {
                  required: 'SGST is required',
                  min: { value: 0, message: 'SGST must be 0 or greater' },
                })}
                placeholder="e.g., 9"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 transition focus:border-primary focus:bg-white  outline-none"
              />
              {errors.taxDetails?.sgst && (
                <p className="mt-1 text-sm text-red-600">{errors.taxDetails.sgst.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Variants Section */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HiCube className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold text-gray-900">Product Variants</h2>
            </div>
            <button
              type="button"
              onClick={addVariant}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
            >
              <HiPlus className="h-4 w-4" />
              Add Variant
            </button>
          </div>

          {variantFields.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
              <HiCube className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">No variants added yet. Click "Add Variant" to get started.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {variantFields.map((variant, variantIndex) => (
                <VariantCard
                  key={variant.id}
                  variantIndex={variantIndex}
                  control={control}
                  register={register}
                  errors={errors}
                  removeVariant={removeVariant}
                  generateUnitId={generateUnitId}
                />
              ))}
            </div>
          )}
        </div>

        {/* Settings Section */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <FiFileText className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold text-gray-900">Additional Settings</h2>
          </div>

          <div className="space-y-5">
            {/* Is Trending */}
            <div className="flex items-center gap-3">
              <Controller
                name="isTrending"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <button
                    type="button"
                    onClick={() => onChange(!value)}
                    className={`flex h-12 w-12 items-center justify-center rounded-xl transition ${value ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                      }`}
                  >
                    {value ? <HiCheckCircle className="h-6 w-6" /> : <HiXCircle className="h-6 w-6" />}
                  </button>
                )}
              />
              <div>
                <label className="text-sm font-medium text-gray-700">Mark as Trending</label>
                <p className="text-xs text-gray-500">Show this product in trending section</p>
              </div>
            </div>

            {/* Keywords */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Keywords</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addKeyword();
                    }
                  }}
                  placeholder="Enter keyword and press Enter"
                  className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 transition focus:border-primary focus:bg-white  outline-none"
                />
                <button
                  type="button"
                  onClick={addKeyword}
                  className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white transition hover:bg-primary/90"
                >
                  Add
                </button>
              </div>
              {watchedKeywords && watchedKeywords.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {watchedKeywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary"
                    >
                      <HiTag className="h-4 w-4" />
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(index)}
                        className="text-primary hover:text-red-600"
                      >
                        <HiXCircle className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <button
            type="button"
            onClick={() => {
              // Reset form or navigate back
              toast.success('Form cleared');
            }}
            className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Clear Form
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-gradient-to-r from-primary to-secondary px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting 
              ? (isEditMode ? 'Updating Product...' : 'Adding Product...') 
              : (isEditMode ? 'Update Product' : 'Add Product')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
