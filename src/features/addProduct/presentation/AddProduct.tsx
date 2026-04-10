import React, { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import type { Control, UseFormRegister, FieldErrors, UseFormSetValue, UseFormClearErrors } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { HiShoppingBag, HiTag, HiCurrencyRupee, HiCube, HiLink, HiCheckCircle, HiXCircle, HiPlus, HiTrash } from 'react-icons/hi';
import { FiPackage, FiFileText } from 'react-icons/fi';
import toast from 'react-hot-toast';
import type { BrandDetail, ProductDescription, VariantUnit } from '../../products/data/productTypes';
import { productStoreToDatabase, getProductFromDatabase } from '../utils/productDatabase';
import { compressImage } from '../utils/compressImage';
import { addProduct, updateProduct } from '../../products/redux/productSlice';
import type { AppDispatch, RootState } from '../../../general/redux/store';
import SelectBrandModal from './components/SelectBrandModal';
import SelectFirstCategoryModal from './components/SelectFirstCategoryModal';
import SelectSecondCategoryModal from './components/SelectSecondCategoryModal';
import SelectThirdCategoryModal from './components/SelectThirdCategoryModal';
import SelectFourthCategoryModal from './components/SelectFourthCategoryModal';
import SelectKeywordModal from './components/SelectKeywordModal';
import SelectVariantModal from './components/SelectVariantModal';
import SelectUnitModal from './components/SelectUnitModal';
import VariantImageUploader from './components/VariantImageUploader';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../firebaseConfig';

export interface VariantFormData {
  id: string;
  variantId: string; // color/variant id from SelectVariantModal
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
  selectedKeywords: { id: string; keywordName: string }[];
  taxDetails: {
    gstPercentage: number;
    hsnCode: number;
  };
  productDetails: {
    productName: string;
    productDescription: ProductDescription[];
    materialCode: string;
    linkUrl: string;
    returnAvailable: boolean;
    reviewAvailable: boolean;
    cashOnDeliveryAvailable: boolean;
  };
  isTrending: boolean;
  isActive: boolean;
  variants: VariantFormData[];
  unitType: string;
}

interface VariantCardProps {
  variantIndex: number;
  variantId: string;
  control: Control<AddProductFormData>;
  register: UseFormRegister<AddProductFormData>;
  errors: FieldErrors<AddProductFormData>;
  removeVariant: (index: number) => void;
  generateUnitId: () => string;
  setValue: UseFormSetValue<AddProductFormData>;
  clearErrors: UseFormClearErrors<AddProductFormData>;
  onVariantFilesChange: (variantId: string, files: File[]) => void;
}

const VariantCard: React.FC<VariantCardProps> = ({
  variantIndex,
  variantId,
  control,
  register,
  errors,
  removeVariant,
  generateUnitId,
  setValue,
  clearErrors,
  onVariantFilesChange,
}) => {
  const { fields: unitFields, append: appendUnit, remove: removeUnit } = useFieldArray({
    control,
    name: `variants.${variantIndex}.units`,
  });

  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [unitIndexForUnitModal, setUnitIndexForUnitModal] = useState<number | null>(null);
  const isUnitModalOpen = unitIndexForUnitModal !== null;

  const addUnit = () => {
    appendUnit({
      id: generateUnitId(),
      index: unitFields.length,
      mrp: 0,
      price: 0,
      stock: 0,
      unit: '',
      unitId: '',
    });
    clearErrors(`variants.${variantIndex}.units` as any);
  };

  const handleUnitConfirm = (unit: { id: string; name: string }) => {
    if (unitIndexForUnitModal === null) return;
    setValue(`variants.${variantIndex}.units.${unitIndexForUnitModal}.unit`, unit.name);
    setValue(`variants.${variantIndex}.units.${unitIndexForUnitModal}.unitId`, unit.id);
    setUnitIndexForUnitModal(null);
  };

  const handleVariantColorConfirm = (color: { id: string; name: string; hexCode: string }) => {
    setValue(`variants.${variantIndex}.variantId`, color.id);
    setValue(`variants.${variantIndex}.color`, color.name);
    setValue(`variants.${variantIndex}.colorCode`, color.hexCode);
    setIsVariantModalOpen(false);
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
        {/* Variant Color - single field: color name + hex code */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Select Variant <span className="text-red-500">*</span>
          </label>
          <Controller
            name={`variants.${variantIndex}.color`}
            control={control}
            rules={{ required: 'Color is required' }}
            render={({ field: colorField }) => (
              <Controller
                name={`variants.${variantIndex}.colorCode`}
                control={control}
                rules={{ required: 'Color code is required' }}
                render={({ field: codeField }) => (
                  <button
                    type="button"
                    onClick={() => setIsVariantModalOpen(true)}
                    className="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 transition hover:border-primary focus:border-primary outline-none text-left"
                  >
                    {colorField.value && codeField.value ? (
                      <>
                        <span
                          className="flex-shrink-0 h-8 w-8 rounded-full border border-gray-200"
                          style={{ backgroundColor: codeField.value }}
                        />
                        <span className="flex-1 min-w-0 truncate">
                          {colorField.value} ({codeField.value})
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-400">Click to select color</span>
                    )}
                  </button>
                )}
              />
            )}
          />
          {(errors.variants?.[variantIndex]?.color || errors.variants?.[variantIndex]?.colorCode) && (
            <p className="mt-1 text-sm text-red-600">
              {errors.variants[variantIndex]?.color?.message || errors.variants[variantIndex]?.colorCode?.message}
            </p>
          )}
        </div>

        <SelectVariantModal
          isOpen={isVariantModalOpen}
          onClose={() => setIsVariantModalOpen(false)}
          onConfirm={handleVariantColorConfirm}
          title="Select Variant Color"
        />

        <SelectUnitModal
          isOpen={isUnitModalOpen}
          onClose={() => setUnitIndexForUnitModal(null)}
          onConfirm={handleUnitConfirm}
          title="Select Unit"
        />

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
            onWheel={(e) => e.currentTarget.blur()}
            placeholder="Maximum quantity a customer can buy"
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
          />
          {errors.variants?.[variantIndex]?.maxBuyQuantity && (
            <p className="mt-1 text-sm text-red-600">{errors.variants[variantIndex]?.maxBuyQuantity?.message}</p>
          )}
        </div>

        {/* Product Images */}
        <Controller
          name={`variants.${variantIndex}.productImages`}
          control={control}
          render={({ field }) => (
            <VariantImageUploader
              variantId={variantId}
              existingImages={field.value || []}
              onExistingImagesChange={field.onChange}
              onNewFilesChange={onVariantFilesChange}
            />
          )}
        />

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
              {(errors.variants?.[variantIndex]?.units as { message?: string } | undefined)?.message && (
                <p className="mt-2 text-sm text-red-600">{(errors.variants?.[variantIndex]?.units as { message: string }).message}</p>
              )}
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
                      <Controller
                        name={`variants.${variantIndex}.units.${unitIndex}.unit`}
                        control={control}
                        rules={{ required: 'Unit is required' }}
                        render={({ field }) => (
                          <button
                            type="button"
                            onClick={() => setUnitIndexForUnitModal(unitIndex)}
                            className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 transition hover:border-primary focus:border-primary outline-none text-left"
                          >
                            {field.value ? (
                              <span className="flex-1 min-w-0 truncate">{field.value}</span>
                            ) : (
                              <span className="text-gray-400">Click to select unit</span>
                            )}
                          </button>
                        )}
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
                        onWheel={(e) => e.currentTarget.blur()}
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
                          onWheel={(e) => e.currentTarget.blur()}
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
                          onWheel={(e) => e.currentTarget.blur()}
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
                        onWheel={(e) => e.currentTarget.blur()}
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
  const [variantImageFiles, setVariantImageFiles] = useState<Record<string, File[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isKeywordModalOpen, setIsKeywordModalOpen] = useState(false);
  const [categoryModalLevel, setCategoryModalLevel] = useState<'first' | 'second' | 'third' | 'fourth' | null>(null);
  const [categoryDisplayNames, setCategoryDisplayNames] = useState<string[]>([]);
  const isEditMode = !!productId;

  const { storeTheme } = useSelector((state: RootState) => state.theme);
  const categorySettings = storeTheme?.categorySettings ?? {
    firstCategoryEnabled: false,
    secondCategoryEnabled: false,
    thirdCategoryEnabled: false,
    fourthCategoryEnabled: false,
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
    reset,
    setError,
    clearErrors,
  } = useForm<AddProductFormData>({
    defaultValues: {
      webLinkName: '',
      brandDetails: { brandId: '', brandName: '', brandImage: null },
      categoryIds: [],
      taxDetails: {
        gstPercentage: 0,
        hsnCode: 0,
      },
      productDetails: {
        productName: '',
        productDescription: [],
        materialCode: '',
        linkUrl: '',
        returnAvailable: false,
        reviewAvailable: false,
        cashOnDeliveryAvailable: false,
      },
      isTrending: false,
      isActive: true,
      selectedKeywords: [],
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

  const selectedKeywords = watch('selectedKeywords') || [];
  const watchedVariants = watch('variants') || [];

  const removeKeyword = (index: number) => {
    const current = selectedKeywords.slice();
    current.splice(index, 1);
    setValue('selectedKeywords', current);
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
      variantId: '',
      color: '',
      colorCode: '#000000',
      maxBuyQuantity: 1,
      productImages: [],
      units: [],
    });
    clearErrors('variants');
  };

  const handleVariantFilesChange = (variantId: string, files: File[]) => {
    setVariantImageFiles((prev) => ({
      ...prev,
      [variantId]: files,
    }));
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
          variantId: variant.variantId ?? '',
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
            productDescription: productData.productDetails.productDescription,
            materialCode: productData.productDetails.materialCode || '',
            linkUrl: productData.productDetails.linkUrl || '',
            returnAvailable: productData.productDetails.returnAvailable,
            reviewAvailable: productData.productDetails.reviewAvailable,
            cashOnDeliveryAvailable: productData.productDetails.cashOnDeliveryAvailable ?? false,
          },
          isTrending: productData.isTrending,
          isActive: productData.isActive ?? true,
          selectedKeywords: ((productData as any).keywordIds || []).map((id: string) => ({
            id,
            keywordName: id,
          })),
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
    // Validate: at least one variant and each variant must have at least one unit
    clearErrors('variants');
    (data.variants || []).forEach((_, i) => clearErrors(`variants.${i}.units` as any));

    if (!data.variants || data.variants.length === 0) {
      setError('variants', { type: 'manual', message: 'Add at least one variant.' });
      toast.error('Add at least one variant before submitting.');
      return;
    }

    const variantsWithoutUnits: number[] = [];
    (data.variants || []).forEach((v, i) => {
      if (!v.units || v.units.length === 0) {
        variantsWithoutUnits.push(i);
        setError(`variants.${i}.units` as any, { type: 'minUnits', message: 'Add at least one unit for this variant.' });
      }
    });
    if (variantsWithoutUnits.length > 0) {
      toast.error('Each variant must have at least one unit.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload newly selected images for each variant and merge with existing URLs
      const processedVariants: VariantFormData[] = await Promise.all(
        (data.variants || []).map(async (variant) => {
          const variantId = variant.id;
          const existingImages = variant.productImages || [];
          const newFiles = variantImageFiles[variantId] || [];

          if (newFiles.length === 0) {
            return {
              ...variant,
              productImages: existingImages,
            };
          }

          const uploadedUrls: string[] = [...existingImages];

          // Compress images in parallel to reduce file size and upload time
          const compressedFiles = await Promise.all(newFiles.map((file) => compressImage(file)));

          await Promise.all(
            compressedFiles.map(async (file, index) => {
              const fileName = `${variantId}_${index}_${Date.now()}`;
              const storageRef = ref(storage, `products/${fileName}`);
              await uploadBytes(storageRef, file);
              const url = await getDownloadURL(storageRef);
              uploadedUrls.push(url);
            }),
          );

          return {
            ...variant,
            productImages: uploadedUrls,
          };
        }),
      );

      const payload: AddProductFormData = {
        ...data,
        variants: processedVariants,
      };

      const savedProductId = await productStoreToDatabase(payload, productId);

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
      toast.error(
        isEditMode ? 'Failed to update product. Please try again.' : 'Failed to add product. Please try again.',
      );
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
        <div className="rounded-2xl bg-white p-6">
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
              <div className="space-y-3">
                {/* Brand Selection Input */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={watch('brandDetails.brandName') || ''}
                      readOnly
                      onClick={() => setIsBrandModalOpen(true)}
                      placeholder="Click to select brand"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 transition focus:border-primary focus:bg-white cursor-pointer outline-none"
                    />
                    {errors.brandDetails?.brandName && (
                      <p className="mt-1 text-sm text-red-600">{errors.brandDetails.brandName.message}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsBrandModalOpen(true)}
                    className="rounded-md bg-secondary px-6 py-3 text-sm font-medium text-white transition hover:bg-secondary/90 whitespace-nowrap"
                  >
                    Select Brand
                  </button>
                </div>

                {/* Selected Brand Details Display */}
                {watch('brandDetails.brandId') && watch('brandDetails.brandName') && (
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {watch('brandDetails.brandImage') && (
                          <div className="flex-shrink-0">
                            <img
                              src={watch('brandDetails.brandImage') || ''}
                              alt={watch('brandDetails.brandName')}
                              className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            Selected Brand: {watch('brandDetails.brandName')}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Brand ID: {watch('brandDetails.brandId')}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setValue('brandDetails.brandId', '');
                          setValue('brandDetails.brandName', '');
                          setValue('brandDetails.brandImage', null);
                        }}
                        className="text-red-600 hover:text-red-700 transition"
                        aria-label="Clear brand selection"
                      >
                        <HiXCircle className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Categories - show buttons only for enabled levels in settings */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              {categorySettings.firstCategoryEnabled && (
                <div>
                  <label className="mb-2  block text-sm font-medium text-gray-700">
                    Categories <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="categoryIds"
                    control={control}
                    rules={{
                      validate: (value) =>
                        !categorySettings.firstCategoryEnabled || (value && value.length >= 1) || 'Select at least the first category',
                    }}
                    render={({ field }) => (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                        {/* 1st Category */}
                        <div className="flex border border-gray-200 rounded-md p-2 flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setCategoryModalLevel('first')}
                            className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-white transition hover:bg-secondary/90"
                          >
                            {field.value?.[0] ? (categoryDisplayNames[0] ? `1st: ${categoryDisplayNames[0]}` : '1st Category selected') : 'Select 1st Category'}
                          </button>
                          {field.value?.[0] && (
                            <button
                              type="button"
                              onClick={() => {
                                field.onChange([]);
                                setCategoryDisplayNames([]);
                              }}
                              className="text-red-600 hover:text-red-700 text-sm"
                              aria-label="Clear categories"
                            >
                              <HiXCircle className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                        {/* 2nd Category - only if enabled and 1st selected */}
                        {categorySettings.secondCategoryEnabled && field.value && field.value.length >= 1 && (
                          <div className="flex border border-gray-200 rounded-md p-2 flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setCategoryModalLevel('second')}
                              className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-white transition hover:bg-secondary/90"
                            >
                              {field.value?.[1] ? (categoryDisplayNames[1] ? `2nd: ${categoryDisplayNames[1]}` : '2nd Category selected') : 'Select 2nd Category'}
                            </button>
                            {field.value?.[1] && (
                              <button
                                type="button"
                                onClick={() => {
                                  field.onChange(field.value!.slice(0, 1));
                                  setCategoryDisplayNames((prev) => prev.slice(0, 1));
                                }}
                                className="text-red-600 hover:text-red-700 text-sm"
                                aria-label="Clear 2nd category"
                              >
                                <HiXCircle className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        )}
                        {/* 3rd Category */}
                        {categorySettings.thirdCategoryEnabled && field.value && field.value.length >= 2 && (
                          <div className="flex border border-gray-200 rounded-md p-2 flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setCategoryModalLevel('third')}
                              className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-white transition hover:bg-secondary/90"
                            >
                              {field.value?.[2] ? (categoryDisplayNames[2] ? `3rd: ${categoryDisplayNames[2]}` : '3rd Category selected') : 'Select 3rd Category'}
                            </button>
                            {field.value?.[2] && (
                              <button
                                type="button"
                                onClick={() => {
                                  field.onChange(field.value!.slice(0, 2));
                                  setCategoryDisplayNames((prev) => prev.slice(0, 2));
                                }}
                                className="text-red-600 hover:text-red-700 text-sm"
                                aria-label="Clear 3rd category"
                              >
                                <HiXCircle className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        )}
                        {/* 4th Category */}
                        {categorySettings.fourthCategoryEnabled && field.value && field.value.length >= 3 && (
                          <div className="flex border border-gray-200 rounded-md p-2 flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setCategoryModalLevel('fourth')}
                              className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-white transition hover:bg-secondary/90"
                            >
                              {field.value?.[3] ? (categoryDisplayNames[3] ? `4th: ${categoryDisplayNames[3]}` : '4th Category selected') : 'Select 4th Category'}
                            </button>
                            {field.value?.[3] && (
                              <button
                                type="button"
                                onClick={() => {
                                  field.onChange(field.value!.slice(0, 3));
                                  setCategoryDisplayNames((prev) => prev.slice(0, 3));
                                }}
                                className="text-red-600 hover:text-red-700 text-sm"
                                aria-label="Clear 4th category"
                              >
                                <HiXCircle className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        )}
                        {errors.categoryIds && <p className="mt-1 text-sm text-red-600">{errors.categoryIds.message}</p>}
                      </div>
                    )}
                  />
                </div>
              )}
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
        <div className="rounded-2xl bg-white p-6">
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

            {/* Link URL - YouTube or video explaining the product */}
            <div>
              <label htmlFor="linkUrl" className="mb-2 block text-sm font-medium text-gray-700">
                Product Link (Video)
              </label>
              <p className="mb-2 text-xs text-gray-500">
                Add a YouTube video link that explains or demonstrates this product.
              </p>
              <div className="relative">
                <HiLink className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="linkUrl"
                  type="url"
                  {...register('productDetails.linkUrl')}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-12 py-3 text-sm text-gray-900 transition focus:border-primary focus:bg-white  outline-none"
                />
              </div>
            </div>

            {/* Product Description */}
            <div className="p-3 rounded-xl border border-gray-200 bg-gray-50">
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
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => appendDescription({ mainHeading: '', details: {} })}
                  className="flex bg-secondary items-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-white transition hover:bg-secondary/90"
                >
                  <HiPlus className="h-4 w-4" />
                  Add Description Section
                </button>
              </div>
            </div>

            {/* Permissions - Return, Review & COD Availability */}
            <div className="p-3 rounded-xl border border-gray-200 bg-gray-50">
              <label className="mb-2 block text-sm font-medium text-gray-700">Permissions</label>
              <p className="mb-3 text-xs text-gray-500">
                Configure return, review, and cash on delivery availability for this product.
              </p>
              <div className="flex flex-wrap gap-6">
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
                <div className="flex items-center gap-3">
                  <Controller
                    name="productDetails.cashOnDeliveryAvailable"
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
                    <label className="text-sm font-medium text-gray-700">Cash on Delivery Available</label>
                    <p className="text-xs text-gray-500">Allow customers to pay with cash on delivery</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tax & Pricing Section */}
        <div className="rounded-2xl bg-white p-6">
          <div className="mb-6 flex items-center gap-3">
            <HiCurrencyRupee className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold text-gray-900">Tax & Pricing Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
            {/* HSN Code */}
            <div>
              <label htmlFor="hsnCode" className="mb-2 block text-sm font-medium text-gray-700">
                HSN Code
              </label>
              <input
                id="hsnCode"
                type="number"
                {...register('taxDetails.hsnCode', {
                  min: { value: 0, message: 'HSN code must be valid' },
                })}
                onWheel={(e) => e.currentTarget.blur()}
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
                GST Percentage (%)
              </label>
              <input
                id="gstPercentage"
                type="number"
                step="0.01"
                {...register('taxDetails.gstPercentage', {
                  min: { value: 0, message: 'GST percentage must be 0 or greater' },
                  max: { value: 100, message: 'GST percentage cannot exceed 100' },
                })}
                onWheel={(e) => e.currentTarget.blur()}
                placeholder="e.g., 18"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 transition focus:border-primary focus:bg-white  outline-none"
              />
              {errors.taxDetails?.gstPercentage && (
                <p className="mt-1 text-sm text-red-600">{errors.taxDetails.gstPercentage.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Variants Section */}
        <div className="rounded-2xl bg-white p-6">
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

          {errors.variants?.message && (
            <p className="mb-2 text-sm text-red-600">{errors.variants.message}</p>
          )}
          {variantFields.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
              <HiCube className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">No variants added yet. Click "Add Variant" to get started.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {variantFields.map((variantField, variantIndex) => {
                const variantValue = watchedVariants[variantIndex];
                const variantId = variantValue?.id || '';

                return (
                  <VariantCard
                    key={variantField.id}
                    variantIndex={variantIndex}
                    variantId={variantId}
                    control={control}
                    register={register}
                    errors={errors}
                    removeVariant={removeVariant}
                    generateUnitId={generateUnitId}
                    setValue={setValue}
                    clearErrors={clearErrors}
                    onVariantFilesChange={handleVariantFilesChange}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Settings Section */}
        <div className="rounded-2xl bg-white p-6">
          <div className="mb-6 flex items-center gap-3">
            <FiFileText className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold text-gray-900">Additional Settings</h2>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Is Trending */}
              <div className="flex items-center gap-3">
                <Controller
                  name="isTrending"
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
                  <label className="text-sm font-medium text-gray-700">Mark as Trending</label>
                  <p className="text-xs text-gray-500">Show this product in trending section</p>
                </div>
              </div>

              {/* Is Active */}
              <div className="flex items-center gap-3">
                <Controller
                  name="isActive"
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
                  <label className="text-sm font-medium text-gray-700">Active Product</label>
                  <p className="text-xs text-gray-500">Product is visible and available for sale</p>
                </div>
              </div>
            </div>

            <hr className="my-4 border-gray-200" />

            {/* Keywords */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Keywords</label>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsKeywordModalOpen(true)}
                  className="rounded-md bg-secondary px-6 py-3 text-sm font-medium text-white transition hover:bg-secondary/90 whitespace-nowrap"
                >
                  Select Keywords
                </button>
                {selectedKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 w-full">
                    {selectedKeywords.map((kw, index) => (
                      <span
                        key={kw.id}
                        className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-sm text-primary"
                      >
                        <HiTag className="h-4 w-4 flex-shrink-0" />
                        {kw.keywordName}
                        <button
                          type="button"
                          onClick={() => removeKeyword(index)}
                          className="text-primary hover:text-red-600 transition"
                          aria-label={`Remove ${kw.keywordName}`}
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
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 rounded-2xl bg-white p-6">
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

      {/* Brand Selection Modal */}
      <SelectBrandModal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
        onConfirm={(brand) => {
          setValue('brandDetails.brandId', brand.brandId);
          setValue('brandDetails.brandName', brand.brandName);
          setValue('brandDetails.brandImage', brand.brandImage);
          setIsBrandModalOpen(false);
        }}
        selectedBrandId={watch('brandDetails.brandId')}
        title="Select Brand"
      />

      {/* Category Selection Modals */}
      <SelectFirstCategoryModal
        isOpen={categoryModalLevel === 'first'}
        onClose={() => setCategoryModalLevel(null)}
        onConfirm={(category) => {
          setValue('categoryIds', [category.firstCategoryId]);
          setCategoryDisplayNames([category.firstCategoryName]);
          setCategoryModalLevel(null);
        }}
        selectedFirstCategoryId={watch('categoryIds')?.[0]}
        title="Select First Category"
      />
      <SelectSecondCategoryModal
        isOpen={categoryModalLevel === 'second'}
        onClose={() => setCategoryModalLevel(null)}
        firstCategoryId={watch('categoryIds')?.[0] ?? ''}
        onConfirm={(category) => {
          const ids = watch('categoryIds') ?? [];
          setValue('categoryIds', [ids[0], category.secondCategoryId]);
          setCategoryDisplayNames((prev) => [prev[0] ?? '', category.secondCategoryName]);
          setCategoryModalLevel(null);
        }}
        selectedSecondCategoryId={watch('categoryIds')?.[1]}
        title="Select Second Category"
      />
      <SelectThirdCategoryModal
        isOpen={categoryModalLevel === 'third'}
        onClose={() => setCategoryModalLevel(null)}
        firstCategoryId={watch('categoryIds')?.[0] ?? ''}
        secondCategoryId={watch('categoryIds')?.[1] ?? ''}
        onConfirm={(category) => {
          const ids = watch('categoryIds') ?? [];
          setValue('categoryIds', [ids[0], ids[1], category.thirdCategoryId]);
          setCategoryDisplayNames((prev) => [prev[0] ?? '', prev[1] ?? '', category.thirdCategoryName]);
          setCategoryModalLevel(null);
        }}
        selectedThirdCategoryId={watch('categoryIds')?.[2]}
        title="Select Third Category"
      />
      <SelectFourthCategoryModal
        isOpen={categoryModalLevel === 'fourth'}
        onClose={() => setCategoryModalLevel(null)}
        firstCategoryId={watch('categoryIds')?.[0] ?? ''}
        secondCategoryId={watch('categoryIds')?.[1] ?? ''}
        thirdCategoryId={watch('categoryIds')?.[2] ?? ''}
        onConfirm={(category) => {
          const ids = watch('categoryIds') ?? [];
          setValue('categoryIds', [ids[0], ids[1], ids[2], category.fourthCategoryId]);
          setCategoryDisplayNames((prev) => [prev[0] ?? '', prev[1] ?? '', prev[2] ?? '', category.fourthCategoryName]);
          setCategoryModalLevel(null);
        }}
        selectedFourthCategoryId={watch('categoryIds')?.[3]}
        title="Select Fourth Category"
      />
      <SelectKeywordModal
        isOpen={isKeywordModalOpen}
        onClose={() => setIsKeywordModalOpen(false)}
        selectedKeywords={selectedKeywords}
        onConfirm={(items) => {
          setValue('selectedKeywords', items);
          setIsKeywordModalOpen(false);
        }}
        title="Select Keywords"
      />
    </div>
  );
};

export default AddProduct;
