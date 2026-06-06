/**
 * Elysian Wedding Concierge — Utility Functions
 */

/**
 * Format a date to a human-readable string.
 * e.g. "June 15, 2026"
 */
export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format a date in short form.
 * e.g. "Jun 15"
 */
export function formatDateShort(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Calculate the number of days until a given date.
 * Returns a negative number if the date is in the past.
 */
export function daysUntil(date) {
  if (!date) return 0;
  const target = new Date(date);
  const now = new Date();
  // Reset times to midnight for accurate day count
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Format a number as USD currency.
 * e.g. 12500 → "$12,500"
 */
export function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Determine budget health based on spending vs total.
 * @returns {'safe' | 'watch' | 'over'}
 */
export function calculateBudgetHealth(spent, total) {
  if (!total || total <= 0) return 'safe';
  const ratio = spent / total;
  if (ratio >= 1) return 'over';
  if (ratio >= 0.85) return 'watch';
  return 'safe';
}

/**
 * Calculate progress percentage.
 * @returns {number} 0-100
 */
export function calculateProgress(completed, total) {
  if (!total || total <= 0) return 0;
  const pct = Math.round((completed / total) * 100);
  return Math.min(100, Math.max(0, pct));
}

/**
 * Generate a random unique ID.
 */
export function generateId() {
  return `${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Return a time-of-day greeting.
 */
export function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Get a rich countdown object for a wedding date.
 * @returns {{ days: number, weeks: number, months: number }}
 */
export function getWeddingCountdown(weddingDate) {
  if (!weddingDate) return { days: 0, weeks: 0, months: 0 };
  const target = new Date(weddingDate);
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const totalDays = Math.max(0, Math.ceil((target - now) / (1000 * 60 * 60 * 24)));
  const weeks = Math.floor(totalDays / 7);
  const months = Math.floor(totalDays / 30.44); // average days per month

  return { days: totalDays, weeks, months };
}

/**
 * Map a category name to a CSS-friendly hex color.
 */
const CATEGORY_COLORS = {
  Venue: '#6366f1',
  Catering: '#f59e0b',
  Photography: '#ec4899',
  Videography: '#a855f7',
  Florals: '#10b981',
  Music: '#3b82f6',
  Attire: '#f472b6',
  'Hair & Makeup': '#fb923c',
  Invitations: '#06b6d4',
  Transportation: '#64748b',
  Honeymoon: '#14b8a6',
  Rings: '#c9a96e',
  Decor: '#8b5cf6',
  Favors: '#84cc16',
  Planner: '#e2c992',
  Bakery: '#fb7185',
  Officiant: '#a78bfa',
  Misc: '#94a3b8',
};

export function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || '#94a3b8';
}

/**
 * Map a category name to an emoji icon.
 */
const CATEGORY_ICONS = {
  Venue: '🏛️',
  Catering: '🍽️',
  Photography: '📸',
  Videography: '🎥',
  Florals: '💐',
  Music: '🎵',
  Attire: '👗',
  'Hair & Makeup': '💄',
  Invitations: '💌',
  Transportation: '🚗',
  Honeymoon: '✈️',
  Rings: '💍',
  Decor: '✨',
  Favors: '🎁',
  Planner: '📋',
  Bakery: '🎂',
  Officiant: '⛪',
  Misc: '📌',
};

export function getCategoryIcon(category) {
  return CATEGORY_ICONS[category] || '📌';
}

/**
 * Truncate text to a maximum length, appending "…" if needed.
 */
export function truncateText(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trimEnd() + '…';
}

/**
 * Group an array of objects by a given key.
 * @returns {Object} keyed by the value of `key`
 */
export function groupBy(array, key) {
  if (!Array.isArray(array)) return {};
  return array.reduce((result, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
}

/**
 * Sort an array of objects by a date key (ascending by default).
 */
export function sortByDate(array, dateKey = 'date', ascending = true) {
  if (!Array.isArray(array)) return [];
  return [...array].sort((a, b) => {
    const da = new Date(a[dateKey] || 0);
    const db = new Date(b[dateKey] || 0);
    return ascending ? da - db : db - da;
  });
}

/**
 * Conditional className joiner.
 * Usage: classNames('btn', isActive && 'btn-active', size === 'lg' && 'btn-lg')
 */
export function classNames(...args) {
  return args
    .flat()
    .filter((x) => typeof x === 'string' && x.length > 0)
    .join(' ');
}

/**
 * Debounce a function by a given delay.
 */
export function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Format a number with commas.
 * e.g. 1234567 → "1,234,567"
 */
export function formatNumber(num) {
  if (num == null || isNaN(num)) return '0';
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Capitalise first letter of a string.
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Check if a value is a non-empty string.
 */
export function isNonEmpty(val) {
  return typeof val === 'string' && val.trim().length > 0;
}

/**
 * Simple email validation.
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Get initials from a full name.
 * e.g. "Sarah Johnson" → "SJ"
 */
export function getInitials(name) {
  if (!name) return '';
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}
