import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { clearBrands, fetchBrands } from '../../../brandManagement/redux/brandSlice';
import type { AppDispatch, RootState } from '../../../../general/redux/store';
import type { BrandProps } from '../../../brandManagement/data/brandTypes';
import ProfileAvatar from '../../../../general/components/ProfileAvatar';
import ThreeDotLoading from '../../../../general/components/ThreeDotLoading';
import { HiX } from 'react-icons/hi';
import AddBrandButton from '../../../brandManagement/presentation/components/AddBrandButton';

interface SelectBrandModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (brand: { brandId: string; brandName: string; brandImage: string | null }) => void;
    title?: string;
    selectedBrandId?: string;
}

const SelectBrandModal: React.FC<SelectBrandModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Select Brand',
    selectedBrandId,
}) => {
    const [mounted, setMounted] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(selectedBrandId || null);
    const [searchQuery, setSearchQuery] = useState<string>('');

    const { brands, loading, error, hasMore } = useSelector((state: RootState) => state.brands);
    const dispatch: AppDispatch = useDispatch();

    // Fetch brands when modal opens
    useEffect(() => {
        if (!isOpen) return;
        dispatch(clearBrands());
        dispatch(fetchBrands({ params: { searchQuery: searchQuery || null } }));
    }, [dispatch, isOpen, searchQuery]);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (error) {
            console.error(error);
        }
    }, [error]);

    useEffect(() => {
        if (isOpen) {
            setSelectedId(selectedBrandId || null);
        }
    }, [isOpen, selectedBrandId]);

    const handleHasMore = () => {
        if (!loading && hasMore) {
            dispatch(fetchBrands({ params: { searchQuery: searchQuery || null } }));
        }
    };

    const handleBrandSelect = (brandId: string) => {
        setSelectedId(brandId);
    };

    const handleConfirm = () => {
        if (!selectedId) return;

        const selectedBrand = brands.find((brand: BrandProps) => brand.id === selectedId);
        if (selectedBrand) {
            onConfirm({
                brandId: selectedBrand.id,
                brandName: selectedBrand.brandName,
                brandImage: selectedBrand.imageUrl,
            });
        }
        setSearchQuery('');
        onClose();
    };

    const handleClose = () => {
        setSearchQuery('');
        onClose();
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        // Reset selection when search changes
        setSelectedId(null);
    };

    if (!mounted) return null;

    return (
        <>
            {createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-end">
                            <motion.div
                                className="absolute inset-0 bg-black/50"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={handleClose}
                            />

                            <motion.div
                                className="z-40 w-full max-w-[500px] h-full bg-white flex flex-col rounded-l-[14px] shadow-xl"
                                initial={{ opacity: 0, x: 500 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 500 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Fixed Header */}
                                <div className="flex bg-secondary rounded-tl-[14px] items-center justify-between px-5 py-2 border-b border-gray-200 flex-shrink-0">
                                    <h2 className="text-base font-semibold text-white">
                                        {title}
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleClose}
                                            className="p-1 hover:bg-white/20 rounded-full transition-colors"
                                            aria-label="Close"
                                        >
                                            <HiX className="w-5 h-5 text-white" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col overflow-hidden min-h-0">

                                    {/* Search Input */}
                                    <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-2">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={handleSearchChange}
                                            placeholder="Search brands..."
                                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary focus:outline-none"
                                        />

                                        <AddBrandButton />
                                    </div>

                                    {/* Brands List */}
                                    <div className="flex-1 overflow-y-auto p-6 space-y-3">
                                        {brands.length > 0 ? (
                                            <>
                                                {brands.map((brand: BrandProps, index: number) => {
                                                    const isSelected = selectedId === brand.id;
                                                    return (
                                                        <motion.div
                                                            key={brand.id}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{
                                                                duration: 0.3,
                                                                delay: index * 0.05
                                                            }}
                                                            onClick={() => handleBrandSelect(brand.id)}
                                                            className={`bg-white rounded-lg p-4 flex items-center gap-4 cursor-pointer transition-colors duration-200 border ${isSelected
                                                                ? 'border-secondary bg-secondary/5'
                                                                : 'border-gray-200 hover:border-secondary hover:bg-gray-50'
                                                                }`}
                                                            style={{
                                                                boxShadow: '0px 0.92px 2.75px 0px #0051AF1A',
                                                            }}
                                                        >
                                                            {/* Radio Button */}
                                                            <div className="flex-shrink-0">
                                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                                                                    ? 'border-secondary bg-secondary'
                                                                    : 'border-gray-300 bg-white'
                                                                    }`}>
                                                                    {isSelected && (
                                                                        <div className="w-2 h-2 rounded-full bg-white" />
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Brand Image/Avatar */}
                                                            <div className="flex-shrink-0">
                                                                <ProfileAvatar
                                                                    name={brand.brandName}
                                                                    imageUrl={brand.imageUrl}
                                                                    size="lg"
                                                                    bgColor="bg-primary"
                                                                />
                                                            </div>

                                                            {/* Brand Details */}
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="text-sm font-semibold text-gray-900 truncate">
                                                                    {brand.brandName}
                                                                </h3>
                                                                {brand.id && (
                                                                    <p className="text-xs text-gray-400 mt-1">
                                                                        ID: {brand.id}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}

                                                {loading && <ThreeDotLoading />}

                                                {!loading && hasMore && (
                                                    <button
                                                        onClick={handleHasMore}
                                                        className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors duration-300 mt-4"
                                                    >
                                                        Load More
                                                    </button>
                                                )}
                                            </>
                                        ) : !loading && (
                                            <div className="flex items-center justify-center py-12">
                                                <p className="text-sm text-gray-500">
                                                    {searchQuery ? 'No brands found matching your search.' : 'No brands available.'}
                                                </p>
                                            </div>
                                        )}

                                        {loading && brands.length === 0 && <ThreeDotLoading />}
                                    </div>

                                    {/* Footer with Confirm Button */}
                                    <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
                                        <button
                                            onClick={handleConfirm}
                                            disabled={!selectedId}
                                            className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-colors duration-300 ${selectedId
                                                ? 'bg-primary text-white hover:bg-primary/80'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                }`}
                                        >
                                            Confirm Selection
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
};

export default SelectBrandModal;
