import { useForm, Controller } from 'react-hook-form';
import { useState, useRef, useEffect } from 'react';
import { FiImage, FiChevronDown } from 'react-icons/fi';
import imageCompression from 'browser-image-compression';
import toast from 'react-hot-toast';
import type { NotificationType } from '../../data/notificationTypes';

interface NoticeBoardFormData {
    image: FileList | null;
    studentId: string;
    caption: string;
    description: string;
}

interface NoticeBoardFormProps {
    onSubmit: (data: {
        image: File | null;
        studentId: string;
        caption: string;
        description: string;
    }) => void;
    loading: boolean;
    shouldReset?: boolean;
    type: NotificationType;
}

const NoticeBoardForm = ({ onSubmit, loading, shouldReset = false, type }: NoticeBoardFormProps) => {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        watch,
        reset,
        setValue,
    } = useForm<NoticeBoardFormData>({
        defaultValues: {
            image: null,
            studentId: '',
            caption: '',
            description: '',
        },
    });

    const imageFile = watch('image');
    const prevShouldResetRef = useRef(shouldReset);

    // Reset form when shouldReset changes from false to true (successful submission)
    useEffect(() => {
        if (prevShouldResetRef.current === false && shouldReset === true) {
            // Reset form fields
            reset({
                image: null,
                studentId: '',
                caption: '',
                description: '',
            });
            // Reset image-related state
            setImagePreview(null);
            setSelectedImageFile(null);
            // Clear file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
        prevShouldResetRef.current = shouldReset;
    }, [shouldReset, reset]);

    // Handle image preview and compression
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const fileSizeKB = file.size / 1024;
        if (fileSizeKB > 5000) { // 5MB limit
            try {
                const options = {
                    maxSizeMB: 5,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                };

                const compressedFile = await imageCompression(file, options);
                const compressedSizeKB = compressedFile.size / 1024;

                if (compressedSizeKB > 5000) {
                    toast.error("Unable to compress image below 5MB.");
                    return;
                }

                setSelectedImageFile(compressedFile);
                setImagePreview(URL.createObjectURL(compressedFile));
                // Update form field with the original FileList for display
                setValue('image', e.target.files);
            } catch (error) {
                console.error("Image compression error:", error);
                toast.error("Failed to compress image.");
            }
        } else {
            setSelectedImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            // Update form field with the FileList
            setValue('image', e.target.files);
        }
    };

    const handleFileButtonClick = () => {
        fileInputRef.current?.click();
    };

    const onSubmitForm = (data: NoticeBoardFormData) => {
        onSubmit({
            image: selectedImageFile,
            studentId: data.studentId,
            caption: data.caption,
            description: data.description,
        });
    };

    // Dummy student list - replace with actual data from your API/state
    const students = [
        { id: '1', name: 'John Doe' },
        { id: '2', name: 'Jane Smith' },
        { id: '3', name: 'Bob Johnson' },
    ];

    return (
        <form
            onSubmit={handleSubmit(onSubmitForm)}
            className="space-y-6 py-4"
        >
            {/* Image Upload Section */}
            <div className="flex gap-6 items-start">
                {/* Label Column */}
                <div className="w-48 flex-shrink-0 pt-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Image
                    </label>
                </div>

                {/* Input Column */}
                <div className="flex-1 space-y-3">
                    {/* File Input Row */}
                    <div className="flex items-center gap-2">
                        <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/svg+xml"
                            {...register('image', {
                                validate: {
                                    fileSize: (files) => {
                                        if (!files || files.length === 0) return true;
                                        const file = files[0];
                                        const maxSize = 5 * 1024 * 1024; // 5MB
                                        if (file.size > maxSize) {
                                            return 'Image size should be less than 5MB';
                                        }
                                        return true;
                                    },
                                    fileType: (files) => {
                                        if (!files || files.length === 0) return true;
                                        const file = files[0];
                                        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
                                        if (!validTypes.includes(file.type)) {
                                            return 'Please upload a valid image (JPG, PNG, or SVG)';
                                        }
                                        return true;
                                    },
                                },
                            })}
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={handleFileButtonClick}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Choose File
                        </button>
                        <span className="text-sm text-gray-500">
                            {imageFile && imageFile.length > 0 ? imageFile[0].name : 'No File Choosen'}
                        </span>
                    </div>
                    {errors.image && (
                        <p className="text-sm text-red-600">{errors.image.message}</p>
                    )}

                    {/* Image Preview and Format Info */}
                    <div className="flex items-center gap-6">
                        {/* Image Preview Box */}
                        <div className="flex flex-col gap-2">
                            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 relative overflow-hidden">
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <FiImage className="w-12 h-12 text-gray-400" />
                                )}
                            </div>
                            <p className="text-xs text-gray-500">Resolution 48w*48h</p>
                        </div>

                        {/* Format Suggestions */}
                        <div className="flex items-center">
                            <p className="text-sm text-gray-600">
                                Suggested Image Format: JPG/PNG SVG
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {type === "student" && (
                <>
                    {/* Select Student (Optional) */}
                    <div className="flex gap-6 items-start">
                        {/* Label Column */}
                        <div className="w-48 flex-shrink-0 pt-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Select Student (Optional)
                            </label>
                        </div>

                        {/* Input Column */}
                        <div className="flex-1">
                            <Controller
                                name="studentId"
                                control={control}
                                render={({ field }) => (
                                    <div className="relative">
                                        <select
                                            {...field}
                                            className="w-full px-4 py-2.5 text-sm bg-white rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors pr-10"
                                        >
                                            <option value="">Select Student</option>
                                            {students.map((student) => (
                                                <option key={student.id} value={student.id}>
                                                    {student.name}
                                                </option>
                                            ))}
                                        </select>
                                        <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                )}
                            />
                        </div>
                    </div>
                </>
            )}

            {/* Caption Field */}
            <div className="flex gap-6 items-start">
                {/* Label Column */}
                <div className="w-48 flex-shrink-0 pt-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Caption<span className="text-red-500">*</span>
                    </label>
                </div>

                {/* Input Column */}
                <div className="flex-1 space-y-2">
                    <input
                        type="text"
                        {...register('caption', {
                            required: 'Caption is required',
                        })}
                        placeholder="Create A Caption For Notification."
                        className="w-full px-4 py-2.5 text-sm bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                    {errors.caption && (
                        <p className="text-sm text-red-600">{errors.caption.message}</p>
                    )}
                </div>
            </div>

            {/* Description Field */}
            <div className="flex gap-6 items-start">
                {/* Label Column */}
                <div className="w-48 flex-shrink-0 pt-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Description<span className="text-red-500">*</span>
                    </label>
                </div>

                {/* Input Column */}
                <div className="flex-1 space-y-2">
                    <textarea
                        {...register('description', {
                            required: 'Description is required',
                        })}
                        placeholder="Enter Description."
                        rows={6}
                        className="w-full px-4 py-2.5 text-sm bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                    />
                    {errors.description && (
                        <p className="text-sm text-red-600">{errors.description.message}</p>
                    )}
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
                <button
                    disabled={loading}
                    type="submit"
                    className="px-6 py-2.5 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors cursor-pointer font-medium text-sm"
                >
                    Submit
                </button>
            </div>
        </form>
    );
};

export default NoticeBoardForm;

