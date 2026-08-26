import { Timestamp } from 'firebase/firestore';
import keywordsBuilder from '../../../../general/utils/keywordsBuilder';
import type { Cofounder, TransactionProps, TransactionType } from '../../data/transactionTypes';
import {
  COFOUNDERS,
  isCreditType,
  TRANSACTION_TYPE_OPTIONS,
} from '../../data/transactionTypes';

export function getTransactionTypeLabel(type: TransactionType) {
  return TRANSACTION_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;
}

export function getCofounderLabel(partner?: Cofounder | null) {
  if (!partner) return '';
  return COFOUNDERS.find((option) => option.value === partner)?.label ?? partner;
}

export function getTypeBadgeClass(type: TransactionType) {
  switch (type) {
    case 'income':
      return 'bg-emerald-50 text-emerald-700';
    case 'investment':
      return 'bg-sky-50 text-sky-700';
    case 'withdrawal':
      return 'bg-amber-50 text-amber-700';
    default:
      return 'bg-rose-50 text-rose-700';
  }
}

export function getTypeIconWrapClass(type: TransactionType) {
  switch (type) {
    case 'income':
      return 'bg-emerald-50 text-emerald-600';
    case 'investment':
      return 'bg-sky-50 text-sky-600';
    case 'withdrawal':
      return 'bg-amber-50 text-amber-600';
    default:
      return 'bg-rose-50 text-rose-600';
  }
}

export function getAmountTextClass(type: TransactionType) {
  switch (type) {
    case 'income':
      return 'text-emerald-600';
    case 'investment':
      return 'text-sky-600';
    case 'withdrawal':
      return 'text-amber-600';
    default:
      return 'text-rose-600';
  }
}

export function formatSignedAmount(amount: number, type: TransactionType) {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
  return isCreditType(type) ? `+${formatted}` : `-${formatted}`;
}

export function formatTransactionDate(
  timestamp: TransactionProps['date'] | TransactionProps['createdAt'] | null | undefined
) {
  if (!timestamp) return null;
  return new Date(timestamp.toMillis()).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTransactionDateTime(
  timestamp: TransactionProps['date'] | TransactionProps['createdAt'] | null | undefined
) {
  if (!timestamp) return '—';
  return new Date(timestamp.toMillis()).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateForInput(timestamp: Timestamp | null | undefined): string {
  if (!timestamp) return todayInputValue();
  const date = timestamp.toDate();
  return toDateInputValue(date);
}

export function todayInputValue() {
  return toDateInputValue(new Date());
}

export function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Calendar date from the picker, clock time from now — so same-day rows stay ordered desc. */
export function timestampFromDateInput(value: string): Timestamp {
  const [year, month, day] = value.split('-').map(Number);
  const now = new Date();
  return Timestamp.fromDate(
    new Date(
      year,
      month - 1,
      day,
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
      now.getMilliseconds()
    )
  );
}

export function buildTransactionKeywords(
  note: string,
  type: TransactionType,
  amount: number,
  partner?: Cofounder | null
): string[] {
  const typeLabel = getTransactionTypeLabel(type);
  const partnerLabel = getCofounderLabel(partner);
  const searchableNote = note.trim().split(/\s+/).slice(0, 8).join(' ');
  const amountText = String(amount);
  const combined = `${searchableNote} ${typeLabel} ${type} ${partnerLabel} ${partner || ''} ${amountText}`.trim();
  return keywordsBuilder(combined);
}

export function parseAmount(value: string | number): number {
  const amount = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(amount) ? amount : 0;
}
