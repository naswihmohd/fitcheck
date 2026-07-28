import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  FiCalendar,
  FiCheckCircle,
  FiChevronRight,
  FiEdit3,
  FiMessageSquare,
  FiPhone,
  FiThumbsDown,
  FiThumbsUp,
} from 'react-icons/fi';
import type { IconType } from 'react-icons';
import type { AppDispatch, RootState } from '../../../general/redux/store';
import type { LeadStatus } from '../../leadsManagement/data/leadTypes';
import { GROUP_STATUS_META } from '../data/groupTypes';
import { fetchGroupCounts } from '../redux/groupSlice';

const STATUS_ICONS: Record<LeadStatus, IconType> = {
  not_contacted: FiPhone,
  contacted: FiMessageSquare,
  interested: FiThumbsUp,
  not_interested: FiThumbsDown,
  next_followup: FiCalendar,
  converted: FiCheckCircle,
  another: FiEdit3,
};

function Groups() {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const { statusCounts, countsLoading } = useSelector((state: RootState) => state.groups);

  useEffect(() => {
    dispatch(fetchGroupCounts());
  }, [dispatch]);

  return (
    <div className="min-h-screen space-y-2.5 pb-8 md:space-y-6 md:pb-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-0.5 md:gap-1"
      >
        <h1 className="text-base font-bold text-gray-900 md:text-xl">Groups</h1>
        <p className="text-xs text-gray-500 md:text-sm">
          Browse leads grouped by status
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 md:gap-4"
      >
        {GROUP_STATUS_META.map((group, index) => {
          const Icon = STATUS_ICONS[group.value];
          const count = statusCounts[group.value] ?? 0;

          return (
            <motion.button
              key={group.value}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + index * 0.04 }}
              onClick={() => navigate(`/groups/${group.path}`)}
              className="group flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 text-left shadow-sm transition-all hover:border-primary/30 hover:shadow-md active:scale-[0.99] md:gap-4 md:p-5"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl md:h-12 md:w-12 ${group.iconBg}`}
              >
                <Icon className={`h-4 w-4 md:h-5 md:w-5 ${group.accent}`} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-sm font-semibold text-gray-900 md:text-base">
                    {group.label}
                  </h2>
                  <span
                    className={`hidden shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide sm:inline ${group.badge}`}
                  >
                    {group.value.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="mt-0.5 line-clamp-2 text-[11px] text-gray-500 md:text-xs">
                  {group.description}
                </p>
                <p className={`mt-1.5 text-xs font-semibold md:text-sm ${group.accent}`}>
                  {countsLoading ? '…' : `${count} lead${count === 1 ? '' : 's'}`}
                </p>
              </div>

              <FiChevronRight className="h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover:text-primary md:h-5 md:w-5" />
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}

export default Groups;
