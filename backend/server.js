const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'elysian_secret_concierge_token_key';

// Middleware
app.use(cors());
app.use(express.json());

// Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Root API welcome route
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Elysian API Server</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background-color: #0d0f14; color: #f3f4f6; margin: 0; text-align: center; }
          .card { background: rgba(255, 255, 255, 0.05); padding: 40px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); max-width: 500px; box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37); backdrop-filter: blur(4px); }
          h1 { color: #e2c992; margin-top: 0; }
          p { line-height: 1.6; color: #94a3b8; }
          a { display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #e2c992; color: #0d0f14; text-decoration: none; border-radius: 6px; font-weight: 600; transition: background 0.2s; }
          a:hover { background-color: #d1b87f; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Elysian API Server</h1>
          <p>This is the backend API service for the Elysian Wedding Concierge platform.</p>
          <p>Please visit the main user interface website on port 3000 to plan your wedding!</p>
          <a href="http://localhost:3000">Go to Elysian Website</a>
        </div>
      </body>
    </html>
  `);
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token is missing or invalid' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token is expired or invalid' });
    }
    
    // Fetch fresh user from DB to make sure they still exist and check their role
    const user = db.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }

    req.user = user;
    next();
  });
};

// --- AUTH ROUTERS ---

// Register Couple, Vendor or Admin
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role, partnerName, weddingDate, location, theme, selectedCategories, businesses } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const existingUser = db.findUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  try {
    const user = db.createUser({
      name: role === 'couple' ? `${name} & ${partnerName || 'Partner'}` : name,
      email,
      password,
      role,
      weddingDate,
      location,
      theme,
      vendorCategory: selectedCategories ? selectedCategories[0] : null,
      businesses
    });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Error registering user' });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.findUserByEmail(email);
  if (!user) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
  if (!isPasswordValid) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  
  const { passwordHash, ...userWithoutPassword } = user;
  res.json({
    message: 'Login successful',
    token,
    user: userWithoutPassword
  });
});

// Get Current User Info
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const { passwordHash, ...userWithoutPassword } = req.user;
  res.json(userWithoutPassword);
});

// --- USER PROFILE ROUTERS ---

app.put('/api/user/profile', authenticateToken, (req, res) => {
  try {
    const updatedUser = db.updateUser(req.user.id, req.body);
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(updatedUser);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Error updating profile' });
  }
});

app.post('/api/user/deduct-credit', authenticateToken, (req, res) => {
  const user = req.user;
  if (user.eventPassActive) {
    return res.json({ success: true, aiCredits: user.aiCredits });
  }

  if (user.aiCredits > 0) {
    const updated = db.updateUser(user.id, { aiCredits: user.aiCredits - 1 });
    res.json({ success: true, aiCredits: updated.aiCredits });
  } else {
    res.status(400).json({ error: 'Insufficient credits', aiCredits: 0 });
  }
});

app.post('/api/user/add-credits', authenticateToken, (req, res) => {
  const { amount } = req.body;
  if (!amount || isNaN(amount)) {
    return res.status(400).json({ error: 'Valid amount is required' });
  }

  const user = req.user;
  const updated = db.updateUser(user.id, { aiCredits: (user.aiCredits || 0) + Number(amount) });
  res.json({ success: true, aiCredits: updated.aiCredits });
});


// --- TASK ROUTERS ---

app.get('/api/tasks', authenticateToken, (req, res) => {
  const tasks = db.getTasksByUserId(req.user.id);
  res.json(tasks);
});

app.post('/api/tasks', authenticateToken, (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Task title is required' });
  }

  const task = db.createTask(req.user.id, req.body);
  res.status(201).json(task);
});

app.put('/api/tasks/:id', authenticateToken, (req, res) => {
  const task = db.updateTask(req.user.id, req.params.id, req.body);
  if (!task) {
    return res.status(404).json({ error: 'Task not found or unauthorized' });
  }
  res.json(task);
});

app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
  const deleted = db.deleteTask(req.user.id, req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Task not found or unauthorized' });
  }
  res.json({ message: 'Task deleted successfully' });
});


// --- VENDOR ROUTERS ---

app.get('/api/vendors', authenticateToken, (req, res) => {
  const vendors = db.getVendorsByUserId(req.user.id);
  res.json(vendors);
});

app.post('/api/vendors', authenticateToken, (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Vendor name is required' });
  }

  const vendor = db.createVendor(req.user.id, req.body);
  res.status(201).json(vendor);
});

app.put('/api/vendors/:id', authenticateToken, (req, res) => {
  const vendor = db.updateVendor(req.user.id, req.params.id, req.body);
  if (!vendor) {
    return res.status(404).json({ error: 'Vendor not found or unauthorized' });
  }
  res.json(vendor);
});

app.delete('/api/vendors/:id', authenticateToken, (req, res) => {
  const deleted = db.deleteVendor(req.user.id, req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Vendor not found or unauthorized' });
  }
  res.json({ message: 'Vendor deleted successfully' });
});


// --- GUEST ROUTERS ---

app.get('/api/guests', authenticateToken, (req, res) => {
  const guests = db.getGuestsByUserId(req.user.id);
  res.json(guests);
});

app.post('/api/guests', authenticateToken, (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Guest name is required' });
  }

  const guest = db.createGuest(req.user.id, req.body);
  res.status(201).json(guest);
});

app.put('/api/guests/:id', authenticateToken, (req, res) => {
  const guest = db.updateGuest(req.user.id, req.params.id, req.body);
  if (!guest) {
    return res.status(404).json({ error: 'Guest not found or unauthorized' });
  }
  res.json(guest);
});

app.delete('/api/guests/:id', authenticateToken, (req, res) => {
  const deleted = db.deleteGuest(req.user.id, req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Guest not found or unauthorized' });
  }
  res.json({ message: 'Guest deleted successfully' });
});


// --- BUDGET ROUTERS ---

app.get('/api/budget', authenticateToken, (req, res) => {
  const budget = db.getBudgetByUserId(req.user.id);
  res.json(budget);
});

app.put('/api/budget/total', authenticateToken, (req, res) => {
  const { total } = req.body;
  if (total === undefined || isNaN(total)) {
    return res.status(400).json({ error: 'Valid total is required' });
  }

  const budget = db.updateBudgetTotal(req.user.id, total);
  res.json(budget);
});

app.put('/api/budget/categories/:name', authenticateToken, (req, res) => {
  const budget = db.updateBudgetCategory(req.user.id, req.params.name, req.body);
  if (!budget) {
    return res.status(404).json({ error: 'Budget details not found' });
  }
  res.json(budget);
});

app.post('/api/budget/payments', authenticateToken, (req, res) => {
  const payment = db.addBudgetPayment(req.user.id, req.body);
  if (!payment) {
    return res.status(404).json({ error: 'Budget not found' });
  }
  res.status(201).json(payment);
});

app.put('/api/budget/payments/:id', authenticateToken, (req, res) => {
  const payment = db.updateBudgetPayment(req.user.id, req.params.id, req.body);
  if (!payment) {
    return res.status(404).json({ error: 'Payment not found or unauthorized' });
  }
  res.json(payment);
});

app.delete('/api/budget/payments/:id', authenticateToken, (req, res) => {
  const deleted = db.deleteBudgetPayment(req.user.id, req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Payment not found or unauthorized' });
  }
  res.json({ message: 'Payment deleted successfully' });
});


// --- TIMELINE ROUTERS ---

app.get('/api/timeline', authenticateToken, (req, res) => {
  const timeline = db.getTimelineByUserId(req.user.id);
  res.json(timeline);
});

app.post('/api/timeline', authenticateToken, (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Timeline event title is required' });
  }

  const event = db.createTimelineEvent(req.user.id, req.body);
  res.status(201).json(event);
});

app.put('/api/timeline/:id', authenticateToken, (req, res) => {
  const event = db.updateTimelineEvent(req.user.id, req.params.id, req.body);
  if (!event) {
    return res.status(404).json({ error: 'Timeline event not found or unauthorized' });
  }
  res.json(event);
});

app.delete('/api/timeline/:id', authenticateToken, (req, res) => {
  const deleted = db.deleteTimelineEvent(req.user.id, req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Timeline event not found or unauthorized' });
  }
  res.json({ message: 'Timeline event deleted successfully' });
});


// --- DIRECT MESSAGES ROUTERS ---

app.get('/api/messages', authenticateToken, (req, res) => {
  const messages = db.getMessagesByUserId(req.user.id);
  res.json(messages);
});

app.post('/api/messages', authenticateToken, (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Message text is required' });
  }

  const message = db.createMessage(req.user.id, req.body);
  res.status(201).json(message);
});


// --- AI CHAT ROUTERS ---

const KEYWORD_RESPONSES = {
  budget: `### 💰 Budget Strategy & Best Practices
A wedding budget is all about prioritization. Here is a standard breakdown recommended by **OVAimagination Events**:

1. **Venue & Catering:** 45% - 50%
2. **Photography & Videography:** 10% - 12%
3. **Planner/Coordinator:** 10%
4. **Attire & Beauty:** 8% - 10%
5. **Florals & Decor:** 8% - 10%
6. **Entertainment (DJ/Band):** 8% - 10%
7. **Invitations & Rings:** 3% - 5%
8. **Emergency Cushion:** 5% (Critical!)

**VND Pro-Tip:** Always define your "Non-Negotiables" first. If premium photography is your #1 priority, budget 15% for it and trim back on floristry or invitations. You can track this in our **Budget Tracker** tab.`,

  venue: `### 🏛️ Choosing Your Perfect Venue
Finding the right venue is the biggest planning milestone. Consider these factors:

- **Capacity:** Ensure it comfortably fits your guest list (aim for 10% below maximum capacity for comfort).
- **Inclusions:** Does it include tables, chairs, linens, and catering? (In-house catering saves coordination stress, but outsourced catering gives more culinary freedom).
- **Curfew & Restrictions:** Ask about noise curfews, alcohol policies, and sparkler send-offs early.
- **Backup Plan:** If you want an outdoor space (like **The Grand Pavilion** lawn), check if they have a stunning indoor room in case of rain.

Would you like me to recommend some venues in your area matching your theme?`,

  vendor: `### 🤝 Tips for Booking Vendors
When hiring wedding vendors, always ask these three questions before signing a contract:
1. *Is there a backup plan if you get sick or have an emergency on the day?*
2. *What is your payment structure and cancellation/postponement policy?*
3. *Have you worked at my venue before?* (If not, will you do a site walk-through with me?)

In the **Vendors** section, you can shortlist options and input their pricing. Once you change their status to **Booked**, their contract price automatically updates your **Budget Tracker** actuals!`,

  guest: `### 👥 Managing Your Guest List & RSVPs
Guest lists can be emotionally challenging. Here is a simple sorting rule:

- **A-List:** Immediate family, bridal party, closest friends whom you cannot imagine the day without. Send invites first.
- **B-List:** Extended family, work friends, acquaintances. Send invites to these guests if you receive early "Declined" RSVPs from your A-List.
- **Plus-Ones:** Be consistent. E.g., only allow plus-ones for guests who are married, engaged, or in long-term cohabiting relationships.

Use our **Guests** manager to group guests by relationship, track meal selections, and assign table numbers.`,

  checklist: `### ✅ Mastering Your Checklist
Staying on top of tasks makes wedding planning feel like a breeze instead of a burden.
Your checklist should be sorted by time periods:
- **12+ Months:** Big picture (budget, venue, planner).
- **9-6 Months:** Creative vendors (photo, attire, design, band).
- **3 Months:** Details (invitations, rings, tasting, hair trials).
- **1 Month:** Logistics (marriage license, seating chart, final RSVP counts).
- **Day-Of:** Stay hydrated and trust your planner!

Go to the **Checklist** tab to view your timeline and check off tasks as you go.`,

  pricing: `### 🎟️ VND Pricing & Plans
We offer flexible pricing options designed for different planning stages:

- **Free Tier:** 15 AI credits per month, up to 20 checklist tasks. Perfect for exploring and starting your plan.
- **Monthly Subscription ($14.99/mo):** Full access to all tools (AI, Budget, Guests, Vendors). Best if you plan to get everything done in 2-3 months.
- **Event Pass ($99 one-time):** Unrestricted access until your wedding day. Includes unlimited AI, exports, seating charts, and guest RSVP pages. (Highly Recommended).
- **Hybrid Option:** Start monthly, upgrade to the Event Pass anytime, or use the free tier during quiet planning months!`,

  subscription: `### 🎟️ Pricing & Subscriptions
Planning a wedding is a single-event journey. That's why we support a **Hybrid Pricing Model**:
- **Monthly Subscription ($14.99/mo):** Cancel anytime. Ideal if your planning is quick or seasonal.
- **Event Pass ($99 one-time):** Pay once and keep full access until your wedding day, no matter how long the engagement.

You can purchase or upgrade in the Profile section of your Dashboard!`,

  pass: `### 🎟️ The VND Event Pass ($99)
The **Event Pass** is our most popular option. For a one-time fee of $99, you get:
- **Unlimited AI Conversations** (No monthly credit limits).
- **Full-featured Budget & Guest Trackers**.
- **Interactive Seating Charts**.
- **Printable PDFs & Excel Exports** with no watermarks.
- **Priority Support** from real coordinators at **OVAimagination Events**.

It stays active until your wedding day, meaning no recurring credit card charges!`,

  credits: `### ⚡ AI Credits & Tokens
To keep the application affordable, the Free plan starts with **15 AI Credits** per month.
- Every message you send to the Concierge deducts **1 credit**.
- Upgrading to the **VND Event Pass ($99)** removes all limits and gives you **unlimited messages**.
- You can buy individual credit packs ($4.99 for 20 credits) if you want to stay on the free plan.

Your current credit balance is displayed in the navigation bar!`,

  vow: `### ✍️ Drafting Your Wedding Vows
Writing vows can be daunting! Here is a simple structure to get you started:

1. **The Hook:** Share a brief memory or mention what you thought when you first met.
2. **The Promises:** 3-5 specific promises (some serious, one lighthearted, e.g., *"I promise to let you have the last slice of pizza"*).
3. **The Core Vow:** Promise to support them through sickness and health, joy and sorrow.
4. **The Look Ahead:** Express excitement for growing old together.

**Would you like me to write a custom draft?** Tell me:
- *3 words that describe your partner.*
- *Your favorite memory together.*
- *Whether you want a romantic, funny, or traditional tone.*`,

  speech: `### 🎤 Crafting the Perfect Speech
Whether you are the Best Man, Maid of Honor, or Groom, a great wedding speech follows this formula:

1. **The Welcome:** Introduce yourself and state your relation to the couple (keep it under 45 seconds).
2. **The Compliment:** Compliment how beautiful/handsome the couple looks today.
3. **The Story:** Tell one short, funny, or sweet story that illustrates the groom's/bride's character. Avoid inside jokes that make others feel left out.
4. **The Toast:** Ask everyone to raise their glass and wish them a lifetime of love.

Keep it under **4 minutes**! If you want, I can write a custom speech draft for you. Just tell me your role and a few details about the bride and groom.`,

  invitation: `### 💌 Wedding Invitation Etiquette & Timeline
Invitations set the tone for your wedding day! Here is the timeline:

- **Save-the-Dates:** Mail out **6 to 8 months** before the wedding (8 to 10 months for destination weddings).
- **Formal Invitations:** Mail out **8 to 10 weeks** before the wedding.
- **RSVP Deadline:** Set this **4 weeks** before the wedding to give you ample time for seating charts and caterer counts.

**Design Tip:** For an **Elegant Navy & Gold** theme, use thick navy cardstock with metallic gold foil lettering and deckled edges for a luxury tactile experience.`,

  music: `### 🎵 Music & Entertainment Strategy
Music defines the atmosphere. When choosing between a **DJ** vs **Live Band**:

- **Live Band:** Unmatched energy, interactive performance, premium feel. Best for classic rock, soul, pop, and jazz. (Typically higher budget).
- **DJ (like DJ Luminary):** Infinite music catalog, original vocal versions, ability to easily read and adapt to the crowd. Takes up less floor space.

**Crucial Songs Checklist:**
1. *Processional (walking down aisle)*
2. *Recessional (exiting aisle)*
3. *Grand Entrance*
4. *First Dance*
5. *Parent Dances*
6. *Last Dance*`,

  dj: `### 🎧 Reception DJ Checklist
Booking a DJ (like **DJ Luminary**)? Ensure they provide:
- A high-quality wireless microphone for speeches (wired mics limit movement).
- Dance floor lighting.
- Sound coverage for both ceremony and reception if they are in different locations.
- Ask how many breaks they take and what music plays during breaks.

Be sure to give them a "Must Play" list (10-15 songs) and a strict **"Do Not Play"** list!`,

  band: `### 🎸 Live Band Booking Guide
A live band brings an incredible energy to the dance floor!
- Check if they act as the MC (Master of Ceremonies) to announce the cake cutting and first dance.
- Ask how many breaks they take and what music plays during breaks.
- Ensure the venue has sufficient electrical outlets and power breakers for their sound system.`,

  photography: `### 📸 Wedding Photography Timeline
Photos are your permanent memories. To get the best out of your photographer (like **Golden Hour Studios**):

- **First Look:** Doing a first look before the ceremony lets you get family and couple portraits completed early, so you can actually attend your own cocktail hour!
- **Sunset Session:** Allocate 15-20 minutes during reception dinner (just before sunset) for romantic couple portraits. The light is soft and golden.
- **Shot List:** Give the photographer a list of specific family groupings so they can check them off quickly without missing anyone.`,

  video: `### 🎥 Wedding Videography Guide
A wedding video captures the emotions, voices, and movements of your day in a way photos cannot.
- **Styles:** Choose between *Cinematic* (looks like a movie), *Documentary* (chronological and full-length), or *Highlight Reel* (3-5 minutes, highly shareable).
- **Audio:** Ask if they will mic the groom and officiant to capture the vows clearly.
- **Drone Footage:** Check if they use drones for sweep shots of your gorgeous venue lawn.`,

  florist: `### 💐 Florals & Centerpieces
Florals instantly transform a space. For our **Elegant Navy & Gold** aesthetic:

- **Colors:** White, cream, and blush roses paired with silver-dollar eucalyptus spray-painted with subtle gold accents.
- **Table Centerpieces:** Mix high and low centerpieces. Tall gold candelabras with cascading greenery look luxurious, while lower floral bowls allow guests to talk across the table.
- **Budget Trick:** Repurpose your ceremony altar florals for the reception sweet table or bar area!`,

  theme: `### ✨ Theme Guide: Elegant Navy & Gold
Your chosen theme is classic, regal, and deeply sophisticated. Here is how to execute it:

- **Attire:** Groomsmen in deep navy tuxedos with black lapels. Bridesmaids in navy chiffon. Bride in ivory with gold hair accessories or gold jewelry.
- **Tablescape:** Navy velvet tablecloths, gold charger plates, gold flatware, white linen napkins, and gold-foiled table numbers.
- **Lighting:** Warm amber uplighting to reflect off the gold accents and create a cozy, luxurious glow.
- **Paper Goods:** Navy menus with metallic gold foil typography.`,

  catering: `### 🍽️ Catering & Food Styles
Catering is often the largest single expense. Choose the right style for your vibe:

- **Plated Dinner (Elegant):** Formal, traditional, looks premium. Guests sit and get served. Easy to stick to timeline. (Culinaria Fine Dining offers this!).
- **Buffet (Casual):** Guests choose their food, wider variety, typically more cost-effective. Can cause lines and slow down the schedule.
- **Family Style (Convivial):** Large platters brought to tables to share. Promotes conversation, feels warm, but requires large tables to fit platters.
- **Food Stations (Modern):** Specialized booths (taco bar, sushi station, carving station). Great for cocktail-style receptions.`,

  seating: `### 🪑 Seating Chart & Layout Strategy
Arranging guests can feel like playing Tetris! Here are some rules of thumb:

- **Bridal/Sweetheart Table:** The couple sits at a sweetheart table facing the guests, or a head table with the wedding party.
- **Parents' Tables:** Parents sit at the front tables closest to the couple, along with grandparents and close relatives.
- **Grouping:** Group guests by how they know you (college friends, family friends, work colleagues). Avoid a "singles table" — mix them in with people they have things in common with.
- **Proximity:** Place older guests away from the DJ speakers, and place young children close to exits.`,

  dress: `### 👗 The Wedding Gown Timeline
Finding the dress (like the one booked at **Bellissima Bridal**) is exciting!
- **Alterations:** Expect 3 fittings.
  1. *Fitting 1 (2-3 months out):* Pinning length and side seams. Bring your wedding shoes and undergarments!
  2. *Fitting 2 (1 month out):* Refining fit and adding the bustle.
  3. *Fitting 3 (2 weeks out):* Final fit check and steam.
- **Transportation:** Never fold the gown! Hang it in a breathable fabric garment bag.`,

  suit: `### 👔 Groom & Groomsmen Suiting
For our **Elegant Navy & Gold** theme, a tuxedo is highly recommended:
- **Tuxedo:** Midnight navy wool with black satin shawl or peak lapels. Pair with a black bow tie, white French-cuff shirt, and gold cufflinks.
- **Suit alternative:** Navy three-piece suit with a cream tie and gold pocket square.
- **Timeline:** Order suits at least 3 months in advance. Groomsmen should submit their measurements 2 months out.`,

  ring: `### 💍 Wedding Bands & Engagement Rings
Buying bands? Remember:
- **Metal Matching:** White gold, platinum, yellow gold, or rose gold. White metals are modern, while yellow gold is warm and classic.
- **Sizing:** Fingers swell in hot weather and shrink in cold. Get sized on a temperate day.
- **Engraving:** Add your wedding date (e.g. *07.15.27*) or a sweet phrase inside the band.
- **Insurance:** Insure your rings immediately under a home/renters policy or specialty jewelry insurer.`,

  timeline: `### ⏱️ Day-Of Timeline Essentials
A smooth day-of timeline is the secret to a stress-free wedding:
- **Buffer Time:** Always add 10-15 minute buffers to hair/makeup, travel, and portrait sessions.
- **Reception Flow:** Keep speeches short (under 4 minutes each) and spread them out between dinner courses so guests don't get bored.
- **Transition Times:** Account for "room flips" if ceremony and reception are in the same room.

You can view, edit, and print your complete schedule in our **Timeline** builder!`,

  license: `### 📜 Marriage License Checklist
A marriage license is what makes it legal!
- **Where to get it:** The county clerk's office in the county/state where your ceremony takes place.
- **When:** Typically **30 to 60 days** before the wedding (licenses expire, so check your local state laws).
- **Documents needed:** Government-issued photo IDs, birth certificates, and divorce decrees (if applicable).
- **After the ceremony:** The officiant, couple, and witnesses sign it. The officiant must mail it back within a set number of days.`,

  speechwriter: `### 🤖 VND AI Speech & Vow Assistant
I can help write your vows or a toast! Just write your prompt like this:
- *"Write a groom vow. I love her laugh, she is a designer, we met in college."*
- *"Write a Maid of Honor speech. The bride is my sister Emily, she loves traveling, she met Thomas at a concert."*

I will draft a premium, customized speech for you!`,

  help: `### 🧭 Welcome to the VND Wedding Concierge!
I am your personal AI assistant, trained in luxury wedding coordination by **OVAimagination Events**.

You can ask me questions about your planning process, budget strategy, or vendor bookings. I can also help you write vows or speeches!

**Try asking me:**
- *How should I divide my $50k budget?*
- *Can you help me write my wedding vows?*
- *What is the checklist for 6 months out?*
- *Tell me about the Event Pass pricing.*`,

  "how are you": `### 😊 Doing Great!
I am doing wonderful, thank you for asking! I'm currently helping couples coordinate their timelines, budgets, and vendors.

How are your wedding preparations coming along today?`,

  "how's it going": `### 😊 Doing Great!
Everything is going wonderfully! Assisting lovely couples all day is a pleasure. 

How can I help you move forward with your wedding tasks today?`,

  "who made you": `### 🛠️ My Creators
I was created by **VND Weddings** to serve as your virtual wedding planner and coordinator. I am built with high-end coordination templates and guidelines!`,

  "who are you": `### 🤖 VND AI Concierge
I am your digital wedding concierge, here to make planning your big day stress-free. I can help calculate budgets, draft vows, format seating tables, and outline day-of timelines.`,

  goodbye: `### 👋 Goodbye!
Thank you for chatting! I'm always here whenever you need more coordination advice. Happy planning! 🌸`,

  bye: `### 👋 Goodbye!
Happy planning! Reach out anytime if you need help with tasks, budgets, or vendor booking questions.`,

  joke: `### 🎂 A Little Wedding Humor!
Here is one for you:
*Why did the two cell phones get married?*
... Because they had a great **reception**! 📱💍`,

  love: `### ❤️ Love is in the Air!
It sure is! And making sure your celebration of love is as stress-free and elegant as possible is exactly what I was built for.`,
};

app.post('/api/ai/chat', authenticateToken, (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const user = req.user;

  // Check credits
  if (!user.eventPassActive && user.aiCredits <= 0) {
    return res.json({
      success: false,
      text: `### ⚠️ Out of AI Credits
You have run out of your 15 complimentary monthly credits. 

To continue chatting with your AI Concierge, you can:
1. **Upgrade to the Event Pass ($99 one-time)** for unlimited questions, seating charts, and PDF exports.
2. **Buy a credit pack** ($4.99 for 20 credits).
3. Wait for your monthly credits to reset on the 1st of next month.

*Go to your Dashboard Profile to upgrade!*`,
      creditsUsed: false,
      aiCredits: 0
    });
  }

  const lowercaseMsg = message.toLowerCase();
  let responseText = null;

  // Check for greetings and thank yous
  const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'yo', 'greetings'];
  const isGreeting = greetings.some(g => {
    const regex = new RegExp(`\\b${g}\\b`, 'i');
    return regex.test(lowercaseMsg);
  });

  const thanks = ['thank you', 'thanks', 'thank', 'appreciate', 'ty'];
  const isThanks = thanks.some(t => {
    const regex = new RegExp(`\\b${t}\\b`, 'i');
    return regex.test(lowercaseMsg);
  });

  if (isGreeting) {
    responseText = `### 🌸 Hello there!
Hey **${user.name}**! Welcome to **Elysian Wedding Concierge** (in partnership with VND Weddings). 

I'm your dedicated AI planning assistant. I can help you:
- 💰 Manage your **Budget breakdown** and payment schedules.
- 📋 Keep track of your monthly planning **Checklist**.
- 👥 Organize your **Guests list**, table seating, and meals.
- 🤝 Coordinate and contract your **Vendors**.
- ✍️ Draft custom **vows or reception speeches**!

How is your wedding planning going today? Ask me anything!`;
  } else if (isThanks) {
    responseText = `### ❤️ You're very welcome, **${user.name.split(' ')[0]}**!
It is my absolute pleasure to assist you. Wedding planning can be a big journey, but you're doing amazing! 

What would you like to coordinate next? (e.g. Budget, Guests, Vendors, or Timelines?)`;
  } else {
    // Search for keywords
    for (const [keyword, response] of Object.entries(KEYWORD_RESPONSES)) {
      if (lowercaseMsg.includes(keyword)) {
        responseText = response;
        break;
      }
    }
  }

  // Fallback response
  if (!responseText) {
    responseText = `### 💍 Elysian AI Wedding Assistant
Hi **${user.name.split(' ')[0]}**, I hear you! Regarding *"${message}"*, I recommend checking out these sections of your workspace:

1. **Checklist:** Add a task to keep this action item on track.
2. **Budget:** Check how this aligns with your category allocation.
3. **Vendors:** Shortlist and compare coordinators or suppliers who specialize in this.

*💡 Quick Tip: Ask me specifically about "budget", "venue", "guest list", "music", "timeline", "vows", or "pricing" for structured templates and guides!*`;
  }

  // Deduct credit
  let updatedCredits = user.aiCredits;
  let creditsUsed = false;

  if (!user.eventPassActive) {
    const updated = db.updateUser(user.id, { aiCredits: user.aiCredits - 1 });
    updatedCredits = updated.aiCredits;
    creditsUsed = true;
  }

  res.json({
    success: true,
    text: responseText,
    creditsUsed,
    aiCredits: updatedCredits
  });
});


// Start server
app.listen(PORT, () => {
  console.log(`Elysian backend server is running on port ${PORT}`);
});
