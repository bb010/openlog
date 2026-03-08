/**
 * Format an ISO 8601 date string to "Dec 25, 2024"
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format an ISO 8601 date string to "Dec 25, 2024 at 3:45 PM"
 */
export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format an ISO 8601 date string to relative time "2 hours ago"
 */
export function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
}

/**
 * Format a date to YYYY-MM-DD for HTML date inputs
 */
export function formatDateForInput(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toISOString().split('T')[0];
}

/**
 * Get the last N days as an array of "MMM DD" labels
 */
export function getLastNDaysLabels(n: number): string[] {
  const labels: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    labels.push(
      date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );
  }
  return labels;
}

/**
 * Get YYYY-MM-DD for a date N days ago
 */
export function getDaysAgo(n: number): string {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return date.toISOString().split('T')[0];
}
