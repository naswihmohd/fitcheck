import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../../firebaseConfig';
import toast from 'react-hot-toast';
import { HiX, HiPlus, HiTrash } from 'react-icons/hi';
import { useDispatch } from 'react-redux';
import type { HeroBannerConfig, BottomStat } from '../../../heroThemes/data/heroTypes';
import type { BannerProps } from '../../data/heroBannerTypes';
import type { AppDispatch } from '../../../../general/redux/store';
import { updateBannerData } from '../../redux/bannerSlice';

interface HeroBannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    bannerData: HeroBannerConfig | null;
    selectedBannerId: string | null;
    fullBannerData: BannerProps | null;
}

interface HeroBannerFormData {
    bannerId: string;
    title: string;
    subtitle: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    imageUrl: string;
    textColor: string;
    buttonBackgroundColor: string;
    buttonTextColor: string;
    subtitleTextColor: string;
    descriptionTextColor: string;
}

const HeroBannerModal: React.FC<HeroBannerModalProps> = ({ isOpen, onClose, bannerData, selectedBannerId, fullBannerData }) => {
    const dispatch: AppDispatch = useDispatch();
    const [mounted, setMounted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bottomStats, setBottomStats] = useState<BottomStat[]>([]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue,
    } = useForm<HeroBannerFormData>({
        defaultValues: {
            bannerId: '',
            title: '',
            subtitle: '',
            description: '',
            buttonText: '',
            buttonLink: '',
            imageUrl: '',
            textColor: '#000000',
            buttonBackgroundColor: '#ffffff',
            buttonTextColor: '#000000',
            subtitleTextColor: '#ffffff',
            descriptionTextColor: '#ffffff',
        },
        mode: 'onTouched',
    });

    const selectedBannerIdValue = watch('bannerId');

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            reset({
                bannerId: bannerData?.bannerId || '',
                title: bannerData?.title || '',
                subtitle: bannerData?.subtitle || '',
                description: bannerData?.description || '',
                buttonText: bannerData?.buttonText || '',
                buttonLink: bannerData?.buttonLink || '',
                imageUrl: bannerData?.imageUrl || '',
                textColor: bannerData?.textColor || '#000000',
                buttonBackgroundColor: bannerData?.buttonBackgroundColor || '#ffffff',
                buttonTextColor: bannerData?.buttonTextColor || '#000000',
                subtitleTextColor: bannerData?.subtitleTextColor || '#ffffff',
                descriptionTextColor: bannerData?.descriptionTextColor || '#ffffff',
            });
            setBottomStats(bannerData?.bottomStats || []);
        }
    }, [isOpen, selectedBannerId, bannerData, reset]);

    const onSubmit = async (data: HeroBannerFormData) => {
        data.bannerId = selectedBannerId || '';
        try {
            setIsSubmitting(true);

            if (!data.bannerId) {
                toast.error('Please select a banner design');
                return;
            }

            const docRef = doc(db, 'general', 'banners');

            // Build HeroBannerConfig object
            const bannerConfig: HeroBannerConfig = {
                bannerId: data.bannerId,
                title: data.title.trim(),
                imageUrl: data.imageUrl.trim(),
            };

            // Add optional fields only if they have values
            if (data.subtitle.trim()) {
                bannerConfig.subtitle = data.subtitle.trim();
            }
            if (data.description.trim()) {
                bannerConfig.description = data.description.trim();
            }
            if (data.buttonText.trim()) {
                bannerConfig.buttonText = data.buttonText.trim();
            }
            if (data.buttonLink.trim()) {
                bannerConfig.buttonLink = data.buttonLink.trim();
            }
            if (data.textColor && data.textColor !== '#000000') {
                bannerConfig.textColor = data.textColor;
            }
            if (data.buttonBackgroundColor && data.buttonBackgroundColor !== '#ffffff') {
                bannerConfig.buttonBackgroundColor = data.buttonBackgroundColor;
            }
            if (data.buttonTextColor && data.buttonTextColor !== '#000000') {
                bannerConfig.buttonTextColor = data.buttonTextColor;
            }
            if (data.subtitleTextColor && data.subtitleTextColor !== '#ffffff') {
                bannerConfig.subtitleTextColor = data.subtitleTextColor;
            }
            if (data.descriptionTextColor && data.descriptionTextColor !== '#ffffff') {
                bannerConfig.descriptionTextColor = data.descriptionTextColor;
            }
            if (bottomStats.length > 0) {
                bannerConfig.bottomStats = bottomStats.filter(stat => stat.value.trim() && stat.label.trim());
            }

            // Get existing banner data from Redux or create new structure
            const existingHeroBanners = fullBannerData?.heroBanners || {};
            const updatedHeroBanners: Record<string, HeroBannerConfig> = {
                ...existingHeroBanners,
                [data.bannerId]: bannerConfig,
            };

            const bannerDataToSave: BannerProps = {
                heroBanners: updatedHeroBanners,
            };

            await setDoc(docRef, bannerDataToSave, { merge: true });

            // Update Redux state immediately
            dispatch(updateBannerData({ bannerData: bannerDataToSave }));

            toast.success('Hero banner updated successfully!');
            onClose();
        } catch (error) {
            console.error('Error saving hero banner data:', error);
            toast.error('Failed to save hero banner. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-end">
                    {/* Background Overlay */}
                    <motion.div
                        className="absolute inset-0 bg-black/50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        className="z-40 w-full max-w-[500px] h-full bg-white flex flex-col rounded-l-[14px] shadow-xl"
                        initial={{ opacity: 0, x: 500 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 500 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Fixed Header */}
                        <div className="flex bg-primary rounded-tl-[14px] items-center justify-between px-5 py-2 border-b border-gray-200 flex-shrink-0">
                            <h2 className="text-base font-semibold text-white">
                                {selectedBannerIdValue ? `Edit ${bannerData?.title || 'Banner'}` : 'Add Hero Banner'}
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <HiX className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {/* Scrollable Form Content */}
                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
                            <div className="flex-1 overflow-y-auto p-5">
                                <div className="space-y-5">

                                    {/* Background Image URL */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Background Image URL <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="url"
                                            {...register('imageUrl', {
                                                required: 'Image URL is required',
                                                pattern: {
                                                    value: /^https?:\/\/.+/i,
                                                    message: 'Please enter a valid URL',
                                                },
                                            })}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                        {errors.imageUrl && (
                                            <p className="mt-1 text-xs text-red-500">{errors.imageUrl.message}</p>
                                        )}
                                    </div>

                                    {/* Title */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            {...register('title', {
                                                required: 'Title is required',
                                            })}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                                            placeholder="Enter banner title"
                                        />
                                        {errors.title && (
                                            <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
                                        )}
                                    </div>

                                    {/* Title Color */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Title Color
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={watch('textColor')}
                                                className="w-16 h-10 rounded-lg border border-gray-200 cursor-pointer"
                                                onChange={(e) => {
                                                    setValue('textColor', e.target.value, { shouldValidate: true });
                                                }}
                                            />
                                            <input
                                                type="text"
                                                {...register('textColor', {
                                                    pattern: {
                                                        value: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
                                                        message: 'Please enter a valid hex color',
                                                    },
                                                })}
                                                className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                                                placeholder="#000000"
                                            />
                                        </div>
                                        {errors.textColor && (
                                            <p className="mt-1 text-xs text-red-500">{errors.textColor.message}</p>
                                        )}
                                    </div>

                                    {/* Subtitle */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Subtitle
                                        </label>
                                        <input
                                            type="text"
                                            {...register('subtitle')}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                                            placeholder="Enter banner subtitle"
                                        />
                                    </div>

                                    {/* Subtitle Text Color */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Subtitle Text Color
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={watch('subtitleTextColor')}
                                                className="w-16 h-10 rounded-lg border border-gray-200 cursor-pointer"
                                                onChange={(e) => {
                                                    setValue('subtitleTextColor', e.target.value, { shouldValidate: true });
                                                }}
                                            />
                                            <input
                                                type="text"
                                                {...register('subtitleTextColor', {
                                                    pattern: {
                                                        value: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
                                                        message: 'Please enter a valid hex color',
                                                    },
                                                })}
                                                className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                                                placeholder="#ffffff"
                                            />
                                        </div>
                                        {errors.subtitleTextColor && (
                                            <p className="mt-1 text-xs text-red-500">{errors.subtitleTextColor.message}</p>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            {...register('description')}
                                            rows={4}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none resize-none"
                                            placeholder="Enter banner description"
                                        />
                                    </div>

                                    {/* Description Text Color */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description Text Color
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={watch('descriptionTextColor')}
                                                className="w-16 h-10 rounded-lg border border-gray-200 cursor-pointer"
                                                onChange={(e) => {
                                                    setValue('descriptionTextColor', e.target.value, { shouldValidate: true });
                                                }}
                                            />
                                            <input
                                                type="text"
                                                {...register('descriptionTextColor', {
                                                    pattern: {
                                                        value: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
                                                        message: 'Please enter a valid hex color',
                                                    },
                                                })}
                                                className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                                                placeholder="#ffffff"
                                            />
                                        </div>
                                        {errors.descriptionTextColor && (
                                            <p className="mt-1 text-xs text-red-500">{errors.descriptionTextColor.message}</p>
                                        )}
                                    </div>

                                    {/* Button Text */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Button Text
                                        </label>
                                        <input
                                            type="text"
                                            {...register('buttonText')}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                                            placeholder="e.g., Shop Now, Learn More"
                                        />
                                    </div>

                                    {/* Button Link */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Button Link
                                        </label>
                                        <input
                                            type="url"
                                            {...register('buttonLink', {
                                                validate: (value) => {
                                                    if (value && !value.match(/^https?:\/\/.+/i)) {
                                                        return 'Please enter a valid URL';
                                                    }
                                                    return true;
                                                },
                                            })}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                                            placeholder="https://example.com/page"
                                        />
                                        {errors.buttonLink && (
                                            <p className="mt-1 text-xs text-red-500">{errors.buttonLink.message}</p>
                                        )}
                                    </div>

                                    {/* Button Text Color */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Button Text Color
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={watch('buttonTextColor')}
                                                className="w-16 h-10 rounded-lg border border-gray-200 cursor-pointer"
                                                onChange={(e) => {
                                                    setValue('buttonTextColor', e.target.value, { shouldValidate: true });
                                                }}
                                            />
                                            <input
                                                type="text"
                                                {...register('buttonTextColor', {
                                                    pattern: {
                                                        value: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
                                                        message: 'Please enter a valid hex color',
                                                    },
                                                })}
                                                className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                                                placeholder="#000000"
                                            />
                                        </div>
                                        {errors.buttonTextColor && (
                                            <p className="mt-1 text-xs text-red-500">{errors.buttonTextColor.message}</p>
                                        )}
                                    </div>

                                    {/* Button Background Color */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Button Background Color
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={watch('buttonBackgroundColor')}
                                                className="w-16 h-10 rounded-lg border border-gray-200 cursor-pointer"
                                                onChange={(e) => {
                                                    setValue('buttonBackgroundColor', e.target.value, { shouldValidate: true });
                                                }}
                                            />
                                            <input
                                                type="text"
                                                {...register('buttonBackgroundColor', {
                                                    pattern: {
                                                        value: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
                                                        message: 'Please enter a valid hex color',
                                                    },
                                                })}
                                                className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                                                placeholder="#ffffff"
                                            />
                                        </div>
                                        {errors.buttonBackgroundColor && (
                                            <p className="mt-1 text-xs text-red-500">{errors.buttonBackgroundColor.message}</p>
                                        )}
                                    </div>

                                    {/* Bottom Stats */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Bottom Stats Bar
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setBottomStats([...bottomStats, { value: '', label: '' }])}
                                                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                            >
                                                <HiPlus className="w-4 h-4" />
                                                Add Stat
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {bottomStats.map((stat, index) => (
                                                <div key={index} className="flex gap-2 items-start">
                                                    <div className="flex-1">
                                                        <input
                                                            type="text"
                                                            value={stat.value}
                                                            onChange={(e) => {
                                                                const updated = [...bottomStats];
                                                                updated[index] = { ...updated[index], value: e.target.value };
                                                                setBottomStats(updated);
                                                            }}
                                                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                                                            placeholder="Value (e.g., 50K+, 200+, 4.9★)"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <input
                                                            type="text"
                                                            value={stat.label}
                                                            onChange={(e) => {
                                                                const updated = [...bottomStats];
                                                                updated[index] = { ...updated[index], label: e.target.value };
                                                                setBottomStats(updated);
                                                            }}
                                                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                                                            placeholder="Label (e.g., Happy Customers)"
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const updated = bottomStats.filter((_, i) => i !== index);
                                                            setBottomStats(updated);
                                                        }}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <HiTrash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                            {bottomStats.length === 0 && (
                                                <p className="text-xs text-gray-500 italic">No stats added. Click "Add Stat" to add bottom stats.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Fixed Footer */}
                            <div className="flex gap-2 justify-end px-5 py-3 border-t border-gray-200 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default HeroBannerModal;
