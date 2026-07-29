import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { FiX } from 'react-icons/fi';
import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
  Timestamp,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../../../../firebaseConfig';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../../general/redux/store';
import { addLead, updateLead } from '../../redux/leadSlice';
import { updateFollowUp } from '../../../followUps/redux/followUpSlice';
import { updateGroupLead } from '../../../groups/redux/groupSlice';
import {
  LEAD_ADDED_BY_OPTIONS,
  LEAD_STATUS_OPTIONS,
  LEAD_TYPE_OPTIONS,
  type LeadAddedBy,
  type LeadProps,
  type LeadStatus,
  type LeadType,
} from '../../data/leadTypes';
import keywordsBuilder from '../../../../general/utils/keywordsBuilder';
import toast from 'react-hot-toast';

interface LeadFormData {
  name: string;
  phoneNumber: string;
  whatsappNumber: string;
  link: string;
  leadType: LeadType;
  area: string;
  addedBy: LeadAddedBy | '';
  status: LeadStatus;
  customStatus: string;
  nextFollowUpDate: string;
  notes: string;
}

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead?: LeadProps | null;
}

const defaultValues: LeadFormData = {
  name: '',
  phoneNumber: '',
  whatsappNumber: '',
  link: '',
  leadType: 'direct',
  area: '',
  addedBy: '',
  status: 'not_contacted',
  customStatus: '',
  nextFollowUpDate: '',
  notes: '',
};

