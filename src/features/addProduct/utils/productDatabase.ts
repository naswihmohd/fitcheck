import { doc, setDoc, getDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import type { ProductProps, ProductVariant, VariantUnit } from '../../products/data/productTypes';
import keywordsBuilder from '../../../general/utils/keywordsBuilder';
import type { AddProductFormData } from '../presentation/AddProduct';

export const productStoreToDatabase = async (
  formData: AddProductFormData,
  productId?: string // Optional: if provided, update existing product; otherwise create new
): Promise<string> => {
  try {
    // Build keywords from product name, brand name, and web link name
    const keywords = [
      ...keywordsBuilder(formData.productDetails.productName),
      ...keywordsBuilder(formData.brandDetails.brandName),
      ...keywordsBuilder(formData.webLinkName),
      ...(formData.keywords || []),
    ];

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
          color: variant.color,
          colorCode: variant.colorCode,
          maxBuyQuantity: variant.maxBuyQuantity,
          productImages: variant.productImages,
          units: unitsRecord,
        };
      });

      // Update the product document (preserve isActive status)
      await setDoc(productDocRef, {
        id: newProductId,
        webLinkName: formData.webLinkName.trim(),
        brandDetails: {
          brandId: formData.brandDetails.brandId.trim(),
          brandName: formData.brandDetails.brandName.trim(),
        },
        categoryIds: formData.categoryIds || [],
        taxDetails: {
          cgst: formData.taxDetails.cgst,
          sgst: formData.taxDetails.sgst,
          gstPercentage: formData.taxDetails.gstPercentage,
          hsnCode: formData.taxDetails.hsnCode,
        },
        productDetails: {
          productName: formData.productDetails.productName.trim(),
          productPrice: formData.productDetails.productPrice,
          productStock: formData.productDetails.productStock,
          productDescription: formData.productDetails.productDescription || [],
          materialCode: formData.productDetails.materialCode?.trim() || '',
          linkUrl: formData.productDetails.linkUrl?.trim() || null,
          returnAvailable: formData.productDetails.returnAvailable,
          reviewAvailable: formData.productDetails.reviewAvailable,
        },
        isTrending: formData.isTrending,
        keywords: keywords,
        variants: variantsRecord,
        unitType: formData.unitType,
        isActive: existingData.isActive, // Preserve existing isActive status
        createdAt, // Preserve original creation date
        updatedAt: serverTimestamp(),
      }, { merge: true });
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
        },
        categoryIds: formData.categoryIds || [],
        taxDetails: {
          cgst: formData.taxDetails.cgst,
          sgst: formData.taxDetails.sgst,
          gstPercentage: formData.taxDetails.gstPercentage,
          hsnCode: formData.taxDetails.hsnCode,
        },
        productDetails: {
          productName: formData.productDetails.productName.trim(),
          productPrice: formData.productDetails.productPrice,
          productStock: formData.productDetails.productStock,
          productDescription: formData.productDetails.productDescription || [],
          materialCode: formData.productDetails.materialCode?.trim() || '',
          linkUrl: formData.productDetails.linkUrl?.trim() || null,
          returnAvailable: formData.productDetails.returnAvailable,
          reviewAvailable: formData.productDetails.reviewAvailable,
        },
        isTrending: formData.isTrending,
        keywords: keywords,
        variants: variantsRecord,
        unitType: formData.unitType,
        isActive: true,
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

    return {
      id: productDoc.id,
      ...productDoc.data(),
    } as ProductProps;
  } catch (error) {
    console.error('Error fetching product from Firebase:', error);
    throw error;
  }
};
