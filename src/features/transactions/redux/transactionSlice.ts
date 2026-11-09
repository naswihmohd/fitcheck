import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import type { RootState } from '../../../general/redux/store';
import type {
  TransactionProps,
  TransactionSummary,
  TransactionTypeFilter,
} from '../data/transactionTypes';
import { parseCofounder, parseTransactionType } from '../data/transactionTypes';

const COLLECTION_NAME = 'transactions';
const LIMIT_NUMBER = 10;

export interface TransactionsState {
  transactions: TransactionProps[];
  lastVisible: any | null;
  hasMore: boolean;
  currentFilter?: string | null;
  currentTypeFilter: TransactionTypeFilter;
  summary: TransactionSummary;
  summaryLoading: boolean;
  loading: boolean;
  error: string | null;
}

const initialSummary = (): TransactionSummary => ({
  income: 0,
  expense: 0,
  investment: 0,
  withdrawal: 0,
  purchase: 0,
});

const initialState: TransactionsState = {
  transactions: [],
  lastVisible: null,
  hasMore: true,
  currentFilter: null,
  currentTypeFilter: 'all',
  summary: initialSummary(),
  summaryLoading: false,
  loading: false,
  error: null,
};

function buildFilterTerm(searchQuery: string | null, typeFilter: TransactionTypeFilter) {
  return `${typeFilter}|${searchQuery || ''}`;
}

function sortByDateDesc(transactions: TransactionProps[]) {
  transactions.sort((a, b) => {
    const aTime = a.date?.toMillis?.() ?? 0;
    const bTime = b.date?.toMillis?.() ?? 0;
    return bTime - aTime;
  });
}

function applySummaryDelta(
  summary: TransactionSummary,
  type: TransactionProps['type'],
  amount: number,
  sign: 1 | -1
) {
  const nextValue = Math.max(0, summary[type] + sign * amount);
  summary[type] = nextValue;
}

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (
    {
      searchQuery,
      typeFilter,
    }: { searchQuery: string | null; typeFilter: TransactionTypeFilter },
    { getState }
  ) => {
    const filterAndQueryTerm = buildFilterTerm(searchQuery, typeFilter);

    try {
      const state = getState() as RootState;
      const transactionsData = state.transactions;

      const shouldReset = transactionsData.currentFilter !== filterAndQueryTerm;
      const lastVisible = shouldReset ? null : transactionsData.lastVisible;
      const transactionsCollectionRef = collection(db, COLLECTION_NAME);

      const transactionsQuery = query(
        transactionsCollectionRef,
        ...(searchQuery ? [where('keywords', 'array-contains', searchQuery.toLowerCase())] : []),
        ...(typeFilter !== 'all' ? [where('type', '==', typeFilter)] : []),
        orderBy('date', 'desc'),
        ...(lastVisible ? [startAfter(lastVisible)] : []),
        limit(LIMIT_NUMBER)
      );

      const querySnapshot = await getDocs(transactionsQuery);
      const newTransactions: TransactionProps[] = querySnapshot.docs.map((d) => {
        const data = d.data();
        return {
          ...data,
          id: d.id,
          amount: Number(data.amount) || 0,
          type: parseTransactionType(data.type),
          partner: parseCofounder(data.partner),
          attachmentUrl: typeof data.attachmentUrl === 'string' ? data.attachmentUrl : null,
        } as TransactionProps;
      });

      return {
        transactions: newTransactions,
        lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
        hasMore: newTransactions.length === LIMIT_NUMBER,
        filterAndQueryTerm,
        typeFilter,
        shouldReset,
      };
    } catch (error) {
      throw new Error('Failed to fetch transactions: ' + (error as Error).message);
    }
  }
);


const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearTransactions: (state) => {
      state.transactions = [];
      state.lastVisible = null;
      state.hasMore = true;
      state.currentFilter = null;
      state.currentTypeFilter = 'all';
      state.loading = false;
      state.error = null;
    },
    addTransaction: (state, action) => {
      const transaction = action.payload as TransactionProps;
      const exists = state.transactions.some((item) => item.id === transaction.id);
      const matchesType =
        state.currentTypeFilter === 'all' || state.currentTypeFilter === transaction.type;

      if (!exists) {
        if (matchesType) {
          state.transactions.unshift(transaction);
          sortByDateDesc(state.transactions);
        }
        applySummaryDelta(state.summary, transaction.type, transaction.amount, 1);
      }
    },
    updateTransaction: (state, action) => {
      const transaction = action.payload as TransactionProps;
      const index = state.transactions.findIndex((item) => item.id === transaction.id);

      if (index !== -1) {
        const previous = state.transactions[index];
        applySummaryDelta(state.summary, previous.type, previous.amount, -1);
        applySummaryDelta(state.summary, transaction.type, transaction.amount, 1);

        const matchesType =
          state.currentTypeFilter === 'all' || state.currentTypeFilter === transaction.type;

        if (matchesType) {
          state.transactions[index] = {
            ...previous,
            ...transaction,
          };
          sortByDateDesc(state.transactions);
        } else {
          state.transactions.splice(index, 1);
        }
      }
    },
    removeTransaction: (state, action) => {
      const transactionId = action.payload as string;
      const previous = state.transactions.find((item) => item.id === transactionId);
      if (previous) {
        applySummaryDelta(state.summary, previous.type, previous.amount, -1);
      }
      state.transactions = state.transactions.filter((item) => item.id !== transactionId);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        const {
          transactions,
          lastVisible,
          hasMore,
          filterAndQueryTerm,
          typeFilter,
          shouldReset,
        } = action.payload;

        if (shouldReset) {
          state.transactions = [];
          state.lastVisible = null;
        }

        const uniqueTransactions = transactions.filter(
          (newTransaction) =>
            !state.transactions.some((transaction) => transaction.id === newTransaction.id)
        );
        state.transactions = [...state.transactions, ...uniqueTransactions];
        state.lastVisible = lastVisible;
        state.hasMore = hasMore;
        state.currentFilter = filterAndQueryTerm;
        state.currentTypeFilter = typeFilter;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch transactions';
      })
  },
});

export const { clearTransactions, addTransaction, updateTransaction, removeTransaction } =
  transactionSlice.actions;
export default transactionSlice.reducer;
