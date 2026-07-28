import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiEdit3,
  FiMessageSquare,
  FiPhone,
  FiThumbsDown,
  FiThumbsUp,
  FiX,
} from 'react-icons/fi';
import { doc, serverTimestamp, Timestamp, updateDoc } from 'firebase/firestore';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { db } from '../../../../firebaseConfig';
import { updateLead } from '../../redux/leadSlice';
import { updateFollowUp } from '../../../followUps/redux/followUpSlice';
import { updateGroupLead } from '../../../groups/redux/groupSlice';
import type { LeadProps, LeadStatus } from '../../data/leadTypes';

interface ChangeStatusModalProps {
  isOpen: boolean;
  lead: LeadProps | null;
  onClose: () => void;
}

const STATUS_META: {
  value: LeadStatus;
  label: string;
  shortLabel: string;
  hint: string;
  icon: typeof FiPhone;
  accent: string;
  iconBg: string;
  selected: string;
}[] = [
  {
    value: 'not_contacted',
    label: 'Not Contacted',
    shortLabel: 'New',
    hint: 'No outreach yet',
    icon: FiPhone,
    accent: 'text-slate-600',
    iconBg: 'bg-slate-100',
    selected: 'border-slate-900 bg-slate-50 ring-1 ring-slate-900/10',
  },
  {
    value: 'contacted',
    label: 'Contacted',
    shortLabel: 'Contacted',
    hint: 'Reached out once',
    icon: FiMessageSquare,
    accent: 'text-sky-700',
    iconBg: 'bg-sky-50',
    selected: 'border-sky-600 bg-sky-50/80 ring-1 ring-sky-600/20',
  },
  {
    value: 'interested',
    label: 'Interested',
    shortLabel: 'Interested',
    hint: 'Lead shows interest',
    icon: FiThumbsUp,
    accent: 'text-emerald-700',
    iconBg: 'bg-emerald-50',
    selected: 'border-emerald-600 bg-emerald-50/80 ring-1 ring-emerald-600/20',
  },
  {
    value: 'not_interested',
    label: 'Not Interested',
    shortLabel: 'Not Int.',
    hint: 'Lead declined',
    icon: FiThumbsDown,
    accent: 'text-rose-700',
    iconBg: 'bg-rose-50',
    selected: 'border-rose-600 bg-rose-50/80 ring-1 ring-rose-600/20',
  },
  {
    value: 'next_followup',
    label: 'Follow-up',
    shortLabel: 'Follow-up',
    hint: 'Schedule next call',
    icon: FiCalendar,
    accent: 'text-orange-700',
    iconBg: 'bg-orange-50',
    selected: 'border-orange-500 bg-orange-50/80 ring-1 ring-orange-500/20',
  },
  {
    value: 'converted',
    label: 'Converted',
    shortLabel: 'Converted',
    hint: 'Deal closed',
    icon: FiCheckCircle,
    accent: 'text-violet-700',
    iconBg: 'bg-violet-50',
    selected: 'border-violet-600 bg-violet-50/80 ring-1 ring-violet-600/20',
  },
  {
    value: 'another',
    label: 'Custom',
    shortLabel: 'Custom',
    hint: 'Set your own label',
    icon: FiEdit3,
    accent: 'text-amber-700',
    iconBg: 'bg-amber-50',
    selected: 'border-amber-500 bg-amber-50/80 ring-1 ring-amber-500/20',
  },
];

