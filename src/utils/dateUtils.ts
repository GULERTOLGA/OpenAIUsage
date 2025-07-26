export interface DateRange {
  label: string;
  startTime: number;
  endTime: number;
  startDate: string;
  endDate: string;
}

export const getDateRanges = (): DateRange[] => {
  const now = new Date();
  const endTime = Math.floor(now.getTime() / 1000);
  
  // This month (from beginning of month to today)
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthStartTime = Math.floor(thisMonthStart.getTime() / 1000);
  
  // Today (from 00:00 to now)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayStartTime = Math.floor(todayStart.getTime() / 1000);
  
  // Last week (7 days ago to today)
  const lastWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastWeekStartTime = Math.floor(lastWeekStart.getTime() / 1000);
  
  // Last 30 days
  const last30DaysStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const last30DaysStartTime = Math.floor(last30DaysStart.getTime() / 1000);
  
  // Last month
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const lastMonthStartTime = Math.floor(lastMonthStart.getTime() / 1000);
  const lastMonthEndTime = Math.floor(lastMonthEnd.getTime() / 1000);

  return [
    {
      label: "This Month",
      startTime: thisMonthStartTime,
      endTime: endTime,
      startDate: thisMonthStart.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0]
    },
    {
      label: "Today",
      startTime: todayStartTime,
      endTime: endTime,
      startDate: todayStart.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0]
    },
    {
      label: "Last Week",
      startTime: lastWeekStartTime,
      endTime: endTime,
      startDate: lastWeekStart.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0]
    },
    {
      label: "Last 30 Days",
      startTime: last30DaysStartTime,
      endTime: endTime,
      startDate: last30DaysStart.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0]
    },
    {
      label: "Last Month",
      startTime: lastMonthStartTime,
      endTime: lastMonthEndTime,
      startDate: lastMonthStart.toISOString().split('T')[0],
      endDate: lastMonthEnd.toISOString().split('T')[0]
    }
  ];
};

export const formatDateRange = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (startDate === endDate) {
    return start.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  return `${start.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })} - ${end.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })}`;
}; 