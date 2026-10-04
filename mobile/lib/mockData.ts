/**
 * VND Wedding Concierge — Comprehensive Mock Data (Mobile)
 */

export interface Task {
  id: string;
  title: string;
  category: string;
  period: string;
  completed: boolean;
  dueDate: string;
  notes: string;
  assignedTo: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewsCount: number;
  costRange: string;
  location: string;
  status: string;
  contactName: string;
  email: string;
  phone: string;
  website?: string;
  contractPrice?: number;
  paidAmount?: number;
  nextPaymentDate?: string | null;
  notes: string;
}

export interface Guest {
  id: string;
  name: string;
  group: string;
  email: string;
  phone: string;
  status: string;
  rsvpReceived: boolean;
  meal: string;
  table: number;
  plusOnes: number;
  notes: string;
}

export interface Payment {
  id: string;
  vendorName: string;
  category: string;
  amount: number;
  date: string;
  status: string;
  method: string;
}

export interface Budget {
  total: number;
  categories: {
    name: string;
    estimated: number;
    actual: number;
    color: string;
  }[];
  payments: Payment[];
}

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  location: string;
  desc: string;
  status: string;
  assignee: string;
}

export interface DirectMessage {
  id: string;
  chatId: string;      // "couple_v1", "couple_v2", etc.
  senderId: string;    // "couple" or the vendor's ID (e.g. "v1", "v2")
  senderName: string;
  text: string;
  timestamp: string;
}


export const MOCK_TASKS: Task[] = [
  { id: 't1', title: 'Determine budget and overall style/theme', category: 'Planner', period: '12+ Months', completed: true, dueDate: '2026-06-15', notes: 'Agreed on Elegant Dark Navy + Gold styling.', assignedTo: 'Both' },
  { id: 't2', title: 'Draft guest list to get tentative head count', category: 'Invitations', period: '12+ Months', completed: true, dueDate: '2026-06-20', notes: 'Initial count is around 150 guests.', assignedTo: 'Both' },
  { id: 't3', title: 'Research and book wedding venue (ceremony & reception)', category: 'Venue', period: '12+ Months', completed: true, dueDate: '2026-07-10', notes: 'Booked The Grand Pavilion.', assignedTo: 'Both' },
  { id: 't4', title: 'Hire professional wedding planner/coordinator', category: 'Planner', period: '12+ Months', completed: true, dueDate: '2026-07-20', notes: 'Booked OVAimagination Events.', assignedTo: 'Both' },
  { id: 't5', title: 'Select wedding party and ask them to participate', category: 'Misc', period: '9 Months', completed: true, dueDate: '2026-09-01', notes: 'All bridesmaids and groomsmen confirmed!', assignedTo: 'Both' },
  { id: 't6', title: 'Research and hire photographer & videographer', category: 'Photography', period: '9 Months', completed: true, dueDate: '2026-09-15', notes: 'Booked Golden Hour Studios.', assignedTo: 'Bride' },
  { id: 't7', title: 'Shop for wedding gown and initial fittings', category: 'Attire', period: '9 Months', completed: true, dueDate: '2026-10-05', notes: 'Found the dress at Bellissima Bridal.', assignedTo: 'Bride' },
  { id: 't8', title: 'Launch wedding website and add countdown', category: 'Misc', period: '9 Months', completed: false, dueDate: '2026-10-20', notes: 'Using VND countdown page builder.', assignedTo: 'Groom' },
  { id: 't9', title: 'Finalize catering menu and bar options', category: 'Catering', period: '6 Months', completed: false, dueDate: '2027-01-15', notes: 'Tasting scheduled for next week.', assignedTo: 'Both' },
  { id: 't10', title: 'Order invitations and save-the-date cards', category: 'Invitations', period: '6 Months', completed: true, dueDate: '2027-01-20', notes: 'Sent save-the-dates! Invitations received.', assignedTo: 'Bride' },
  { id: 't11', title: 'Hire florist and design centerpiece concepts', category: 'Florals', period: '6 Months', completed: false, dueDate: '2027-02-05', notes: 'Proposed white roses and gold eucalyptus.', assignedTo: 'Bride' },
  { id: 't12', title: 'Book ceremony musicians and reception DJ/Band', category: 'Music', period: '6 Months', completed: true, dueDate: '2027-02-15', notes: 'DJ Luminary booked.', assignedTo: 'Groom' },
  { id: 't13', title: 'Order wedding cake and groom dessert', category: 'Bakery', period: '3 Months', completed: false, dueDate: '2027-04-10', notes: 'Need to choose between vanilla berry and red velvet.', assignedTo: 'Bride' },
  { id: 't14', title: 'Purchase wedding rings', category: 'Rings', period: '3 Months', completed: false, dueDate: '2027-04-15', notes: 'Fitting is scheduled.', assignedTo: 'Both' },
  { id: 't15', title: 'Mail formal wedding invitations to guests', category: 'Invitations', period: '3 Months', completed: false, dueDate: '2027-04-20', notes: 'RSVP deadline set to July 1st.', assignedTo: 'Bride' },
  { id: 't16', title: 'Schedule hair and makeup trials', category: 'Hair & Makeup', period: '3 Months', completed: false, dueDate: '2027-05-01', notes: 'Trial booked with VND Beauty.', assignedTo: 'Bride' },
  { id: 't17', title: 'Apply for marriage license', category: 'Misc', period: '1 Month', completed: false, dueDate: '2027-06-15', notes: 'Need to go to city hall together.', assignedTo: 'Both' },
  { id: 't18', title: 'Finalize seating chart and floor plan', category: 'Decor', period: '1 Month', completed: false, dueDate: '2027-06-20', notes: 'Waiting on last RSVPs.', assignedTo: 'Both' },
  { id: 't19', title: 'Submit final guest count to venue & caterer', category: 'Catering', period: '1 Month', completed: false, dueDate: '2027-06-25', notes: 'Caterer needs final count 14 days before.', assignedTo: 'Planner' },
  { id: 't20', title: 'Write wedding vows and practice speeches', category: 'Officiant', period: '1 Month', completed: false, dueDate: '2027-07-01', notes: 'VND AI vow assistant draft done.', assignedTo: 'Both' },
];

