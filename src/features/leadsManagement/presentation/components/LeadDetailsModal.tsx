import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiX,
  FiUser,
  FiPhone,
  FiMessageCircle,
  FiCalendar,
  FiGlobe,
  FiEdit,
  FiClock,
  FiFileText,
  FiArrowRight,
  FiHash,
} from 'react-icons/fi';
import type { LeadProps, LeadStatus, LeadType, LeadAddedBy } from '../../data/leadTypes';
import {
  LEAD_ADDED_BY_OPTIONS,
  LEAD_STATUS_OPTIONS,
  LEAD_TYPE_OPTIONS,
} from '../../data/leadTypes';
import { getCallHref, getWhatsAppHref, getLinkHref } from '../utils/leadContactLinks';

interface LeadDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: LeadProps | null;
}

function getLeadTypeLabel(type: LeadType) {
  return LEAD_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}

function getAddedByLabel(addedBy?: LeadAddedBy) {
  if (!addedBy) return '—';
  return LEAD_ADDED_BY_OPTIONS.find((o) => o.value === addedBy)?.label ?? addedBy;
}

function getLeadStatusLabel(lead: LeadProps) {
  if (lead.status === 'another' && lead.customStatus) {
    return lead.customStatus;
  }
  return LEAD_STATUS_OPTIONS.find((o) => o.value === lead.status)?.label ?? lead.status ?? '—';
}

function getStatusBadgeStyle(status: LeadStatus) {
  switch (status) {
    case 'not_contacted':
      return { bg: 'bg-slate-50 border-slate-200 text-slate-700', bullet: 'bg-slate-400' };
    case 'contacted':
      return { bg: 'bg-sky-50 border-sky-100 text-sky-700', bullet: 'bg-sky-500' };
    case 'interested':
      return { bg: 'bg-emerald-50 border-emerald-100 text-emerald-700', bullet: 'bg-emerald-500' };
    case 'not_interested':
      return { bg: 'bg-rose-50 border-rose-100 text-rose-700', bullet: 'bg-rose-500' };
    case 'next_followup':
      return { bg: 'bg-orange-50 border-orange-100 text-orange-700', bullet: 'bg-orange-500' };
    case 'converted':
      return { bg: 'bg-violet-50 border-violet-100 text-violet-700', bullet: 'bg-violet-500' };
    case 'another':
      return { bg: 'bg-amber-50 border-amber-100 text-amber-700', bullet: 'bg-amber-500' };
    default:
      return { bg: 'bg-slate-50 border-slate-200 text-slate-700', bullet: 'bg-slate-400' };
  }
}

