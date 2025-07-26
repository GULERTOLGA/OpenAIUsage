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
  
  // Bu ay (ayın başından bugüne)
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthStartTime = Math.floor(thisMonthStart.getTime() / 1000);
  
  // Bugün (00:00'dan şimdiye)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayStartTime = Math.floor(todayStart.getTime() / 1000);
  
  // Geçen hafta (7 gün öncesinden bugüne)
  const lastWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastWeekStartTime = Math.floor(lastWeekStart.getTime() / 1000);
  
  // Son 30 gün
  const last30DaysStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const last30DaysStartTime = Math.floor(last30DaysStart.getTime() / 1000);
  
  // Geçen ay
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const lastMonthStartTime = Math.floor(lastMonthStart.getTime() / 1000);
  const lastMonthEndTime = Math.floor(lastMonthEnd.getTime() / 1000);

  return [
    {
      label: "Bu Ay",
      startTime: thisMonthStartTime,
      endTime: endTime,
      startDate: thisMonthStart.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0]
    },
    {
      label: "Bugün",
      startTime: todayStartTime,
      endTime: endTime,
      startDate: todayStart.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0]
    },
    {
      label: "Geçen Hafta",
      startTime: lastWeekStartTime,
      endTime: endTime,
      startDate: lastWeekStart.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0]
    },
    {
      label: "Son 30 Gün",
      startTime: last30DaysStartTime,
      endTime: endTime,
      startDate: last30DaysStart.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0]
    },
    {
      label: "Geçen Ay",
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
    return start.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  return `${start.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })} - ${end.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })}`;
}; 