export const MOCK_VENDORS: Vendor[] = [
  {
    id: 'v1',
    name: 'OVAimagination Events',
    category: 'Planner',
    rating: 4.9,
    reviewsCount: 48,
    costRange: '$$$',
    location: 'Los Angeles, CA',
    status: 'Booked',
    contactName: 'Olivia Vance',
    email: 'olivia@ovaimagination.com',
    phone: '(555) 019-2834',
    website: 'https://ovaimagination.com',
    contractPrice: 4500,
    paidAmount: 2250,
    nextPaymentDate: '2027-06-01',
    notes: 'Premium wedding planners. Olivia is amazing and coordinates day-of and styling.',
  },
  {
    id: 'v2',
    name: 'The Grand Pavilion',
    category: 'Venue',
    rating: 4.8,
    reviewsCount: 112,
    costRange: '$$$$',
    location: 'Malibu, CA',
    status: 'Booked',
    contactName: 'Marcus Sterling',
    email: 'events@grandpavilion.com',
    phone: '(555) 014-9831',
    website: 'https://grandpavilion.com',
    contractPrice: 18000,
    paidAmount: 9000,
    nextPaymentDate: '2027-05-15',
    notes: 'Stunning outdoor ceremony space with ocean views + gold ballroom for reception.',
  },
  {
    id: 'v3',
    name: 'Golden Hour Studios',
    category: 'Photography',
    rating: 4.9,
    reviewsCount: 64,
    costRange: '$$$',
    location: 'Pasadena, CA',
    status: 'Booked',
    contactName: 'Chloe Bennett',
    email: 'chloe@goldenhourstudios.com',
    phone: '(555) 018-7241',
    website: 'https://goldenhourstudios.com',
    contractPrice: 3800,
    paidAmount: 1900,
    nextPaymentDate: '2027-07-01',
    notes: 'Full-day coverage, includes engagement shoot and secondary shooter.',
  },
  {
    id: 'v4',
    name: 'Culinaria Fine Dining',
    category: 'Catering',
    rating: 4.7,
    reviewsCount: 89,
    costRange: '$$$',
    location: 'Santa Monica, CA',
    status: 'Shortlisted',
    contactName: 'Chef Andre',
    email: 'info@culinariafine.com',
    phone: '(555) 013-6490',
    website: 'https://culinariafine.com',
    contractPrice: 9500,
    notes: 'Custom plating options. Sample menu includes gold-crusted filet mignon and lavender halibut.',
  },
  {
    id: 'v5',
    name: 'DJ Luminary',
    category: 'Music',
    rating: 5.0,
    reviewsCount: 73,
    costRange: '$$',
    location: 'Los Angeles, CA',
    status: 'Booked',
    contactName: 'DJ Dave',
    email: 'dave@djluminary.com',
    phone: '(555) 016-5287',
    website: 'https://djluminary.com',
    contractPrice: 2200,
    paidAmount: 1100,
    nextPaymentDate: '2027-07-15',
    notes: 'Includes custom uplighting and wireless microphones for toasts.',
  },
];

