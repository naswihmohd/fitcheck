export type FollowUpFilter = 'today_followups' | 'today_leads' | 'overdue';

export const FOLLOW_UP_TABS: {
  filter: FollowUpFilter;
  path: string;
  label: string;
  description: string;
}[] = [
    {
      filter: 'today_followups',
      path: 'today-follow-ups',
      label: 'Today Follow-ups',
      description: 'Leads scheduled for follow-up today',
    },
    {
      filter: 'overdue',
      path: 'overdue',
      label: 'Overdue Follow-ups',
      description: 'Leads with a past follow-up date',
    },
    {
      filter: 'today_leads',
      path: 'today-leads',
      label: 'Today Leads',
      description: 'Leads created today',
    },
  ];
