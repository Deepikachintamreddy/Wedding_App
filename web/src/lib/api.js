// Elysian Wedding Concierge — API Service Client
const API_BASE = 'http://localhost:5000/api';

const isBrowser = typeof window !== 'undefined';

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (isBrowser) {
    const token = localStorage.getItem('wedding_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

export const api = {
  // Check if user is logged in via token
  isAuthenticated() {
    if (!isBrowser) return false;
    return !!localStorage.getItem('wedding_token');
  },

  // Auth operations
  async register(data) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Registration failed');
    
    if (result.token) {
      localStorage.setItem('wedding_token', result.token);
      localStorage.setItem('wedding_user', JSON.stringify(result.user));
    }
    return result;
  },

  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Login failed');
    
    if (result.token) {
      localStorage.setItem('wedding_token', result.token);
      localStorage.setItem('wedding_user', JSON.stringify(result.user));
    }
    return result;
  },

  logout() {
    if (!isBrowser) return;
    localStorage.removeItem('wedding_token');
    localStorage.removeItem('wedding_user');
    localStorage.removeItem('wedding_tasks');
    localStorage.removeItem('wedding_vendors');
    localStorage.removeItem('wedding_guests');
    localStorage.removeItem('wedding_budget');
    localStorage.removeItem('wedding_timeline');
  },

  async getProfile() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },

  async updateProfile(data) {
    const res = await fetch(`${API_BASE}/user/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update profile');
    }
    return res.json();
  },

  async deductCredit() {
    const res = await fetch(`${API_BASE}/user/deduct-credit`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) return false;
    const result = await res.json();
    return result.success;
  },

  async addCredits(amount) {
    const res = await fetch(`${API_BASE}/user/add-credits`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) throw new Error('Failed to add credits');
    return res.json();
  },

  // Task operations
  async getTasks() {
    const res = await fetch(`${API_BASE}/tasks`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
  },

  async createTask(task) {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(task),
    });
    if (!res.ok) throw new Error('Failed to create task');
    return res.json();
  },

  async updateTask(id, updatedFields) {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updatedFields),
    });
    if (!res.ok) throw new Error('Failed to update task');
    return res.json();
  },

  async deleteTask(id) {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete task');
    return res.json();
  },

  // Vendor operations
  async getVendors() {
    const res = await fetch(`${API_BASE}/vendors`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch vendors');
    return res.json();
  },

  async createVendor(vendor) {
    const res = await fetch(`${API_BASE}/vendors`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(vendor),
    });
    if (!res.ok) throw new Error('Failed to create vendor');
    return res.json();
  },

  async updateVendor(id, updatedFields) {
    const res = await fetch(`${API_BASE}/vendors/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updatedFields),
    });
    if (!res.ok) throw new Error('Failed to update vendor');
    return res.json();
  },

  async deleteVendor(id) {
    const res = await fetch(`${API_BASE}/vendors/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete vendor');
    return res.json();
  },

  // Guest operations
  async getGuests() {
    const res = await fetch(`${API_BASE}/guests`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch guests');
    return res.json();
  },

  async createGuest(guest) {
    const res = await fetch(`${API_BASE}/guests`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(guest),
    });
    if (!res.ok) throw new Error('Failed to create guest');
    return res.json();
  },

  async updateGuest(id, updatedFields) {
    const res = await fetch(`${API_BASE}/guests/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updatedFields),
    });
    if (!res.ok) throw new Error('Failed to update guest');
    return res.json();
  },

  async deleteGuest(id) {
    const res = await fetch(`${API_BASE}/guests/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete guest');
    return res.json();
  },

  // Budget operations
  async getBudget() {
    const res = await fetch(`${API_BASE}/budget`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch budget');
    return res.json();
  },

  async updateBudgetTotal(total) {
    const res = await fetch(`${API_BASE}/budget/total`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ total }),
    });
    if (!res.ok) throw new Error('Failed to update budget total');
    return res.json();
  },

  async updateBudgetCategory(name, updatedFields) {
    const res = await fetch(`${API_BASE}/budget/categories/${name}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updatedFields),
    });
    if (!res.ok) throw new Error('Failed to update budget category');
    return res.json();
  },

  async addBudgetPayment(payment) {
    const res = await fetch(`${API_BASE}/budget/payments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payment),
    });
    if (!res.ok) throw new Error('Failed to create payment');
    return res.json();
  },

  async updateBudgetPayment(id, updatedFields) {
    const res = await fetch(`${API_BASE}/budget/payments/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updatedFields),
    });
    if (!res.ok) throw new Error('Failed to update payment');
    return res.json();
  },

  async deleteBudgetPayment(id) {
    const res = await fetch(`${API_BASE}/budget/payments/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete payment');
    return res.json();
  },

  // Timeline operations
  async getTimeline() {
    const res = await fetch(`${API_BASE}/timeline`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch timeline');
    return res.json();
  },

  async createTimelineEvent(event) {
    const res = await fetch(`${API_BASE}/timeline`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(event),
    });
    if (!res.ok) throw new Error('Failed to create timeline event');
    return res.json();
  },

  async updateTimelineEvent(id, updatedFields) {
    const res = await fetch(`${API_BASE}/timeline/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updatedFields),
    });
    if (!res.ok) throw new Error('Failed to update timeline event');
    return res.json();
  },

  async deleteTimelineEvent(id) {
    const res = await fetch(`${API_BASE}/timeline/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete timeline event');
    return res.json();
  },

  // Messaging operations
  async getMessages() {
    const res = await fetch(`${API_BASE}/messages`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch messages');
    return res.json();
  },

  async sendMessage(chatId, senderId, senderName, text) {
    const res = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ chatId, senderId, senderName, text }),
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  },

  // AI Chat
  async sendAiChat(message) {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to communicate with AI Concierge');
    return result;
  }
};
