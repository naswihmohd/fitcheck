import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { clearSecondCategories, fetchSecondCategories } from '../../../secondCategory/redux/secondCategorySlice';
import type { AppDispatch, RootState } from '../../../../general/redux/store';
import type { SecondCategoryProps } from '../../../secondCategory/data/secondCategoryTypes';
import ProfileAvatar from '../../../../general/components/ProfileAvatar';
import ThreeDotLoading from '../../../../general/components/ThreeDotLoading';
import { HiX } from 'react-icons/hi';
import AddSecondCategoryButton from '../../../secondCategory/presentation/components/AddSecondCategoryButton';

interface SelectSecondCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (category: { secondCategoryId: string; secondCategoryName: string; secondCategoryImage: string | null }) => void;
    title?: string;
    selectedSecondCategoryId?: string;
    firstCategoryId: string;
}

const SelectSecondCategoryModal: React.FC<SelectSecondCategoryModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Select Second Category',
    selectedSecondCategoryId,
    firstCategoryId,
}) => {
    const [mounted, setMounted] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(selectedSecondCategoryId || null);
    const [searchQuery, setSearchQuery] = useState<string>('');

    const secondCategoriesState = useSelector((state: RootState) => state.secondCategories);
    const firstCategoryData = firstCategoryId ? secondCategoriesState.firstCategorySecondCategories[firstCategoryId] : undefined;
    const secondCategories = firstCategoryData?.secondCategories ?? [];
    const hasMore = firstCategoryData?.hasMore ?? false;
    const { loading, error } = secondCategoriesState;
    const dispatch: AppDispatch = useDispatch();

    useEffect(() => {
        if (!isOpen || !firstCategoryId) return;
        dispatch(clearSecondCategories());
        dispatch(fetchSecondCategories({ params: { firstCategoryId, searchQuery: searchQuery || null } }));
    }, [dispatch, isOpen, firstCategoryId, searchQuery]);

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
            setSelectedId(selectedSecondCategoryId || null);
        }
    }, [isOpen, selectedSecondCategoryId]);

    const handleHasMore = () => {
        if (!loading && hasMore && firstCategoryId) {
            dispatch(fetchSecondCategories({ params: { firstCategoryId, searchQuery: searchQuery || null } }));
        }
    };

    const handleCategorySelect = (categoryId: string) => {
        setSelectedId(categoryId);
    };

    const handleConfirm = () => {
        if (!selectedId) return;

        const selectedCategory = secondCategories.find((cat: SecondCategoryProps) => cat.id === selectedId);
        if (selectedCategory) {
            onConfirm({
                secondCategoryId: selectedCategory.id,
                secondCategoryName: selectedCategory.categoryName,
                secondCategoryImage: selectedCategory.imageUrl,
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
        setSelectedId(null);
    };

    if (!mounted) return null;

    if (!firstCategoryId) return null;

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
                                    <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-2">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={handleSearchChange}
                                            placeholder="Search second categories..."
                                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary focus:outline-none"
                                        />
                                        <AddSecondCategoryButton />
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-6 space-y-3">
                                        {secondCategories.length > 0 ? (
                                            <>
                                                {secondCategories.map((category: SecondCategoryProps, index: number) => {
                                                    const isSelected = selectedId === category.id;
                                                    return (
                                                        <motion.div
                                                            key={category.id}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{
                                                                duration: 0.3,
                                                                delay: index * 0.05
                                                            }}
                                                            onClick={() => handleCategorySelect(category.id)}
                                                            className={`bg-white rounded-lg p-4 flex items-center gap-4 cursor-pointer transition-colors duration-200 border ${isSelected
                                                                ? 'border-secondary bg-secondary/5'
                                                                : 'border-gray-200 hover:border-secondary hover:bg-gray-50'
                                                                }`}
                                                            style={{
                                                                boxShadow: '0px 0.92px 2.75px 0px #0051AF1A',
                                                            }}
                                                        >
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
                                                            <div className="flex-shrink-0">
                                                                <ProfileAvatar
                                                                    name={category.categoryName}
                                                                    imageUrl={category.imageUrl}
                                                                    size="lg"
                                                                    bgColor="bg-primary"
                                                                />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="text-sm font-semibold text-gray-900 truncate">
                                                                    {category.categoryName}
                                                                </h3>
                                                                {category.id && (
                                                                    <p className="text-xs text-gray-400 mt-1">
                                                                        ID: {category.id}
                                                                    </p>
                                                                )}
                                                                {category.keywords && category.keywords.length > 0 && (
                                                                    <p className="text-xs text-gray-500 mt-1 truncate">
                                                                        Keywords: {category.keywords.slice(0, 3).join(', ')}
                                                                        {category.keywords.length > 3 && '...'}
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
                                                    {searchQuery ? 'No second categories found matching your search.' : 'No second categories available.'}
                                                </p>
                                            </div>
                                        )}
                                        {loading && secondCategories.length === 0 && <ThreeDotLoading />}
                                    </div>

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

export default SelectSecondCategoryModal;
