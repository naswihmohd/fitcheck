import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Timestamp } from 'firebase/firestore';
import { deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { FiCopy, FiCheck, FiEdit2, FiMoreVertical, FiTrash2 } from 'react-icons/fi';
import type { CouponProps } from '../../data/couponTypes';
import LoadImage from '../../../../general/components/LoadImage';
import ConfirmModal from '../../../../general/components/ConfirmModal';
import { formatCurrency } from '../../../../general/utils/formatCurrency';
import { db } from '../../../../firebaseConfig';
import type { AppDispatch } from '../../../../general/redux/store';
import { removeCoupon } from '../../redux/couponSlice';

interface CouponCardProps {
  data: CouponProps;
}

function timestampToDate(ts: Timestamp | undefined): Date | null {
  if (!ts || typeof (ts as Timestamp).toDate !== 'function') return null;
  return (ts as Timestamp).toDate();
}

function formatCouponDate(ts: Timestamp | undefined): string {
  const d = timestampToDate(ts);
  if (!d) return '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function CouponCard({ data }: CouponCardProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [copied, setCopied] = useState(false);
  const [showIcons, setShowIcons] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const expiry = timestampToDate(data.expiryAt);
  const isExpired = expiry ? expiry < new Date() : false;
  const hasCouponImage = Boolean(data.image?.trim());

  const discountLabel =
    data.discountType === 'percentage'
      ? `${data.discountValue}%`
      : formatCurrency(data.discountValue);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data.couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const handleThreeDotClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowIcons(!showIcons);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/coupons/add/${data.id}`);
    setShowIcons(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
    setShowIcons(false);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteDoc(doc(db, 'coupons', data.id));
      dispatch(removeCoupon(data.id));
      setShowDeleteModal(false);
      toast.success('Coupon deleted');
    } catch {
      toast.error('Failed to delete coupon');
      setShowDeleteModal(false);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex w-full min-h-[140px] overflow-hidden rounded-xl border-2 border-dashed border-primary/35 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Left: coupon image or discount stub */}
      <div
        className={`relative flex w-[30%] min-w-[7.5rem] min-h-[140px] overflow-hidden bg-gradient-to-br from-primary to-primary/85 ${
          hasCouponImage ? '' : 'flex-col items-center justify-center px-3 py-4 text-white'
        }`}
      >
        {hasCouponImage ? (
          <div className="absolute inset-0">
            <LoadImage
              index={0}
              src={data.image}
              alt={data.coupontTitle ? `${data.coupontTitle} coupon` : 'Coupon'}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/80">Save</span>
            <span className="text-2xl font-black leading-tight sm:text-3xl">{discountLabel}</span>
            <span className="mt-0.5 text-[10px] font-medium text-white/85">
              {data.discountType === 'percentage' ? 'OFF' : 'flat'}
            </span>
          </>
        )}
        {/* Perforation circles along the right edge of stub */}
        <div
          className="pointer-events-none absolute -right-1.5 top-0 bottom-0 flex flex-col justify-between py-2"
          aria-hidden
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className="h-2.5 w-2.5 rounded-full border-2 border-primary/35 bg-gray-50 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.4)]"
            />
          ))}
        </div>
      </div>

      {/* Tear / dashed divider */}
      <div
        className="relative w-0 flex-shrink-0 border-l-2 border-dashed border-primary/25 bg-gray-50/80"
        aria-hidden
      />

      {/* Right: details */}
      <div className="relative flex min-w-0 flex-1 flex-col justify-between gap-3 p-4">
        <div className="absolute right-0 top-0 h-16 w-16 rounded-bl-full bg-primary/[0.06]" aria-hidden />

        <div className="action-buttons absolute right-2 top-2 z-20 flex items-center gap-1">
          {showIcons && (
            <div className="mr-1 flex items-center gap-1">
              <button
                type="button"
                onClick={handleEditClick}
                className="rounded-lg bg-white/90 p-1.5 text-gray-600 shadow-sm transition-all duration-200 hover:bg-primary/10 hover:text-primary"
                title="Edit"
              >
                <FiEdit2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleDeleteClick}
                className="rounded-lg bg-white/90 p-1.5 text-gray-600 shadow-sm transition-all duration-200 hover:bg-red-50 hover:text-red-600"
                title="Delete"
              >
                <FiTrash2 className="h-4 w-4" />
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={handleThreeDotClick}
            className="rounded-lg bg-white/90 p-1.5 text-gray-600 shadow-sm transition-all duration-200 hover:bg-gray-100 hover:text-gray-800"
            title="More options"
          >
            <FiMoreVertical className="h-4 w-4" />
          </button>
        </div>

        <div className="relative z-[1] min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2 pr-[5.25rem]">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-gray-900">{data.coupontTitle || 'Coupon'}</h3>
              {data.couponDescription ? (
                <p className="mt-0.5 line-clamp-2 text-xs text-gray-600">{data.couponDescription}</p>
              ) : null}
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                isExpired ? 'bg-gray-200 text-gray-600' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {isExpired ? 'Expired' : 'Active'}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <code className="rounded-md bg-gray-100 px-2.5 py-1 font-mono text-sm font-bold tracking-wide text-primary">
              {data.couponCode}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 transition-colors hover:border-primary/40 hover:text-primary"
              title="Copy code"
            >
              {copied ? <FiCheck className="h-3.5 w-3.5 text-emerald-600" /> : <FiCopy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="relative z-[1] flex flex-wrap gap-x-4 gap-y-1 border-t border-gray-100 pt-3 text-[11px] text-gray-500">
          <span>
            <span className="font-medium text-gray-700">Min. order</span> {formatCurrency(data.minimumOrderValue)}
          </span>
          <span>
            <span className="font-medium text-gray-700">Until</span> {formatCouponDate(data.expiryAt)}
          </span>
          <span className="capitalize">
            <span className="font-medium text-gray-700">Scope</span> {data.couponType}
          </span>
          {data.isShownPublic ? (
            <span className="rounded bg-amber-100 px-1.5 py-0.5 font-semibold text-amber-900">Public</span>
          ) : null}
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        message={`Are you sure you want to delete "${data.coupontTitle || data.couponCode}"? This action cannot be undone.`}
      />
    </motion.article>
  );
}

export default CouponCard;