function formatDateForInput(timestamp: Timestamp | null | undefined): string {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function extractNameFromLink(urlStr: string): string | null {
  try {
    const trimmed = urlStr.trim();
    if (!trimmed) return null;
    
    let parsedUrlStr = trimmed;
    if (!/^https?:\/\//i.test(trimmed)) {
      parsedUrlStr = 'https://' + trimmed;
    }
    
    const url = new URL(parsedUrlStr);
    const hostname = url.hostname.toLowerCase();
    
    // 1. Instagram
    if (hostname.includes('instagram.com')) {
      const segments = url.pathname.split('/').filter(Boolean);
      if (segments.length > 0) {
        const username = segments[0];
        if (!['p', 'reel', 'stories', 'explore', 'direct'].includes(username.toLowerCase())) {
          return decodeURIComponent(username);
        }
      }
    }
    
    // 2. Facebook
    if (hostname.includes('facebook.com') || hostname.includes('fb.com')) {
      const segments = url.pathname.split('/').filter(Boolean);
      if (segments.length > 0) {
        const username = segments[0];
        if (!['groups', 'pages', 'people', 'profile.php', 'share', 'sharer'].includes(username.toLowerCase())) {
          return decodeURIComponent(username);
        }
        if (username.toLowerCase() === 'profile.php') {
          const id = url.searchParams.get('id');
          if (id) return id;
        }
      }
    }

    // 3. TikTok
    if (hostname.includes('tiktok.com')) {
      const segments = url.pathname.split('/').filter(Boolean);
      if (segments.length > 0) {
        const username = segments[0];
        if (username.startsWith('@')) {
          return decodeURIComponent(username.substring(1));
        }
        return decodeURIComponent(username);
      }
    }

    // 4. Fallback for other URLs
    const segments = url.pathname.split('/').filter(Boolean);
    if (segments.length > 0) {
      const firstSegment = segments[0];
      if (firstSegment.length > 2 && !firstSegment.includes('.')) {
        return decodeURIComponent(firstSegment);
      }
    }
  } catch (e) {
    // Ignore
  }
  return null;
}

const LeadModal: React.FC<LeadModalProps> = ({ isOpen, onClose, lead }) => {
  const dispatch: AppDispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!lead;
  const isNameManuallyEdited = React.useRef(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
    getValues,
  } = useForm<LeadFormData>({
    defaultValues,
    mode: 'onTouched',
  });

  const leadType = watch('leadType');
  const status = watch('status');

  useEffect(() => {
    if (isOpen) {
      isNameManuallyEdited.current = false;
      if (lead) {
        reset({
          name: lead.name || '',
          phoneNumber: lead.phoneNumber || '',
          whatsappNumber: lead.whatsappNumber || '',
          link: lead.link || '',
          leadType: lead.leadType || 'direct',
          area: lead.area || '',
          addedBy: lead.addedBy || '',
          status: lead.status || 'not_contacted',
          customStatus: lead.customStatus || '',
          nextFollowUpDate: formatDateForInput(lead.nextFollowUpDate),
          notes: lead.notes || '',
        });
      } else {
        reset(defaultValues);
      }
    }
  }, [isOpen, lead, reset]);

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);
    try {
      const leadsCollectionRef = collection(db, 'leads');

      if (!isEditMode) {
        const trimmedName = data.name.trim();
        const nameQuery = query(leadsCollectionRef, where('name', '==', trimmedName));
        const nameSnap = await getDocs(nameQuery);

        const nameMatch = nameSnap.docs.some(
          (doc) => doc.data().name?.trim().toLowerCase() === trimmedName.toLowerCase()
        );
        if (nameMatch) {
          toast.error('A lead with this name already exists');
          setIsSubmitting(false);
          return;
        }
      }

      const targetLeadId = isEditMode && lead ? lead.id : doc(leadsCollectionRef).id;
      const allKeywords = keywordsBuilder(data.name);

      const nextFollowUpDate =
        isEditMode && data.status === 'next_followup' && data.nextFollowUpDate
          ? Timestamp.fromDate(new Date(data.nextFollowUpDate))
          : null;

      const leadPayload = {
        name: data.name.trim(),
        phoneNumber: data.phoneNumber.trim(),
        whatsappNumber: data.whatsappNumber.trim(),
        link: data.link.trim(),
        leadType: data.leadType,
        area: data.leadType === 'another' ? data.area.trim() : '',
        status: isEditMode ? data.status : ('not_contacted' as const),
        customStatus:
          isEditMode && data.status === 'another' ? data.customStatus.trim() : '',
        nextFollowUpDate,
        notes: data.notes.trim(),
        keywords: allKeywords,
        updatedAt: serverTimestamp(),
        ...(isEditMode
          ? {}
          : { addedBy: data.addedBy as LeadAddedBy }),
      };

      if (isEditMode && lead) {
        await setDoc(doc(db, 'leads', targetLeadId), leadPayload, { merge: true });
        const updatedLead = {
          ...lead,
          ...leadPayload,
          updatedAt: Timestamp.now(),
        } as LeadProps;
        dispatch(updateLead(updatedLead));
        dispatch(updateFollowUp(updatedLead));
        dispatch(updateGroupLead(updatedLead));
        toast.success('Lead updated successfully');
      } else {
        const newLead = {
          ...leadPayload,
          createdAt: serverTimestamp(),
        };
        await setDoc(doc(db, 'leads', targetLeadId), newLead);
        dispatch(
          addLead({
            ...newLead,
            id: targetLeadId,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          } as LeadProps)
        );
        toast.success('Lead added successfully');
      }
      onClose();
    } catch (error) {
      console.error('Error saving lead:', error);
      toast.error(isEditMode ? 'Failed to update lead' : 'Failed to add lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.aside
            className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-lg font-bold text-gray-900">
                {isEditMode ? 'Edit Lead' : 'Add New Lead'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                aria-label="Close"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-1 flex-col overflow-hidden"
            >
              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Lead Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('name', {
                      required: 'Name is required',
                      onChange: () => {
                        isNameManuallyEdited.current = true;
                      },
                    })}
                    placeholder="Enter lead name"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:bg-white"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Phone Number
                  </label>
                  <Controller
                    name="phoneNumber"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <PhoneInput
                        country="in"
                        value={value?.replace(/^\+/, '') || ''}
                        onChange={(phone, country) => {
                          const dialCode =
                            typeof country === 'object' && country && 'dialCode' in country
                              ? String(country.dialCode)
                              : '';
                          if (!phone || phone === dialCode) {
                            onChange('');
                          } else {
                            onChange(`+${phone}`);
                          }
                        }}
                        inputClass="!w-full !h-[42px] !rounded-xl !border !border-gray-200 !bg-gray-50 !text-sm !pl-12"
                        containerClass="!w-full"
                        buttonClass="!rounded-l-xl !border !border-gray-200 !bg-gray-50"
                        dropdownClass="!rounded-xl"
                        placeholder="Phone number"
                        enableSearch
                      />
                    )}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    WhatsApp Number
                  </label>
                  <Controller
                    name="whatsappNumber"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <PhoneInput
                        country="in"
                        value={value?.replace(/^\+/, '') || ''}
                        onChange={(phone, country) => {
                          const dialCode =
                            typeof country === 'object' && country && 'dialCode' in country
                              ? String(country.dialCode)
                              : '';
                          if (!phone || phone === dialCode) {
                            onChange('');
                          } else {
                            onChange(`+${phone}`);
                          }
                        }}
                        inputClass="!w-full !h-[42px] !rounded-xl !border !border-gray-200 !bg-gray-50 !text-sm !pl-12"
                        containerClass="!w-full"
                        buttonClass="!rounded-l-xl !border !border-gray-200 !bg-gray-50"
                        dropdownClass="!rounded-xl"
                        placeholder="WhatsApp number"
                        enableSearch
                      />
                    )}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Link
                  </label>
                  <input
                    type="url"
                    {...register('link', {
                      onChange: (e) => {
                        const val = e.target.value;
                        const extracted = extractNameFromLink(val);
                        if (extracted && !isNameManuallyEdited.current) {
                          setValue('name', extracted, { shouldValidate: true, shouldDirty: true });
                        }
                      },
                    })}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Lead Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('leadType', { required: 'Lead type is required' })}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:bg-white"
                  >
                    {LEAD_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.leadType && (
                    <p className="mt-1 text-xs text-red-500">{errors.leadType.message}</p>
                  )}
                </div>

                {leadType === 'another' && (
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                      Area / Source <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('area', {
                        required:
                          leadType === 'another' ? 'Please specify the area/source' : false,
                      })}
                      placeholder="e.g. Referral, Website, Event"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:bg-white"
                    />
                    {errors.area && (
                      <p className="mt-1 text-xs text-red-500">{errors.area.message}</p>
                    )}
                  </div>
                )}

                {!isEditMode && (
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                      Who Added <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register('addedBy', {
                        required: !isEditMode ? 'Please select who added this lead' : false,
                      })}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:bg-white"
                    >
                      <option value="">Select person</option>
                      {LEAD_ADDED_BY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.addedBy && (
                      <p className="mt-1 text-xs text-red-500">{errors.addedBy.message}</p>
                    )}
                  </div>
                )}

                {isEditMode && (
                  <>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                        Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register('status', { required: 'Status is required' })}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:bg-white"
                      >
                        {LEAD_STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.status && (
                        <p className="mt-1 text-xs text-red-500">{errors.status.message}</p>
                      )}
                    </div>

                    {status === 'another' && (
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                          Custom Status <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          {...register('customStatus', {
                            required:
                              status === 'another' ? 'Please specify the status' : false,
                          })}
                          placeholder="e.g. Follow-up later, Not interested"
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:bg-white"
                        />
                        {errors.customStatus && (
                          <p className="mt-1 text-xs text-red-500">{errors.customStatus.message}</p>
                        )}
                      </div>
                    )}

                    {status === 'next_followup' && (
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                          Next Follow-up Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          {...register('nextFollowUpDate', {
                            required:
                              status === 'next_followup'
                                ? 'Please select a follow-up date'
                                : false,
                          })}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:bg-white"
                        />
                        {errors.nextFollowUpDate && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.nextFollowUpDate.message}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Notes
                  </label>
                  <textarea
                    {...register('notes')}
                    rows={3}
                    placeholder="Optional notes about this lead"
                    className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 border-t border-gray-100 px-5 py-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmitting && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  )}
                  {isEditMode ? 'Update Lead' : 'Add Lead'}
                </button>
              </div>
            </form>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default LeadModal;