export const MOCK_GUESTS: Guest[] = [
  { id: 'g1', name: 'Eleanor Johnson', group: "Bride's Family", email: 'eleanor.j@gmail.com', phone: '(555) 019-1122', status: 'Attending', rsvpReceived: true, meal: 'Beef', table: 1, plusOnes: 0, notes: 'Mother of the Bride.' },
  { id: 'g2', name: 'Robert Johnson', group: "Bride's Family", email: 'robert.j@gmail.com', phone: '(555) 019-1123', status: 'Attending', rsvpReceived: true, meal: 'Beef', table: 1, plusOnes: 0, notes: 'Father of the Bride.' },
  { id: 'g3', name: 'Thomas Johnson', group: "Bride's Family", email: 'tom.j@outlook.com', phone: '(555) 019-5566', status: 'Attending', rsvpReceived: true, meal: 'Vegetarian', table: 3, plusOnes: 1, notes: "Bride's brother." },
  { id: 'g4', name: 'Emily Johnson', group: "Bride's Family", email: 'emily.j@outlook.com', phone: '(555) 019-5567', status: 'Attending', rsvpReceived: true, meal: 'Chicken', table: 3, plusOnes: 0, notes: 'Thomas Johnson plus one.' },
  { id: 'g5', name: 'Arthur Miller', group: "Groom's Family", email: 'arthur.m@yahoo.com', phone: '(555) 015-4422', status: 'Attending', rsvpReceived: true, meal: 'Fish', table: 2, plusOnes: 0, notes: 'Father of the Groom.' },
  { id: 'g6', name: 'Grace Miller', group: "Groom's Family", email: 'grace.m@yahoo.com', phone: '(555) 015-4423', status: 'Attending', rsvpReceived: true, meal: 'Fish', table: 2, plusOnes: 0, notes: 'Mother of the Groom.' },
  { id: 'g7', name: 'Lucy Miller', group: "Groom's Family", email: 'lucy.m@gmail.com', phone: '(555) 015-9988', status: 'Attending', rsvpReceived: true, meal: 'Vegetarian', table: 4, plusOnes: 0, notes: "Groom's sister (Bridesmaid)." },
  { id: 'g8', name: 'David Smith', group: 'Friends', email: 'dsmith@corp.com', phone: '(555) 012-3344', status: 'Attending', rsvpReceived: true, meal: 'Beef', table: 5, plusOnes: 1, notes: 'Best Man.' },
  { id: 'g9', name: 'Jessica Smith', group: 'Friends', email: 'jess.smith@corp.com', phone: '(555) 012-3345', status: 'Attending', rsvpReceived: true, meal: 'Chicken', table: 5, plusOnes: 0, notes: 'David Smith plus one.' },
  { id: 'g10', name: 'Sophia Martinez', group: 'Friends', email: 'sophia.m@design.com', phone: '(555) 013-4411', status: 'Pending', rsvpReceived: false, meal: 'Pending', table: 0, plusOnes: 0, notes: 'Maid of Honor.' },
];

