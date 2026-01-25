import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../../firebaseConfig';
import toast from 'react-hot-toast';
import { HiX } from 'react-icons/hi';
import { useDispatch } from 'react-redux';
import { updateApplicationData } from '../../redux/generalSlice';
import type { ApplicationProps, SocialMedia } from '../../data/applicationTypes';
import type { AppDispatch } from '../../../../general/redux/store';

interface EditSocialMediaModalProps {
    isOpen: boolean;
    onClose: () => void;
    socialMediaData: ApplicationProps | null;
}

interface SocialMediaFormData {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
    youtube: string;
    tiktok: string;
    x: string;
    telegram: string;
    whatsapp: string;
    discord: string;
    reddit: string;
    pinterest: string;
}

const EditSocialMediaModal: React.FC<EditSocialMediaModalProps> = ({ isOpen, onClose, socialMediaData }) => {
    const dispatch: AppDispatch = useDispatch();
    const [mounted, setMounted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<SocialMediaFormData>({
        defaultValues: {
            facebook: '',
            instagram: '',
            twitter: '',
            linkedin: '',
            youtube: '',
            tiktok: '',
            x: '',
            telegram: '',
            whatsapp: '',
            discord: '',
            reddit: '',
            pinterest: '',
        },
        mode: 'onTouched',
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen && socialMediaData?.socialMedia) {
            reset({
                facebook: socialMediaData.socialMedia.facebook || '',
                instagram: socialMediaData.socialMedia.instagram || '',
                twitter: socialMediaData.socialMedia.twitter || '',
                linkedin: socialMediaData.socialMedia.linkedin || '',
                youtube: socialMediaData.socialMedia.youtube || '',
                tiktok: socialMediaData.socialMedia.tiktok || '',
                x: socialMediaData.socialMedia.x || '',
                telegram: socialMediaData.socialMedia.telegram || '',
                whatsapp: socialMediaData.socialMedia.whatsapp || '',
                discord: socialMediaData.socialMedia.discord || '',
                reddit: socialMediaData.socialMedia.reddit || '',
                pinterest: socialMediaData.socialMedia.pinterest || '',
            });
        } else if (isOpen && !socialMediaData) {
            reset({
                facebook: '',
                instagram: '',
                twitter: '',
                linkedin: '',
                youtube: '',
                tiktok: '',
                x: '',
                telegram: '',
                whatsapp: '',
                discord: '',
                reddit: '',
                pinterest: '',
            });
        }
    }, [isOpen, socialMediaData, reset]);

    const onSubmit = async (data: SocialMediaFormData) => {
        try {
            setIsSubmitting(true);

            const docRef = doc(db, 'general', 'applicationData');

            // Build socialMedia object with only non-empty values
            const socialMediaEntries: Partial<SocialMedia> = {};
            
            if (data.facebook.trim()) socialMediaEntries.facebook = data.facebook.trim();
            if (data.instagram.trim()) socialMediaEntries.instagram = data.instagram.trim();
            if (data.twitter.trim()) socialMediaEntries.twitter = data.twitter.trim();
            if (data.linkedin.trim()) socialMediaEntries.linkedin = data.linkedin.trim();
            if (data.youtube.trim()) socialMediaEntries.youtube = data.youtube.trim();
            if (data.tiktok.trim()) socialMediaEntries.tiktok = data.tiktok.trim();
            if (data.x.trim()) socialMediaEntries.x = data.x.trim();
            if (data.telegram.trim()) socialMediaEntries.telegram = data.telegram.trim();
            if (data.whatsapp.trim()) socialMediaEntries.whatsapp = data.whatsapp.trim();
            if (data.discord.trim()) socialMediaEntries.discord = data.discord.trim();
            if (data.reddit.trim()) socialMediaEntries.reddit = data.reddit.trim();
            if (data.pinterest.trim()) socialMediaEntries.pinterest = data.pinterest.trim();

            const socialMediaToSave: ApplicationProps = {
                companyInfo: socialMediaData?.companyInfo || {
                    companyName: '',
                    email: '',
                    phoneNumber: '',
                    taxNumber: '',
                    country: '',
                    currency: '',
                    address: '',
                },
                socialMedia: socialMediaEntries,
            };

            await setDoc(docRef, socialMediaToSave, { merge: true });

            // Update Redux state immediately
            dispatch(updateApplicationData({ applicationData: socialMediaToSave }));

            toast.success('Social media links updated successfully!');
            onClose();
        } catch (error) {
            console.error('Error saving social media data:', error);
            toast.error('Failed to save social media links. Please try again.');
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
                                Edit Social Media Links
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <HiX className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Scrollable Form Content */}
                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
                            <div className="flex-1 overflow-y-auto p-5">
                                <div className="space-y-5">
                                    {/* Facebook */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Facebook
                                        </label>
                                        <input
                                            type="text"
                                            {...register('facebook', {
                                                validate: (value) => {
                                                    if (value && !value.match(/^(https?:\/\/)?(www\.)?(facebook\.com|fb\.com)/i) && !value.match(/^[a-zA-Z0-9.]+$/)) {
                                                        return 'Please enter a valid Facebook URL';
                                                    }
                                                    return true;
                                                },
                                            })}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                                            placeholder="https://facebook.com/yourpage"
                                        />
                                        {errors.facebook && (
                                            <p className="mt-1 text-xs text-red-500">{errors.facebook.message}</p>
                                        )}
                                    </div>

                                    {/* Instagram */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Instagram
                                        </label>
                                        <input
                                            type="text"
                                            {...register('instagram', {
                                                validate: (value) => {
                                                    if (value && !value.match(/^(https?:\/\/)?(www\.)?instagram\.com/i) && !value.match(/^[a-zA-Z0-9._]+$/)) {
                                                        return 'Please enter a valid Instagram URL';
                                                    }
                                                    return true;
                                                },
                                            })}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                                            placeholder="https://instagram.com/yourprofile"
                                        />
                                        {errors.instagram && (
                                            <p className="mt-1 text-xs text-red-500">{errors.instagram.message}</p>
                                        )}
                                    </div>

                                    {/* Twitter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Twitter
                                        </label>
                                        <input
                                            type="text"
                                            {...register('twitter', {
                                                validate: (value) => {
                                                    if (value && !value.match(/^(https?:\/\/)?(www\.)?twitter\.com/i) && !value.match(/^[a-zA-Z0-9_]+$/)) {
                                                        return 'Please enter a valid Twitter URL';
                                                    }
                                                    return true;
                                                },
                                            })}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                                            placeholder="https://twitter.com/yourhandle"
                                        />
                                        {errors.twitter && (
                                            <p className="mt-1 text-xs text-red-500">{errors.twitter.message}</p>
                                        )}
                                    </div>

                                    {/* X (Twitter) */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            X (Twitter)
                                        </label>
                                        <input
                                            type="text"
                                            {...register('x', {
                                                validate: (value) => {
                                                    if (value && !value.match(/^(https?:\/\/)?(www\.)?(x\.com|twitter\.com)/i) && !value.match(/^[a-zA-Z0-9_]+$/)) {
                                                        return 'Please enter a valid X/Twitter URL';
                                                    }
                                                    return true;
                                                },
                                            })}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                                            placeholder="https://x.com/yourhandle"
                                        />
                                        {errors.x && (
                                            <p className="mt-1 text-xs text-red-500">{errors.x.message}</p>
                                        )}
                                    </div>

                                    {/* LinkedIn */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            LinkedIn
                                        </label>
                                        <input
                                            type="text"
                                            {...register('linkedin', {
                                                validate: (value) => {
                                                    if (value && !value.match(/^(https?:\/\/)?(www\.)?linkedin\.com/i) && !value.match(/^[a-zA-Z0-9-]+$/)) {
                                                        return 'Please enter a valid LinkedIn URL';
                                                    }
                                                    return true;
                                                },
                                            })}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                                            placeholder="https://linkedin.com/in/yourprofile"
                                        />
                                        {errors.linkedin && (
                                            <p className="mt-1 text-xs text-red-500">{errors.linkedin.message}</p>
                                        )}
                                    </div>

                                    {/* YouTube */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            YouTube
                                        </label>
                                        <input
                                            type="text"
                                            {...register('youtube', {
                                                validate: (value) => {
                                                    if (value && !value.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)/i) && !value.match(/^[a-zA-Z0-9_-]+$/)) {
                                                        return 'Please enter a valid YouTube URL or channel name';
                                                    }
                                                    return true;
                                                },
                                            })}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                                            placeholder="https://youtube.com/channel/yourchannel or channel name"
                                        />
                                        {errors.youtube && (
                                            <p className="mt-1 text-xs text-red-500">{errors.youtube.message}</p>
                                        )}
                                    </div>

                                    {/* TikTok */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            TikTok
                                        </label>
                                        <input
                                            type="text"
                                            {...register('tiktok', {
                                                validate: (value) => {
                                                    if (value && !value.match(/^(https?:\/\/)?(www\.)?tiktok\.com/i) && !value.match(/^[a-zA-Z0-9._]+$/)) {
                                                        return 'Please enter a valid TikTok URL';
                                                    }
                                                    return true;
                                                },
                                            })}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                                            placeholder="https://tiktok.com/@yourusername"
                                        />
                                        {errors.tiktok && (
                                            <p className="mt-1 text-xs text-red-500">{errors.tiktok.message}</p>
                                        )}
                                    </div>

                                    {/* Telegram */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Telegram
                                        </label>
                                        <input
                                            type="text"
                                            {...register('telegram', {
                                                validate: (value) => {
                                                    if (value && !value.match(/^(https?:\/\/)?(www\.)?t\.me/i) && !value.match(/^[a-zA-Z0-9_]+$/)) {
                                                        return 'Please enter a valid Telegram URL';
                                                    }
                                                    return true;
                                                },
                                            })}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                                            placeholder="https://t.me/yourusername"
                                        />
                                        {errors.telegram && (
                                            <p className="mt-1 text-xs text-red-500">{errors.telegram.message}</p>
                                        )}
                                    </div>

                                    {/* WhatsApp */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            WhatsApp
                                        </label>
                                        <input
                                            type="text"
                                            {...register('whatsapp', {
                                                validate: (value) => {
                                                    if (value && !value.match(/^(https?:\/\/)?(wa\.me|api\.whatsapp\.com)/i) && !value.match(/^\+?[1-9]\d{1,14}$/)) {
                                                        return 'Please enter a valid WhatsApp URL or phone number';
                                                    }
                                                    return true;
                                                },
                                            })}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                                            placeholder="https://wa.me/1234567890 or phone number"
                                        />
                                        {errors.whatsapp && (
                                            <p className="mt-1 text-xs text-red-500">{errors.whatsapp.message}</p>
                                        )}
                                    </div>

                                    {/* Discord */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Discord
                                        </label>
                                        <input
                                            type="text"
                                            {...register('discord', {
                                                validate: (value) => {
                                                    if (value && !value.match(/^(https?:\/\/)?(discord\.gg|discord\.com)/i) && !value.match(/^[a-zA-Z0-9]+$/)) {
                                                        return 'Please enter a valid Discord invite URL or server ID';
                                                    }
                                                    return true;
                                                },
                                            })}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                                            placeholder="https://discord.gg/invitecode or invite code"
                                        />
                                        {errors.discord && (
                                            <p className="mt-1 text-xs text-red-500">{errors.discord.message}</p>
                                        )}
                                    </div>

                                    {/* Reddit */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Reddit
                                        </label>
                                        <input
                                            type="text"
                                            {...register('reddit', {
                                                validate: (value) => {
                                                    if (value && !value.match(/^(https?:\/\/)?(www\.)?reddit\.com/i) && !value.match(/^[a-zA-Z0-9_]+$/)) {
                                                        return 'Please enter a valid Reddit URL or subreddit/username';
                                                    }
                                                    return true;
                                                },
                                            })}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                                            placeholder="https://reddit.com/r/subreddit or subreddit/username"
                                        />
                                        {errors.reddit && (
                                            <p className="mt-1 text-xs text-red-500">{errors.reddit.message}</p>
                                        )}
                                    </div>

                                    {/* Pinterest */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Pinterest
                                        </label>
                                        <input
                                            type="text"
                                            {...register('pinterest', {
                                                validate: (value) => {
                                                    if (value && !value.match(/^(https?:\/\/)?(www\.)?pinterest\.com/i) && !value.match(/^[a-zA-Z0-9_-]+$/)) {
                                                        return 'Please enter a valid Pinterest URL';
                                                    }
                                                    return true;
                                                },
                                            })}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                                            placeholder="https://pinterest.com/yourprofile"
                                        />
                                        {errors.pinterest && (
                                            <p className="mt-1 text-xs text-red-500">{errors.pinterest.message}</p>
                                        )}
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

export default EditSocialMediaModal;
