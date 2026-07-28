import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { signOut } from 'firebase/auth';
import {
  FiCheckCircle,
  FiEdit3,
  FiLogOut,
  FiPercent,
  FiThumbsUp,
  FiUsers,
  FiZap,
} from 'react-icons/fi';
import type { AppDispatch, RootState } from '../../../general/redux/store';
import { fetchDashboardCounts } from '../redux/dashboardSlice';
import { clearUser } from '../../login/redux/authSlice';
import { auth } from '../../../firebaseConfig';
import ConfirmModal from '../../../general/components/ConfirmModal';
import MetricCard from './components/MetricCard';
import LineChart from './components/LineChart';

function formatConversionRate(converted: number, total: number) {
  if (total <= 0) return '0%';
  const rate = (converted / total) * 100;
  return `${rate % 1 === 0 ? rate.toFixed(0) : rate.toFixed(1)}%`;
}

function Dashboard() {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { counts, loading, error } = useSelector(
    (state: RootState) => state.dashboard
  );
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    dispatch(fetchDashboardCounts());
  }, [dispatch]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      dispatch(clearUser());
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const conversionRate = formatConversionRate(counts.converted, counts.total);

  const primaryMetrics = [
    {
      title: 'Total Leads',
      value: counts.total,
      color: '#EDEEFC',
      icon: FiUsers,
      iconClassName: 'text-indigo-600',
    },
    {
      title: 'Today Leads',
      value: counts.today,
      color: '#E6F1FD',
      icon: FiZap,
      iconClassName: 'text-sky-600',
    },
    {
      title: 'Interested',
      value: counts.interested,
      color: '#E8F8F0',
      icon: FiThumbsUp,
      iconClassName: 'text-emerald-600',
    },
    {
      title: 'Converted',
      value: counts.converted,
      color: '#F3E8FF',
      icon: FiCheckCircle,
      iconClassName: 'text-violet-600',
    },
    {
      title: 'Conversion Rate',
      value: conversionRate,
      color: '#E6FBF5',
      icon: FiPercent,
      iconClassName: 'text-teal-600',
    },
    {
      title: 'Another',
      value: counts.another,
      color: '#FFF4E5',
      icon: FiEdit3,
      iconClassName: 'text-amber-600',
    },
  ];

  const weekData =
    counts.weekTrend.length > 0
      ? counts.weekTrend
      : [
          { name: 'Sun', leads: 0 },
          { name: 'Mon', leads: 0 },
          { name: 'Tue', leads: 0 },
          { name: 'Wed', leads: 0 },
          { name: 'Thu', leads: 0 },
          { name: 'Fri', leads: 0 },
          { name: 'Sat', leads: 0 },
        ];

  return (
    <div className="min-h-screen space-y-2.5 pb-8 md:space-y-5 md:pb-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-3"
      >
        <div className="flex flex-col gap-0.5 md:gap-1">
          <h1 className="text-base font-bold text-gray-900 md:text-xl">Dashboard</h1>
          <p className="text-xs text-gray-500 md:text-sm">
            Overview of your leads pipeline
          </p>
        </div>

        <button
          type="button"
          disabled={isLoggingOut}
          onClick={() => setShowLogoutModal(true)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-70 md:px-3 md:py-2 md:text-sm"
          aria-label="Logout"
        >
          <FiLogOut className="h-3.5 w-3.5 md:h-4 md:w-4" />
          {isLoggingOut ? 'Signing out...' : 'Logout'}
        </button>
      </motion.div>

      {error && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 md:text-sm">
          {error}
        </p>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 md:gap-3"
      >
        {primaryMetrics.map((metric, index) => (
          <MetricCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            index={index}
            color={metric.color}
            icon={metric.icon}
            iconClassName={metric.iconClassName}
            loading={loading}
          />
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          boxShadow: '0px 0.92px 2.75px 0px #0051AF1A',
        }}
        className="overflow-hidden rounded-xl border border-primary/10 bg-white p-3 md:p-5"
      >
        <h3 className="mb-3 text-sm font-semibold text-gray-900 md:mb-4 md:text-base">
          Leads This Week
        </h3>
        <div className="-mx-1 h-[200px] w-full sm:mx-0 md:h-[260px]">
          <LineChart
            data={weekData}
            lines={[{ key: 'leads', color: '#0095DA', name: 'Leads' }]}
            title=""
            height="100%"
          />
        </div>
      </motion.div>

      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        message="Are you sure you want to logout?"
      />
    </div>
  );
}

export default Dashboard;
