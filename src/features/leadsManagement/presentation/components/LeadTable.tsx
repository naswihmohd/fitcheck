import { useState } from 'react';
import { FiEdit2, FiTrash2, FiUser, FiRefreshCw } from 'react-icons/fi';
import type { LeadProps } from '../../data/leadTypes';
import { LEAD_ADDED_BY_OPTIONS, LEAD_STATUS_OPTIONS, LEAD_TYPE_OPTIONS } from '../../data/leadTypes';
import { useDispatch } from 'react-redux';
import { removeLead } from '../../redux/leadSlice';
import { removeFollowUp } from '../../../followUps/redux/followUpSlice';
import { removeGroupLead } from '../../../groups/redux/groupSlice';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../../firebaseConfig';
import toast from 'react-hot-toast';
import ConfirmModal from '../../../../general/components/ConfirmModal';
import LeadCard from './LeadCard';
import ChangeStatusModal from './ChangeStatusModal';
import LeadContactActions from './LeadContactActions';
import { getCallHref, getWhatsAppHref, getLinkHref } from '../utils/leadContactLinks';

interface LeadTableProps {
  leads: LeadProps[];
  onEdit: (lead: LeadProps) => void;
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

function LeadTable({ leads, onEdit }: LeadTableProps) {
  const dispatch = useDispatch();
  const [showDeleteModalId, setShowDeleteModalId] = useState<string | null>(null);
  const [statusLead, setStatusLead] = useState<LeadProps | null>(null);

  const selectedLead = leads.find((lead) => lead.id === showDeleteModalId);

  const handleDelete = async () => {
    if (!showDeleteModalId) return;
    try {
      await deleteDoc(doc(db, 'leads', showDeleteModalId));
      dispatch(removeLead(showDeleteModalId));
      dispatch(removeFollowUp(showDeleteModalId));
      dispatch(removeGroupLead(showDeleteModalId));
      toast.success('Lead deleted successfully');
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error('Failed to delete lead');
    } finally {
      setShowDeleteModalId(null);
    }
  };

  return (
    <>
      {/* Mobile — compact cards for denser list */}
      <div className="space-y-2 md:hidden">
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onEdit={onEdit}
            onDelete={setShowDeleteModalId}
            onChangeStatus={setStatusLead}
          />
        ))}
      </div>

      {/* Desktop — table */}
      <div className="hidden overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm md:block">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-[#FAF9F6]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                No
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Phone
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                WhatsApp
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Added By
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Follow-up
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Link
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Created
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {leads.map((lead, index) => (
              <tr
                key={lead.id}
                className="transition-colors duration-150 hover:bg-[#FAF9F6]/50"
              >
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-500">
                  {String(index + 1).padStart(2, '0')}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <FiUser className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="max-w-[180px] truncate text-sm font-semibold text-gray-900">
                        {lead.name}
                      </div>
                      {lead.area && (
                        <div className="max-w-[180px] truncate text-xs text-gray-400">
                          {lead.area}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                  {getCallHref(lead.phoneNumber) ? (
                    <a
                      href={getCallHref(lead.phoneNumber)!}
                      className="text-blue-600 hover:underline"
                      title="Call"
                    >
                      {lead.phoneNumber}
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                  {getWhatsAppHref(lead.whatsappNumber) ? (
                    <a
                      href={getWhatsAppHref(lead.whatsappNumber)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:underline"
                      title="WhatsApp"
                    >
                      {lead.whatsappNumber}
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                    {getLeadTypeLabel(lead.leadType)}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                  {getAddedByLabel(lead.addedBy) || (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <button
                    type="button"
                    onClick={() => setStatusLead(lead)}
                    className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-opacity hover:opacity-80 ${getStatusBadgeClass(lead.status)}`}
                    title="Change status"
                  >
                    {getLeadStatusLabel(lead)}
                  </button>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-500">
                  {lead.nextFollowUpDate ? (
                    new Date(lead.nextFollowUpDate.toMillis()).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {lead.link ? (
                    <a
                      href={getLinkHref(lead.link)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-violet-600 hover:underline"
                      title="Open link"
                    >
                      Open
                    </a>
                  ) : (
                    <span className="text-sm text-gray-300">—</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-500">
                  {lead.createdAt ? (
                    new Date(lead.createdAt.toMillis()).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  ) : (
                    <span className="text-gray-300">Not set</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-1">
                    <LeadContactActions lead={lead} size="sm" />
                    <button
                      onClick={() => setStatusLead(lead)}
                      className="rounded-lg p-2 text-orange-600 transition-all duration-200 hover:bg-orange-50"
                      title="Change Status"
                    >
                      <FiRefreshCw className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit(lead)}
                      className="rounded-lg p-2 text-blue-600 transition-all duration-200 hover:bg-blue-50"
                      title="Edit Lead"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteModalId(lead.id)}
                      className="rounded-lg p-2 text-red-600 transition-all duration-200 hover:bg-red-50"
                      title="Delete Lead"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ChangeStatusModal
        isOpen={!!statusLead}
        lead={statusLead}
        onClose={() => setStatusLead(null)}
      />

      {selectedLead && showDeleteModalId && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setShowDeleteModalId(null)}
          onConfirm={handleDelete}
          message={`Are you sure you want to delete "${selectedLead.name}"?`}
        />
      )}
    </>
  );
}

export default LeadTable;
