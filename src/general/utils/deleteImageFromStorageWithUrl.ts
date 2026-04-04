import { ref, deleteObject } from "firebase/storage";
import { storage } from "../../firebaseConfig";

/**
 * Deletes an image from Firebase Storage using its download URL.
 * @param {string} imageUrl - The download URL of the image to delete.
 * @returns {Promise<void>}
 */
const deleteImageFromStorageWithUrl = async (imageUrl: string): Promise<void> => {
    if (!imageUrl || !imageUrl.startsWith("http")) {
        console.warn("Invalid or empty image URL provided for deletion.");
        return;
    }

    try {
        // Extract the path from the Firebase Storage URL
        // URL format: https://firebasestorage.googleapis.com/v0/b/[bucket]/o/[path]?alt=media&token=[token]
        const decodedUrl = decodeURIComponent(imageUrl);
        const pathStart = decodedUrl.lastIndexOf('/o/') + 3;
        const pathEnd = decodedUrl.indexOf('?', pathStart);
        const path = pathEnd === -1
            ? decodedUrl.substring(pathStart)
            : decodedUrl.substring(pathStart, pathEnd);

        if (!path) {
            throw new Error("Could not extract storage path from URL");
        }

        const imageRef = ref(storage, path);
        await deleteObject(imageRef);
        console.log(`Successfully deleted image at path: ${path}`);
    } catch (error: any) {
        // If the file doesn't exist, we don't want to throw an error as it's already "deleted"
        if (error.code === 'storage/object-not-found') {
            console.warn("Storage object not found, skipping deletion.");
            return;
        }
        console.error("Error deleting image from Firebase Storage:", error);
        throw error;
    }
};

export default deleteImageFromStorageWithUrl;
