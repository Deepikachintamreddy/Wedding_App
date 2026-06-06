/**
 * Elysian Wedding Concierge — Mobile Utility Functions
 */

export function formatDate(date: string | Date): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateShort(date: string | Date): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function daysUntil(date: string | Date): number {
  if (!date) return 0;
  const target = new Date(date);
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateBudgetHealth(spent: number, total: number): 'safe' | 'watch' | 'over' {
  if (!total || total <= 0) return 'safe';
  const ratio = spent / total;
  if (ratio >= 1) return 'over';
  if (ratio >= 0.85) return 'watch';
  return 'safe';
}

export function calculateProgress(completed: number, total: number): number {
  if (!total || total <= 0) return 0;
  const pct = Math.round((completed / total) * 100);
  return Math.min(100, Math.max(0, pct));
}

export function generateId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
}

export function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const CATEGORY_COLORS: { [key: string]: string } = {
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

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || '#94a3b8';
}

const CATEGORY_ICONS: { [key: string]: string } = {
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

export function getCategoryIcon(category: string): string {
  return CATEGORY_ICONS[category] || '📌';
}

export function truncateText(text: string, maxLength = 100): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trimEnd() + '…';
}
