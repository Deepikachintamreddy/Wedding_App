const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Default initial state
const DEFAULT_DB = {
  users: [],
  tasks: [],
  vendors: [],
  guests: [],
  budgets: [],
  timeline: [],
  messages: []
};

// Ensure data folder and db file exist
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2));
}

class Database {
  constructor() {
    this.filePath = DB_FILE;
  }

  // Read database state
  read() {
    try {
      const content = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error('Error reading database file, resetting to default', error);
      this.write(DEFAULT_DB);
      return DEFAULT_DB;
    }
  }

  // Write database state
  write(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (error) {
      console.error('Error writing to database file', error);
      return false;
    }
  }

  // --- USER API ---
  findUserByEmail(email) {
    const db = this.read();
    return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    const db = this.read();
    return db.users.find(u => u.id === id);
  }

  createUser(userData) {
    const db = this.read();
    const passwordHash = bcrypt.hashSync(userData.password, 10);
    
    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: userData.name,
      email: userData.email.toLowerCase(),
      passwordHash,
      role: userData.role || 'couple',
      weddingDate: userData.weddingDate || '2027-07-15',
      location: userData.location || 'Malibu, CA',
      budget: Number(userData.budget) || 50000,
      theme: userData.theme || 'Elegant Navy & Gold',
      onboardingComplete: userData.onboardingComplete !== undefined ? userData.onboardingComplete : false,
      aiCredits: userData.role === 'admin' ? 9999 : (userData.role === 'vendor' ? 100 : 15),
      eventPassActive: userData.role === 'admin',
      vendorCategory: userData.vendorCategory || null,
      businesses: userData.businesses || null,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);

    // Initialize mock data for couple
    if (newUser.role === 'couple') {
      this.initializeCoupleData(db, newUser.id, newUser.budget, newUser.weddingDate, newUser.location, newUser.theme);
    }

    // Initialize mock direct messages if first user
    if (db.messages.length === 0) {
      this.initializeDirectMessages(db, newUser.id);
    }

    this.write(db);