export const MOCK_BUDGET: Budget = {
  total: 50000,
  categories: [
    { name: 'Venue', estimated: 18000, actual: 18000, color: '#6366f1' },
    { name: 'Catering', estimated: 10000, actual: 9500, color: '#f59e0b' },
    { name: 'Planner', estimated: 5000, actual: 4500, color: '#e2c992' },
    { name: 'Photography', estimated: 4000, actual: 3800, color: '#ec4899' },
    { name: 'Florals', estimated: 5000, actual: 5000, color: '#10b981' },
    { name: 'Music', estimated: 2500, actual: 2200, color: '#3b82f6' },
    { name: 'Attire', estimated: 4000, actual: 3200, color: '#f472b6' },
    { name: 'Misc', estimated: 1500, actual: 800, color: '#94a3b8' },
  ],
  payments: [
    { id: 'p1', vendorName: 'The Grand Pavilion', category: 'Venue', amount: 9000, date: '2026-07-15', status: 'Paid', method: 'Wire' },
    { id: 'p2', vendorName: 'OVAimagination Events', category: 'Planner', amount: 2250, date: '2026-07-25', status: 'Paid', method: 'Credit Card' },
    { id: 'p3', vendorName: 'Golden Hour Studios', category: 'Photography', amount: 1900, date: '2026-09-20', status: 'Paid', method: 'Check' },
  ],
};

export const MOCK_TIMELINE: TimelineEvent[] = [
  { id: 'tl1', time: '08:00 AM', title: 'Hair and Makeup Starts', location: 'Bridal Suite', desc: 'Bridesmaids and mother of the bride first. Bride starts at 09:30 AM.', status: 'Completed', assignee: 'Bride' },
  { id: 'tl2', time: '10:00 AM', title: 'Groomsmen Getting Ready', location: 'Groom Suite', desc: 'Groom and groomsmen dress. Photographer captures details (rings, suit, shoes).', status: 'Pending', assignee: 'Groom' },
  { id: 'tl3', time: '12:30 PM', title: 'First Look & Couple Portraits', location: 'Grand Garden', desc: 'Private first look. Photographer & videographer shoot couple portraits.', status: 'Pending', assignee: 'Both' },
  { id: 'tl4', time: '04:00 PM', title: 'Wedding Ceremony', location: 'Pavilion Lawn', desc: 'Processional starts. Vows exchange, rings exchange. Recessional at 04:35 PM.', status: 'Pending', assignee: 'Both' },
  { id: 'tl5', time: '06:00 PM', title: 'Dinner Service & Speeches', location: 'Gold Ballroom', desc: 'Plated dinner served. Best Man, Maid of Honor, and parents give toasts.', status: 'Pending', assignee: 'Both' },
  { id: 'tl6', time: '11:00 PM', title: 'Grand Sparkler Send-off', location: 'Front Portico', desc: 'Guests line up with sparklers. Bride and Groom exit.', status: 'Pending', assignee: 'Both' },
];

export const MOCK_DIRECT_MESSAGES: DirectMessage[] = [
  {
    id: 'dm1',
    chatId: 'couple_v1',
    senderId: 'v1',
    senderName: 'Olivia Vance',
    text: 'Hi Sarah! I reviewed your Malibu Pavilion ceremony timeline. Everything looks perfect, but did you want to push the First Look photo session to 12:15 PM instead?',
    timestamp: '10:30 AM'
  },
  {
    id: 'dm2',
    chatId: 'couple_v1',
    senderId: 'couple',
    senderName: 'Sarah & David',
    text: 'Hey Olivia! Yes, that sounds much better. It gives us a bit of breathing room before the guests start arriving.',
    timestamp: '10:35 AM'
  },
  {
    id: 'dm3',
    chatId: 'couple_v1',
    senderId: 'v1',
    senderName: 'Olivia Vance',
    text: 'Excellent! I will update the master day-of timeline. Talk to you soon!',
    timestamp: '10:40 AM'
  },
  {
    id: 'dm4',
    chatId: 'couple_v3',
    senderId: 'v3',
    senderName: 'Chloe Bennett',
    text: 'Hey there! Just wanted to check if you have chosen the locations for your outdoor portrait session yet?',
    timestamp: 'Yesterday'
  },
  {
    id: 'dm5',
    chatId: 'couple_v3',
    senderId: 'couple',
    senderName: 'Sarah & David',
    text: 'Hi Chloe! We are thinking about the cliffs at Point Dume. Does that work for lighting?',
    timestamp: 'Yesterday'
  }
];
