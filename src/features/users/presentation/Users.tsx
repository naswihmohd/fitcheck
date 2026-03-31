import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiClock,
  FiSearch,
} from 'react-icons/fi';
import type { AppDispatch, RootState } from '../../../general/redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCustomers } from '../redux/customerSlice';
import ThreeDotLoading from '../../../general/components/ThreeDotLoading';
import UserCard from './components/UserCard';
import UsersStats from './components/UsersStats';

function Users() {
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch: AppDispatch = useDispatch();
  const { customers, loading, error, currentFilter, hasMore } = useSelector((state: RootState) => state.customers);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  useEffect(() => {
    if (customers.length > 0 && currentFilter === normalizedQuery) return;
    dispatch(fetchCustomers({ params: { searchQuery: normalizedQuery || null } }));
  }, [dispatch, normalizedQuery]);

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  const handleLoadMore = () => {
    if (loading || !hasMore) return;
    dispatch(fetchCustomers({ params: { searchQuery: normalizedQuery || null } }));
  };

  return (
    <div className="space-y-6 pb-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">Manage platform users</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary font-medium">
          <FiClock className="size-4" />
          Last synced: just now
        </div>
      </motion.div>

      <UsersStats />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="relative max-w-md"
      >
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by id, name, email, phone, WhatsApp..."
          className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="bg-white border border-gray-200 rounded-xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Phone / WhatsApp</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Joined</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Active</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </tbody>
          </table>
        </div>
        {customers.length === 0 && !loading ? (
          <div className="px-4 py-10 text-center">
            <FiSearch className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700">No users found</p>
            <p className="text-xs text-gray-500 mt-1">Try a different search term.</p>
          </div>
        ) : null}
      </motion.div>

      {loading && <ThreeDotLoading />}

      {hasMore && customers.length > 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center"
        >
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium"
          >
            Load More
          </button>
        </motion.div>
      )}
    </div>
  );
}

export default Users;
