import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  collection,
  count,
  getAggregateFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  sum,
  Timestamp,
  where,
  type CollectionReference,
  type Query,
} from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import type { Cofounder, TransactionType } from '../../transactions/data/transactionTypes';
import {
  COFOUNDERS,
  parseCofounder,
  parseTransactionType,
} from '../../transactions/data/transactionTypes';

const COLLECTION_NAME = 'transactions';

export interface WeekDayAmount {
  name: string;
  income: number;
  expense: number;
}

export interface DashboardRecentTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  note: string;
  dateMillis: number;
  partner: Cofounder | null;
}

export interface PartnerFundFlow {
  partner: Cofounder;
  name: string;
  investment: number;
  withdrawal: number;
  net: number;
}

export interface DashboardAnalytics {
  income: number;
  expense: number;
  investment: number;
  withdrawal: number;
  balance: number;
  transactionCount: number;
  weekTrend: WeekDayAmount[];
  recentTransactions: DashboardRecentTransaction[];
  partnerFlows: PartnerFundFlow[];
}

export interface DashboardState {
  analytics: DashboardAnalytics;
  loading: boolean;
  error: string | null;
}

export interface DashboardDateRange {
  startDate: string;
  endDate: string;
}

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endExclusive(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
}

function dateRangeFilters(range?: DashboardDateRange | null) {
  if (!range?.startDate || !range?.endDate) return [];

  return [
    where('date', '>=', Timestamp.fromDate(startOfDay(parseLocalDate(range.startDate)))),
    where('date', '<', Timestamp.fromDate(endExclusive(parseLocalDate(range.endDate)))),
  ];
}

function trendDays(range?: DashboardDateRange | null): Date[] {
  const end = startOfDay(range?.endDate ? parseLocalDate(range.endDate) : new Date());
  const rangeStart = range?.startDate
    ? startOfDay(parseLocalDate(range.startDate))
    : new Date(end.getFullYear(), end.getMonth(), end.getDate() - 6);

  const days: Date[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(end.getFullYear(), end.getMonth(), end.getDate() - i);
    if (date >= rangeStart) days.push(date);
  }

  return days.length > 0 ? days : [end];
}

const emptyWeekTrend = (range?: DashboardDateRange | null): WeekDayAmount[] =>
  trendDays(range).map((date) => ({
    name: WEEKDAY_NAMES[date.getDay()],
    income: 0,
    expense: 0,
  }));

const emptyPartnerFlows = (): PartnerFundFlow[] =>
  COFOUNDERS.map((cofounder) => ({
    partner: cofounder.value,
    name: cofounder.label,
    investment: 0,
    withdrawal: 0,
    net: 0,
  }));

const initialAnalytics = (): DashboardAnalytics => ({
  income: 0,
  expense: 0,
  investment: 0,
  withdrawal: 0,
  balance: 0,
  transactionCount: 0,
  weekTrend: emptyWeekTrend(),
  recentTransactions: [],
  partnerFlows: emptyPartnerFlows(),
});

const initialState: DashboardState = {
  analytics: initialAnalytics(),
  loading: false,
  error: null,
};

function toMillis(value: unknown): number | null {
  if (!value) return null;
  if (typeof value === 'object' && value !== null && 'toMillis' in value) {
    return (value as { toMillis: () => number }).toMillis();
  }
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    return (value as { toDate: () => Date }).toDate().getTime();
  }
  if (typeof value === 'object' && value !== null && 'seconds' in value) {
    return Number((value as { seconds: number }).seconds) * 1000;
  }
  return null;
}

function numericValue(value: number | null | undefined) {
  return Number(value) || 0;
}

function datedQuery(
  transactionsRef: CollectionReference,
  type: TransactionType,
  startTs: Timestamp,
  endTs: Timestamp
) {
  return query(
    transactionsRef,
    where('type', '==', type),
    where('date', '>=', startTs),
    where('date', '<', endTs)
  );
}

async function fetchSum(baseQuery: Query) {
  const snap = await getAggregateFromServer(baseQuery, {
    total: sum('amount'),
  });
  return numericValue(snap.data().total);
}