    const { passwordHash: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  updateUser(id, updatedFields) {
    const db = this.read();
    const index = db.users.findIndex(u => u.id === id);
    if (index === -1) return null;

    // Filter out password modification here for safety
    const { password, passwordHash, id: _, createdAt, email, ...safeFields } = updatedFields;
    
    const oldUser = db.users[index];
    const isNowCompletingOnboarding = safeFields.onboardingComplete && !oldUser.onboardingComplete;

    db.users[index] = {
      ...oldUser,
      ...safeFields
    };

    if (isNowCompletingOnboarding && oldUser.role === 'couple') {
      // Clean up initially generated mock data and recreate matching custom onboarding specs
      db.tasks = db.tasks.filter(t => t.userId !== id);
      db.vendors = db.vendors.filter(v => v.userId !== id);
      db.guests = db.guests.filter(g => g.userId !== id);
      db.budgets = db.budgets.filter(b => b.userId !== id);
      db.timeline = db.timeline.filter(t => t.userId !== id);
      db.messages = db.messages.filter(m => m.userId !== id);

      this.initializeCoupleData(db, id, db.users[index].budget, db.users[index].weddingDate, db.users[index].location, db.users[index].theme);
      this.initializeDirectMessages(db, id);
    }

    this.write(db);
    
    const { passwordHash: pHash, ...userWithoutPassword } = db.users[index];
    return userWithoutPassword;
  }

  // --- TASK API ---
  getTasksByUserId(userId) {
    const db = this.read();
    return db.tasks.filter(t => t.userId === userId);
  }

  createTask(userId, taskData) {
    const db = this.read();
    const newTask = {
      id: `t_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId,
      title: taskData.title,
      category: taskData.category || 'Misc',
      period: taskData.period || 'General',
      completed: false,
      dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
      notes: taskData.notes || '',
      assignedTo: taskData.assignedTo || 'Both',
      createdAt: new Date().toISOString()
    };
    db.tasks.push(newTask);
    this.write(db);
    return newTask;
  }

  updateTask(userId, taskId, updatedFields) {
    const db = this.read();
    const index = db.tasks.findIndex(t => t.id === taskId && t.userId === userId);
    if (index === -1) return null;

    db.tasks[index] = {
      ...db.tasks[index],
      ...updatedFields,
      id: taskId, // prevent id change
      userId // prevent userId change
    };
    this.write(db);
    return db.tasks[index];
  }

  deleteTask(userId, taskId) {
    const db = this.read();
    const originalLength = db.tasks.length;
    db.tasks = db.tasks.filter(t => !(t.id === taskId && t.userId === userId));
    this.write(db);
    return db.tasks.length < originalLength;
  }

  // --- VENDOR API ---
  getVendorsByUserId(userId) {
    const db = this.read();
    return db.vendors.filter(v => v.userId === userId);
  }

  createVendor(userId, vendorData) {
    const db = this.read();
    const newVendor = {
      id: `v_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId,
      name: vendorData.name,
      category: vendorData.category || 'Other',
      rating: Number(vendorData.rating) || 5.0,
      reviewsCount: Number(vendorData.reviewsCount) || 1,
      costRange: vendorData.costRange || '$$',
      location: vendorData.location || 'Los Angeles, CA',
      status: vendorData.status || 'Shortlisted',
      contactName: vendorData.contactName || '',
      email: vendorData.email || '',
      phone: vendorData.phone || '',
      website: vendorData.website || '',
      contractPrice: Number(vendorData.contractPrice) || 0,
      paidAmount: Number(vendorData.paidAmount) || 0,
      nextPaymentDate: vendorData.nextPaymentDate || null,
      notes: vendorData.notes || '',
      createdAt: new Date().toISOString()
    };
    db.vendors.push(newVendor);
    this.write(db);

    // If booked, add to payments automatically
    if (newVendor.status === 'Booked' && newVendor.contractPrice > 0) {
      this.createAutomaticPayment(userId, newVendor);
    }

    return newVendor;
  }

  updateVendor(userId, vendorId, updatedFields) {
    const db = this.read();
    const index = db.vendors.findIndex(v => v.id === vendorId && v.userId === userId);
    if (index === -1) return null;

    const oldVendor = db.vendors[index];
    db.vendors[index] = {
      ...oldVendor,
      ...updatedFields,
      id: vendorId,
      userId
    };

    const newVendor = db.vendors[index];
    this.write(db);

    // If status changed to Booked and wasn't before, trigger auto payment
    if (newVendor.status === 'Booked' && oldVendor.status !== 'Booked' && newVendor.contractPrice > 0) {
      this.createAutomaticPayment(userId, newVendor);
    }

    // Sync vendor pricing with budget actuals
    if (updatedFields.contractPrice !== undefined || updatedFields.category !== undefined || updatedFields.status !== undefined) {
      this.syncVendorPricingWithBudget(userId, db.vendors.filter(v => v.userId === userId));
    }

    return newVendor;
  }

  deleteVendor(userId, vendorId) {
    const db = this.read();
    const originalLength = db.vendors.length;
    db.vendors = db.vendors.filter(v => !(v.id === vendorId && v.userId === userId));
    this.write(db);
    return db.vendors.length < originalLength;
  }

  // --- GUEST API ---
  getGuestsByUserId(userId) {
    const db = this.read();
    return db.guests.filter(g => g.userId === userId);
  }

  createGuest(userId, guestData) {
    const db = this.read();
    const newGuest = {
      id: `g_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId,
      name: guestData.name,
      group: guestData.group || 'Friends',
      email: guestData.email || '',
      phone: guestData.phone || '',
      status: guestData.status || 'Pending',
      rsvpReceived: guestData.status ? guestData.status !== 'Pending' : false,
      meal: guestData.meal || 'Pending',
      table: Number(guestData.table) || 0,
      plusOnes: Number(guestData.plusOnes) || 0,
      notes: guestData.notes || '',
      createdAt: new Date().toISOString()
    };
    db.guests.push(newGuest);
    this.write(db);
    return newGuest;
  }

  updateGuest(userId, guestId, updatedFields) {
    const db = this.read();
    const index = db.guests.findIndex(g => g.id === guestId && g.userId === userId);
    if (index === -1) return null;

    db.guests[index] = {
      ...db.guests[index],
      ...updatedFields,
      id: guestId,
      userId
    };

    // Auto set rsvpReceived based on status change
    if (updatedFields.status !== undefined) {
      db.guests[index].rsvpReceived = updatedFields.status !== 'Pending';
      if (updatedFields.status === 'Pending') {
        db.guests[index].meal = 'Pending';
      } else if (updatedFields.status === 'Declined') {
        db.guests[index].meal = 'Declined';
      }
    }

    this.write(db);
    return db.guests[index];
  }

  deleteGuest(userId, guestId) {
    const db = this.read();
    const originalLength = db.guests.length;
    db.guests = db.guests.filter(g => !(g.id === guestId && g.userId === userId));
    this.write(db);
    return db.guests.length < originalLength;
  }

  // --- BUDGET API ---
  getBudgetByUserId(userId) {
    const db = this.read();
    let budget = db.budgets.find(b => b.userId === userId);
    if (!budget) {
      // Create empty default budget
      budget = {
        id: `b_${Date.now()}`,
        userId,
        total: 50000,
        categories: [
          { name: 'Venue', estimated: 18000, actual: 0, color: '#6366f1' },
          { name: 'Catering', estimated: 10000, actual: 0, color: '#f59e0b' },
          { name: 'Planner', estimated: 5000, actual: 0, color: '#e2c992' },
          { name: 'Photography', estimated: 4000, actual: 0, color: '#ec4899' },
          { name: 'Florals', estimated: 5000, actual: 0, color: '#10b981' },
          { name: 'Music', estimated: 2500, actual: 0, color: '#3b82f6' },
          { name: 'Attire', estimated: 4000, actual: 0, color: '#f472b6' },
          { name: 'Misc', estimated: 1500, actual: 0, color: '#94a3b8' },
        ],
        payments: []
      };
      db.budgets.push(budget);
      this.write(db);
    }
    return budget;
  }

  updateBudgetTotal(userId, total) {
    const db = this.read();
    const index = db.budgets.findIndex(b => b.userId === userId);
    if (index === -1) {
      const newBudget = {
        id: `b_${Date.now()}`,
        userId,
        total: Number(total),
        categories: [],
        payments: []
      };
      db.budgets.push(newBudget);
      this.write(db);
      return newBudget;
    }

    db.budgets[index].total = Number(total);
    this.write(db);
    return db.budgets[index];
  }

  updateBudgetCategory(userId, catName, updatedFields) {
    const db = this.read();
    const index = db.budgets.findIndex(b => b.userId === userId);
    if (index === -1) return null;

    const budget = db.budgets[index];
    const catIndex = budget.categories.findIndex(c => c.name.toLowerCase() === catName.toLowerCase());
    
    if (catIndex !== -1) {
      budget.categories[catIndex] = {
        ...budget.categories[catIndex],
        ...updatedFields,
        name: budget.categories[catIndex].name // preserve original name case
      };
    } else {
      // Create new category
      budget.categories.push({
        name: catName,
        estimated: Number(updatedFields.estimated) || 0,
        actual: Number(updatedFields.actual) || 0,
        color: updatedFields.color || '#94a3b8'
      });
    }

    this.write(db);
    return budget;
  }

  addBudgetPayment(userId, paymentData) {
    const db = this.read();
    const index = db.budgets.findIndex(b => b.userId === userId);
    if (index === -1) return null;

    const budget = db.budgets[index];
    const newPayment = {
      id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      vendorName: paymentData.vendorName || '',
      category: paymentData.category || 'Misc',
      amount: Number(paymentData.amount) || 0,
      date: paymentData.date || new Date().toISOString().split('T')[0],
      status: paymentData.status || 'Upcoming',
      method: paymentData.method || 'Credit Card'
    };

    budget.payments.unshift(newPayment);
    this.write(db);
    return newPayment;
  }

  updateBudgetPayment(userId, paymentId, updatedFields) {
    const db = this.read();
    const index = db.budgets.findIndex(b => b.userId === userId);
    if (index === -1) return null;

    const budget = db.budgets[index];
    const pIndex = budget.payments.findIndex(p => p.id === paymentId);
    if (pIndex === -1) return null;

    budget.payments[pIndex] = {
      ...budget.payments[pIndex],
      ...updatedFields,
      id: paymentId // preserve ID
    };

    this.write(db);
    return budget.payments[pIndex];
  }

  deleteBudgetPayment(userId, paymentId) {
    const db = this.read();
    const index = db.budgets.findIndex(b => b.userId === userId);
    if (index === -1) return false;

    const budget = db.budgets[index];
    const originalLength = budget.payments.length;
    budget.payments = budget.payments.filter(p => p.id !== paymentId);
    this.write(db);
    return budget.payments.length < originalLength;
  }

  // --- TIMELINE API ---
  getTimelineByUserId(userId) {
    const db = this.read();
    return db.timeline.filter(e => e.userId === userId);
  }

  createTimelineEvent(userId, eventData) {
    const db = this.read();
    const newEvent = {
      id: `tl_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId,
      time: eventData.time || '12:00 PM',
      title: eventData.title,
      location: eventData.location || '',
      desc: eventData.desc || '',
      status: eventData.status || 'Pending',
      createdAt: new Date().toISOString()
    };
    db.timeline.push(newEvent);
    
    // Sort timeline events chronologically by parsing time
    this.sortTimeline(db, userId);
    this.write(db);
    return newEvent;
  }

  updateTimelineEvent(userId, eventId, updatedFields) {
    const db = this.read();
    const index = db.timeline.findIndex(e => e.id === eventId && e.userId === userId);
    if (index === -1) return null;

    db.timeline[index] = {
      ...db.timeline[index],
      ...updatedFields,
      id: eventId,
      userId
    };

    if (updatedFields.time !== undefined) {
      this.sortTimeline(db, userId);
    }
    
    this.write(db);
    return db.timeline.find(e => e.id === eventId);
  }

  deleteTimelineEvent(userId, eventId) {
    const db = this.read();
    const originalLength = db.timeline.length;
    db.timeline = db.timeline.filter(e => !(e.id === eventId && e.userId === userId));
    this.write(db);
    return db.timeline.length < originalLength;
  }

  // --- MESSAGES API ---
  getMessagesByUserId(userId) {
    const db = this.read();
    // Return messages for this user or sent by this user
    return db.messages.filter(m => m.userId === userId || m.senderId === userId);
  }

  createMessage(userId, msgData) {
    const db = this.read();
    const newMsg = {
      id: `msg_dm_${Date.now()}`,
      userId, // linked to the couple
      chatId: msgData.chatId || 'general',
      senderId: msgData.senderId || userId,
      senderName: msgData.senderName || 'Couple',
      text: msgData.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString()
    };
    db.messages.push(newMsg);
    this.write(db);
    return newMsg;
  }

  // --- HELPERS ---
  sortTimeline(db, userId) {
    const userTimeline = db.timeline.filter(e => e.userId === userId);
    const nonUserTimeline = db.timeline.filter(e => e.userId !== userId);

    const parseTime = (timeStr) => {
      if (!timeStr) return 0;
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return 0;
      let hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      const ampm = match[3].toUpperCase();
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };

    userTimeline.sort((a, b) => parseTime(a.time) - parseTime(b.time));
    db.timeline = [...nonUserTimeline, ...userTimeline];
  }

  createAutomaticPayment(userId, vendor) {
    const budget = this.getBudgetByUserId(userId);
    const newPayment = {
      id: `p_auto_${Date.now()}`,
      vendorName: vendor.name,
      category: vendor.category,
      amount: vendor.contractPrice / 2, // half down deposit
      date: new Date().toISOString().split('T')[0],
      status: 'Upcoming',
      method: 'Credit Card'
    };
    budget.payments.unshift(newPayment);
    // write is done by the caller vendor function
  }

  syncVendorPricingWithBudget(userId, userVendors) {
    const budget = this.getBudgetByUserId(userId);
    budget.categories = budget.categories.map(cat => {
      const bookedInCat = userVendors.filter(v => v.category === cat.name && v.status === 'Booked');
      const totalActual = bookedInCat.reduce((sum, v) => sum + (v.contractPrice || 0), 0);
      return {
        ...cat,
        actual: totalActual || cat.estimated
      };
    });
    // write is done by the caller vendor function
  }

  initializeCoupleData(db, userId, budgetLimit, weddingDate, location, theme) {
    const getRelativeDate = (daysBefore) => {
      try {
        const wDate = new Date(weddingDate);
        wDate.setDate(wDate.getDate() - daysBefore);
        return wDate.toISOString().split('T')[0];
      } catch {
        return weddingDate;
      }
    };

    // 1. Initial Tasks
    const baseTasks = [
      { title: `Lock in the final budget of $${budgetLimit.toLocaleString()}`, category: 'Planner', period: '12+ Months', completed: true, dueDate: getRelativeDate(365), notes: `Target styling theme: ${theme}`, assignedTo: 'Both' },
      { title: 'Draft guest list to get tentative head count', category: 'Invitations', period: '12+ Months', completed: false, dueDate: getRelativeDate(350), notes: 'Aim for a realistic head count to guide venue sizing and budget.', assignedTo: 'Both' },
      { title: `Research and book wedding venue (ceremony & reception) in ${location}`, category: 'Venue', period: '12+ Months', completed: false, dueDate: getRelativeDate(330), notes: 'Explore spaces matching your theme and capacity needs.', assignedTo: 'Both' },
      { title: 'Hire professional wedding planner/coordinator', category: 'Planner', period: '12+ Months', completed: false, dueDate: getRelativeDate(320), notes: 'A coordinator helps keep the planning timeline running smoothly.', assignedTo: 'Both' },
      { title: 'Select wedding party and ask them to participate', category: 'Misc', period: '9 Months', completed: false, dueDate: getRelativeDate(270), notes: 'Ask bridesmaids, groomsmen, and attendants.', assignedTo: 'Both' },
      { title: 'Research and hire photographer & videographer', category: 'Photography', period: '9 Months', completed: false, dueDate: getRelativeDate(250), notes: 'Secure photography coverage early to lock in key dates.', assignedTo: 'Bride' },
      { title: 'Shop for wedding gown and initial fittings', category: 'Attire', period: '9 Months', completed: false, dueDate: getRelativeDate(230), notes: 'Start wedding attire shopping to allow time for tailor adjustments.', assignedTo: 'Bride' },
      { title: 'Launch wedding website and add countdown', category: 'Misc', period: '9 Months', completed: false, dueDate: getRelativeDate(210), notes: 'Create a website to share details and RSVP links with guests.', assignedTo: 'Groom' },
      { title: 'Finalize catering menu and bar options', category: 'Catering', period: '6 Months', completed: false, dueDate: getRelativeDate(180), notes: 'Coordinate a tasting session with caterers.', assignedTo: 'Both' },
      { title: 'Order invitations and save-the-date cards', category: 'Invitations', period: '6 Months', completed: false, dueDate: getRelativeDate(170), notes: 'Finalize custom printing options and paper assets.', assignedTo: 'Bride' },
      { title: 'Hire florist and design centerpiece concepts', category: 'Florals', period: '6 Months', completed: false, dueDate: getRelativeDate(150), notes: 'Select floral structures and bouquet designs.', assignedTo: 'Bride' },
      { title: 'Book ceremony musicians and reception DJ/Band', category: 'Music', period: '6 Months', completed: false, dueDate: getRelativeDate(140), notes: 'Arrange audio equipment and playlist requirements.', assignedTo: 'Groom' },
      { title: 'Order wedding cake and groom dessert', category: 'Bakery', period: '3 Months', completed: false, dueDate: getRelativeDate(90), notes: 'Select flavors and custom cake designs.', assignedTo: 'Bride' },
      { title: 'Purchase wedding bands and arrange engraving', category: 'Rings', period: '3 Months', completed: false, dueDate: getRelativeDate(80), notes: 'Confirm fits and order custom inscriptions.', assignedTo: 'Both' },
      { title: 'Mail formal wedding invitations to guests', category: 'Invitations', period: '3 Months', completed: false, dueDate: getRelativeDate(75), notes: 'Set RSVP deadline to 4-6 weeks before the wedding.', assignedTo: 'Bride' },
      { title: 'Schedule hair and makeup trials', category: 'Hair & Makeup', period: '3 Months', completed: false, dueDate: getRelativeDate(60), notes: 'Book trials to finalize styling details.', assignedTo: 'Bride' },
      { title: 'Apply for marriage license', category: 'Misc', period: '1 Month', completed: false, dueDate: getRelativeDate(30), notes: 'Check local government guidelines for valid window/processing times.', assignedTo: 'Both' },
      { title: 'Finalize seating chart and floor plan', category: 'Decor', period: '1 Month', completed: false, dueDate: getRelativeDate(20), notes: 'Group guests into tables based on RSVPs.', assignedTo: 'Both' },
      { title: 'Submit final guest count to venue & caterer', category: 'Catering', period: '1 Month', completed: false, dueDate: getRelativeDate(14), notes: 'Confirm final plate counts with caterers.', assignedTo: 'Planner' },
      { title: 'Write wedding vows and practice speeches', category: 'Officiant', period: '1 Month', completed: false, dueDate: getRelativeDate(7), notes: 'Draft personal vows and review toasts.', assignedTo: 'Both' },
      { title: 'Remember the rings and marriage license', category: 'Rings', period: 'Day-Of', completed: false, dueDate: weddingDate, notes: 'Give rings to the Best Man.', assignedTo: 'Groom' },
      { title: 'Eat a hearty breakfast and stay hydrated', category: 'Misc', period: 'Day-Of', completed: false, dueDate: weddingDate, notes: 'Stay energized and enjoy the morning.', assignedTo: 'Both' },
      { title: 'Relax, celebrate, and enjoy the day!', category: 'Misc', period: 'Day-Of', completed: false, dueDate: weddingDate, notes: 'Enjoy the day!', assignedTo: 'Both' }
    ];

    const tasks = baseTasks.map((t, idx) => ({
      id: `t_init_${idx}_${Date.now()}`,
      userId,
      ...t,
      createdAt: new Date().toISOString()
    }));
    db.tasks.push(...tasks);

    // 2. Initial Vendors: Empty for newly-registered couples so they can choose their own
    // 3. Initial Guests: Empty for newly-registered couples so they can enter their own

    // 4. Initial Budget (Calculate categories from budgetLimit, actual spend starts at 0)
    const budgetObj = {
      id: `b_init_${Date.now()}`,
      userId,
      total: budgetLimit,
      categories: [
        { name: 'Venue', estimated: Math.round(budgetLimit * 0.36), actual: 0, color: '#6366f1' },
        { name: 'Catering', estimated: Math.round(budgetLimit * 0.20), actual: 0, color: '#f59e0b' },
        { name: 'Planner', estimated: Math.round(budgetLimit * 0.10), actual: 0, color: '#e2c992' },
        { name: 'Photography', estimated: Math.round(budgetLimit * 0.08), actual: 0, color: '#ec4899' },
        { name: 'Florals', estimated: Math.round(budgetLimit * 0.10), actual: 0, color: '#10b981' },
        { name: 'Music', estimated: Math.round(budgetLimit * 0.05), actual: 0, color: '#3b82f6' },
        { name: 'Attire', estimated: Math.round(budgetLimit * 0.08), actual: 0, color: '#f472b6' },
        { name: 'Misc', estimated: Math.round(budgetLimit * 0.03), actual: 0, color: '#94a3b8' },
      ],
      payments: []
    };
    db.budgets.push(budgetObj);

    // 5. Initial Timeline
    const baseTimeline = [
      { time: '08:00 AM', title: 'Hair and Makeup Starts', location: 'Bridal Suite', desc: 'Bridesmaids and mother of the bride first. Bride starts at 09:30 AM.', status: 'Pending' },
      { time: '10:00 AM', title: 'Groomsmen Getting Ready', location: 'Groom Suite', desc: 'Groom and groomsmen dress. Photographer captures details (rings, suit, shoes).', status: 'Pending' },
      { time: '12:30 PM', title: 'First Look & Couple Portraits', location: 'Grand Garden', desc: 'Private first look. Photographer & videographer shoot couple portraits.', status: 'Pending' },
      { time: '01:30 PM', title: 'Wedding Party & Family Photos', location: 'Grand Garden', desc: 'Shoot immediate family, bridesmaids, and groomsmen.', status: 'Pending' },
      { time: '03:30 PM', title: 'Groom & Guests Arrival', location: 'Pavilion Lawn', desc: 'Ushers stand in position. Pre-ceremony music starts playing.', status: 'Pending' },
      { time: '04:00 PM', title: 'Wedding Ceremony', location: 'Pavilion Lawn', desc: 'Processional starts. Vows exchange, rings exchange. Recessional at 04:35 PM.', status: 'Pending' },
      { time: '04:40 PM', title: 'Cocktail Hour', location: 'Ocean View Terrace', desc: 'Guests enjoy appetizers and signature cocktails. Couple takes sunset pictures.', status: 'Pending' },
      { time: '05:45 PM', title: 'Grand Reception Entrance', location: 'Gold Ballroom', desc: 'Guests seated. Entrance of wedding party and bride/groom. First dance.', status: 'Pending' },
      { time: '06:00 PM', title: 'Dinner Service & Speeches', location: 'Gold Ballroom', desc: 'Plated dinner served. Best Man, Maid of Honor, and parents give toasts.', status: 'Pending' },
      { time: '08:00 PM', title: 'Dance Floor Opens & Cake Cutting', location: 'Gold Ballroom', desc: 'DJ Dave sets off. Cake cut at 08:30 PM. Late night snacks served at 10:00 PM.', status: 'Pending' },
      { time: '11:00 PM', title: 'Grand Sparkler Send-off', location: 'Front Portico', desc: 'Guests line up with sparklers. Bride and Groom exit.', status: 'Pending' },
    ];

    const timeline = baseTimeline.map((e, idx) => ({
      id: `tl_init_${idx}_${Date.now()}`,
      userId,
      ...e,
      createdAt: new Date().toISOString()
    }));
    db.timeline.push(...timeline);
  }

  initializeDirectMessages(db, userId) {
    const baseDms = [
      { chatId: 'chat_c_v1', senderId: 'v1', senderName: 'Olivia Vance', text: "Welcome to your planning workspace! I'm Olivia, your dedicated planning coordinator from OVAimagination Events. Feel free to message me here to coordinate your wedding styling and venue bookings!" }
    ];
    
    db.messages.push(...baseDms.map((m, idx) => ({
      id: `msg_dm_init_${idx}_${Date.now()}`,
      userId,
      chatId: m.chatId,
      senderId: m.senderId,
      senderName: m.senderName,
      text: m.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString()
    })));
  }
}

module.exports = new Database();
