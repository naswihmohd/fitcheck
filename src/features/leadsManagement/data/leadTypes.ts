import { Timestamp } from 'firebase/firestore';

export type LeadType = 'direct' | 'instagram' | 'facebook' | 'another';

export type LeadAddedBy = 'naswih' | 'anujith';

export type LeadStatus =
  | 'not_contacted'
  | 'contacted'
  | 'interested'
  | 'not_interested'
  | 'next_followup'
  | 'converted'
  | 'another';

export const LEAD_TYPE_OPTIONS: { value: LeadType; label: string }[] = [
  { value: 'direct', label: 'Direct' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'another', label: 'Another Area' },
];

export const LEAD_ADDED_BY_OPTIONS: { value: LeadAddedBy; label: string }[] = [
  { value: 'naswih', label: 'Naswih' },
  { value: 'anujith', label: 'Anujith' },
];

export const LEAD_STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: 'not_contacted', label: 'Not Contacted' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'interested', label: 'Interested' },
  { value: 'not_interested', label: 'Not Interested' },
  { value: 'next_followup', label: 'Next Follow-up' },
  { value: 'converted', label: 'Converted' },
  { value: 'another', label: 'Another Status' },
];

export interface LeadProps {
  id: string;
  name: string;
  phoneNumber: string;
  whatsappNumber: string;
  link: string;
  leadType: LeadType;
  /** Used when leadType is "another" or for a specific area/source note */
  area?: string;
  /** Who added this lead */
  addedBy?: LeadAddedBy;
  status: LeadStatus;
  /** Used when status is "another" */
  customStatus?: string;
  nextFollowUpDate: Timestamp | null;
  /** Latest note from a status change */
  responseNote?: string;
  notes?: string;
  keywords: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
