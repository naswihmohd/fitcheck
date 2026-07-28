import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiSearch } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../general/redux/store';
import { fetchLeads } from '../redux/leadSlice';
import type { LeadProps } from '../data/leadTypes';
import LeadModal from './components/LeadModal';
import LeadTable from './components/LeadTable';
import ThreeDotLoading from '../../../general/components/ThreeDotLoading';

function LeadsManagement() {
  const dispatch: AppDispatch = useDispatch();
  const { leads, loading, hasMore, error, currentFilter } = useSelector(
    (state: RootState) => state.leads
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<LeadProps | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim() || null);
    }, 800);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (leads.length === 0 || currentFilter !== debouncedSearchQuery) {
      dispatch(fetchLeads({ searchQuery: debouncedSearchQuery }));
    }
  }, [debouncedSearchQuery, dispatch]);

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  const handleLoadMore = () => {
    if (loading || !hasMore) return;
    dispatch(fetchLeads({ searchQuery: debouncedSearchQuery }));
  };

  const handleAddLead = () => {
    setEditingLead(null);
    setIsModalOpen(true);
  };

  const handleEditLead = (lead: LeadProps) => {
    setEditingLead(lead);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLead(null);
  };

  return (
    <div className="min-h-screen space-y-2.5 pb-8 md:space-y-6 md:pb-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between md:gap-3"
      >
        <div>
          <h1 className="text-base font-bold text-gray-900 md:text-xl">Leads</h1>
          <p className="mt-0.5 text-xs text-gray-500 md:text-sm">Manage and track all your leads</p>
        </div>

        <button
          onClick={handleAddLead}
          className="flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white transition-all hover:bg-primary/90 sm:w-auto md:gap-2 md:px-5 md:py-2.5 md:text-base"
        >
          <FiPlus className="h-4 w-4 md:h-5 md:w-5" /> Add New Lead
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative w-full max-w-md"
      >
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 md:left-4" size={16} />
        <input
          type="text"
          placeholder="Search leads by name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs outline-none transition-all md:py-3 md:pl-11 md:pr-4 md:text-sm"
        />
      </motion.div>

      <hr className="hidden text-gray-300 md:block" />

      {leads.length > 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <LeadTable leads={leads} onEdit={handleEditLead} />
        </motion.div>
      ) : (
        !loading && (
          <div className="py-10 text-center md:py-24">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 md:mb-4 md:h-20 md:w-20">
              <FiSearch className="h-5 w-5 text-gray-300 md:h-8 md:w-8" />
            </div>
            <h3 className="mb-1 text-sm font-bold text-gray-900 md:mb-2 md:text-xl">No leads found</h3>
            <p className="mx-auto max-w-xs text-xs text-gray-500 md:text-sm">
              {searchQuery
                ? `We couldn't find any results for "${searchQuery}"`
                : "You haven't added any leads yet. Click 'Add New Lead' to get started."}
            </p>
          </div>
        )
      )}

      {loading && (
        <div className="py-8 md:py-12">
          <ThreeDotLoading />
        </div>
      )}

      {hasMore && !loading && leads.length > 0 && (
        <div className="flex justify-center pt-2 md:pt-8">
          <button
            onClick={handleLoadMore}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 active:scale-95 sm:w-auto md:rounded-xl md:px-8 md:py-3 md:text-sm"
          >
            Load More Leads
          </button>
        </div>
      )}

      <LeadModal isOpen={isModalOpen} onClose={handleCloseModal} lead={editingLead} />
    </div>
  );
}

export default LeadsManagement;
