import { Timestamp } from 'firebase/firestore';

export type TransactionType = 'income' | 'expense' | 'investment' | 'withdrawal' | 'purchase';

export type TransactionTypeFilter = 'all' | TransactionType;

export type Cofounder = 'shafi' | 'ajmal';

export const TRANSACTION_TYPE_OPTIONS: { value: TransactionType; label: string }[] = [
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
  { value: 'investment', label: 'Investment' },
  { value: 'withdrawal', label: 'Withdrawal' },
  { value: 'purchase', label: 'Purchase' },
];

export const TRANSACTION_FILTER_OPTIONS: { value: TransactionTypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
  { value: 'investment', label: 'Investment' },
  { value: 'withdrawal', label: 'Withdrawal' },
  { value: 'purchase', label: 'Purchase' },
];

export const COFOUNDERS: { value: Cofounder; label: string }[] = [
  { value: 'shafi', label: 'Shafi' },
  { value: 'ajmal', label: 'Ajmal' },
];

export interface TransactionProps {
  id: string;
  type: TransactionType;
  amount: number;
  note: string;
  date: Timestamp;
  keywords: string[];
  partner?: Cofounder | null;
  /** Optional bill / proof file stored in Firebase Storage */
  attachmentUrl?: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TransactionSummary {
  income: number;
  expense: number;
  investment: number;
  withdrawal: number;
  purchase: number;
}

export function isFundFlowType(type: TransactionType): type is 'investment' | 'withdrawal' {
  return type === 'investment' || type === 'withdrawal';
}

export function isCreditType(type: TransactionType): boolean {
  return type === 'income' || type === 'investment';
}

export function parseTransactionType(value: unknown): TransactionType {
  if (
    value === 'expense' ||
    value === 'investment' ||
    value === 'withdrawal' ||
    value === 'income' ||
    value === 'purchase'
  ) {
    return value;
  }
  return 'income';
}

export function parseCofounder(value: unknown): Cofounder | null {
  if (value === 'shafi' || value === 'ajmal') return value;
  return null;
}
