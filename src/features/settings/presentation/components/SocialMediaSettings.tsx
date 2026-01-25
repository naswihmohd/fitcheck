import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MdEdit } from 'react-icons/md';
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaYoutube, FaTiktok, FaTelegram, FaWhatsapp, FaDiscord, FaReddit, FaPinterest } from 'react-icons/fa';
import EditSocialMediaModal from './EditSocialMediaModal';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { fetchApplicationData } from '../../redux/generalSlice';
import type { RootState, AppDispatch } from '../../../../general/redux/store';

interface SocialMediaCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    delay?: number;
    url?: string;
    iconColor?: string;
}

const SocialMediaCard: React.FC<SocialMediaCardProps> = ({ icon, label, value, delay = 0, url, iconColor = '#6B7280' }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay }}
            className="relative bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-5"
        >
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center" style={{ color: iconColor }}>
                    {icon}
                </div>
                <div className="flex-1 my-auto min-w-0">
                    <p className="text-xs font-medium text-black/90 uppercase tracking-wide mb-1">
                        {label}
                    </p>
                    {value ? (
                        <a
                            href={url || value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold text-primary hover:underline truncate block"
                        >
                            {value}
                        </a>
                    ) : (
                        <p className="text-sm font-semibold text-black/50 italic">Not set</p>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const SocialMediaSettings: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const { applicationData, error } = useSelector((state: RootState) => state.general);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (applicationData) return;
        dispatch(fetchApplicationData());
    }, []);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const handleEditClick = () => {
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        dispatch(fetchApplicationData()); // Refresh data after modal closes
    };

    const socialMedia = applicationData?.socialMedia || {};

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            {/* Header Card */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold mb-1">Social Media Links</h2>
                    <p className="text-black/50 text-sm">Manage your social media profiles and links</p>
                </div>
                <button
                    onClick={handleEditClick}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-primary rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold hover:shadow-md"
                >
                    <MdEdit className="w-5 h-5" />
                    Edit Links
                </button>
            </div>

            {/* Social Media Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SocialMediaCard
                    icon={<FaFacebook className="w-6 h-6" />}
                    label="Facebook"
                    value={socialMedia.facebook || ''}
                    url={socialMedia.facebook?.startsWith('http') ? socialMedia.facebook : `https://facebook.com/${socialMedia.facebook}`}
                    delay={0.1}
                    iconColor="#1877F2"
                />
                <SocialMediaCard
                    icon={<FaInstagram className="w-6 h-6" />}
                    label="Instagram"
                    value={socialMedia.instagram || ''}
                    url={socialMedia.instagram?.startsWith('http') ? socialMedia.instagram : `https://instagram.com/${socialMedia.instagram}`}
                    delay={0.15}
                    iconColor="#E4405F"
                />
                <SocialMediaCard
                    icon={<FaTwitter className="w-6 h-6" />}
                    label="Twitter"
                    value={socialMedia.twitter || ''}
                    url={socialMedia.twitter?.startsWith('http') ? socialMedia.twitter : `https://twitter.com/${socialMedia.twitter}`}
                    delay={0.2}
                    iconColor="#1DA1F2"
                />
                <SocialMediaCard
                    icon={<FaTwitter className="w-6 h-6" />}
                    label="X (Twitter)"
                    value={socialMedia.x || ''}
                    url={socialMedia.x?.startsWith('http') ? socialMedia.x : `https://x.com/${socialMedia.x}`}
                    delay={0.25}
                    iconColor="#000000"
                />
                <SocialMediaCard
                    icon={<FaLinkedin className="w-6 h-6" />}
                    label="LinkedIn"
                    value={socialMedia.linkedin || ''}
                    url={socialMedia.linkedin?.startsWith('http') ? socialMedia.linkedin : `https://linkedin.com/in/${socialMedia.linkedin}`}
                    delay={0.3}
                    iconColor="#0077B5"
                />
                <SocialMediaCard
                    icon={<FaYoutube className="w-6 h-6" />}
                    label="YouTube"
                    value={socialMedia.youtube || ''}
                    url={socialMedia.youtube?.startsWith('http') ? socialMedia.youtube : `https://youtube.com/${socialMedia.youtube}`}
                    delay={0.35}
                    iconColor="#FF0000"
                />
                <SocialMediaCard
                    icon={<FaTiktok className="w-6 h-6" />}
                    label="TikTok"
                    value={socialMedia.tiktok || ''}
                    url={socialMedia.tiktok?.startsWith('http') ? socialMedia.tiktok : `https://tiktok.com/@${socialMedia.tiktok}`}
                    delay={0.4}
                    iconColor="#000000"
                />
                <SocialMediaCard
                    icon={<FaTelegram className="w-6 h-6" />}
                    label="Telegram"
                    value={socialMedia.telegram || ''}
                    url={socialMedia.telegram?.startsWith('http') ? socialMedia.telegram : `https://t.me/${socialMedia.telegram}`}
                    delay={0.45}
                    iconColor="#0088CC"
                />
                <SocialMediaCard
                    icon={<FaWhatsapp className="w-6 h-6" />}
                    label="WhatsApp"
                    value={socialMedia.whatsapp || ''}
                    url={socialMedia.whatsapp?.startsWith('http') ? socialMedia.whatsapp : `https://wa.me/${socialMedia.whatsapp}`}
                    delay={0.5}
                    iconColor="#25D366"
                />
                <SocialMediaCard
                    icon={<FaDiscord className="w-6 h-6" />}
                    label="Discord"
                    value={socialMedia.discord || ''}
                    url={socialMedia.discord || ''}
                    delay={0.55}
                    iconColor="#5865F2"
                />
                <SocialMediaCard
                    icon={<FaReddit className="w-6 h-6" />}
                    label="Reddit"
                    value={socialMedia.reddit || ''}
                    url={socialMedia.reddit?.startsWith('http') ? socialMedia.reddit : `https://reddit.com/r/${socialMedia.reddit}`}
                    delay={0.6}
                    iconColor="#FF4500"
                />
                <SocialMediaCard
                    icon={<FaPinterest className="w-6 h-6" />}
                    label="Pinterest"
                    value={socialMedia.pinterest || ''}
                    url={socialMedia.pinterest?.startsWith('http') ? socialMedia.pinterest : `https://pinterest.com/${socialMedia.pinterest}`}
                    delay={0.65}
                    iconColor="#BD081C"
                />
            </div>

            {/* Edit Modal */}
            <EditSocialMediaModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                socialMediaData={applicationData}
            />
        </motion.div>
    );
};

export default SocialMediaSettings;
