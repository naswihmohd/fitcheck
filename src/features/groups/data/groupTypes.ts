import type { LeadStatus } from '../../leadsManagement/data/leadTypes';
import { LEAD_STATUS_OPTIONS } from '../../leadsManagement/data/leadTypes';

export type GroupStatus = LeadStatus;

export const GROUP_STATUS_META: {
  value: GroupStatus;
  label: string;
  description: string;
  path: string;
  accent: string;
  iconBg: string;
  badge: string;
}[] = LEAD_STATUS_OPTIONS.map((option) => {
  const metaByStatus: Record<
    LeadStatus,
    { description: string; accent: string; iconBg: string; badge: string }
  > = {
    not_contacted: {
      description: 'Leads that have not been contacted yet',
      accent: 'text-slate-700',
      iconBg: 'bg-slate-100',
      badge: 'bg-gray-100 text-gray-700',
    },
    contacted: {
      description: 'Leads you have already reached out to',
      accent: 'text-sky-700',
      iconBg: 'bg-sky-50',
      badge: 'bg-blue-50 text-blue-700',
    },
    interested: {
      description: 'Leads showing interest in your offer',
      accent: 'text-emerald-700',
      iconBg: 'bg-emerald-50',
      badge: 'bg-green-100 text-green-700',
    },
    not_interested: {
      description: 'Leads that declined or are not interested',
      accent: 'text-rose-700',
      iconBg: 'bg-rose-50',
      badge: 'bg-rose-50 text-rose-700',
    },
    next_followup: {
      description: 'Leads scheduled for a follow-up',
      accent: 'text-orange-700',
      iconBg: 'bg-orange-50',
      badge: 'bg-orange-50 text-orange-700',
    },
    converted: {
      description: 'Leads that converted successfully',
      accent: 'text-violet-700',
      iconBg: 'bg-violet-50',
      badge: 'bg-violet-50 text-violet-700',
    },
    another: {
      description: 'Leads with a custom status',
      accent: 'text-amber-700',
      iconBg: 'bg-amber-50',
      badge: 'bg-amber-50 text-amber-700',
    },
  };

  const meta = metaByStatus[option.value];

  return {
    value: option.value,
    label: option.label,
    description: meta.description,
    path: option.value,
    accent: meta.accent,
    iconBg: meta.iconBg,
    badge: meta.badge,
  };
});

export function isValidGroupStatus(value: string): value is GroupStatus {
  return GROUP_STATUS_META.some((g) => g.value === value);
}

export function getGroupMeta(status: string) {
  return GROUP_STATUS_META.find((g) => g.value === status);
}
