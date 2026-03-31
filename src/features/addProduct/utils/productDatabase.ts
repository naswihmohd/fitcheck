import { doc, setDoc, getDoc, collection, serverTimestamp, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import type { ProductProps, ProductVariant, VariantUnit } from '../../products/data/productTypes';
import keywordsBuilder from '../../../general/utils/keywordsBuilder';
import type { AddProductFormData } from '../presentation/AddProduct';

// Derive productPrice from first unit (price is at unit level)
const getProductPriceFromUnits = (formData: AddProductFormData): number => {
  const firstVariant = formData.variants[0];
  if (!firstVariant?.units?.length) return 0;
  const firstUnit = firstVariant.units[0];
  return firstUnit?.price ?? 0;
};

// Derive productStock from sum of all unit stocks
const getProductStockFromUnits = (formData: AddProductFormData): number => {
  return formData.variants.reduce((total, variant) => {
    const variantStock = (variant.units || []).reduce((sum, unit) => sum + (unit.stock ?? 0), 0);
    return total + variantStock;
  }, 0);
};

export const productStoreToDatabase = async (
  formData: AddProductFormData,
  productId?: string // Optional: if provided, update existing product; otherwise create new
): Promise<string> => {
  try {
    // Build keywords from product name, brand name, and web link name
    const keywords = keywordsBuilder(formData.productDetails.productName);
    const productPrice = getProductPriceFromUnits(formData);
    const productStock = getProductStockFromUnits(formData);

    // Reference to the products collection
    const productsCollectionRef = collection(db, 'products');

    let newProductId: string;
    let createdAt: Timestamp;

    if (productId) {
      // Update existing product
      newProductId = productId;
      const productDocRef = doc(productsCollectionRef, productId);
      const productDoc = await getDoc(productDocRef);
      
      if (!productDoc.exists()) {
        throw new Error('Product not found');
      }

      const existingData = productDoc.data() as ProductProps;
      createdAt = existingData.createdAt;

      // Convert variants array to Record<string, ProductVariant> format
      const variantsRecord: Record<string, ProductVariant> = {};
      
      formData.variants.forEach((variant) => {
        // Convert units array to Record<string, VariantUnit>
        const unitsRecord: Record<string, VariantUnit> = {};
        variant.units.forEach((unit) => {
          unitsRecord[unit.id] = unit;
        });

        variantsRecord[variant.id] = {
          id: variant.id,
          variantId: variant.variantId || undefined,
          color: variant.color,
          colorCode: variant.colorCode,
          maxBuyQuantity: variant.maxBuyQuantity,
          productImages: variant.productImages,
          units: unitsRecord,
        };
      });

      // Update the product document.
      // Use updateDoc so map fields (like variants/units) are replaced, not merged.
      await updateDoc(productDocRef, {
        id: newProductId,
        webLinkName: formData.webLinkName.trim(),
        brandDetails: {
          brandId: formData.brandDetails.brandId.trim(),
          brandName: formData.brandDetails.brandName.trim(),
          brandImage: formData.brandDetails.brandImage || null,
        },
        categoryIds: formData.categoryIds || [],
        taxDetails: {
          gstPercentage: formData.taxDetails.gstPercentage,
          hsnCode: formData.taxDetails.hsnCode,
        },
        productDetails: {
          productName: formData.productDetails.productName.trim(),
          productPrice,
          productStock,
          productDescription: formData.productDetails.productDescription || [],
          materialCode: formData.productDetails.materialCode?.trim() || '',
          linkUrl: formData.productDetails.linkUrl?.trim() || null,
          returnAvailable: formData.productDetails.returnAvailable,
          reviewAvailable: formData.productDetails.reviewAvailable,
          cashOnDeliveryAvailable: formData.productDetails.cashOnDeliveryAvailable,
        },
        isTrending: formData.isTrending,
        keywordIds: (formData.selectedKeywords || []).map((s) => s.id),
        keywords: keywords,
        variants: variantsRecord,
        unitType: formData.unitType,
        isActive: formData.isActive,
        createdAt, // Preserve original creation date
        updatedAt: serverTimestamp(),
      });
    } else {
      // Create new product with auto-generated ID
      const productDocRef = doc(productsCollectionRef);
      newProductId = productDocRef.id;

      // Convert variants array to Record<string, ProductVariant> format
      const variantsRecord: Record<string, ProductVariant> = {};
      
      formData.variants.forEach((variant) => {
        // Convert units array to Record<string, VariantUnit>
        const unitsRecord: Record<string, VariantUnit> = {};
        variant.units.forEach((unit) => {
          unitsRecord[unit.id] = unit;
        });

        variantsRecord[variant.id] = {
          id: variant.id,
          variantId: variant.variantId || undefined,
          color: variant.color,
          colorCode: variant.colorCode,
          maxBuyQuantity: variant.maxBuyQuantity,
          productImages: variant.productImages,
          units: unitsRecord,
        };
      });

      await setDoc(productDocRef, {
        id: newProductId,
        webLinkName: formData.webLinkName.trim(),
        brandDetails: {
          brandId: formData.brandDetails.brandId.trim(),
          brandName: formData.brandDetails.brandName.trim(),
          brandImage: formData.brandDetails.brandImage || null,
        },
        categoryIds: formData.categoryIds || [],
        taxDetails: {
          gstPercentage: formData.taxDetails.gstPercentage,
          hsnCode: formData.taxDetails.hsnCode,
        },
        productDetails: {
          productName: formData.productDetails.productName.trim(),
          productPrice,
          productStock,
          productDescription: formData.productDetails.productDescription || [],
          materialCode: formData.productDetails.materialCode?.trim() || '',
          linkUrl: formData.productDetails.linkUrl?.trim() || null,
          returnAvailable: formData.productDetails.returnAvailable,
          reviewAvailable: formData.productDetails.reviewAvailable,
          cashOnDeliveryAvailable: formData.productDetails.cashOnDeliveryAvailable,
        },
        isTrending: formData.isTrending,
        keywordIds: (formData.selectedKeywords || []).map((s) => s.id),
        keywords: keywords,
        variants: variantsRecord,
        unitType: formData.unitType,
        isActive: formData.isActive,
        createdAt: serverTimestamp() as Timestamp,
      });
    }

    return newProductId;
  } catch (error) {
    console.error('Error saving product to Firebase:', error);
    throw error;
  }
};

export const getProductFromDatabase = async (
  productId: string
): Promise<ProductProps | null> => {
  try {
    const productsCollectionRef = collection(db, 'products');
    const productDocRef = doc(productsCollectionRef, productId);
    const productDoc = await getDoc(productDocRef);

    if (!productDoc.exists()) {
      return null;
    }

    const data = productDoc.data();
    
    // Handle backward compatibility: ensure brandImage exists
    if (data.brandDetails && !data.brandDetails.brandImage) {
      data.brandDetails.brandImage = null;
    }

    return {
      id: productDoc.id,
      ...data,
    } as ProductProps;
  } catch (error) {
    console.error('Error fetching product from Firebase:', error);
    throw error;
  }
};
