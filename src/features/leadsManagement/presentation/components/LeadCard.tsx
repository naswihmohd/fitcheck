import {
  FiEdit2,
  FiTrash2,
  FiUser,
  FiPhone,
  FiMessageCircle,
  FiCalendar,
  FiRefreshCw,
  FiCopy,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import type { LeadProps } from '../../data/leadTypes';
import { LEAD_ADDED_BY_OPTIONS, LEAD_STATUS_OPTIONS, LEAD_TYPE_OPTIONS } from '../../data/leadTypes';
import LeadContactActions from './LeadContactActions';

interface LeadCardProps {
  lead: LeadProps;
  onEdit: (lead: LeadProps) => void;
  onDelete: (leadId: string) => void;
  onChangeStatus: (lead: LeadProps) => void;
}

function getLeadTypeLabel(type: string) {
  return LEAD_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}

function getAddedByLabel(addedBy?: string) {
  if (!addedBy) return null;
  return LEAD_ADDED_BY_OPTIONS.find((o) => o.value === addedBy)?.label ?? addedBy;
}

function getLeadStatusLabel(lead: LeadProps) {
  if (lead.status === 'another' && lead.customStatus) {
    return lead.customStatus;
  }
  return LEAD_STATUS_OPTIONS.find((o) => o.value === lead.status)?.label ?? lead.status ?? '—';
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'not_contacted':
      return 'bg-gray-100 text-gray-700';
    case 'contacted':
      return 'bg-blue-50 text-blue-700';
    case 'interested':
      return 'bg-green-100 text-green-700';
    case 'not_interested':
      return 'bg-rose-50 text-rose-700';
    case 'next_followup':
      return 'bg-orange-50 text-orange-700';
    case 'converted':
      return 'bg-violet-50 text-violet-700';
    case 'another':
      return 'bg-amber-50 text-amber-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

function formatDate(timestamp: LeadProps['nextFollowUpDate'] | LeadProps['createdAt']) {
  if (!timestamp) return null;
  return new Date(timestamp.toMillis()).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatLeadForCopy(lead: LeadProps) {
  const lines = [
    `Name: ${lead.name}`,
    `Phone: ${lead.phoneNumber || '—'}`,
    `WhatsApp: ${lead.whatsappNumber || '—'}`,
    lead.link ? `Link: ${lead.link}` : null,
    `Type: ${getLeadTypeLabel(lead.leadType)}`,
    lead.area ? `Area: ${lead.area}` : null,
    `Status: ${getLeadStatusLabel(lead)}`,
    getAddedByLabel(lead.addedBy) ? `Added by: ${getAddedByLabel(lead.addedBy)}` : null,
    formatDate(lead.nextFollowUpDate) ? `Follow-up: ${formatDate(lead.nextFollowUpDate)}` : null,
    lead.responseNote ? `Response: ${lead.responseNote}` : null,
    lead.notes ? `Notes: ${lead.notes}` : null,
  ];
  return lines.filter(Boolean).join('\n');
}

async function copyLeadData(lead: LeadProps) {
  try {
    await navigator.clipboard.writeText(formatLeadForCopy(lead));
    toast.success('Lead data copied');
  } catch (error) {
    console.error('Failed to copy lead data:', error);
    toast.error('Failed to copy lead data');
  }
}

function LeadCard({ lead, onEdit, onDelete, onChangeStatus }: LeadCardProps) {
  const followUp = formatDate(lead.nextFollowUpDate);
  const addedByLabel = getAddedByLabel(lead.addedBy);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-2.5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FiUser className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-xs font-semibold text-gray-900">{lead.name}</h3>
            {lead.area ? (
              <p className="truncate text-[10px] text-gray-400">{lead.area}</p>
            ) : (
              <p className="text-[10px] text-gray-400">{getLeadTypeLabel(lead.leadType)}</p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-start gap-1">
          <button
            type="button"
            onClick={() => copyLeadData(lead)}
            className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            title="Copy lead data"
            aria-label="Copy lead data"
          >
            <FiCopy className="h-3.5 w-3.5" />
          </button>
          <div className="flex flex-col items-end gap-1">
            <span
              className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${getStatusBadgeClass(lead.status)}`}
            >
              {getLeadStatusLabel(lead)}
            </span>
            {addedByLabel && (
              <span className="rounded px-1.5 py-0.5 text-[9px] font-medium text-gray-500 bg-gray-50">
                {addedByLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-gray-100 pt-2 text-[11px] text-gray-600">
        <div className="flex min-w-0 items-center gap-1">
          <FiPhone className="h-3 w-3 shrink-0 text-gray-400" />
          <span className="truncate">{lead.phoneNumber || '—'}</span>
        </div>
        <div className="flex min-w-0 items-center gap-1">
          <FiMessageCircle className="h-3 w-3 shrink-0 text-gray-400" />
          <span className="truncate">{lead.whatsappNumber || '—'}</span>
        </div>
        {followUp && (
          <div className="flex items-center gap-1">
            <FiCalendar className="h-3 w-3 shrink-0 text-gray-400" />
            <span>{followUp}</span>
          </div>
        )}
      </div>

      {(lead.phoneNumber || lead.whatsappNumber || lead.link) && (
        <div className="mt-2 border-t border-gray-100 pt-2">
          <LeadContactActions lead={lead} size="md" />
        </div>
      )}

      <div className="mt-2 flex items-center justify-between gap-1.5 border-t border-gray-100 pt-2">
        <button
          type="button"
          onClick={() => onChangeStatus(lead)}
          className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-[10px] font-semibold text-gray-700 transition-colors hover:bg-gray-100"
        >
          <FiRefreshCw className="h-3 w-3" />
          Status
        </button>

        <div className="flex items-center">
          <button
            type="button"
            onClick={() => onEdit(lead)}
            className="rounded-md p-1.5 text-blue-600 transition-colors hover:bg-blue-50"
            title="Edit Lead"
            aria-label="Edit lead"
          >
            <FiEdit2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(lead.id)}
            className="rounded-md p-1.5 text-red-600 transition-colors hover:bg-red-50"
            title="Delete Lead"
            aria-label="Delete lead"
          >
            <FiTrash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default LeadCard;
