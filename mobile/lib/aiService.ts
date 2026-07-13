/**
 * VND Wedding Concierge — Expert AI Service (Mobile)
 * Provides expert-level wedding planning advice based on keyword matching
 */

const KEYWORD_RESPONSES: { [key: string]: string } = {
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

Would you like me to recommend some venues in your area matching your **Elegant Navy & Gold** theme?`,

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
- Upgrading to the **Event Pass ($99)** removes all limits and gives you **unlimited messages**.
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
- **Drone Footage:** Check if they use drones for sweep shots of your gorgeous venue like **The Grand Pavilion** lawn.`,

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
};

import { api } from './api';

export async function getAiResponse(message: string, userCredits = 15): Promise<{ success: boolean; text: string; creditsUsed: boolean }> {
  try {
    const authenticated = await api.isAuthenticated();
    if (authenticated) {
      const response = await api.sendAiChat(message);
      return {
        success: true,
        text: response.text,
        creditsUsed: response.creditsUsed !== undefined ? response.creditsUsed : true
      };
    }
  } catch (err: any) {
    console.error('[AI Service] Failed to fetch backend AI response, falling back to local keyword matcher:', err);
    // If it's a credit error, let's display the out of credits page
    if (err.message && err.message.includes('credits')) {
      return {
        success: false,
        text: `### ⚠️ Out of AI Credits\nYou have run out of your complimentary monthly credits.\n\nTo continue chatting with your AI Concierge, you can:\n1. **Upgrade to the Event Pass ($99 one-time)** for unlimited questions.\n2. **Buy a credit pack** ($4.99 for 20 credits).\n\n*Go to your Dashboard Profile to upgrade!*`,
        creditsUsed: false
      };
    }
  }

  // Simulate network latency for offline/demo fallback
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (userCredits <= 0) {
    return {
      success: false,
      text: `### ⚠️ Out of AI Credits
You have run out of your 15 complimentary monthly credits. 

To continue chatting with your AI Concierge, you can:
1. **Upgrade to the Event Pass ($99 one-time)** for unlimited questions, seating charts, and PDF exports.
2. **Buy a credit pack** ($4.99 for 20 credits).
3. Wait for your monthly credits to reset on the 1st of next month.

*Go to your Dashboard Profile to upgrade!*`,
      creditsUsed: false,
    };
  }

  const lowercaseMsg = message.toLowerCase();
  let responseText = null;

  for (const [keyword, response] of Object.entries(KEYWORD_RESPONSES)) {
    if (lowercaseMsg.includes(keyword)) {
      responseText = response;
      break;
    }
  }

  if (!responseText) {
    responseText = `### 💍 VND AI Wedding Assistant
Thank you for your message! You asked about: *"${message}"*.

As your AI planner, I recommend:
1. **Adding tasks** to your **Checklist** to track this specific item.
2. **Checking the Budget** to see if this affects your spending.
3. **Shortlisting vendors** who can help execute this.

*Tip: Try asking specifically about "budget", "venue", "guest list", "music", "timeline", "dress", or "vows" for detailed guides!*`;
  }

  return {
    success: true,
    text: responseText,
    creditsUsed: true,
  };
}
