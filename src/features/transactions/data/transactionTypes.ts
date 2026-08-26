import { Timestamp } from 'firebase/firestore';

export type TransactionType = 'income' | 'expense' | 'investment' | 'withdrawal';

export type TransactionTypeFilter = 'all' | TransactionType;

export type Cofounder = 'naswih' | 'anujith';

export const TRANSACTION_TYPE_OPTIONS: { value: TransactionType; label: string }[] = [
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
  { value: 'investment', label: 'Investment' },
  { value: 'withdrawal', label: 'Withdrawal' },
];

export const TRANSACTION_FILTER_OPTIONS: { value: TransactionTypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
  { value: 'investment', label: 'Investment' },
  { value: 'withdrawal', label: 'Withdrawal' },
];

export const COFOUNDERS: { value: Cofounder; label: string }[] = [
  { value: 'naswih', label: 'Naswih' },
  { value: 'anujith', label: 'Anujith' },
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
    value === 'income'
  ) {
    return value;
  }
  return 'income';
}

export function parseCofounder(value: unknown): Cofounder | null {
  if (value === 'naswih' || value === 'anujith') return value;
  return null;
}
