// Content calendar — topic rotation for auto-generated social media posts
// The cron cycles through these daily, picking 3-4 per run

export interface ContentTopic {
  topic: string;
  tone: string;
  platforms: string[];
  contentType: string;
  brand: string;
}

export const CONTENT_TOPICS: ContentTopic[] = [
  // expNWA — lifestyle & real estate
  {
    topic: 'Why Northwest Arkansas is the best place to relocate in 2026 — low cost of living, outdoor recreation, Fortune 500 employers, and a thriving arts scene',
    tone: 'inspiring',
    platforms: ['facebook', 'linkedin'],
    contentType: 'educational',
    brand: 'expNWA',
  },
  {
    topic: 'This weekend in Northwest Arkansas — events, live music, farmers markets, and things to do in Bentonville, Fayetteville, and Rogers',
    tone: 'casual',
    platforms: ['facebook'],
    contentType: 'engagement',
    brand: 'expNWA',
  },
  {
    topic: 'Northwest Arkansas real estate market update — home prices, inventory, and why buyers are choosing NWA over bigger metros',
    tone: 'professional',
    platforms: ['facebook', 'linkedin'],
    contentType: 'educational',
    brand: 'expNWA',
  },
  {
    topic: 'Best neighborhoods in Bentonville and Rogers for families, remote workers, and young professionals moving to NWA',
    tone: 'helpful',
    platforms: ['facebook'],
    contentType: 'listicle',
    brand: 'expNWA',
  },
  {
    topic: 'Crystal Bridges, the Momentary, and why NWA has become a world-class arts and culture destination',
    tone: 'inspiring',
    platforms: ['facebook'],
    contentType: 'storytelling',
    brand: 'expNWA',
  },

  // BAD SaaS — business automation
  {
    topic: 'How AI-powered business automation is replacing manual CRM workflows — lead scoring, follow-ups, and pipeline management without the busywork',
    tone: 'professional',
    platforms: ['linkedin'],
    contentType: 'thought-leadership',
    brand: 'BAD SaaS',
  },
  {
    topic: 'Small businesses are using AI agents to automate lead qualification, proposal generation, and project management — here is how',
    tone: 'professional',
    platforms: ['linkedin'],
    contentType: 'educational',
    brand: 'BAD SaaS',
  },
  {
    topic: 'The future of enterprise AV is software-defined — how platforms like AV Orchestrator are replacing manual commissioning workflows',
    tone: 'professional',
    platforms: ['linkedin'],
    contentType: 'thought-leadership',
    brand: 'BAD SaaS',
  },

  // HookVault — music & creative
  {
    topic: 'Independent songwriters and producers — organize your catalog, track rights, build pitch packs, and use AI to market your music with HookVault',
    tone: 'casual',
    platforms: ['facebook'],
    contentType: 'promotional',
    brand: 'HookVault',
  },
  {
    topic: 'Build your own internet radio station with AI DJ voices, per-artist stations, and ad slot management — no broadcasting license needed',
    tone: 'exciting',
    platforms: ['facebook'],
    contentType: 'promotional',
    brand: 'HookVault',
  },

  // LessonPilot — education
  {
    topic: 'Preparing for the AVIXA CTS certification exam? Our AI-powered 3-day bootcamp covers all four exam domains with practice questions and study strategies',
    tone: 'professional',
    platforms: ['linkedin'],
    contentType: 'promotional',
    brand: 'LessonPilot',
  },
  {
    topic: 'AI is transforming professional training — upload your materials, and AI builds a full curriculum with lessons, quizzes, and audio narration',
    tone: 'professional',
    platforms: ['linkedin'],
    contentType: 'educational',
    brand: 'LessonPilot',
  },
];

export function getTodaysTopics(dayOfYear: number, count: number = 4): ContentTopic[] {
  const startIdx = (dayOfYear * count) % CONTENT_TOPICS.length;
  const topics: ContentTopic[] = [];
  for (let i = 0; i < count; i++) {
    topics.push(CONTENT_TOPICS[(startIdx + i) % CONTENT_TOPICS.length]);
  }
  return topics;
}
