/**
 * Elysian Wedding Concierge — Mock AI Service (Mobile)
 */

const KEYWORD_RESPONSES: { [key: string]: string } = {
  budget: `### 💰 Budget Strategy
A wedding budget is all about prioritization:
1. Venue & Catering: 45% - 50%
2. Photo & Video: 10% - 12%
3. Coordinator: 10%
4. Attire & Beauty: 8% - 10%
5. Florals & Decor: 8% - 10%
6. Music: 8% - 10%
7. Reserve Cushion: 5% (Critical!)`,

  venue: `### 🏛️ Choosing Your Venue
Key Malibu elements:
- Capacity: comfortable margins.
- Inclusions: catering, tables.
- Rain Plan: grand Pavilion lawns.`,

  vendor: `### 🤝 Booking Vetted Partners
Always ask:
1. What is the cancellation/emergency policy?
2. Are you familiar with Malibu curfew rules?`,

  guest: `### 👥 Guest Lists & RSVPs
- A-List: Essential family & bridal party.
- B-List: Send if A-List declines.
- Plus-Ones: Stick to a firm rule.`,

  vows: `### ✍️ Writing Personal Vows
Structure:
1. The hook memory.
2. The core promises (include one funny one!).
3. Standard romantic promises.
4. Excited look ahead.`,

  speech: `### 🎤 Perfect Speech Checklist
- Keep under 4 minutes.
- Introduce relation.
- Compliment couple.
- One brief, clean story.
- Toast to their future!`,

  pricing: `### 🎟️ Pricing & Plans
- Free Tier: 15 AI credits / month.
- Monthly: $14.99/mo full workspace.
- Event Pass: $99 one-time full access until wedding day. (Highly Recommended).`,

  help: `### 🧭 Elysian AI Concierge
I am your personal AI assistant coordinated by **OVAimagination Events**.
Ask me about: "budget", "venue", "vows", "speech", "pricing" or "guest list"!`,
};

export async function getAiResponse(message: string, userCredits = 15): Promise<{ success: boolean; text: string; creditsUsed: boolean }> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (userCredits <= 0) {
    return {
      success: false,
      text: `### ⚠️ Out of Credits\nPlease upgrade to the Event Pass ($99 one-time) in settings for unlimited AI questions!`,
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
    responseText = `### 💍 Elysian AI Wedding Assistant\nThanks for asking! I recommend checking your **Checklist** or asking about "budget", "vows", or "venue" details.`;
  }

  return {
    success: true,
    text: responseText,
    creditsUsed: true,
  };
}
