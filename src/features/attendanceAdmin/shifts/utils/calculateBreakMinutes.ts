import type { ShiftDay } from "../data/shiftTypes";


interface BreakResult {
  totalMinutes: number;
  readable: string;
}

function formatMinutes(minutes: number): string {
  if (minutes <= 0) return "0 min";

  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hrs && mins) return `${hrs} hr ${mins} min`;
  if (hrs) return `${hrs} hr`;
  return `${mins} min`;
}



export function calculateBreakMinutes(shift: ShiftDay): BreakResult {
  let totalMinutes = 0;

  // ✅ Case 1: No fixed break time → use breakTimeMinutes
  if (!shift.isFixedBreakTime) {
    totalMinutes = shift.breakTimeMinutes ?? 0;

    return {
      totalMinutes,
      readable: formatMinutes(totalMinutes),
    };
  }

  // ✅ Case 2: Fixed break times → calculate from start & end
  if (shift.isFixedBreakTime && shift.breakTimes?.length) {
    totalMinutes = shift.breakTimes.reduce((sum, breakTime) => {
      const start = breakTime.startTime.toDate().getTime();
      const end = breakTime.endTime.toDate().getTime();

      const diffMinutes = Math.max(0, (end - start) / (1000 * 60));
      return sum + diffMinutes;
    }, 0);
  }

  return {
    totalMinutes: Math.round(totalMinutes),
    readable: formatMinutes(Math.round(totalMinutes)),
  };
}
