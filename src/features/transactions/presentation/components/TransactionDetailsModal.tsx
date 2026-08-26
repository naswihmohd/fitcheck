import React from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiArrowDownRight,
  FiArrowUpRight,
  FiCalendar,
  FiClock,
  FiExternalLink,
  FiFileText,
  FiPaperclip,
  FiUser,
  FiX,
} from 'react-icons/fi';
import { isCreditType, type TransactionProps } from '../../data/transactionTypes';
import { formatCurrency } from '../../../../general/utils/formatCurrency';
import {
  formatSignedAmount,
  formatTransactionDateTime,
  getAmountTextClass,
  getCofounderLabel,
  getTransactionTypeLabel,
  getTypeBadgeClass,
  getTypeIconWrapClass,
} from '../utils/transactionHelpers';

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionProps | null;
}

const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  if (typeof window === 'undefined') return null;

  const isCredit = transaction ? isCreditType(transaction.type) : false;
  const partnerLabel = transaction ? getCofounderLabel(transaction.partner) : '';

  return createPortal(
    <AnimatePresence>
      {isOpen && transaction && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <motion.div
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-[#F8F8F7] shadow-2xl sm:rounded-3xl"
            initial={{ opacity: 0, y: 48, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.98 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          >
            <div className="relative shrink-0 overflow-hidden bg-white px-5 py-5 sm:px-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${getTypeIconWrapClass(transaction.type)}`}
                  >
                    {isCredit ? (
                      <FiArrowUpRight className="h-5 w-5" />
                    ) : (
                      <FiArrowDownRight className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Transaction
                    </p>
                    <h2 className={`mt-0.5 text-lg font-bold tracking-tight ${getAmountTextClass(transaction.type)}`}>
                      {formatSignedAmount(transaction.amount, transaction.type)}
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
                  aria-label="Close"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
              <div className="rounded-2xl border border-slate-200/60 bg-white p-4">
                <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Overview
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
                    <span className="block text-[10px] font-medium text-slate-400">Type</span>
                    <span
                      className={`mt-1 inline-flex rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getTypeBadgeClass(transaction.type)}`}
                    >
                      {getTransactionTypeLabel(transaction.type)}
                    </span>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
                    <span className="block text-[10px] font-medium text-slate-400">Amount</span>
                    <span className="mt-1 block text-xs font-bold text-slate-800">
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>
                  {partnerLabel && (
                    <div className="col-span-2 rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
                      <span className="block text-[10px] font-medium text-slate-400">
                        Cofounder
                      </span>
                      <span className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <FiUser className="h-3.5 w-3.5 text-slate-400" />
                        {partnerLabel}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/60 bg-white p-4">
                <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Note
                </h3>
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                  <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                    <FiFileText className="h-3 w-3" />
                    <span>DETAILS</span>
                  </div>
                  <p className="whitespace-pre-line text-xs leading-relaxed text-slate-700">
                    {transaction.note || '—'}
                  </p>
                </div>
              </div>

              {transaction.attachmentUrl && (
                <div className="rounded-2xl border border-slate-200/60 bg-white p-4">
                  <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Bill / Proof
                  </h3>
                  <a
                    href={transaction.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3 transition-colors hover:border-primary/30 hover:bg-primary/5"
                  >
                    <span className="flex min-w-0 items-center gap-2 text-xs font-semibold text-slate-700">
                      <FiPaperclip className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="truncate">View attached file</span>
                    </span>
                    <FiExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  </a>
                </div>
              )}

              <div className="rounded-2xl border border-slate-200/60 bg-white p-4">
                <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Dates
                </h3>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-50 py-1 text-xs">
                    <span className="flex items-center gap-1 text-slate-400">
                      <FiCalendar className="h-3 w-3" /> Transaction date
                    </span>
                    <span className="font-bold text-slate-700">
                      {formatTransactionDateTime(transaction.date)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-50 py-1 text-xs">
                    <span className="flex items-center gap-1 text-slate-400">
                      <FiClock className="h-3 w-3" /> Created
                    </span>
                    <span className="font-semibold text-slate-600">
                      {formatTransactionDateTime(transaction.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 text-xs">
                    <span className="flex items-center gap-1 text-slate-400">
                      <FiClock className="h-3 w-3" /> Last updated
                    </span>
                    <span className="font-semibold text-slate-600">
                      {formatTransactionDateTime(transaction.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 gap-3 border-t border-slate-200/70 bg-white px-5 py-4 sm:px-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default TransactionDetailsModal;
