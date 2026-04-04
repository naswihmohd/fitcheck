import React, { useEffect, useRef, useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import {
  HiTag,
  HiCurrencyRupee,
  HiLink,
  HiCheckCircle,
  HiXCircle,
  HiPlus,
  HiTrash,
  HiPhotograph,
  HiTicket,
  HiUsers,
  HiCalendar,
} from 'react-icons/hi';
import { FiPercent } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { collection, doc, getDoc, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../../firebaseConfig';
import imageCompression from 'browser-image-compression';
import LoadImage from '../../../../general/components/LoadImage';
import SelectBrandModal from '../../../addProduct/presentation/components/SelectBrandModal';
import SelectFirstCategoryModal from '../../../addProduct/presentation/components/SelectFirstCategoryModal';
import SelectKeywordModal, {
  type SelectedKeywordItem,
} from '../../../addProduct/presentation/components/SelectKeywordModal';
import type { CouponProps } from '../../data/couponTypes';

export interface AddNewCouponFormData {
  couponCode: string;
  coupontTitle: string;
  couponDescription: string;
  couponType: 'product' | 'category' | 'brand' | 'all';
  categoryId: string;
  categoryName: string;
  brandId: string;
  brandName: string;
  brandImage: string | null;
  productId: string;
  discountType: 'amount' | 'percentage';
  discountValue: number;
  couponAllowedUsersNumber: number | null;
  maximumCalimableValue: number;
  minimumOrderValue: number;
  usersType: 'all' | 'single' | 'multiple';
  singleUserId: string;
  multipleUserRows: { userId: string }[];
  couponUsedLimit: 'oneTime' | 'unlimited';
  imageUrl: string;
  selectedKeywords: SelectedKeywordItem[];
  startAtLocal: string;
  expiryAtLocal: string;
  isShownPublic: boolean;
}

const MAX_COUPON_IMAGE_SIZE_KB = 50;

function localInputValueToTimestamp(value: string): Timestamp | null {
  if (!value?.trim()) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return Timestamp.fromDate(d);
}

function timestampToDatetimeLocalValue(ts: Timestamp | undefined): string {
  if (!ts || typeof (ts as Timestamp).toDate !== 'function') return '';
  const d = (ts as Timestamp).toDate();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const AddNewCoupon: React.FC = () => {
  const { couponId } = useParams<{ couponId?: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(couponId);
  const createdAtRef = useRef<Timestamp | null>(null);
  const [isLoadingCoupon, setIsLoadingCoupon] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isKeywordModalOpen, setIsKeywordModalOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const couponImageInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
    clearErrors,
    setError,
    trigger,
    reset,
  } = useForm<AddNewCouponFormData>({
    defaultValues: {
      couponCode: '',
      coupontTitle: '',
      couponDescription: '',
      couponType: 'all',
      categoryId: '',
      categoryName: '',
      brandId: '',
      brandName: '',
      brandImage: null,
      productId: '',
      discountType: 'percentage',
      discountValue: 0,
      couponAllowedUsersNumber: null,
      maximumCalimableValue: 0,
      minimumOrderValue: 0,
      usersType: 'all',
      singleUserId: '',
      multipleUserRows: [],
      couponUsedLimit: 'unlimited',
      imageUrl: '',
      selectedKeywords: [],
      startAtLocal: '',
      expiryAtLocal: '',
      isShownPublic: true,
    },
    mode: 'onTouched',
  });

  const { fields: userIdFields, append: appendUserRow, remove: removeUserRow } = useFieldArray({
    control,
    name: 'multipleUserRows',
  });

  useEffect(() => {
    if (!couponId) {
      createdAtRef.current = null;
      return;
    }

    const loadCoupon = async () => {
      setIsLoadingCoupon(true);
      try {
        const snap = await getDoc(doc(db, 'coupons', couponId));
        if (!snap.exists()) {
          toast.error('Coupon not found');
          navigate('/coupons/add');
          return;
        }
        const c = snap.data() as CouponProps;

        if (c.createdAt && typeof (c.createdAt as Timestamp).toMillis === 'function') {
          createdAtRef.current = c.createdAt as Timestamp;
        } else {
          createdAtRef.current = null;
        }

        const keywords = c.keywords ?? [];
        reset({
          couponCode: c.couponCode ?? '',
          coupontTitle: c.coupontTitle ?? '',
          couponDescription: c.couponDescription ?? '',
          couponType: c.couponType ?? 'all',
          categoryId: c.categoryId ?? '',
          categoryName: '',
          brandId: c.brandId ?? '',
          brandName: '',
          brandImage: null,
          productId: c.productId ?? '',
          discountType: c.discountType ?? 'percentage',
          discountValue: Number(c.discountValue) || 0,
          couponAllowedUsersNumber:
            c.couponAllowedUsersNumber === null || c.couponAllowedUsersNumber === undefined
              ? null
              : Number(c.couponAllowedUsersNumber),
          maximumCalimableValue: Number(c.maximumCalimableValue) || 0,
          minimumOrderValue: Number(c.minimumOrderValue) || 0,
          usersType: c.usersType ?? 'all',
          singleUserId: c.singleUserId ?? '',
          multipleUserRows: (c.multipleUserIds ?? []).map((userId) => ({ userId })),
          couponUsedLimit: c.couponUsedLimit ?? 'unlimited',
          imageUrl: (c.image ?? '').trim(),
          selectedKeywords: keywords.map((keywordName) => ({ id: keywordName, keywordName })),
          startAtLocal: timestampToDatetimeLocalValue(c.startAt),
          expiryAtLocal: timestampToDatetimeLocalValue(c.expiryAt),
          isShownPublic: Boolean(c.isShownPublic),
        });

        const img = (c.image ?? '').trim();
        setImageFile(null);
        if (couponImageInputRef.current) couponImageInputRef.current.value = '';
        setPreviewImage(img || null);
      } catch (e) {
        console.error(e);
        toast.error('Failed to load coupon');
        navigate('/coupons');
      } finally {
        setIsLoadingCoupon(false);
      }
    };

    void loadCoupon();
  }, [couponId, navigate, reset]);

  const couponType = watch('couponType');
  const usersType = watch('usersType');
  const discountType = watch('discountType');
  const selectedKeywords = watch('selectedKeywords') || [];

  const removeKeyword = (index: number) => {
    const next = selectedKeywords.slice();
    next.splice(index, 1);
    setValue('selectedKeywords', next);
  };

  const clearCouponImage = () => {
    setImageFile(null);
    setPreviewImage((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return null;
    });
    if (couponImageInputRef.current) couponImageInputRef.current.value = '';
    void trigger('imageUrl');
  };

  const handleCouponImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const revokeIfBlob = (url: string | null) => {
      if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
    };

    const fileSizeKB = file.size / 1024;
    if (fileSizeKB > MAX_COUPON_IMAGE_SIZE_KB) {
      try {
        const options = {
          maxSizeMB: MAX_COUPON_IMAGE_SIZE_KB / 1024,
          maxWidthOrHeight: 800,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);
        const compressedSizeKB = compressedFile.size / 1024;
        if (compressedSizeKB > MAX_COUPON_IMAGE_SIZE_KB) {
          toast.error(`Unable to compress image below ${MAX_COUPON_IMAGE_SIZE_KB}KB.`);
          return;
        }
        setImageFile(compressedFile);
        setPreviewImage((prev) => {
          revokeIfBlob(prev);
          return URL.createObjectURL(compressedFile);
        });
      } catch (error) {
        console.error('Image compression error:', error);
        toast.error('Failed to compress image.');
      }
    } else {
      setImageFile(file);
      setPreviewImage((prev) => {
        revokeIfBlob(prev);
        return URL.createObjectURL(file);
      });
    }
    clearErrors('imageUrl');
  };

  const onSubmit = async (data: AddNewCouponFormData) => {
    const startTs = localInputValueToTimestamp(data.startAtLocal);
    const expiryTs = localInputValueToTimestamp(data.expiryAtLocal);
    if (!startTs || !expiryTs) {
      toast.error('Please set valid start and expiry dates.');
      if (!startTs) setError('startAtLocal', { type: 'manual', message: 'Start date is required' });
      if (!expiryTs) setError('expiryAtLocal', { type: 'manual', message: 'Expiry date is required' });
      return;
    }
    if (expiryTs.toMillis() <= startTs.toMillis()) {
      setError('expiryAtLocal', { type: 'manual', message: 'Expiry must be after start' });
      toast.error('Expiry must be after start date.');
      return;
    }

    if (data.couponType === 'product' && !data.productId?.trim()) {
      toast.error('Enter a product ID for product-scoped coupons.');
      setError('productId', { type: 'manual', message: 'Product ID is required' });
      return;
    }
    if (data.couponType === 'category' && !data.categoryId?.trim()) {
      toast.error('Select a category for category-scoped coupons.');
      setError('categoryId', { type: 'manual', message: 'Category is required' });
      return;
    }
    if (data.couponType === 'brand' && !data.brandId?.trim()) {
      toast.error('Select a brand for brand-scoped coupons.');
      setError('brandId', { type: 'manual', message: 'Brand is required' });
      return;
    }

    if (data.usersType === 'single' && !data.singleUserId?.trim()) {
      setError('singleUserId', { type: 'manual', message: 'User ID is required' });
      toast.error('Enter a user ID for single-user coupons.');
      return;
    }
    if (data.usersType === 'multiple') {
      const ids = (data.multipleUserRows || []).map((r) => r.userId.trim()).filter(Boolean);
      if (ids.length === 0) {
        setError('multipleUserRows', { type: 'manual', message: 'Add at least one user ID' });
        toast.error('Add at least one user ID for multiple-user coupons.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const couponsCol = collection(db, 'coupons');
      const docRef = isEditMode && couponId ? doc(db, 'coupons', couponId) : doc(couponsCol);
      const id = isEditMode && couponId ? couponId : docRef.id;

      let image = data.imageUrl?.trim() || '';
      if (imageFile) {
        const storageRef = ref(storage, `coupons/${id}`);
        await uploadBytes(storageRef, imageFile);
        image = await getDownloadURL(storageRef);
      }
      if (!image) {
        toast.error('Add a coupon image URL or upload an image.');
        setIsSubmitting(false);
        return;
      }

      const multipleUserIds =
        data.usersType === 'multiple'
          ? (data.multipleUserRows || []).map((r) => r.userId.trim()).filter(Boolean)
          : null;

      await setDoc(docRef, {
        id,
        couponCode: data.couponCode.trim().toUpperCase(),
        coupontTitle: data.coupontTitle.trim(),
        couponDescription: data.couponDescription.trim(),
        couponType: data.couponType,
        categoryId: data.couponType === 'category' ? data.categoryId.trim() : null,
        brandId: data.couponType === 'brand' ? data.brandId.trim() : null,
        productId: data.couponType === 'product' ? data.productId.trim() : null,
        discountType: data.discountType,
        discountValue: Number(data.discountValue),
        couponAllowedUsersNumber:
          data.couponAllowedUsersNumber === null || data.couponAllowedUsersNumber === undefined
            ? null
            : Number(data.couponAllowedUsersNumber),
        maximumCalimableValue: Number(data.maximumCalimableValue),
        minimumOrderValue: Number(data.minimumOrderValue),
        usersType: data.usersType,
        singleUserId: data.usersType === 'single' ? data.singleUserId.trim() : null,
        multipleUserIds,
        couponUsedLimit: data.couponUsedLimit,
        image,
        keywords: selectedKeywords.map((k) => k.keywordName),
        createdAt: isEditMode && createdAtRef.current ? createdAtRef.current : serverTimestamp(),
        startAt: startTs,
        expiryAt: expiryTs,
        isShownPublic: data.isShownPublic,
      });

      toast.success(isEditMode ? 'Coupon updated successfully!' : 'Coupon created successfully!');
      navigate('/coupons');
    } catch (e) {
      console.error(e);
      toast.error('Failed to save coupon. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const imageUrlRegister = register('imageUrl', {
    validate: (value) => {
      if (imageFile) return true;
      if (previewImage && !previewImage.startsWith('blob:')) return true;
      return value?.trim() ? true : 'Upload a coupon image or enter an image URL';
    },
  });

  if (isLoadingCoupon) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
          <p className="mt-4 text-sm text-gray-600">Loading coupon…</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900">{isEditMode ? 'Edit coupon' : 'Add New Coupon'}</h1>
        <p className="mt-2 text-sm text-gray-600">
          {isEditMode
            ? 'Update the coupon details below'
            : 'Fill in the details to create a new coupon for your store'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basics */}
        <div className="rounded-2xl bg-white p-6">
          <div className="mb-6 flex items-center gap-3">
            <HiTicket className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold text-gray-900">Coupon basics</h2>
          </div>
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Coupon image <span className="text-red-500">*</span>
              </label>
              <p className="mb-2 text-xs text-gray-500">JPG, PNG — max {MAX_COUPON_IMAGE_SIZE_KB}KB (upload or URL below)</p>
              <div className="flex flex-wrap items-start gap-3">
                <label htmlFor="coupon-image-upload" className="cursor-pointer block">
                  <div className="w-full max-w-[220px] overflow-hidden border-2 border-dashed border-gray-300 rounded-xl p-4 flex items-center justify-center hover:border-primary transition-colors">
                    {previewImage ? (
                      <div className="relative overflow-hidden w-full h-24 flex items-center justify-center">
                        <LoadImage
                          index={0}
                          className="object-cover max-h-24 rounded-lg"
                          src={previewImage}
                          alt="Coupon preview"
                        />
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        <HiPhotograph className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">Click to upload</p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG (max {MAX_COUPON_IMAGE_SIZE_KB}KB)</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={couponImageInputRef}
                    id="coupon-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCouponImageChange}
                  />
                </label>
                {previewImage && (
                  <button
                    type="button"
                    onClick={clearCouponImage}
                    className="text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Remove image
                  </button>
                )}
              </div>
              <div className="mt-4">
                <label htmlFor="imageUrl" className="mb-2 block text-sm font-medium text-gray-700">
                  Or image URL
                </label>
                <div className="relative">
                  <HiLink className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="imageUrl"
                    type="url"
                    {...imageUrlRegister}
                    onChange={(e) => {
                      imageUrlRegister.onChange(e);
                      if (e.target.value.trim()) clearErrors('imageUrl');
                    }}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-12 py-3 text-sm text-gray-900 transition focus:border-primary focus:bg-white outline-none"
                  />
                </div>
                {errors.imageUrl && <p className="mt-1 text-sm text-red-600">{errors.imageUrl.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="couponCode" className="mb-2 block text-sm font-medium text-gray-700">
                Coupon code <span className="text-red-500">*</span>
              </label>
              <input
                id="couponCode"
                type="text"
                {...register('couponCode', { required: 'Coupon code is required' })}
                placeholder="e.g., SUMMER20"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm uppercase text-gray-900 transition focus:border-primary focus:bg-white outline-none"
              />
              {errors.couponCode && <p className="mt-1 text-sm text-red-600">{errors.couponCode.message}</p>}
            </div>

            <div>
              <label htmlFor="coupontTitle" className="mb-2 block text-sm font-medium text-gray-700">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="coupontTitle"
                type="text"
                {...register('coupontTitle', { required: 'Title is required' })}
                placeholder="Short title shown to customers"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 transition focus:border-primary focus:bg-white outline-none"
              />
              {errors.coupontTitle && <p className="mt-1 text-sm text-red-600">{errors.coupontTitle.message}</p>}
            </div>

            <div>
              <label htmlFor="couponDescription" className="mb-2 block text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="couponDescription"
                rows={3}
                {...register('couponDescription', { required: 'Description is required' })}
                placeholder="Describe what this coupon offers"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 transition focus:border-primary focus:bg-white outline-none"
              />
              {errors.couponDescription && (
                <p className="mt-1 text-sm text-red-600">{errors.couponDescription.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="couponType" className="mb-2 block text-sm font-medium text-gray-700">
                Applies to <span className="text-red-500">*</span>
              </label>
              <select
                id="couponType"
                {...register('couponType')}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 transition focus:border-primary focus:bg-white outline-none"
              >
                <option value="all">Entire store</option>
                <option value="product">Specific product</option>
                <option value="category">Specific category</option>
                <option value="brand">Specific brand</option>
              </select>
            </div>

            {couponType === 'product' && (
              <div>
                <label htmlFor="productId" className="mb-2 block text-sm font-medium text-gray-700">
                  Product ID <span className="text-red-500">*</span>
                </label>
                <input
                  id="productId"
                  type="text"
                  {...register('productId')}
                  placeholder="Firestore product document ID"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 transition focus:border-primary focus:bg-white outline-none"
                />
                {errors.productId && <p className="mt-1 text-sm text-red-600">{errors.productId.message}</p>}
              </div>
            )}

            {couponType === 'category' && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={watch('categoryName') || ''}
                    readOnly
                    onClick={() => setIsCategoryModalOpen(true)}
                    placeholder="Click to select category"
                    className="min-w-[200px] flex-1 cursor-pointer rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 transition focus:border-primary focus:bg-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="rounded-md bg-secondary px-6 py-3 text-sm font-medium text-white transition hover:bg-secondary/90 whitespace-nowrap"
                  >
                    Select category
                  </button>
                  {watch('categoryId') && (
                    <button
                      type="button"
                      onClick={() => {
                        setValue('categoryId', '');
                        setValue('categoryName', '');
                      }}
                      className="text-red-600 hover:text-red-700"
                      aria-label="Clear category"
                    >
                      <HiXCircle className="h-6 w-6" />
                    </button>
                  )}
                </div>
                {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>}
              </div>
            )}

            {couponType === 'brand' && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Brand <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={watch('brandName') || ''}
                    readOnly
                    onClick={() => setIsBrandModalOpen(true)}
                    placeholder="Click to select brand"
                    className="min-w-[200px] flex-1 cursor-pointer rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setIsBrandModalOpen(true)}
                    className="rounded-md bg-secondary px-6 py-3 text-sm font-medium text-white transition hover:bg-secondary/90 whitespace-nowrap"
                  >
                    Select brand
                  </button>
                </div>
                {watch('brandId') && watch('brandName') && (
                  <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {watch('brandImage') && (
                          <img
                            src={watch('brandImage') || ''}
                            alt={watch('brandName') || ''}
                            className="h-12 w-12 rounded-full border-2 border-primary/20 object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{watch('brandName')}</p>
                          <p className="mt-1 text-xs text-gray-500">ID: {watch('brandId')}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setValue('brandId', '');
                          setValue('brandName', '');
                          setValue('brandImage', null);
                        }}
                        className="text-red-600 hover:text-red-700"
                        aria-label="Clear brand"
                      >
                        <HiXCircle className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
                {errors.brandId && <p className="mt-1 text-sm text-red-600">{errors.brandId.message}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Discount */}
        <div className="rounded-2xl bg-white p-6">
          <div className="mb-6 flex items-center gap-3">
            {discountType === 'percentage' ? (
              <FiPercent className="h-6 w-6 text-primary" />
            ) : (
              <HiCurrencyRupee className="h-6 w-6 text-primary" />
            )}
            <h2 className="text-xl font-semibold text-gray-900">Discount & order rules</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="discountType" className="mb-2 block text-sm font-medium text-gray-700">
                Discount type <span className="text-red-500">*</span>
              </label>
              <select
                id="discountType"
                {...register('discountType')}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 transition focus:border-primary focus:bg-white outline-none"
              >
                <option value="percentage">Percentage</option>
                <option value="amount">Fixed amount (₹)</option>
              </select>
            </div>

            <div>
              <label htmlFor="discountValue" className="mb-2 block text-sm font-medium text-gray-700">
                Discount value <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                {discountType === 'amount' && (
                  <HiCurrencyRupee className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                )}
                <input
                  id="discountValue"
                  type="number"
                  step={discountType === 'percentage' ? '1' : '0.01'}
                  {...register('discountValue', {
                    required: 'Discount value is required',
                    valueAsNumber: true,
                    min: { value: 0, message: 'Must be 0 or greater' },
                    max:
                      discountType === 'percentage'
                        ? { value: 100, message: 'Percentage cannot exceed 100' }
                        : undefined,
                  })}
                  onWheel={(e) => e.currentTarget.blur()}
                  className={`w-full rounded-xl border border-gray-200 bg-gray-50 py-3 text-sm text-gray-900 transition focus:border-primary focus:bg-white outline-none ${
                    discountType === 'amount' ? 'pl-12 pr-4' : 'px-4'
                  }`}
                />
              </div>
              {errors.discountValue && (
                <p className="mt-1 text-sm text-red-600">{errors.discountValue.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="minimumOrderValue" className="mb-2 block text-sm font-medium text-gray-700">
                Minimum order value (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <HiCurrencyRupee className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="minimumOrderValue"
                  type="number"
                  step="0.01"
                  {...register('minimumOrderValue', {
                    required: 'Required',
                    valueAsNumber: true,
                    min: { value: 0, message: 'Must be 0 or greater' },
                  })}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-sm text-gray-900 transition focus:border-primary focus:bg-white outline-none"
                />
              </div>
              {errors.minimumOrderValue && (
                <p className="mt-1 text-sm text-red-600">{errors.minimumOrderValue.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="maximumCalimableValue" className="mb-2 block text-sm font-medium text-gray-700">
                Maximum discount cap (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <HiCurrencyRupee className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="maximumCalimableValue"
                  type="number"
                  step="0.01"
                  {...register('maximumCalimableValue', {
                    required: 'Required',
                    valueAsNumber: true,
                    min: { value: 0, message: 'Must be 0 or greater' },
                  })}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-sm text-gray-900 transition focus:border-primary focus:bg-white outline-none"
                />
              </div>
              {errors.maximumCalimableValue && (
                <p className="mt-1 text-sm text-red-600">{errors.maximumCalimableValue.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="couponAllowedUsersNumber" className="mb-2 block text-sm font-medium text-gray-700">
                Max number of users (optional)
              </label>
              <input
                id="couponAllowedUsersNumber"
                type="number"
                {...register('couponAllowedUsersNumber', {
                  setValueAs: (v) => (v === '' || v === undefined || v === null ? null : Number(v)),
                })}
                onWheel={(e) => e.currentTarget.blur()}
                placeholder="Leave empty for no limit"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 transition focus:border-primary focus:bg-white outline-none"
              />
            </div>

            <div>
              <label htmlFor="couponUsedLimit" className="mb-2 block text-sm font-medium text-gray-700">
                Per-customer usage <span className="text-red-500">*</span>
              </label>
              <select
                id="couponUsedLimit"
                {...register('couponUsedLimit')}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 transition focus:border-primary focus:bg-white outline-none"
              >
                <option value="unlimited">Unlimited</option>
                <option value="oneTime">One time only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Audience */}
        <div className="rounded-2xl bg-white p-6">
          <div className="mb-6 flex items-center gap-3">
            <HiUsers className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold text-gray-900">Who can use this coupon</h2>
          </div>
          <div className="space-y-5">
            <div>
              <label htmlFor="usersType" className="mb-2 block text-sm font-medium text-gray-700">
                Audience <span className="text-red-500">*</span>
              </label>
              <select
                id="usersType"
                {...register('usersType')}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 transition focus:border-primary focus:bg-white outline-none"
              >
                <option value="all">All customers</option>
                <option value="single">Single user (by ID)</option>
                <option value="multiple">Multiple users (by ID)</option>
              </select>
            </div>

            {usersType === 'single' && (
              <div>
                <label htmlFor="singleUserId" className="mb-2 block text-sm font-medium text-gray-700">
                  User ID <span className="text-red-500">*</span>
                </label>
                <input
                  id="singleUserId"
                  type="text"
                  {...register('singleUserId')}
                  placeholder="Customer user document ID"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 transition focus:border-primary focus:bg-white outline-none"
                />
                {errors.singleUserId && (
                  <p className="mt-1 text-sm text-red-600">{errors.singleUserId.message}</p>
                )}
              </div>
            )}

            {usersType === 'multiple' && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">User IDs</span>
                  <button
                    type="button"
                    onClick={() => appendUserRow({ userId: '' })}
                    className="flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white transition hover:bg-primary/90"
                  >
                    <HiPlus className="h-4 w-4" />
                    Add user
                  </button>
                </div>
                {errors.multipleUserRows && (
                  <p className="mb-2 text-sm text-red-600">{(errors.multipleUserRows as { message?: string }).message}</p>
                )}
                {userIdFields.length === 0 ? (
                  <p className="text-sm text-gray-500">No users added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {userIdFields.map((field, index) => (
                      <div key={field.id} className="flex gap-2">
                        <input
                          type="text"
                          {...register(`multipleUserRows.${index}.userId` as const)}
                          placeholder="User document ID"
                          className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeUserRow(index)}
                          className="rounded-lg bg-red-100 px-3 py-2 text-red-600 hover:bg-red-200"
                          aria-label="Remove user row"
                        >
                          <HiTrash className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Schedule & visibility */}
        <div className="rounded-2xl bg-white p-6">
          <div className="mb-6 flex items-center gap-3">
            <HiCalendar className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold text-gray-900">Schedule & visibility</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="startAtLocal" className="mb-2 block text-sm font-medium text-gray-700">
                Starts at <span className="text-red-500">*</span>
              </label>
              <input
                id="startAtLocal"
                type="datetime-local"
                {...register('startAtLocal', { required: 'Start date is required' })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 transition focus:border-primary focus:bg-white outline-none"
              />
              {errors.startAtLocal && <p className="mt-1 text-sm text-red-600">{errors.startAtLocal.message}</p>}
            </div>
            <div>
              <label htmlFor="expiryAtLocal" className="mb-2 block text-sm font-medium text-gray-700">
                Expires at <span className="text-red-500">*</span>
              </label>
              <input
                id="expiryAtLocal"
                type="datetime-local"
                {...register('expiryAtLocal', { required: 'Expiry date is required' })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 transition focus:border-primary focus:bg-white outline-none"
              />
              {errors.expiryAtLocal && (
                <p className="mt-1 text-sm text-red-600">{errors.expiryAtLocal.message}</p>
              )}
            </div>

            <div className="flex items-center gap-3 md:col-span-2">
              <Controller
                name="isShownPublic"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <button
                    type="button"
                    onClick={() => onChange(!value)}
                    className={`flex h-12 w-12 items-center justify-center rounded-xl transition ${
                      value ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {value ? <HiCheckCircle className="h-6 w-6" /> : <HiXCircle className="h-6 w-6" />}
                  </button>
                )}
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Show publicly</span>
                <p className="text-xs text-gray-500">When off, the coupon can be hidden from public listings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Keywords */}
        <div className="rounded-2xl bg-white p-6">
          <div className="mb-6 flex items-center gap-3">
            <HiTag className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold text-gray-900">Keywords</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsKeywordModalOpen(true)}
              className="rounded-md bg-secondary px-6 py-3 text-sm font-medium text-white transition hover:bg-secondary/90 whitespace-nowrap"
            >
              Select keywords
            </button>
            {selectedKeywords.length > 0 && (
              <div className="mt-2 flex w-full flex-wrap gap-2">
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
                      className="text-primary transition hover:text-red-600"
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

        <div className="flex justify-end gap-4 rounded-2xl bg-white p-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-gradient-to-r from-primary to-secondary px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Saving coupon...' : isEditMode ? 'Update coupon' : 'Create coupon'}
          </button>
        </div>
      </form>

      <SelectBrandModal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
        onConfirm={(brand) => {
          setValue('brandId', brand.brandId);
          setValue('brandName', brand.brandName);
          setValue('brandImage', brand.brandImage);
          setIsBrandModalOpen(false);
          clearErrors('brandId');
        }}
        selectedBrandId={watch('brandId')}
        title="Select brand"
      />

      <SelectFirstCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onConfirm={(category) => {
          setValue('categoryId', category.firstCategoryId);
          setValue('categoryName', category.firstCategoryName);
          setIsCategoryModalOpen(false);
          clearErrors('categoryId');
        }}
        selectedFirstCategoryId={watch('categoryId')}
        title="Select category"
      />

      <SelectKeywordModal
        isOpen={isKeywordModalOpen}
        onClose={() => setIsKeywordModalOpen(false)}
        selectedKeywords={selectedKeywords}
        onConfirm={(items) => {
          setValue('selectedKeywords', items);
          setIsKeywordModalOpen(false);
        }}
        title="Select keywords"
      />
    </div>
  );
};

export default AddNewCoupon;
