import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebaseConfig";

export const checkDuplicateBrandName = async (brandName: string, excludeId?: string): Promise<boolean> => {
    const brandsCollectionRef = collection(db, 'brands');
    const trimmedName = brandName.trim();
    
    // Query for brands with the same name (case-insensitive check)
    const brandsQuery = query(
        brandsCollectionRef,
        where('brandName', '==', trimmedName)
    );
    
    const querySnapshot = await getDocs(brandsQuery);
    
    // If editing, exclude the current document
    if (excludeId) {
        return querySnapshot.docs.some(doc => doc.id !== excludeId);
    }
    
    // If creating, check if any document exists
    return !querySnapshot.empty;
};