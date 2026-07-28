import { useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { useOutletContext } from 'react-router';
import { FOLLOW_UP_TABS, type FollowUpFilter } from '../../data/followUpTypes';
import type { AppDispatch, RootState } from '../../../../general/redux/store';
import type { FollowUpsOutletContext } from '../FollowUps';
import { fetchFollowUps } from '../../redux/followUpSlice';
import LeadTable from '../../../leadsManagement/presentation/components/LeadTable';
import ThreeDotLoading from '../../../../general/components/ThreeDotLoading';

interface FollowUpListProps {
  filter: FollowUpFilter;
}

function FollowUpList({ filter }: FollowUpListProps) {
  const dispatch: AppDispatch = useDispatch();
  const { onEditLead } = useOutletContext<FollowUpsOutletContext>();
  const { leads, loading, hasMore, error, currentFilter } = useSelector(
    (state: RootState) => state.followUps
  );

  const tab = FOLLOW_UP_TABS.find((t) => t.filter === filter);

  useEffect(() => {
    if (leads.length === 0 || currentFilter !== filter) {
      dispatch(fetchFollowUps({ filter }));
    }
  }, [filter, dispatch]);

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  const handleLoadMore = () => {
    if (loading || !hasMore) return;
    dispatch(fetchFollowUps({ filter }));
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">{tab?.description}</p>

      {leads.length > 0 ? (
        <LeadTable leads={leads} onEdit={onEditLead} />
      ) : (
        !loading && (
          <div className="py-16 text-center md:py-24">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 md:h-20 md:w-20">
              <FiSearch className="h-7 w-7 text-gray-300 md:h-8 md:w-8" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-900 md:text-xl">No leads found</h3>
            <p className="mx-auto max-w-xs text-sm text-gray-500">
              {tab?.description
                ? `Nothing matches “${tab.label}” right now.`
                : 'No leads to show in this tab.'}
            </p>
          </div>
        )
      )}

      {loading && (
        <div className="py-12">
          <ThreeDotLoading />
        </div>
      )}

      {hasMore && !loading && leads.length > 0 && (
        <div className="flex justify-center pt-4 md:pt-8">
          <button
            onClick={handleLoadMore}
            className="w-full rounded-xl border border-gray-200 bg-white px-8 py-3 text-sm font-bold text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 active:scale-95 sm:w-auto"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}

export default FollowUpList;
