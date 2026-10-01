export function formatCurrency(amount: number, currency: string = 'LKR'): string {
  if (currency === 'LKR' || currency === 'Rs' || currency === 'Rs.') {
    return `Rs. ${Math.round(amount).toLocaleString()}`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatLKR(usdAmount: number): string {
  if (usdAmount === 0) return 'Free';
  const lkr = Math.round(usdAmount * 300);
  return `Rs. ${lkr.toLocaleString()}`;
}

export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatDuration(days: number): string {
  if (days === 1) return '1 Day';
  return `${days} Days`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}