async function fetchSumAndCount(baseQuery: Query) {
  const snap = await getAggregateFromServer(baseQuery, {
    total: sum('amount'),
    count: count(),
  });
  const data = snap.data();
  return {
    total: numericValue(data.total),
    count: data.count ?? 0,
  };
}

async function fetchPartnerFlows(
  transactionsRef: CollectionReference,
  rangeFilters: ReturnType<typeof dateRangeFilters>
): Promise<PartnerFundFlow[]> {
  return Promise.all(
    COFOUNDERS.map(async (cofounder) => {
      const [investment, withdrawal] = await Promise.all([
        fetchSum(
          query(
            transactionsRef,
            where('type', '==', 'investment'),
            where('partner', '==', cofounder.value),
            ...rangeFilters
          )
        ),
        fetchSum(
          query(
            transactionsRef,
            where('type', '==', 'withdrawal'),
            where('partner', '==', cofounder.value),
            ...rangeFilters
          )
        ),
      ]);

      return {
        partner: cofounder.value,
        name: cofounder.label,
        investment,
        withdrawal,
        net: investment - withdrawal,
      };
    })
  );
}

async function fetchDayAmounts(transactionsRef: CollectionReference, dayStart: Date) {
  const startTs = Timestamp.fromDate(dayStart);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);
  const endTs = Timestamp.fromDate(dayEnd);

  const [income, expense] = await Promise.all([
    fetchSum(datedQuery(transactionsRef, 'income', startTs, endTs)),
    fetchSum(datedQuery(transactionsRef, 'expense', startTs, endTs)),
  ]);

  return { income, expense };
}

export const fetchDashboardAnalytics = createAsyncThunk(
  'dashboard/fetchDashboardAnalytics',
  async (range?: DashboardDateRange | null) => {
    try {
      const transactionsRef = collection(db, COLLECTION_NAME);
      const rangeFilters = dateRangeFilters(range);
      const incomeQuery = query(transactionsRef, where('type', '==', 'income'), ...rangeFilters);
      const expenseQuery = query(transactionsRef, where('type', '==', 'expense'), ...rangeFilters);
      const investmentQuery = query(
        transactionsRef,
        where('type', '==', 'investment'),
        ...rangeFilters
      );
      const withdrawalQuery = query(
        transactionsRef,
        where('type', '==', 'withdrawal'),
        ...rangeFilters
      );
      const weekDayStarts = trendDays(range);

      const [incomeAgg, expenseAgg, investmentAgg, withdrawalAgg, weekAmounts, recentSnap, partnerFlows] =
        await Promise.all([
          fetchSumAndCount(incomeQuery),
          fetchSumAndCount(expenseQuery),
          fetchSumAndCount(investmentQuery),
          fetchSumAndCount(withdrawalQuery),
          Promise.all(weekDayStarts.map((dayStart) => fetchDayAmounts(transactionsRef, dayStart))),
          getDocs(query(transactionsRef, ...rangeFilters, orderBy('date', 'desc'), limit(5))),
          fetchPartnerFlows(transactionsRef, rangeFilters),
        ]);

      const analytics = initialAnalytics();
      analytics.transactionCount =
        incomeAgg.count + expenseAgg.count + investmentAgg.count + withdrawalAgg.count;
      analytics.income = incomeAgg.total;
      analytics.expense = expenseAgg.total;
      analytics.investment = investmentAgg.total;
      analytics.withdrawal = withdrawalAgg.total;
      analytics.balance =
        analytics.income + analytics.investment - analytics.expense - analytics.withdrawal;
      analytics.partnerFlows = partnerFlows;
      analytics.weekTrend = emptyWeekTrend(range).map((day, index) => ({
        ...day,
        income: weekAmounts[index]?.income ?? 0,
        expense: weekAmounts[index]?.expense ?? 0,
      }));
      analytics.recentTransactions = recentSnap.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          type: parseTransactionType(data.type),
          amount: Number(data.amount) || 0,
          note: String(data.note || ''),
          dateMillis: toMillis(data.date) ?? toMillis(data.createdAt) ?? 0,
          partner: parseCofounder(data.partner),
        };
      });

      return analytics;
    } catch (error) {
      throw new Error(
        'Failed to fetch account analytics: ' + (error as Error).message
      );
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchDashboardAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch account analytics';
      });
  },
});

export default dashboardSlice.reducer;
