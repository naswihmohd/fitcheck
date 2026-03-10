import React, { useEffect, useState } from 'react';
import { FiImage } from 'react-icons/fi';
import { HiXCircle } from 'react-icons/hi';

interface VariantImageUploaderProps {
  variantId: string;
  existingImages: string[];
  onExistingImagesChange: (images: string[]) => void;
  onNewFilesChange: (variantId: string, files: File[]) => void;
}

const VariantImageUploader: React.FC<VariantImageUploaderProps> = ({
  variantId,
  existingImages,
  onExistingImagesChange,
  onNewFilesChange,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;

    const newFiles = [...files, ...selectedFiles];
    const newPreviews = [
      ...previewUrls,
      ...selectedFiles.map((file) => URL.createObjectURL(file)),
    ];

    setFiles(newFiles);
    setPreviewUrls(newPreviews);
    onNewFilesChange(variantId, newFiles);
  };

  const handleRemoveExisting = (index: number) => {
    const updated = existingImages.filter((_, i) => i !== index);
    onExistingImagesChange(updated);
  };

  const handleRemoveNew = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    const updatedPreviews = previewUrls.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    setPreviewUrls(updatedPreviews);
    onNewFilesChange(variantId, updatedFiles);
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        Product Images
      </label>

      <label className="block cursor-pointer w-fit">
        <div className="flex items-center w-fit justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center transition hover:border-primary">
          <div>
            <FiImage className="mx-auto mb-2 h-6 w-6 text-gray-400" />
            <p className="text-sm font-medium text-gray-700">Click to upload images</p>
            <p className="mt-1 text-xs text-gray-500">You can select multiple images</p>
          </div>
        </div>
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </label>

      {(existingImages.length > 0 || previewUrls.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-3">
          {existingImages.map((image, index) => (
            <div
              key={`existing-${index}`}
              className="group relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200 bg-white"
            >
              <img
                src={image}
                alt={`Product ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveExisting(index)}
                className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-red-600 opacity-0 shadow-sm transition group-hover:opacity-100"
              >
                <HiXCircle className="h-4 w-4" />
              </button>
            </div>
          ))}

          {previewUrls.map((url, index) => (
            <div
              key={`new-${index}`}
              className="group relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200 bg-white"
            >
              <img
                src={url}
                alt={`New product ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveNew(index)}
                className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-red-600 opacity-0 shadow-sm transition group-hover:opacity-100"
              >
                <HiXCircle className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VariantImageUploader;

