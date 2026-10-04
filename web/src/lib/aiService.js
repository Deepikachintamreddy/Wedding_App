/**
 * Elysian Concierge — Verified Wedding Intelligence & Planning Knowledge Base
 * Developed in collaboration with OVAimagination Events
 */

const KNOWLEDGE_BASE = {
  budget: {
    category: 'Budget Strategy',
    source: 'OVAimagination Events Benchmark Standards',
    title: 'Luxury Budget Allocation Framework',
    content: `### 💰 Luxury Wedding Budget Strategy
A balanced luxury wedding budget requires strategic allocation across core vendor disciplines. Here is the standard framework recommended by **OVAimagination Events**:

1. **Venue & Plated Catering:** 45% – 50%
2. **Photography & Cinematic Videography:** 12% – 15%
3. **Professional Planning & Day-Of Coordination:** 10% – 12%
4. **Floral Architecture & Lighting Design:** 10% – 12%
5. **Entertainment (Band, Strings & DJ):** 8% – 10%
6. **Bridal Couture & Groom Suiting:** 6% – 8%
7. **Fine Stationery & Custom Digital Invites:** 3% – 5%
8. **Contingency Reserve Cushion:** 5% *(Essential for unexpected weather adaptations or guest fluctuations)*

*Note: Cost figures provided by Elysian Concierge are planning estimates. Final pricing requires a verified vendor proposal and signed contract.*`,
    proposedAction: {
      type: 'budget_review',
      title: 'Review category allocations in Budget Tracker',
      actionUrl: '/budget',
    }
  },

  venue: {
    category: 'Venues',
    source: 'Elysian Venue Evaluation Protocol',
    title: 'Essential Venue Inspection & Contract Criteria',
    content: `### 🏛️ Choosing Your Perfect Wedding Venue
When evaluating luxury venues (such as **The Grand Pavilion at Sunset Cove**), verify these critical operational terms before signing:

- **Capacity Margins:** Never book a venue at 100% capacity; maintain a 10% – 15% buffer for comfortable circulation, dance floors, and service stations.
- **In-House vs. Outsourced Catering:** Clarify kitchen buyout fees, preferred vendor exclusivity, and bar corkage rates.
- **Sound & Curfew Restrictions:** Check outdoor decibel ordinances and hard closing hours (often 10:00 PM or 11:00 PM in residential or coastal jurisdictions).
- **Weather Contingency Plan (Plan B):** Ensure the indoor rain-backup space is equally stunning and does not require costly same-day room flipping.

*Would you like assistance drafting an inquiry email or comparing specific venue proposals?*`,
    proposedAction: {
      type: 'checklist_add',
      title: 'Schedule venue walkthrough and confirm weather contingency plan',
      category: 'Venue',
      notes: 'Check noise curfew, load-in timing, and catering kitchen access with venue coordinator.',
    }
  },

  vendor: {
    category: 'Vendor Procurement',
    source: 'OVAimagination Vendor Standards',
    title: 'Vendor Contract Protection Checklist',
    content: `### 🤝 Vendor Selection & Contract Best Practices
Before executing contracts with wedding professionals, insist on these standard protective clauses:

1. **Illness & Emergency Substitution:** Confirm in writing who replaces the lead photographer, officiant, or coordinator in case of emergency.
2. **Retainer & Payment Schedule:** Typical structure is 25% – 50% upon contract signing, with the final balance due 14 to 30 days prior to the wedding date.
3. **Liability Insurance:** Require all vendors to provide a Certificate of Insurance (COI) naming the venue as an additional insured.
4. **Meal & Rest Provisions:** Provide vendor meals for professionals working 5+ consecutive hours on the wedding day.

*In the **Vendors** module, changing a vendor's status to **Booked** automatically synchronizes their contract pricing with your **Budget Tracker**.*`,
  },

  guest: {
    category: 'Guest Coordination',
    source: 'Elysian Etiquette Guide',
    title: 'Guest List Strategy & RSVP Management',
    content: `### 👥 Guest List Architecture & RSVP Timeline
Managing your guest list with clarity prevents seating stress and budget overruns:

- **Tiered Invitation Dispatch:** Send Save-the-Dates **6 to 8 months** out. Send formal invitations **8 to 10 weeks** prior, with an RSVP deadline **4 weeks** before the event.
- **Plus-One Protocol:** Establish a clear, consistent policy (e.g. plus-ones extended to married, engaged, or cohabiting couples).
- **Dietary Tracking:** Capture dietary restrictions (vegan, gluten-free, nut allergies) directly through your custom digital RSVP portal.
- **Head Count Buffer:** Typically 10% to 15% of invited guests will decline; use this historical average when setting provisional catering numbers.`,
    proposedAction: {
      type: 'guest_followup',
      title: 'Follow up with unconfirmed guests 14 days before RSVP cutoff',
      actionUrl: '/guests',
    }
  },

  checklist: {
    category: 'Checklist Management',
    source: 'Elysian 12-Month Wedding Roadmap',
    title: 'Milestone Execution Timeline',
    content: `### ✅ Master Planning Milestone Roadmap
A structured timeline keeps planning organized and joyful:

- **12+ Months:** Establish budget ceiling, secure venue, and retain full-service planner (OVAimagination Events).
- **9 to 6 Months:** Book key creative team (Photo, Video, Catering, Music, Florals) and order wedding attire.
- **3 Months:** Finalize menu tasting, design digital invitations, purchase wedding bands, and schedule hair/makeup trials.
- **1 Month:** Obtain marriage license, finalize floor plan and table seating, and write personal vows.
- **Day-Of:** Trust your coordination team, stay nourished, and savor every moment.

*Visit your **Checklist** tab to view your personalized countdown and check off completed milestones.*`,
  },

  vow: {
    category: 'Ceremony & Vows',
    source: 'Elysian Speech & Vow Workshop',
    title: 'Personal Vow Writing Structure',
    content: `### ✍️ Personalized Wedding Vow Composition
A memorable personal vow is sincere, emotional, and takes roughly 2 to 3 minutes to recite. Use this 4-part framework:

1. **The Origin:** Recall the moment you realized your partner was the one, or a meaningful memory that defines your connection.
2. **The Affirmation:** Express specific qualities you admire in them (their kindness, humor, resilience, loyalty).
3. **The Core Promises:** 3 to 5 genuine commitments (both profound and lighthearted, e.g., *"I promise to support your wildest ambitions and never turn off the heat when you're cold"*).
4. **The Horizon:** Close with your vision for the future and a pledge of lifelong partnership.

*Would you like me to write a custom vow draft for you? Share 3 words that describe your partner and your favorite shared memory.*`,
    proposedAction: {
      type: 'checklist_add',
      title: 'Finalize personal wedding vows draft',
      category: 'Officiant',
      notes: 'Practice reciting vows aloud with a 2-minute timer.',
    }
  },

  speech: {
    category: 'Toasts & Speeches',
    source: 'Elysian Speech & Vow Workshop',
    title: 'Toast & Speech Protocol',
    content: `### 🎤 Crafting a Heartfelt Wedding Toast
Whether you are the Best Man, Maid of Honor, or Parent of the Couple, adhere to these timing rules:

- **Target Duration:** 3 to 4 minutes maximum (speeches exceeding 5 minutes disrupt dinner service).
- **The Structure:**
  1. *Welcome & Relation (30s):* Introduce yourself and acknowledge how stunning the couple looks.
  2. *The Story (2 mins):* Share one relatable anecdote demonstrating the character and love of the couple. Avoid inside jokes.
  3. *The Compliment to the Partner (30s):* Share how the couple brings out the best in each other.
  4. *The Toast (30s):* Invite all guests to raise their glasses to a lifetime of love and joy.`,
  },

  license: {
    category: 'Legal Procedures',
    source: 'California & US County Registrar Requirements',
    title: 'Marriage License Verification Protocol',
    content: `### 📜 Marriage License Legal Protocol
*Important: Marriage license rules vary by county and state. Please consult your local county clerk.*

- **Timing:** Apply **30 to 90 days** prior to the wedding date (licenses expire after a set duration).
- **Requirements:** Both partners must appear in person with government-issued photo IDs (passports or driver's licenses) and certified birth certificates.
- **Day-of Execution:** The ordained officiant and designated witnesses sign the license immediately following the ceremony.
- **Return Deadline:** The officiant must mail the completed certificate back to the county registrar within 10 days of the ceremony.`,
    proposedAction: {
      type: 'checklist_add',
      title: 'Schedule county clerk appointment for marriage license',
      category: 'Misc',
      notes: 'Bring valid government photo IDs and check local county clerk operating hours.',
    }
  },

  pricing: {
    category: 'Plans & Pricing',
    source: 'Elysian Concierge Commercial Terms',
    title: 'Transparent Pricing & Entitlements',
    content: `### 🎟️ Elysian Concierge Plans & Pricing
We provide clear, fair access tiers tailored to your wedding planning journey:

- **Free Tier ($0):** 15 complimentary AI concierge credits per month, standard checklist, budget overview, and directory browsing.
- **Event Pass ($99 one-time):** The gold standard for couples. Unlimited AI conversations, full budget & payment tracking, guest manager with digital RSVP, and printable PDF exports until your wedding day. No recurring monthly subscription.
- **Concierge Plus ($199 one-time):** Everything in Event Pass, plus a dedicated 1-on-1 virtual consultation with **OVAimagination Events** coordinators, priority email support, and day-of coordination templates.

*Upgrade options are accessible anytime from your Profile Settings.*`,
  },

  planner: {
    category: 'Coordination Services',
    source: 'OVAimagination Events',
    title: 'Professional Coordination Partner',
    content: `### ⚜️ OVAimagination Events Coordination
Elysian Concierge is powered by the planning standards of **OVAimagination Events**.

For couples requiring on-site coordination, vendor contract negotiation, floral architecture, or luxury design production in Southern California and destination locations:
- **Full Planning & Design:** Complete concept creation, vendor matchmaking, and master timeline execution.
- **Month-Of & Day-Of Coordination:** Taking over logistics 6 weeks prior to the event date to ensure seamless vendor arrivals and processional timing.

*You can submit an inquiry through our **Contact & Support** portal or request direct matchmaking in your Admin/Settings.*`,
  }
};

