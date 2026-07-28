import { FiPhone, FiExternalLink } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import type { LeadProps } from '../../data/leadTypes';
import { getCallHref, getWhatsAppHref, getLinkHref } from '../utils/leadContactLinks';

interface LeadContactActionsProps {
  lead: LeadProps;
  /** Larger tap targets for mobile cards */
  size?: 'sm' | 'md';
}

function LeadContactActions({ lead, size = 'md' }: LeadContactActionsProps) {
  const callHref = getCallHref(lead.phoneNumber);
  const whatsappHref = getWhatsAppHref(lead.whatsappNumber);
  const linkHref = getLinkHref(lead.link);

  if (!callHref && !whatsappHref && !linkHref) return null;

  const iconClass = size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5';
  const btnClass =
    size === 'md'
      ? 'inline-flex h-9 min-w-9 flex-1 items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-colors active:scale-[0.98]'
      : 'inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors';

  return (
    <div className={`flex items-center ${size === 'md' ? 'gap-2' : 'gap-1'}`}>
      {callHref && (
        <a
          href={callHref}
          className={`${btnClass} bg-blue-50 text-blue-700 hover:bg-blue-100`}
          title="Call"
          aria-label={`Call ${lead.name}`}
        >
          <FiPhone className={iconClass} />
          {size === 'md' && <span>Call</span>}
        </a>
      )}
      {whatsappHref && (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btnClass} bg-emerald-50 text-emerald-700 hover:bg-emerald-100`}
          title="WhatsApp"
          aria-label={`WhatsApp ${lead.name}`}
        >
          <FaWhatsapp className={iconClass} />
          {size === 'md' && <span>WhatsApp</span>}
        </a>
      )}
      {linkHref && (
        <a
          href={linkHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btnClass} bg-violet-50 text-violet-700 hover:bg-violet-100`}
          title="Open link"
          aria-label={`Open link for ${lead.name}`}
        >
          <FiExternalLink className={iconClass} />
          {size === 'md' && <span>Link</span>}
        </a>
      )}
    </div>
  );
}

export default LeadContactActions;
