import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  FiArrowDownRight,
  FiArrowUpRight,
  FiFile,
  FiMinusCircle,
  FiPaperclip,
  FiPlusCircle,
  FiShoppingBag,
  FiX,
} from 'react-icons/fi';
import { collection, doc, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { db, storage } from '../../../../firebaseConfig';
import type { AppDispatch } from '../../../../general/redux/store';
import { addTransaction, updateTransaction } from '../../redux/transactionSlice';
import type { Cofounder, TransactionProps, TransactionType } from '../../data/transactionTypes';
import { COFOUNDERS, isFundFlowType } from '../../data/transactionTypes';
import deleteImageFromStorageWithUrl from '../../../../general/utils/deleteImageFromStorageWithUrl';
import {
  buildTransactionKeywords,
  formatDateForInput,
  parseAmount,
  timestampFromDateInput,
  todayInputValue,
} from '../utils/transactionHelpers';

const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const ATTACHMENT_ACCEPT = 'image/jpeg,image/png,image/webp,application/pdf';

interface TransactionFormData {
  type: TransactionType;
  amount: string;
  note: string;
  date: string;
  partner: Cofounder | '';
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: TransactionProps | null;
}

const defaultValues: TransactionFormData = {
  type: 'income',
  amount: '',
  note: '',
  date: todayInputValue(),
  partner: '',
};

const TYPE_BUTTONS: {
  value: TransactionType;
  label: string;
  icon: typeof FiArrowUpRight;
  activeClass: string;
}[] = [
  {
    value: 'income',
    label: 'Income',
    icon: FiArrowUpRight,
    activeClass: 'border-emerald-600 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
  },
  {
    value: 'expense',
    label: 'Expense',
    icon: FiArrowDownRight,
    activeClass: 'border-rose-600 bg-rose-50 text-rose-700 ring-1 ring-rose-600/20',
  },
  {
    value: 'investment',
    label: 'Investment',
    icon: FiPlusCircle,
    activeClass: 'border-sky-600 bg-sky-50 text-sky-700 ring-1 ring-sky-600/20',
  },
  {
    value: 'withdrawal',
    label: 'Withdrawal',
    icon: FiMinusCircle,
    activeClass: 'border-amber-600 bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
  },
  {
    value: 'purchase',
    label: 'Purchase',
    icon: FiShoppingBag,
    activeClass: 'border-purple-600 bg-purple-50 text-purple-700 ring-1 ring-purple-600/20',
  },
];

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, transaction }) => {
  const dispatch: AppDispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeAttachment, setRemoveAttachment] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditMode = !!transaction;
  const existingAttachmentUrl = removeAttachment ? null : transaction?.attachmentUrl || null;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<TransactionFormData>({
    defaultValues,
    mode: 'onTouched',
  });

  const type = watch('type');
  const partner = watch('partner');
  const showPartner = isFundFlowType(type);

  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setRemoveAttachment(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (transaction) {
        reset({
          type: transaction.type || 'income',
          amount: transaction.amount ? String(transaction.amount) : '',
          note: transaction.note || '',
          date: formatDateForInput(transaction.date),
          partner: transaction.partner || '',
        });
      } else {
        reset({
          ...defaultValues,
          date: todayInputValue(),
        });
      }
    }
  }, [isOpen, transaction, reset]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleTypeChange = (nextType: TransactionType) => {
    setValue('type', nextType, { shouldValidate: true });
    if (!isFundFlowType(nextType)) {
      setValue('partner', '', { shouldValidate: true });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_ATTACHMENT_BYTES) {
      toast.error('File must be 5MB or smaller');
      event.target.value = '';
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, WEBP, or PDF files are allowed');
      event.target.value = '';
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setRemoveAttachment(false);
  };

  const handleClearAttachment = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setRemoveAttachment(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true);
    try {
      const amount = parseAmount(data.amount);
      const note = data.note.trim();
      const partnerValue = isFundFlowType(data.type) ? (data.partner as Cofounder) : null;
      const transactionsCollectionRef = collection(db, 'transactions');
      const targetId =
        isEditMode && transaction ? transaction.id : doc(transactionsCollectionRef).id;
      const date =
        isEditMode && transaction && formatDateForInput(transaction.date) === data.date
          ? transaction.date
          : timestampFromDateInput(data.date);

      let attachmentUrl: string | null =
        isEditMode && transaction && !removeAttachment ? transaction.attachmentUrl || null : null;

      if (selectedFile) {
        const storageRef = ref(storage, `transactions/${targetId}`);
        await uploadBytes(storageRef, selectedFile);
        attachmentUrl = await getDownloadURL(storageRef);
      } else if (removeAttachment && transaction?.attachmentUrl) {
        try {
          await deleteImageFromStorageWithUrl(transaction.attachmentUrl);
        } catch (storageError) {
          console.error('Error removing attachment from storage:', storageError);
        }
      }

      const payload = {
        type: data.type,
        amount,
        note,
        date,
        partner: partnerValue,
        attachmentUrl,
        keywords: buildTransactionKeywords(note, data.type, amount, partnerValue),
        updatedAt: serverTimestamp(),
      };

      if (isEditMode && transaction) {
        await setDoc(doc(db, 'transactions', targetId), payload, { merge: true });
        dispatch(
          updateTransaction({
            ...transaction,
            ...payload,
            updatedAt: Timestamp.now(),
          } as TransactionProps)
        );
        toast.success('Transaction updated successfully');
      } else {
        const newTransaction = {
          ...payload,
          createdAt: serverTimestamp(),
        };
        await setDoc(doc(db, 'transactions', targetId), newTransaction);
        dispatch(
          addTransaction({
            ...newTransaction,
            id: targetId,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          } as TransactionProps)
        );
        toast.success('Transaction added successfully');
      }
      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast.error(isEditMode ? 'Failed to update transaction' : 'Failed to add transaction');
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
                {isEditMode ? 'Edit Transaction' : 'Add Transaction'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {TYPE_BUTTONS.map((option) => {
                      const Icon = option.icon;
                      const isActive = type === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleTypeChange(option.value)}
                          className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${
                            isActive
                              ? option.activeClass
                              : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                  <input type="hidden" {...register('type', { required: 'Type is required' })} />
                </div>

                {showPartner && (
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                      Cofounder <span className="text-red-500">*</span>
                    </label>
                    <p className="mb-2 text-xs text-gray-500">
                      {type === 'investment'
                        ? 'Who is investing this amount into the company?'
                        : 'Who is withdrawing this amount from the company?'}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {COFOUNDERS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            setValue('partner', option.value, { shouldValidate: true })
                          }
                          className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${
                            partner === option.value
                              ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary/20'
                              : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    <input
                      type="hidden"
                      {...register('partner', {
                        validate: (value) =>
                          !showPartner || value ? true : 'Select Shafi or Ajmal',
                      })}
                    />
                    {errors.partner && (
                      <p className="mt-1 text-xs text-red-500">{errors.partner.message}</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0.01"
                      {...register('amount', {
                        required: 'Amount is required',
                        validate: (value) => parseAmount(value) > 0 || 'Amount must be greater than 0',
                      })}
                      placeholder="0.00"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-8 pr-4 text-sm outline-none transition-all focus:border-primary focus:bg-white"
                    />
                  </div>
                  {errors.amount && (
                    <p className="mt-1 text-xs text-red-500">{errors.amount.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Note <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register('note', {
                      required: 'Note is required',
                      validate: (value) => value.trim().length > 0 || 'Note is required',
                    })}
                    rows={4}
                    placeholder={
                      type === 'investment'
                        ? 'Why is this capital being added?'
                        : type === 'withdrawal'
                          ? 'Why is this amount being withdrawn?'
                          : type === 'purchase'
                            ? 'What items were purchased?'
                            : 'What is this transaction for?'
                    }
                    className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:bg-white"
                  />
                  {errors.note && (
                    <p className="mt-1 text-xs text-red-500">{errors.note.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    {...register('date', { required: 'Date is required' })}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:bg-white"
                  />
                  {errors.date && (
                    <p className="mt-1 text-xs text-red-500">{errors.date.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Bill / Proof <span className="font-normal text-gray-400">(optional)</span>
                  </label>
                  <p className="mb-2 text-xs text-gray-500">
                    Attach a bill or proof if you have one. JPG, PNG, WEBP, or PDF — max 5MB.
                  </p>

                  {selectedFile || existingAttachmentUrl ? (
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
                      <a
                        href={previewUrl || existingAttachmentUrl || undefined}
                        target="_blank"
                        rel="noreferrer"
                        className="flex min-w-0 items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary"
                      >
                        {selectedFile?.type === 'application/pdf' ? (
                          <FiFile className="h-4 w-4 shrink-0 text-primary" />
                        ) : (
                          <FiPaperclip className="h-4 w-4 shrink-0 text-primary" />
                        )}
                        <span className="truncate">
                          {selectedFile?.name || 'View attached file'}
                        </span>
                      </a>
                      <div className="flex shrink-0 items-center">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="rounded-lg px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-white"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={handleClearAttachment}
                          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white hover:text-rose-600"
                          aria-label="Remove attachment"
                        >
                          <FiX className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label
                      htmlFor="transaction-attachment"
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-500 transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                    >
                      <FiPaperclip className="h-4 w-4" />
                      Choose file
                    </label>
                  )}

                  <input
                    id="transaction-attachment"
                    ref={fileInputRef}
                    type="file"
                    accept={ATTACHMENT_ACCEPT}
                    className="hidden"
                    onChange={handleFileChange}
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
                  {isEditMode ? 'Update Transaction' : 'Add Transaction'}
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

export default TransactionModal;