function formatFullDate(timestamp: LeadProps['nextFollowUpDate'] | LeadProps['createdAt'] | null) {
  if (!timestamp) return '—';
  return new Date(timestamp.toMillis()).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const LeadDetailsModal: React.FC<LeadDetailsModalProps> = ({ isOpen, onClose, lead }) => {
  if (typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && lead && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            className="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-[#F8F8F7] shadow-2xl sm:rounded-3xl"
            initial={{ opacity: 0, y: 48, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.98 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          >
            {/* Header */}
            <div className="relative shrink-0 overflow-hidden bg-white px-5 py-5 sm:px-6">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <FiUser className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Lead profile
                    </p>
                    <h2 className="mt-0.5 text-lg font-bold tracking-tight text-slate-900 truncate max-w-[280px]">
                      {lead.name}
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

            {/* Content */}
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
              {/* Status & Pipeline */}
              <div className="rounded-2xl border border-slate-200/60 bg-white p-4">
                <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Pipeline & Status
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
                    <span className="text-[10px] text-slate-400 block font-medium">Status</span>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${getStatusBadgeStyle(lead.status).bullet}`} />
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {getLeadStatusLabel(lead)}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
                    <span className="text-[10px] text-slate-400 block font-medium">Lead Type</span>
                    <span className="mt-1 block text-xs font-bold text-slate-800">
                      {getLeadTypeLabel(lead.leadType)}
                    </span>
                  </div>
                  {lead.area && (
                    <div className="col-span-2 rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
                      <span className="text-[10px] text-slate-400 block font-medium">Area / Source</span>
                      <span className="mt-0.5 block text-xs font-bold text-slate-800">
                        {lead.area}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="rounded-2xl border border-slate-200/60 bg-white p-4">
                <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Contact Information
                </h3>
                <div className="space-y-2.5">
                  {/* Phone */}
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-50 bg-slate-50/20 px-3 py-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <FiPhone className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-400 block">Phone Number</span>
                        <span className="text-xs font-semibold text-slate-800 block truncate">
                          {lead.phoneNumber || '—'}
                        </span>
                      </div>
                    </div>
                    {getCallHref(lead.phoneNumber) && (
                      <a
                        href={getCallHref(lead.phoneNumber)!}
                        className="flex h-7 items-center justify-center rounded-lg border border-blue-200 bg-blue-50/30 px-3 text-[10px] font-bold text-blue-600 transition-colors hover:bg-blue-50"
                      >
                        Call
                      </a>
                    )}
                  </div>

                  {/* WhatsApp */}
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-50 bg-slate-50/20 px-3 py-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <FiMessageCircle className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-400 block">WhatsApp Number</span>
                        <span className="text-xs font-semibold text-slate-800 block truncate">
                          {lead.whatsappNumber || '—'}
                        </span>
                      </div>
                    </div>
                    {getWhatsAppHref(lead.whatsappNumber) && (
                      <a
                        href={getWhatsAppHref(lead.whatsappNumber)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-7 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50/30 px-3 text-[10px] font-bold text-emerald-600 transition-colors hover:bg-emerald-50"
                      >
                        Chat
                      </a>
                    )}
                  </div>

                  {/* Social Link */}
                  {lead.link && (
                    <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-50 bg-slate-50/20 px-3 py-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                          <FiGlobe className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0">
                          <span className="text-[10px] text-slate-400 block">Social Link</span>
                          <span className="text-xs font-semibold text-violet-600 block truncate hover:underline">
                            {lead.link}
                          </span>
                        </div>
                      </div>
                      {getLinkHref(lead.link) && (
                        <a
                          href={getLinkHref(lead.link)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-7 items-center justify-center rounded-lg border border-violet-200 bg-violet-50/30 px-3 text-[10px] font-bold text-violet-600 transition-colors hover:bg-violet-50"
                        >
                          Visit
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Notes & Activity */}
              {(lead.responseNote || lead.notes) && (
                <div className="rounded-2xl border border-slate-200/60 bg-white p-4">
                  <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Notes & Activity
                  </h3>
                  <div className="space-y-3">
                    {lead.responseNote && (
                      <div className="rounded-xl bg-slate-50/80 p-3 border border-slate-100">
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 mb-1">
                          <FiEdit className="h-3 w-3 text-slate-400" />
                          <span>LATEST RESPONSE</span>
                        </div>
                        <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                          {lead.responseNote}
                        </p>
                      </div>
                    )}
                    {lead.notes && (
                      <div className="rounded-xl bg-slate-50/80 p-3 border border-slate-100">
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 mb-1">
                          <FiFileText className="h-3 w-3 text-slate-400" />
                          <span>GENERAL NOTES</span>
                        </div>
                        <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                          {lead.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Schedule & History */}
              <div className="rounded-2xl border border-slate-200/60 bg-white p-4">
                <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Timestamps & Ownership
                </h3>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                    <span className="text-slate-400">Added By</span>
                    <span className="font-bold text-slate-700">{getAddedByLabel(lead.addedBy)}</span>
                  </div>

                  {lead.nextFollowUpDate && (
                    <div className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                      <span className="text-slate-400 flex items-center gap-1">
                        <FiCalendar className="h-3 w-3" /> Next Follow-up
                      </span>
                      <span className="font-bold text-orange-600">{formatFullDate(lead.nextFollowUpDate)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                    <span className="text-slate-400 flex items-center gap-1">
                      <FiClock className="h-3 w-3" /> Created
                    </span>
                    <span className="font-semibold text-slate-600">{formatFullDate(lead.createdAt)}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="text-slate-400 flex items-center gap-1">
                      <FiClock className="h-3 w-3" /> Last Updated
                    </span>
                    <span className="font-semibold text-slate-600">{formatFullDate(lead.updatedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Search Keywords */}
              {lead.keywords && lead.keywords.length > 0 && (
                <div className="px-1.5">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-0.5">
                    <FiHash className="h-3 w-3" /> Keywords
                  </span>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {lead.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-slate-100/80 px-2 py-0.5 text-[9px] font-medium text-slate-500 border border-slate-200/30"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex shrink-0 gap-3 border-t border-slate-200/70 bg-white px-5 py-4 sm:px-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50"
              >
                Close Profile
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default LeadDetailsModal;
