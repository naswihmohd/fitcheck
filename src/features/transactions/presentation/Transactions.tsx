import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiSearch } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../general/redux/store';
import { fetchTransactions } from '../redux/transactionSlice';
import type { TransactionProps, TransactionTypeFilter } from '../data/transactionTypes';
import { TRANSACTION_FILTER_OPTIONS } from '../data/transactionTypes';
import ThreeDotLoading from '../../../general/components/ThreeDotLoading';
import TransactionModal from './components/TransactionModal';
import TransactionTable from './components/TransactionTable';

function Transactions() {
  const dispatch: AppDispatch = useDispatch();
  const { transactions, loading, hasMore, error, currentFilter } = useSelector(
    (state: RootState) => state.transactions
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<TransactionTypeFilter>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionProps | null>(null);

  const filterTerm = `${typeFilter}|${debouncedSearchQuery || ''}`;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim() || null);
    }, 800);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (transactions.length === 0 || currentFilter !== filterTerm) {
      dispatch(
        fetchTransactions({
          searchQuery: debouncedSearchQuery,
          typeFilter,
        })
      );
    }
  }, [debouncedSearchQuery, typeFilter, dispatch]);

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  const handleLoadMore = () => {
    if (loading || !hasMore) return;
    dispatch(
      fetchTransactions({
        searchQuery: debouncedSearchQuery,
        typeFilter,
      })
    );
  };

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleEditTransaction = (transaction: TransactionProps) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  return (
    <div className="min-h-screen space-y-2.5 pb-8 md:space-y-6 md:pb-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between md:gap-3"
      >
        <div>
          <h1 className="text-base font-bold text-gray-900 md:text-xl">Transactions</h1>
          <p className="mt-0.5 text-xs text-gray-500 md:text-sm">
            Track income, expenses, purchases, investments, and withdrawals
          </p>
        </div>

        <button
          onClick={handleAddTransaction}
          className="flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white transition-all hover:bg-primary/90 sm:w-auto md:gap-2 md:px-5 md:py-2.5 md:text-base"
        >
          <FiPlus className="h-4 w-4 md:h-5 md:w-5" /> Add Transaction
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
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="relative w-full max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 md:left-4" size={16} />
          <input
            type="text"
            placeholder="Search transactions by note"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs outline-none transition-all md:py-3 md:pl-11 md:pr-4 md:text-sm"
          />
        </div>

        <div className="flex w-full gap-1 overflow-x-auto rounded-lg border border-gray-200 bg-white p-1 sm:w-auto">
          {TRANSACTION_FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setTypeFilter(option.value)}
              className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold transition-all md:px-4 md:text-sm ${
                typeFilter === option.value
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </motion.div>

      <hr className="hidden text-gray-300 md:block" />

      {transactions.length > 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <TransactionTable transactions={transactions} onEdit={handleEditTransaction} />
        </motion.div>
      ) : (
        !loading && (
          <div className="py-10 text-center md:py-24">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 md:mb-4 md:h-20 md:w-20">
              <FiSearch className="h-5 w-5 text-gray-300 md:h-8 md:w-8" />
            </div>
            <h3 className="mb-1 text-sm font-bold text-gray-900 md:mb-2 md:text-xl">
              No transactions found
            </h3>
            <p className="mx-auto max-w-xs text-xs text-gray-500 md:text-sm">
              {searchQuery || typeFilter !== 'all'
                ? 'We could not find any results for the current filters.'
                : "You haven't added any transactions yet. Click 'Add Transaction' to get started."}
            </p>
          </div>
        )
      )}

      {loading && (
        <div className="py-8 md:py-12">
          <ThreeDotLoading />
        </div>
      )}

      {hasMore && !loading && transactions.length > 0 && (
        <div className="flex justify-center pt-2 md:pt-8">
          <button
            onClick={handleLoadMore}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 active:scale-95 sm:w-auto md:rounded-xl md:px-8 md:py-3 md:text-sm"
          >
            Load More Transactions
          </button>
        </div>
      )}

      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        transaction={editingTransaction}
      />
    </div>
  );
}

export default Transactions;
