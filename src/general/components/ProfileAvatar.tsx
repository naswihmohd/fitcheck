import { useState } from 'react';
import ImageModal from './ImageModal';
import { getInitials } from '../utils/getInitials';

interface ProfileAvatarProps {
    name: string;
    imageUrl?: string | null;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    className?: string;
    bgColor?: string;
}

const ProfileAvatar = ({ 
    name, 
    imageUrl, 
    size = 'md', 
    className = '',
    bgColor = 'bg-primary'
}: ProfileAvatarProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const initials = getInitials(name);
    
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-lg',
        'xl': 'w-16 h-16 text-xl',
        '2xl': 'w-20 h-20 text-2xl'
    };

    const baseClasses = `rounded-full flex items-center justify-center font-semibold ${sizeClasses[size]} ${className}`;

    const handleImageClick = (e: React.MouseEvent) => {
        if (imageUrl) {
            e.stopPropagation();
            setIsModalOpen(true);
        }
    };

    if (imageUrl) {
        return (
            <>
                <div 
                    className={`${baseClasses} overflow-hidden cursor-pointer hover:opacity-80 transition-opacity duration-200`}
                    onClick={handleImageClick}
                >
                    <img 
                        src={imageUrl} 
                        alt={name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            // Fallback to initials if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                                parent.innerHTML = `<span class="text-white">${initials}</span>`;
                                parent.className = `${baseClasses} ${bgColor}`;
                            }
                        }}
                    />
                </div>
                
                <ImageModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    imageUrl={imageUrl}
                    altText={name}
                />
            </>
        );
    }

    return (
        <div className={`${baseClasses} ${bgColor} text-white`}>
            <span>{initials}</span>
        </div>
    );
};

export default ProfileAvatar;
