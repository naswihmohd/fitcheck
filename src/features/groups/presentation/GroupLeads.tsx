import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSearch } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../general/redux/store';
import type { LeadProps } from '../../leadsManagement/data/leadTypes';
import LeadModal from '../../leadsManagement/presentation/components/LeadModal';
import LeadTable from '../../leadsManagement/presentation/components/LeadTable';
import ThreeDotLoading from '../../../general/components/ThreeDotLoading';
import { getGroupMeta, isValidGroupStatus } from '../data/groupTypes';
import { fetchGroupLeads } from '../redux/groupSlice';

function GroupLeads() {
  const { status } = useParams<{ status: string }>();
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();

  const { leads, loading, hasMore, error, currentFilter } = useSelector(
    (state: RootState) => state.groups
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<LeadProps | null>(null);

  const validStatus = status && isValidGroupStatus(status) ? status : null;
  const groupMeta = validStatus ? getGroupMeta(validStatus) : null;

  useEffect(() => {
    if (!validStatus) return;
    if (leads.length === 0 || currentFilter !== validStatus) {
      dispatch(fetchGroupLeads({ status: validStatus }));
    }
  }, [validStatus, dispatch]);

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  const handleLoadMore = () => {
    if (!validStatus || loading || !hasMore) return;
    dispatch(fetchGroupLeads({ status: validStatus }));
  };

  const handleEditLead = (lead: LeadProps) => {
    setEditingLead(lead);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLead(null);
  };

  if (!validStatus || !groupMeta) {
    return (
      <div className="min-h-screen space-y-4 pb-8 md:pb-12">
        <button
          type="button"
          onClick={() => navigate('/groups')}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-primary"
        >
          <FiArrowLeft className="h-4 w-4" /> Back to Groups
        </button>
        <div className="py-16 text-center">
          <h3 className="mb-2 text-lg font-bold text-gray-900">Group not found</h3>
          <p className="text-sm text-gray-500">This status group does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-2.5 pb-8 md:space-y-6 md:pb-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <button
          type="button"
          onClick={() => navigate('/groups')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 transition-colors hover:text-primary md:text-sm"
        >
          <FiArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4" /> Back to Groups
        </button>

        <div className="flex flex-col gap-0.5 md:gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-base font-bold text-gray-900 md:text-xl">{groupMeta.label}</h1>
            <span
              className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide md:text-[10px] ${groupMeta.badge}`}
            >
              {groupMeta.value.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-xs text-gray-500 md:text-sm">{groupMeta.description}</p>
        </div>
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
              There are no leads with status &quot;{groupMeta.label}&quot; yet.
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
            type="button"
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

export default GroupLeads;
