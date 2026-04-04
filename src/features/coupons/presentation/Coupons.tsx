import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiSearch, FiTag } from 'react-icons/fi';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../general/redux/store';
import { fetchCoupons } from '../redux/couponSlice';
import type { CouponProps } from '../data/couponTypes';
import CouponCard from './components/CouponCard';
import ThreeDotLoading from '../../../general/components/ThreeDotLoading';
import type { Timestamp } from 'firebase/firestore';

function timestampToDate(ts: Timestamp | undefined): Date | null {
  if (!ts || typeof (ts as Timestamp).toDate !== 'function') return null;
  return (ts as Timestamp).toDate();
}

function Coupons() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const { coupons, loading, error, currentFilter, hasMore } = useSelector((state: RootState) => state.coupons);

  useEffect(() => {
    const timer = setTimeout(() => {
      const formatted = searchQuery.trim().toLowerCase().replace(/\s+/g, '');
      setDebouncedSearchQuery(formatted);
    }, 1000);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filterKey = debouncedSearchQuery || null;

  useEffect(() => {
    if (coupons.length > 0 && currentFilter === filterKey) return;
    dispatch(fetchCoupons({ params: { searchQuery: filterKey } }));
  }, [debouncedSearchQuery]);

  useEffect(() => {
    if (error) console.error(error);
  }, [error]);

  const handleLoadMore = () => {
    if (loading || !hasMore) return;
    dispatch(fetchCoupons({ params: { searchQuery: filterKey } }));
  };

  const handleAddCoupon = () => {
    navigate('/coupons/add');
  };

  const activeCount = useMemo(() => {
    const now = new Date();
    return coupons.filter(c => {
      const exp = timestampToDate(c.expiryAt);
      return exp && exp >= now;
    }).length;
  }, [coupons]);
  const publicCount = useMemo(() => coupons.filter(c => c.isShownPublic).length, [coupons]);

  return (
    <div className="space-y-6 pb-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FiTag className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Coupons</h1>
            <p className="text-sm text-gray-600">Create and manage promotional codes</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddCoupon}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-primary/90"
        >
          <FiPlus className="h-5 w-5" />
          New coupon
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <div className="rounded-lg border border-primary/10 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">Loaded coupons</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{coupons.length}</p>
        </div>
        <div className="rounded-lg border border-primary/10 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">Not expired</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{activeCount}</p>
        </div>
        <div className="rounded-lg border border-amber-100 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">Shown publicly</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{publicCount}</p>
        </div>
      </motion.div>

      <div className="relative max-w-md flex-1">
        <FiSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by keyword"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
        />
      </div>

      {coupons.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="grid grid-cols-1 gap-4 lg:grid-cols-2"
        >
          {coupons.map((coupon: CouponProps, index: number) => (
            <motion.div
              key={coupon.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.04 }}
            >
              <CouponCard data={coupon} />
            </motion.div>
          ))}
        </motion.div>
      ) : !loading ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 text-center">
          <FiTag className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">No coupons yet</h3>
          <p className="mx-auto max-w-sm text-sm text-gray-600">
            {debouncedSearchQuery
              ? 'No coupons match your search. Try another keyword.'
              : 'Create your first coupon to offer discounts to customers.'}
          </p>
        </motion.div>
      ) : null}

      {loading && <ThreeDotLoading />}

      {hasMore && coupons.length > 0 && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            className="rounded-lg bg-primary px-6 py-2 font-medium text-white transition-colors duration-200 hover:bg-primary/90"
          >
            Load more
          </button>
        </motion.div>
      )}
    </div>
  );
}

export default Coupons;