function formatDateForInput(timestamp: Timestamp | null | undefined): string {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function ChangeStatusModal({ isOpen, lead, onClose }: ChangeStatusModalProps) {
  const dispatch = useDispatch();
  const [status, setStatus] = useState<LeadStatus>('not_contacted');
  const [customStatus, setCustomStatus] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [responseNote, setResponseNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && lead) {
      setStatus(lead.status || 'not_contacted');
      setCustomStatus(lead.customStatus || '');
      setFollowUpDate(formatDateForInput(lead.nextFollowUpDate));
      setResponseNote(lead.responseNote || '');
      setError('');
    }
  }, [isOpen, lead]);

  const selectedMeta = STATUS_META.find((item) => item.value === status);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;

    if (status === 'another' && !customStatus.trim()) {
      setError('Please enter a custom status');
      return;
    }

    if (status === 'next_followup' && !followUpDate) {
      setError('Please select a follow-up date');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const nextFollowUpDate =
        status === 'next_followup' && followUpDate
          ? Timestamp.fromDate(new Date(followUpDate))
          : null;

      const payload = {
        status,
        customStatus: status === 'another' ? customStatus.trim() : '',
        nextFollowUpDate,
        responseNote: responseNote.trim(),
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, 'leads', lead.id), payload);

      const updatedLead = {
        ...lead,
        ...payload,
        updatedAt: Timestamp.now(),
      } as LeadProps;

      dispatch(updateLead(updatedLead));
      dispatch(updateFollowUp(updatedLead));
      dispatch(updateGroupLead(updatedLead));

      toast.success('Status updated');
      onClose();
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && lead && (
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
            <div className="relative shrink-0 overflow-hidden bg-white px-5 pb-5 pt-5 sm:px-6">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Lead pipeline
                  </p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                    Update status
                  </h2>
                  <p className="mt-1 truncate text-sm text-slate-500">{lead.name}</p>
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

              {selectedMeta && (
                <div className="mt-4 flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-2.5">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-xl ${selectedMeta.iconBg} ${selectedMeta.accent}`}
                  >
                    <selectedMeta.icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">Currently selecting</p>
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {selectedMeta.label}
                      {status === 'another' && customStatus.trim()
                        ? ` · ${customStatus.trim()}`
                        : ''}
                    </p>
                    <p className="truncate text-[11px] text-slate-500">{selectedMeta.hint}</p>
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col overflow-hidden"
            >
              <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
                <div>
                  <div className="mb-3 flex items-end justify-between">
                    <label className="text-sm font-semibold text-slate-800">
                      Choose status
                    </label>
                    <span className="text-[11px] text-slate-400">Tap one to select</span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-4 sm:gap-2">
                    {STATUS_META.map((option) => {
                      const selected = status === option.value;
                      const Icon = option.icon;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          title={option.hint}
                          onClick={() => {
                            setStatus(option.value);
                            setError('');
                          }}
                          className={`group relative flex flex-col items-center rounded-xl border bg-white px-1 py-2.5 text-center transition-all duration-200 sm:rounded-2xl sm:px-1.5 sm:py-3 ${
                            selected
                              ? option.selected
                              : 'border-slate-200/80 hover:border-slate-300 hover:shadow-sm'
                          }`}
                        >
                          {selected && (
                            <span className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-900 text-white sm:right-1.5 sm:top-1.5 sm:h-4 sm:w-4">
                              <FiCheck className="h-2 w-2 sm:h-2.5 sm:w-2.5" strokeWidth={3} />
                            </span>
                          )}

                          <span
                            className={`mb-1.5 flex h-7 w-7 items-center justify-center rounded-lg sm:mb-2 sm:h-8 sm:w-8 sm:rounded-xl ${option.iconBg} ${option.accent}`}
                          >
                            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </span>

                          <p className="text-[10px] font-semibold leading-tight text-slate-900 sm:text-xs">
                            {option.shortLabel}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {status === 'next_followup' && (
                    <motion.div
                      key="followup"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="rounded-2xl border border-orange-100 bg-white p-4">
                        <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                          Next follow-up date <span className="text-orange-500">*</span>
                        </label>
                        <p className="mb-2.5 text-xs text-slate-500">
                          When should you reach out again?
                        </p>
                        <input
                          type="date"
                          value={followUpDate}
                          onChange={(e) => {
                            setFollowUpDate(e.target.value);
                            setError('');
                          }}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
                        />
                      </div>
                    </motion.div>
                  )}

                  {status === 'another' && (
                    <motion.div
                      key="custom"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="rounded-2xl border border-amber-100 bg-white p-4">
                        <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                          Custom status <span className="text-amber-500">*</span>
                        </label>
                        <p className="mb-2.5 text-xs text-slate-500">
                          Name this stage in your own words.
                        </p>
                        <input
                          type="text"
                          value={customStatus}
                          onChange={(e) => {
                            setCustomStatus(e.target.value);
                            setError('');
                          }}
                          placeholder="e.g. Not interested, On hold"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-4">
                  <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                    Response note
                  </label>
                  <p className="mb-2.5 text-xs text-slate-500">
                    Optional note about this conversation or update.
                  </p>
                  <textarea
                    value={responseNote}
                    onChange={(e) => setResponseNote(e.target.value)}
                    rows={3}
                    placeholder="What did they say? Any next step?"
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
                  />
                </div>

                {error && (
                  <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                    {error}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 gap-3 border-t border-slate-200/70 bg-white px-5 py-4 sm:px-6">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmitting && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  )}
                  Save status
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default ChangeStatusModal;
