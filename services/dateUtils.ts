// Helper to get the date string in YYYY-MM-DD format for a given Date object
const toISODateString = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

// Checks if a given ISO date string (YYYY-MM-DD) is today
export const isToday = (dateString: string | null): boolean => {
    if (!dateString) return false;
    return toISODateString(new Date()) === dateString;
};

// Checks if a given ISO date string (YYYY-MM-DD) was yesterday
export const isYesterday = (dateString: string | null): boolean => {
    if (!dateString) return false;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return toISODateString(yesterday) === dateString;
};

// Gets the day number of the year (e.g., Feb 1st is 32)
export const getDayOfYear = (): number => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};