/**
 * Generate AI Response with secure context injection and safety validation
 */
export async function getAiResponse(message, userCredits = 15, eventContext = null) {
  // Simulate natural AI thinking latency
  await new Promise((resolve) => setTimeout(resolve, 600));

  // Check credit balance
  if (userCredits <= 0 && !eventContext?.eventPassActive && eventContext?.role !== 'admin') {
    return {
      success: false,
      text: `### ⚠️ AI Concierge Credits Depleted
You have utilized your complimentary monthly credits.

To continue planning seamlessly without interruptions:
1. **Activate the Event Pass ($99 one-time)** for unlimited AI access, seating charts, and export tools.
2. Upgrade to **Concierge Plus ($199)** for 1-on-1 planner consultations with **OVAimagination Events**.
3. Your 15 complimentary credits will refresh on the first of next month.

*Your existing checklist, budget, and guest data remain fully accessible at all times.*`,
      creditsUsed: false,
    };
  }

  const query = message.toLowerCase().trim();

  // Safety filter for prompt injection / internal secrets
  if (query.includes('ignore previous instructions') || query.includes('system prompt') || query.includes('leak credentials')) {
    return {
      success: true,
      text: `### 🛡️ Security Boundary Notice
I am Elysian Concierge, dedicated solely to assisting you with luxury wedding planning, budgets, vendors, timelines, and ceremony coordination. I cannot disclose internal system architecture or bypass security policies.`,
      creditsUsed: false,
    };
  }

  let matchedArticle = null;
  for (const [key, article] of Object.entries(KNOWLEDGE_BASE)) {
    if (query.includes(key)) {
      matchedArticle = article;
      break;
    }
  }

  // If specific knowledge article matched
  if (matchedArticle) {
    let responseText = matchedArticle.content;

    // Contextualize with couple's central profile if available
    if (eventContext && eventContext.name) {
      if (query.includes('budget') && eventContext.budget) {
        responseText += `\n\n**Your Current Event Snapshot:**\n- **Couple:** ${eventContext.name}\n- **Budget Ceiling:** $${Number(eventContext.budget).toLocaleString()} USD\n- **Wedding Date:** ${eventContext.weddingDate || 'TBD'}`;
      }
    }

    return {
      success: true,
      text: responseText,
      proposedAction: matchedArticle.proposedAction || null,
      creditsUsed: true,
      contextVersion: 'v2.4-elysian-ovaimagination',
    };
  }

  // Context-aware fallback response
  const coupleName = eventContext?.name || 'there';
  const weddingDate = eventContext?.weddingDate ? ` (${eventContext.weddingDate})` : '';

  return {
    success: true,
    text: `### 💍 Elysian Concierge Planning Assistant
Thank you for your question, **${coupleName}**! You asked about: *"${message}"*.

As your digital wedding concierge trained by **OVAimagination Events**, here are recommended next steps:
1. **Checklist:** Add a dedicated task with clear milestones and assigned partners in your **Checklist**.
2. **Budget Verification:** Check how this item aligns with your planned financial allocations in the **Budget Tracker**.
3. **Vendor Coordination:** Review proposals or compare vetted specialists in the **Vendors** directory.

*Tip: For in-depth guides, try asking specifically about "budget", "venue checklist", "vow writing", "guest list", "music", "timeline", "license", or "pricing".*`,
    proposedAction: {
      type: 'checklist_add',
      title: `Review and plan: ${message.substring(0, 40)}`,
      category: 'Planner',
      notes: `Follow up on advice regarding: ${message}`,
    },
    creditsUsed: true,
    contextVersion: 'v2.4-elysian-ovaimagination',
  };
}
