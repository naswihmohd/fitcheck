import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { HiX } from 'react-icons/hi';
import type { AppDispatch, RootState } from '../../../../general/redux/store';
import { clearKeywords, fetchKeywords } from '../../../keywords/redux/keywordSlice';
import type { KeywordProps } from '../../../keywords/data/keywordTypes';
import ThreeDotLoading from '../../../../general/components/ThreeDotLoading';
import AddKeywordButton from '../../../keywords/presentation/components/AddKeywordButton';

export interface SelectedKeywordItem {
  id: string;
  keywordName: string;
}

interface SelectKeywordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selected: SelectedKeywordItem[]) => void;
  title?: string;
  selectedKeywords?: SelectedKeywordItem[];
}

const SelectKeywordModal: React.FC<SelectKeywordModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Select Keywords',
  selectedKeywords = [],
}) => {
  const [mounted, setMounted] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedKeywords.map((k) => k.id));
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { keywords, loading, error, hasMore } = useSelector((state: RootState) => state.keywords);
  const dispatch: AppDispatch = useDispatch();

  // Fetch keywords when modal opens or search changes
  useEffect(() => {
    if (!isOpen) return;
    dispatch(clearKeywords());
    dispatch(fetchKeywords({ params: { searchQuery: searchQuery || null } }));
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
      setSelectedIds(selectedKeywords.map((k) => k.id));
    }
  }, [isOpen, selectedKeywords]);

  const handleHasMore = () => {
    if (!loading && hasMore) {
      dispatch(fetchKeywords({ params: { searchQuery: searchQuery || null } }));
    }
  };

  const toggleKeywordSelect = (keywordId: string) => {
    setSelectedIds((prev) =>
      prev.includes(keywordId) ? prev.filter((id) => id !== keywordId) : [...prev, keywordId]
    );
  };

  const handleConfirm = () => {
    const selected = selectedIds
      .map((id) => {
        const kw = keywords.find((k) => k.id === id);
        return kw ? { id: kw.id, keywordName: kw.keywordName } : null;
      })
      .filter((x): x is SelectedKeywordItem => x !== null);
    onConfirm(selected);
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
                  <h2 className="text-base font-semibold text-white">{title}</h2>
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
                      placeholder="Search keywords..."
                      className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary focus:outline-none"
                    />

                    <AddKeywordButton />
                  </div>

                  {/* Keywords List */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-3">
                    {keywords.length > 0 ? (
                      <>
                        {keywords.map((keyword: KeywordProps, index: number) => {
                          const isSelected = selectedIds.includes(keyword.id);
                          return (
                            <motion.div
                              key={keyword.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: 0.3,
                                delay: index * 0.05,
                              }}
                              onClick={() => toggleKeywordSelect(keyword.id)}
                              className={`bg-white rounded-lg p-4 flex items-center gap-4 cursor-pointer transition-colors duration-200 border ${
                                isSelected
                                  ? 'border-secondary bg-secondary/5'
                                  : 'border-gray-200 hover:border-secondary hover:bg-gray-50'
                              }`}
                              style={{
                                boxShadow: '0px 0.92px 2.75px 0px #0051AF1A',
                              }}
                            >
                              {/* Checkbox */}
                              <div className="flex-shrink-0">
                                <div
                                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                    isSelected
                                      ? 'border-secondary bg-secondary'
                                      : 'border-gray-300 bg-white'
                                  }`}
                                >
                                  {isSelected && (
                                    <div className="w-2.5 h-2.5 rounded-sm bg-white" />
                                  )}
                                </div>
                              </div>

                              {/* Keyword Details */}
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-gray-900 truncate">
                                  {keyword.keywordName}
                                </h3>
                                {keyword.id && (
                                  <p className="text-xs text-gray-400 mt-1">ID: {keyword.id}</p>
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
                    ) : !loading ? (
                      <div className="flex items-center justify-center py-12">
                        <p className="text-sm text-gray-500">
                          {searchQuery
                            ? 'No keywords found matching your search.'
                            : 'No keywords available.'}
                        </p>
                      </div>
                    ) : null}

                    {loading && keywords.length === 0 && <ThreeDotLoading />}
                  </div>

                  {/* Footer with Confirm Button */}
                  <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
                    <button
                      onClick={handleConfirm}
                      disabled={selectedIds.length === 0}
                      className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-colors duration-300 ${
                        selectedIds.length > 0
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

export default SelectKeywordModal;

