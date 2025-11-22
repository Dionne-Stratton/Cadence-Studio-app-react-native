/**
 * History utility functions for calculations
 */

/**
 * Get ISO weekday (1=Monday ... 7=Sunday)
 * @param {Date} date - Date object
 * @returns {number} ISO weekday (1-7)
 */
export function getISOWeekday(date) {
  const day = date.getDay(); // 0=Sunday, 6=Saturday
  return day === 0 ? 7 : day; // Convert to ISO: 1=Monday, 7=Sunday
}

/**
 * Get start of week (Monday) in local timezone
 * @param {Date} date - Date object (defaults to today)
 * @returns {Date} Start of week (Monday 00:00:00)
 */
export function getStartOfWeek(date = new Date()) {
  const d = new Date(date);
  const weekday = getISOWeekday(d);
  d.setDate(d.getDate() - (weekday - 1)); // Move to Monday
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get end of week (Sunday) in local timezone
 * @param {Date} date - Date object (defaults to today)
 * @returns {Date} End of week (Sunday 23:59:59.999)
 */
export function getEndOfWeek(date = new Date()) {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6); // Add 6 days to get Sunday
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * Convert UTC ISO string to local date (yyyy-mm-dd)
 * @param {string} isoString - UTC ISO timestamp
 * @returns {string} Local date string (yyyy-mm-dd)
 */
export function getLocalDateString(isoString) {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get date string for display (Today, Yesterday, or date)
 * @param {string} isoString - UTC ISO timestamp
 * @returns {string} Display string
 */
export function getDateDisplayString(isoString) {
  const entryDate = new Date(isoString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const entryDateOnly = new Date(entryDate);
  entryDateOnly.setHours(0, 0, 0, 0);
  
  if (entryDateOnly.getTime() === today.getTime()) {
    return 'Today';
  } else if (entryDateOnly.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else {
    // Format as "Mon", "Jan 5", etc.
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[entryDate.getMonth()];
    const day = entryDate.getDate();
    return `${month} ${day}`;
  }
}

/**
 * Calculate current streak from history
 * @param {Array} history - Array of SessionHistoryEntry
 * @returns {number} Current streak in days
 */
export function calculateCurrentStreak(history) {
  if (!history || history.length === 0) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get unique dates with at least one completion
  const datesWithSessions = new Set();
  history.forEach(entry => {
    const dateStr = getLocalDateString(entry.completedAt);
    datesWithSessions.add(dateStr);
  });
  
  // Check if today has a session
  const todayStr = getLocalDateString(today.toISOString());
  if (!datesWithSessions.has(todayStr)) {
    return 0; // No session today = streak is 0
  }
  
  // Count backwards from today
  let streak = 0;
  let checkDate = new Date(today);
  
  while (true) {
    const dateStr = getLocalDateString(checkDate.toISOString());
    if (datesWithSessions.has(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}

/**
 * Calculate longest streak from history
 * @param {Array} history - Array of SessionHistoryEntry
 * @returns {number} Longest streak in days
 */
export function calculateLongestStreak(history) {
  if (!history || history.length === 0) return 0;
  
  // Get unique dates sorted
  const datesSet = new Set();
  history.forEach(entry => {
    const dateStr = getLocalDateString(entry.completedAt);
    datesSet.add(dateStr);
  });
  
  const dates = Array.from(datesSet).sort();
  if (dates.length === 0) return 0;
  
  // Find longest consecutive sequence
  let longestStreak = 1;
  let currentStreak = 1;
  
  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i - 1]);
    const currDate = new Date(dates[i]);
    const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      // Consecutive day
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      // Gap in dates
      currentStreak = 1;
    }
  }
  
  return longestStreak;
}

/**
 * Get this week's history entries
 * @param {Array} history - Array of SessionHistoryEntry
 * @returns {Array} History entries from this week (Monday-Sunday)
 */
export function getThisWeekHistory(history) {
  if (!history || history.length === 0) return [];
  
  const weekStart = getStartOfWeek();
  const weekEnd = getEndOfWeek();
  
  return history.filter(entry => {
    const entryDate = new Date(entry.completedAt);
    return entryDate >= weekStart && entryDate <= weekEnd;
  });
}

