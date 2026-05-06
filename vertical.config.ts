export interface TradeCategory {
  id: string; label: string; icon: string; synonyms: string[]
}

export interface TradeSpotConfig {
  id: string; name: string; tagline: string; domain: string; themeColor: string
  metaTitle: string; metaDescription: string; keywords: string[]
  aiSystemPrompt: string
  tradeCategories: TradeCategory[]
}

const config: TradeSpotConfig = {
  id: 'tradespot',
  name: 'TradeSpot',
  tagline: 'Find trusted tradespeople near you — AI-ranked by real reviews',
  domain: 'tradespot.app',
  themeColor: 'orange',
  metaTitle: 'TradeSpot — Find Trusted Tradespeople Near You',
  metaDescription: 'AI-powered local trades finder. Find plumbers, electricians, builders and more — ranked by real review analysis, not just star ratings.',
  keywords: ['find plumber', 'local tradesman', 'electrician near me', 'builder near me', 'handyman', 'trusted trades'],
  aiSystemPrompt: `You are a helpful assistant for TradeSpot, a platform that helps people find trusted local tradespeople globally.
When users ask to find a tradesperson, extract the trade type and location from their message.
When you have results, give an honest AI summary of what the reviews say — punctuality, quality, value, reliability.
Be concise and direct. Always suggest calling the business directly.`,
  tradeCategories: [
    { id: 'plumber',     label: 'Plumber',        icon: '🔧', synonyms: ['plumbing','pipe','leak','boiler'] },
    { id: 'electrician', label: 'Electrician',    icon: '⚡', synonyms: ['electrical','wiring','socket','fuse'] },
    { id: 'builder',     label: 'Builder',        icon: '🏗️', synonyms: ['building','construction','extension','renovation'] },
    { id: 'cleaner',     label: 'Cleaner',        icon: '🧹', synonyms: ['cleaning','housekeeping','maid','domestic'] },
    { id: 'painter',     label: 'Painter',        icon: '🎨', synonyms: ['painting','decorator','decorating'] },
    { id: 'gardener',    label: 'Gardener',       icon: '🌿', synonyms: ['gardening','landscaping','lawn','hedge'] },
    { id: 'locksmith',   label: 'Locksmith',      icon: '🔑', synonyms: ['locks','lockout','keys','security'] },
    { id: 'handyman',    label: 'Handyman',       icon: '🛠️', synonyms: ['odd jobs','repairs','maintenance'] },
    { id: 'roofer',      label: 'Roofer',         icon: '🏠', synonyms: ['roofing','roof repair','gutters','tiles'] },
    { id: 'carpenter',   label: 'Carpenter',      icon: '🪚', synonyms: ['joinery','woodwork','doors','furniture'] },
    { id: 'plasterer',   label: 'Plasterer',      icon: '🪣', synonyms: ['plastering','rendering','walls','ceiling'] },
    { id: 'hvac',        label: 'HVAC / Heating', icon: '❄️', synonyms: ['air conditioning','heating','boiler','heat pump'] },
  ],
}

export default config
