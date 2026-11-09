import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { signOut } from 'firebase/auth';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  FiArrowDownRight,
  FiArrowUpRight,
  FiList,
  FiLogOut,
  FiMinusCircle,
  FiPlusCircle,
  FiShoppingBag,
  FiTrendingDown,
  FiTrendingUp,
} from 'react-icons/fi';
import type { AppDispatch, RootState } from '../../../general/redux/store';
import { fetchDashboardAnalytics } from '../redux/dashboardSlice';
import { clearUser } from '../../login/redux/authSlice';
import { auth } from '../../../firebaseConfig';
import ConfirmModal from '../../../general/components/ConfirmModal';
import MetricCard from './components/MetricCard';
import LineChart from './components/LineChart';
import PartnerFundCard from './components/PartnerFundCard';
import { formatCurrency } from '../../../general/utils/formatCurrency';
import {
  formatSignedAmount,
  getAmountTextClass,
  getCofounderLabel,
  getTransactionTypeLabel,
  getTypeBadgeClass,
  toDateInputValue,
} from '../../transactions/presentation/utils/transactionHelpers';

function Dashboard() {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { analytics, loading, error } = useSelector((state: RootState) => state.dashboard);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const hasDateRange = Boolean(startDate && endDate);

  useEffect(() => {
    if (startDate && endDate) {
      dispatch(
        fetchDashboardAnalytics({
          startDate: toDateInputValue(startDate),
          endDate: toDateInputValue(endDate),
        })
      );
      return;
    }

    if (!startDate && !endDate) {
      dispatch(fetchDashboardAnalytics());
    }
  }, [dispatch, startDate, endDate]);

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

  const primaryMetrics = [
    {
      title: 'Total Income',
      value: formatCurrency(analytics.income),
      color: '#E8F8F0',
      icon: FiArrowUpRight,
      iconClassName: 'text-emerald-600',
    },
    {
      title: 'Total Expense',
      value: formatCurrency(analytics.expense),
      color: '#FDECEC',
      icon: FiArrowDownRight,
      iconClassName: 'text-rose-600',
    },
    {
      title: 'Total Investment',
      value: formatCurrency(analytics.investment),
      color: '#E8F4FD',
      icon: FiPlusCircle,
      iconClassName: 'text-sky-600',
    },
    {
      title: 'Total Withdrawal',
      value: formatCurrency(analytics.withdrawal),
      color: '#FFF6E8',
      icon: FiMinusCircle,
      iconClassName: 'text-amber-600',
    },
    {
      title: 'Total Purchase',
      value: formatCurrency(analytics.purchase),
      color: '#F5F0FF',
      icon: FiShoppingBag,
      iconClassName: 'text-purple-600',
    },
    {
      title: 'Income − Purchase',
      value: formatCurrency(analytics.purchaseVsIncomeNet),
      color: analytics.purchaseVsIncomeNet < 0 ? '#FDECEC' : '#E8F8F0',
      icon: analytics.purchaseVsIncomeNet < 0 ? FiTrendingDown : FiTrendingUp,
      iconClassName: analytics.purchaseVsIncomeNet < 0 ? 'text-rose-600' : 'text-emerald-600',
      isPending: analytics.purchaseVsIncomeNet < 0,
    },
    {
      title: 'Balance',
      value: formatCurrency(analytics.balance),
      color: analytics.balance < 0 ? '#FFF4E5' : '#E6F1FD',
      icon: FiTrendingUp,
      iconClassName: analytics.balance < 0 ? 'text-amber-600' : 'text-sky-600',
      isPending: analytics.balance < 0,
    },
    {
      title: 'Transactions',
      value: analytics.transactionCount,
      color: '#F3E8FF',
      icon: FiList,
      iconClassName: 'text-violet-600',
    },
  ];

  const weekData =
    analytics.weekTrend.length > 0
      ? analytics.weekTrend
      : [
          { name: 'Sun', income: 0, expense: 0 },
          { name: 'Mon', income: 0, expense: 0 },
          { name: 'Tue', income: 0, expense: 0 },
          { name: 'Wed', income: 0, expense: 0 },
          { name: 'Thu', income: 0, expense: 0 },
          { name: 'Fri', income: 0, expense: 0 },
          { name: 'Sat', income: 0, expense: 0 },
        ];

  return (
    <div className="min-h-screen space-y-2.5 pb-8 md:space-y-5 md:pb-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
      >
        <div className="flex flex-col gap-0.5 md:gap-1">
          <h1 className="text-base font-bold text-gray-900 md:text-xl">Dashboard</h1>
          <p className="text-xs text-gray-500 md:text-sm">
            Company account overview and analytics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="dashboard-date-range min-w-0 flex-1 sm:w-[240px] sm:flex-none">
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => setDateRange(update)}
              isClearable
              allowSameDay
              maxDate={new Date()}
              popperProps={{ strategy: 'fixed' }}
              dateFormat="dd MMM yyyy"
              placeholderText="Select date range"
              showIcon
              toggleCalendarOnIconClick
              popperPlacement="bottom-end"
              popperClassName="dashboard-date-range-popper"
              wrapperClassName="w-full"
              className="h-8 w-full rounded-lg border border-gray-200 bg-white py-1.5 pr-7 pl-8 text-xs text-gray-700 outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15 md:h-9 md:text-sm"
            />
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
        </div>
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
        className="grid grid-cols-2 gap-2 md:gap-3 lg:grid-cols-3"
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
            isPending={metric.isPending}
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
        <div className="mb-3 flex items-center justify-between gap-3 md:mb-4">
          <h3 className="text-sm font-semibold text-gray-900 md:text-base">
            {hasDateRange ? 'Income vs Expense' : 'Income vs Expense This Week'}
          </h3>
          <div className="flex items-center gap-3 text-[10px] font-semibold md:text-xs">
            <span className="inline-flex items-center gap-1.5 text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Income
            </span>
            <span className="inline-flex items-center gap-1.5 text-rose-700">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              Expense
            </span>
          </div>
        </div>
        <div className="-mx-1 h-[200px] w-full sm:mx-0 md:h-[260px]">
          <LineChart
            data={weekData}
            lines={[
              { key: 'income', color: '#10B981', name: 'Income' },
              { key: 'expense', color: '#F43F5E', name: 'Expense' },
            ]}
            title=""
            height="100%"
            valueFormatter={formatCurrency}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="space-y-2 md:space-y-3"
      >
        <div>
          <h3 className="text-sm font-semibold text-gray-900 md:text-base">
            Cofounder Fund Flow
          </h3>
          <p className="text-[11px] text-gray-500 md:text-xs">
            Capital invested and withdrawn by Shafi and Ajmal
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-3">
          {(analytics.partnerFlows ?? []).map((flow, index) => (
            <PartnerFundCard
              key={flow.partner}
              flow={flow}
              index={index}
              loading={loading}
            />
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={{
          boxShadow: '0px 0.92px 2.75px 0px #0051AF1A',
        }}
        className="overflow-hidden rounded-xl border border-primary/10 bg-white"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-3 py-3 md:px-5 md:py-4">
          <h3 className="text-sm font-semibold text-gray-900 md:text-base">Recent Transactions</h3>
          <button
            type="button"
            onClick={() => navigate('/transactions')}
            className="text-xs font-semibold text-primary hover:underline md:text-sm"
          >
            View all
          </button>
        </div>

        {analytics.recentTransactions.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {analytics.recentTransactions.map((transaction) => (
              <button
                key={transaction.id}
                type="button"
                onClick={() => navigate('/transactions')}
                className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left transition-colors hover:bg-[#FAF9F6]/70 md:px-5"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-gray-900 md:text-sm">
                    {transaction.note || 'Untitled'}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${getTypeBadgeClass(transaction.type)}`}
                    >
                      {getTransactionTypeLabel(transaction.type)}
                    </span>
                    {transaction.partner && (
                      <span className="text-[10px] font-medium text-gray-500 md:text-xs">
                        {getCofounderLabel(transaction.partner)}
                      </span>
                    )}
                    <span className="text-[10px] text-gray-400 md:text-xs">
                      {new Date(transaction.dateMillis).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                <p
                  className={`shrink-0 text-xs font-bold md:text-sm ${getAmountTextClass(transaction.type)}`}
                >
                  {formatSignedAmount(transaction.amount, transaction.type)}
                </p>
              </button>
            ))}
          </div>
        ) : (
          !loading && (
            <div className="px-3 py-8 text-center md:px-5 md:py-12">
              <p className="text-xs font-semibold text-gray-900 md:text-sm">No transactions yet</p>
              <p className="mt-1 text-[11px] text-gray-500 md:text-xs">
                Add income, expenses, investments, and withdrawals to see account analytics here.
              </p>
              <button
                type="button"
                onClick={() => navigate('/transactions')}
                className="mt-3 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 md:text-sm"
              >
                Add Transaction
              </button>
            </div>
          )
        )}
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
