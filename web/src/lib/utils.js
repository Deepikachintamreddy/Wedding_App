/**
 * Elysian Concierge & Elysian Weddings — Comprehensive Utility Functions
 * Grounded in luxury wedding coordination procedures by OVAimagination Events
 */

/**
 * Format a date to a human-readable string.
 * e.g. "July 15, 2027"
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
 * e.g. "Jul 15"
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
 * Returns negative if the date has passed.
 */
export function daysUntil(date) {
  if (!date) return 0;
  const target = new Date(date);
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Format a number as USD currency.
 * e.g. 50000 → "$50,000"
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
 * Calculate budget financial metrics adhering strictly to Step 10:
 * - totalBudget
 * - plannedAllocation
 * - totalContracted
 * - totalPaid
 * - outstandingBalance (contracted - paid)
 * - unallocatedRemaining (totalBudget - contracted)
 * - health: 'safe' | 'watch' | 'over'
 */
export function calculateBudgetSummary(budget) {
  const total = Number(budget?.total) || 0;
  const categories = budget?.categories || [];
  const payments = budget?.payments || [];

  const plannedAllocation = categories.reduce((sum, c) => sum + (Number(c.planned) || Number(c.estimated) || 0), 0);
  const totalContracted = categories.reduce((sum, c) => sum + (Number(c.contracted) || Number(c.actual) || 0), 0);
  
  const totalPaid = payments
    .filter(p => p.status === 'Paid')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const outstandingBalance = Math.max(0, totalContracted - totalPaid);
  const unallocatedRemaining = Math.max(0, total - totalContracted);

  // Over-budget categories
  const overBudgetCategories = categories.filter(c => {
    const contracted = Number(c.contracted) || Number(c.actual) || 0;
    const planned = Number(c.planned) || Number(c.estimated) || 0;
    return contracted > planned;
  });

  // Overdue payments
  const nowStr = new Date().toISOString().split('T')[0];
  const overduePayments = payments.filter(p => p.status === 'Upcoming' && p.date && p.date < nowStr);

  let health = 'safe';
  if (totalContracted > total) {
    health = 'over';
  } else if (totalContracted >= total * 0.9) {
    health = 'watch';
  }

  return {
    total,
    totalBudget: total,
    planned: plannedAllocation,
    plannedAllocation,
    contracted: totalContracted,
    totalContracted,
    paid: totalPaid,
    totalPaid,
    outstanding: outstandingBalance,
    outstandingBalance,
    unallocated: unallocatedRemaining,
    unallocatedRemaining,
    overBudgetCategories,
    overduePayments,
    health,
  };
}

/**
 * Determine budget health indicator based on contracted vs total.
 */
export function calculateBudgetHealth(contracted, total) {
  if (!total || total <= 0) return 'safe';
  const ratio = contracted / total;
  if (ratio > 1) return 'over';
  if (ratio >= 0.88) return 'watch';
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
 * Calculate Wedding Progress Score (Step 23) based on weighted high-impact milestones:
 * - Venue booked (25%)
 * - Key vendors booked (Photography, Catering, Music, Florals) (25%)
 * - Guest list finalized & invites sent (20%)
 * - RSVPs managed & seating assigned (15%)
 * - Final day-of timeline complete (15%)
 */
export function calculateProgressScore(data = {}) {
  const tasks = data?.tasks || [];
  const vendors = data?.vendors || [];
  const guests = data?.guests || [];
  const timeline = data?.timeline || [];

  let score = 0;
  const breakdown = [];
  let nextAction = 'Complete your initial onboarding profile.';

  // Milestone 1: Venue Booked (25 pts)
  const venueBooked = vendors.some(v => v.category === 'Venue' && v.status === 'Booked') ||
                      tasks.some(t => t.category === 'Venue' && t.completed);
  const venuePts = venueBooked ? 25 : 0;
  score += venuePts;
  breakdown.push({
    driver: 'Venue Reserved',
    name: 'Venue Reserved',
    weight: 25,
    max: 25,
    current: venuePts,
    points: 25,
    completed: venueBooked
  });
  if (!venueBooked) {
    nextAction = 'Research and shortlist a wedding venue in your target location.';
  }

  // Milestone 2: Key Creative Vendors (25 pts)
  const bookedCategories = new Set(vendors.filter(v => v.status === 'Booked').map(v => v.category));
  let vendorPts = 0;
  if (bookedCategories.has('Photography')) vendorPts += 8;
  if (bookedCategories.has('Catering')) vendorPts += 7;
  if (bookedCategories.has('Music') || bookedCategories.has('DJ')) vendorPts += 5;
  if (bookedCategories.has('Florals') || bookedCategories.has('Planner')) vendorPts += 5;
  
  score += vendorPts;
  breakdown.push({
    driver: 'Key Vendors Booked',
    name: 'Key Creative Vendors Retained',
    weight: 25,
    max: 25,
    current: vendorPts,
    points: 25,
    earned: vendorPts,
    completed: vendorPts >= 20
  });

  if (vendorPts < 20 && venueBooked && nextAction.startsWith('Research')) {
    nextAction = 'Book your lead photographer and catering partners.';
  }

  // Milestone 3: Guest List & Invitations (20 pts)
  const hasGuests = guests.length >= 10;
  const invitesSent = tasks.some(t => (t.id === 't8' || t.id === 't10') && t.completed);
  let invitePts = 0;
  if (hasGuests) invitePts += 10;
  if (invitesSent) invitePts += 10;

  score += invitePts;
  breakdown.push({
    driver: 'Guest List & Invites',
    name: 'Guest List Drafted & Invitations Dispatched',
    weight: 20,
    max: 20,
    current: invitePts,
    points: 20,
    earned: invitePts,
    completed: invitePts === 20
  });

  if (invitePts < 20 && score >= 50) {
    nextAction = 'Send out formal digital invitations to your guest list.';
  }

  // Milestone 4: RSVPs & Seating (15 pts)
  const attendingGuests = guests.filter(g => g.status === 'Attending');
  const seatedGuests = attendingGuests.filter(g => Number(g.table) > 0);
  let rsvpPts = 0;
  if (attendingGuests.length > 0) rsvpPts += 7;
  if (seatedGuests.length > 0 && seatedGuests.length >= attendingGuests.length * 0.7) rsvpPts += 8;

  score += rsvpPts;
  breakdown.push({
    driver: 'RSVPs & Seating Chart',
    name: 'RSVP Responses Logged & Tables Assigned',
    weight: 15,
    max: 15,
    current: rsvpPts,
    points: 15,
    earned: rsvpPts,
    completed: rsvpPts === 15
  });

  if (rsvpPts < 15 && score >= 65) {
    nextAction = 'Assign table seating numbers to confirmed attending guests.';
  }

  // Milestone 5: Day-Of Timeline (15 pts)
  const timelineCount = timeline.length;
  let timelinePts = 0;
  if (timelineCount >= 5) timelinePts += 10;
  if (timelineCount >= 8) timelinePts += 5;

  score += timelinePts;
  breakdown.push({
    driver: 'Day-of Timeline',
    name: 'Master Day-of Timeline Finalized',
    weight: 15,
    max: 15,
    current: timelinePts,
    points: 15,
    earned: timelinePts,
    completed: timelinePts === 15
  });

  if (timelinePts < 15 && score >= 80) {
    nextAction = 'Review and finalize your hourly ceremony and reception schedule.';
  }

  if (score >= 95) {
    nextAction = 'All core planning milestones completed! Coordinate final details with your planner.';
  }

  return {
    score: Math.min(100, score),
    breakdown,
    drivers: breakdown,
    nextAction,
    nextBestAction: nextAction
  };
}

/**
 * Generate a unique ID.
 */
export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
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
 * Get a countdown object for a wedding date.
 */
export function getWeddingCountdown(weddingDate) {
  if (!weddingDate) return { days: 0, weeks: 0, months: 0 };
  const target = new Date(weddingDate);
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const totalDays = Math.max(0, Math.ceil((target - now) / (1000 * 60 * 60 * 24)));
  const weeks = Math.floor(totalDays / 7);
  const months = Math.floor(totalDays / 30.44);

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
  Rings: '#d4af37',
  Decor: '#8b5cf6',
  Favors: '#84cc16',
  Planner: '#d4af37',
  Bakery: '#fb7185',
  Officiant: '#a78bfa',
  Misc: '#94a3b8',
};

export function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || '#94a3b8';
}

/**
 * Map a category name to an icon.
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
 * Capitalize first letter of a string.
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format a number with commas.
 */
export function formatNumber(num) {
  if (num == null || isNaN(num)) return '0';
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Get initials from a full name.
 */
export function getInitials(name) {
  if (!name) return 'EC';
  return name
    .split(/[\s&]+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}
