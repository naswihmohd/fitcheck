import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  collection,
  getCountFromServer,
  query,
  Timestamp,
  where,
} from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

const COLLECTION_NAME = 'leads';

const METRIC_STATUSES = ['interested', 'converted', 'another'] as const;

export interface WeekDayCount {
  name: string;
  leads: number;
}

export interface DashboardCounts {
  total: number;
  today: number;
  interested: number;
  converted: number;
  another: number;
  weekTrend: WeekDayCount[];
}

export interface DashboardState {
  counts: DashboardCounts;
  loading: boolean;
  error: string | null;
}

const initialCounts = (): DashboardCounts => ({
  total: 0,
  today: 0,
  interested: 0,
  converted: 0,
  another: 0,
  weekTrend: [],
});

const initialState: DashboardState = {
  counts: initialCounts(),
  loading: false,
  error: null,
};

function getDayRange(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  return {
    start: Timestamp.fromDate(start),
    end: Timestamp.fromDate(end),
  };
}

function getTodayRange() {
  return getDayRange(new Date());
}

function getWeekDays(): { date: Date; name: string }[] {
  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const days: { date: Date; name: string }[] = [];

  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - i
    );
    days.push({ date, name: names[date.getDay()] });
  }

  return days;
}

export const fetchDashboardCounts = createAsyncThunk(
  'dashboard/fetchDashboardCounts',
  async () => {
    try {
      const leadsCollectionRef = collection(db, COLLECTION_NAME);
      const { start: todayStart, end: todayEnd } = getTodayRange();
      const weekDays = getWeekDays();

      const [totalSnap, todaySnap, statusResults, weekResults] = await Promise.all([
        getCountFromServer(query(leadsCollectionRef)),
        getCountFromServer(
          query(
            leadsCollectionRef,
            where('createdAt', '>=', todayStart),
            where('createdAt', '<', todayEnd)
          )
        ),
        Promise.all(
          METRIC_STATUSES.map(async (status) => {
            const snapshot = await getCountFromServer(
              query(leadsCollectionRef, where('status', '==', status))
            );
            return [status, snapshot.data().count] as const;
          })
        ),
        Promise.all(
          weekDays.map(async ({ date, name }) => {
            const { start, end } = getDayRange(date);
            const snapshot = await getCountFromServer(
              query(
                leadsCollectionRef,
                where('createdAt', '>=', start),
                where('createdAt', '<', end)
              )
            );
            return { name, leads: snapshot.data().count } satisfies WeekDayCount;
          })
        ),
      ]);

      const statusMap = Object.fromEntries(statusResults) as Record<
        (typeof METRIC_STATUSES)[number],
        number
      >;

      return {
        total: totalSnap.data().count,
        today: todaySnap.data().count,
        interested: statusMap.interested,
        converted: statusMap.converted,
        another: statusMap.another,
        weekTrend: weekResults,
      } satisfies DashboardCounts;
    } catch (error) {
      throw new Error(
        'Failed to fetch dashboard counts: ' + (error as Error).message
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
      .addCase(fetchDashboardCounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardCounts.fulfilled, (state, action) => {
        state.loading = false;
        state.counts = action.payload;
      })
      .addCase(fetchDashboardCounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch dashboard counts';
      });
  },
});

export default dashboardSlice.reducer;
