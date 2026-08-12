'use client';

import { useState, useRef, useEffect } from 'react';
import { useWeddingStore } from '@/lib/store';
import styles from './page.module.css';

const TEMPLATES = [
  {
    id: 't_arch',
    name: 'The Timeless Arch',
    tier: 'basic',
    style: 'Elegant Arch-framed layout with curved lettering overlay, 9-bar sound wave visualizer, double-lined arch date blocks, and vertical schedule timelines.',
    price: 0,
    priceLabel: 'Free Template',
    color: '#ffffff',
    accentColor: '#111111',
    font: 'serif',
    sampleBg: 'linear-gradient(180deg, #fbfaf8 0%, #f5f2eb 100%)',
    vibe: 'High-fashion, editorial, curated',
    features: [
      'Basic Arch-Framed Photo Layout',
      'Simple Event Timeline',
      'Standard RSVP Form',
      'General Information Section'
    ]
  },
  {
    id: 't_essential',
    name: 'The Modern Essential',
    tier: 'modern',
    style: 'Modern minimalist layout with full screen photography, horizontal image slider gallery, integrated sound wave music player, and active entourage rosters.',
    price: 14.99,
    priceLabel: 'Buy $14.99',
    color: '#f5f0e8',
    accentColor: '#2c2c2c',
    font: 'sans-serif',
    sampleBg: 'linear-gradient(135deg, #f5f0e8 0%, #e5dfd5 100%)',
    vibe: 'Modern, chic, airy',
    features: [
      'Advanced Dress Code & Color Palette Guide',
      'Interactive Event Timeline & Programs',
      'Customizable RSVP with Deadline Tracking',
      'Multi-link Gift Registry Integration',
      'Curated Photo Gallery'
    ]
  },
  {
    id: 't_noir',
    name: 'The Noir Editorial',
    tier: 'editorial',
    style: 'Luxury dark theme with magazine-style typography, full-bleed high-contrast couple photography, background track lists, and structured travel tip boards.',
    price: 29.99,
    priceLabel: 'Buy $29.99',
    color: '#121212',
    accentColor: '#fbfaf8',
    font: 'Georgia, serif',
    sampleBg: 'linear-gradient(180deg, #121212 0%, #1e1e1e 100%)',
    vibe: 'Dramatic, editorial, black & white',
    features: [
      'Magazine-Style Full-Bleed Photography',
      'Integrated Background Audio Experience',
      'Icon-Driven Event Timeline',
      'Customizable Details & Travel Info',
      'Seamless Registry & RSVP Flow',
      'Unlimited High-Res Photo Uploads',
      'Custom Domain Support'
    ]
  },
  {
    id: 't_obsidian',
    name: 'The Obsidian Romance',
    tier: 'imperial',
    style: 'Dramatic black velvet theme accented with gold borders, multiple full-bleed portrait grids, staggered timeline scheduler, and customizable swatches.',
    price: 49.99,
    priceLabel: 'Buy $49.99',
    color: '#020208',
    accentColor: '#d4af37',
    font: 'serif',
    sampleBg: 'linear-gradient(135deg, #020208 0%, #0d0d1a 100%)',
    vibe: 'Luxury, dramatic, imperial',
    features: [
      'Dramatic Dark-Theme Premium Aesthetic',
      'Three 9:16 Full-Bleed Portrait Layouts',
      'Elegant Staggered Event Timeline',
      'Visual Dress Code Color Swatches',
      'Multi-Link Gift Registry Integration',
      'Seamless Background Audio',
      'Priority Customer Support',
      'Custom Animations & Transitions',
      'Dedicated Vendor Coordination Integration'
    ]
  }
];

export default function TemplatesPage() {
  const store = useWeddingStore();
  const { user } = store;
  const [selectedTemplate, setSelectedTemplate] = useState(null); // template object for preview
  const [selectedEventType, setSelectedEventType] = useState('wedding'); // 'wedding', 'birthday', 'baby', 'corporate'
  const [mobileEditorTab, setMobileEditorTab] = useState('edit'); // 'edit' or 'preview' active tab on mobile
  const [activeTab, setActiveTab] = useState('invite'); // 'invite', 'dress', 'timeline', 'registry', 'party', 'rsvp'
  const [expandedSection, setExpandedSection] = useState('general'); // active editor tab: 'general', 'dress', 'registry', 'party', 'timeline'
  
  // RSVP Form simulation
  const [rsvpForm, setRsvpForm] = useState({ 
    name: '', 
    attending: 'yes', 
    count: '1', 
    meal: 'beef', 
    songRequest: '', 
    genderGuess: 'boy', 
    company: '', 
    jobTitle: '',
    message: '' 
  });
  const [rsvpSuccess, setRsvpSuccess] = useState(false);

  // Save the Date / Teaser states
  const [invitationMode, setInvitationMode] = useState('full'); // 'full' or 'savethedate'
  const [subscribersFeed, setSubscribersFeed] = useState([]);
  const [subscriberEmail, setSubscriberEmail] = useState('');
  const [subscriberSuccess, setSubscriberSuccess] = useState(false);
  const [countdown, setCountdown] = useState({ days: 120, hours: 14, minutes: 22, seconds: 45 });

  // Innovative features states
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [rsvpFeed, setRsvpFeed] = useState([]);
  const [aiLoadingField, setAiLoadingField] = useState(null);

  // Countdown timer hook will be declared below customText state initialization

  const audioRef = useRef(null);

  const THEME_PALETTES = [
    { id: 'gold', label: 'Champagne Gold', primary: '#d4af37', background: 'linear-gradient(135deg, #020208 0%, #0d0d1a 100%)' },
    { id: 'burgundy', label: 'Burgundy Rose', primary: '#aa112f', background: 'linear-gradient(135deg, #1f0107 0%, #0c0003 100%)' },
    { id: 'emerald', label: 'Royal Emerald', primary: '#31724f', background: 'linear-gradient(135deg, #011c0f 0%, #000b06 100%)' },
    { id: 'sapphire', label: 'Sapphire Night', primary: '#2858a6', background: 'linear-gradient(135deg, #010e26 0%, #000612 100%)' }
  ];

  useEffect(() => {
    if (audioRef.current && audioPlaying) {
      audioRef.current.load();
      audioRef.current.play().catch(e => console.log("Audio switch failed", e));
    }
  }, [selectedTrack]);

  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (audioPlaying) {
      audioRef.current.pause();
      setAudioPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setAudioPlaying(true);
      }).catch((e) => {
        console.error("Audio playback error:", e);
        // Fallback for simulation
        setAudioPlaying(true);
      });
    }
  };

  const handleAICopywrite = (fieldKey) => {
    setAiLoadingField(fieldKey);
    setTimeout(() => {
      let replacement = '';
      const toneIndex = Math.floor(Math.random() * 3);
      if (fieldKey === 'title') {
        const titleOptions = [
          'The Marriage of Vanessa & Noah',
          'Vanessa & Noah: Live, Love, Celebrate!',
          'Two Hearts, One Journey: Vanessa & Noah'
        ];
        replacement = titleOptions[toneIndex];
        setCustomText(prev => ({ ...prev, title: replacement }));
      } else if (fieldKey === 'dressCodeText') {
        const dressOptions = [
          'We request formal wedding attire. We recommend warm champagne shades, earthy neutral tones, and soft pastel colors.',
          'Dress code is chic, elegant, and comfortable. Think linen suits, flowy midi dresses, and your favorite dancing shoes.',
          'Please dress in dreamy colors of the twilight—soft blues, warm golds, and muted rose shades.'
        ];
        replacement = dressOptions[toneIndex];
        setCustomText(prev => ({ ...prev, dressCodeText: replacement }));
      } else if (fieldKey === 'details') {
        const detailsOptions = [
          'Please join us for a celebration of love, commitment, and new beginnings as we exchange our vows.',
          'We’re tying the knot! Good vibes, great drinks, and bad dancing to follow.',
          'Under the soft sun of Malibu, we will pledge our lives to each other. We would be honored by your presence.'
        ];
        replacement = detailsOptions[toneIndex];
        setCustomText(prev => ({ ...prev, details: replacement }));
      }
      setAiLoadingField(null);
    }, 1000);
  };

  const [customText, setCustomText] = useState({
    title: 'Vanessa & Noah',
    date: 'Saturday, July 15, 2027',
    location: 'Sunset Cove, Malibu, CA',
    details: 'Reception to follow immediately after ceremony',
    couplePhoto: '/couple1.png',
    dressCodeText: 'Wear formal wedding attire. We recommend earthy neutral tones and pastel shades.',
    dressColors: ['#bdc3c7', '#d4a373', '#e9c46a', '#faedcd'],
    registry: [
      { name: 'Amazon Wedding Registry', url: 'https://amazon.com' },
      { name: 'Target Gift Registry', url: 'https://target.com' }
    ],
    entourage: [
      { role: 'Maid of Honor', name: 'Juliana Smith' },
      { role: 'Best Man', name: 'James Carter' },
      { role: 'Bridesmaid', name: 'Emily Rose' },
      { role: 'Groomsman', name: 'Michael Brown' }
    ],
    timeline: [
      { time: '04:30 PM', title: 'Guest Arrival & Welcome Drinks', description: 'Begin the evening with a refreshing glass of champagne and live acoustic music as you settle in.' },
      { time: '05:00 PM', title: 'The Ceremony', description: "Please take your seats as we exchange our vows, wedding rings, and say 'I do' under the floral arch." },
      { time: '06:00 PM', title: 'Cocktail Hour', description: "Enjoy hors d'oeuvres, signature cocktails, and live jazz on the terrace." },
      { time: '07:30 PM', title: 'Reception Dinner & Dancing', description: 'Join us for a three-course dinner, toasts, and dancing under the stars.' }
    ]
  });

  // Countdown timer hook
  useEffect(() => {
    const timer = setInterval(() => {
      let targetDate;
      try {
        targetDate = new Date(customText.date);
        if (isNaN(targetDate.getTime())) {
          targetDate = new Date('2027-07-15T17:00:00');
        }
      } catch {
        targetDate = new Date('2027-07-15T17:00:00');
      }
      const difference = targetDate.getTime() - Date.now();
      if (difference > 0) {
        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const m = Math.floor((difference / 1000 / 60) % 60);
        const s = Math.floor((difference / 1000) % 60);
        setCountdown({ days: d, hours: h, minutes: m, seconds: s });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [customText.date]);

  const handleSelectTemplate = (template) => {
    alert(`Great choice! Template "${template.name}" has been chosen. You will proceed to payment for ${template.priceLabel} upon publishing.`);
  };

  const getDynamicTemplateName = (id, eventType) => {
    if (id === 't_arch') {
      if (eventType === 'wedding') return 'The Timeless Arch';
      if (eventType === 'birthday') return 'The Celebration Arch';
      if (eventType === 'baby') return 'The Welcome Arch';
      if (eventType === 'savethedate') return 'The Save The Date Arch';
      return 'The Keynote Arch';
    }
    if (id === 't_essential') {
      if (eventType === 'wedding') return 'The Modern Essential';
      if (eventType === 'birthday') return 'The Neon Essential';
      if (eventType === 'baby') return 'The Pastel Essential';
      if (eventType === 'savethedate') return 'The Modern Save The Date';
      return 'The Executive Essential';
    }
    if (id === 't_noir') {
      if (eventType === 'wedding') return 'The Noir Editorial';
      if (eventType === 'birthday') return 'The Midnight Lounge';
      if (eventType === 'baby') return 'The Noir Nursery';
      if (eventType === 'savethedate') return 'The Editorial Save The Date';
      return 'The Vanguard Summit';
    }
    if (id === 't_obsidian') {
      if (eventType === 'wedding') return 'The Obsidian Romance';
      if (eventType === 'birthday') return 'The Golden Gala';
      if (eventType === 'baby') return 'The Starlight Baby';
      if (eventType === 'savethedate') return 'The Imperial Save The Date';
      return 'The Obsidian Executive';
    }
    return 'VND Style';
  };

  const getDynamicPrice = (id, mode) => {
    if (id === 't_arch') return { price: 0, label: 'Free Template' };
    if (mode === 'savethedate') {
      if (id === 't_essential') return { price: 4.99, label: 'Buy $4.99' };
      if (id === 't_noir') return { price: 9.99, label: 'Buy $9.99' };
      if (id === 't_obsidian') return { price: 14.99, label: 'Buy $14.99' };
    } else {
      if (id === 't_essential') return { price: 14.99, label: 'Buy $14.99' };
      if (id === 't_noir') return { price: 29.99, label: 'Buy $29.99' };
      if (id === 't_obsidian') return { price: 49.99, label: 'Buy $49.99' };
    }
    return { price: 0, label: 'Free Template' };
  };

  const openPreview = (template) => {
    setSelectedPreset(null);
    setRsvpSuccess(false);
    setSelectedTemplate(template);
    setMobileEditorTab('edit');
    setRsvpForm({ 
      name: '', 
      attending: 'yes', 
      count: '1', 
      meal: 'beef', 
      songRequest: '', 
      genderGuess: 'boy', 
      company: '', 
      jobTitle: '',
      message: '' 
    });

    if (selectedEventType === 'savethedate') {
      setInvitationMode('savethedate');
      setActiveTab('savethedate');
      setCustomText({
        title: 'Vanessa & Noah',
        date: 'Saturday, July 15, 2027',
        location: 'Sunset Cove, Malibu, CA',
        details: 'Formal digital invitation to follow. Please save our date!',
        couplePhoto: '/couple1.png',
        dressCodeText: 'Wear formal wedding attire. We recommend earthy neutral tones and pastel shades.',
        dressColors: ['#bdc3c7', '#d4a373', '#e9c46a', '#faedcd'],
        registry: [
          { name: 'Amazon Wedding Registry', url: 'https://amazon.com' },
          { name: 'Target Gift Registry', url: 'https://target.com' }
        ],
        entourage: [
          { role: 'Maid of Honor', name: 'Juliana Smith' },
          { role: 'Best Man', name: 'James Carter' }
        ],
        timeline: [
          { time: '05:00 PM', title: 'Save the Date Ceremony', description: "Vows exchange and dinner reception under the sunset." }
        ]
      });
    } else if (selectedEventType === 'wedding') {
      setInvitationMode('full');
      setActiveTab('invite');
      setCustomText({
        title: 'Vanessa & Noah',
        date: 'Saturday, July 15, 2027',
        location: 'Sunset Cove, Malibu, CA',
        details: 'Reception to follow immediately after ceremony',
        couplePhoto: '/couple1.png',
        dressCodeText: 'Wear formal wedding attire. We recommend earthy neutral tones and pastel shades.',
        dressColors: ['#bdc3c7', '#d4a373', '#e9c46a', '#faedcd'],
        registry: [
          { name: 'Amazon Wedding Registry', url: 'https://amazon.com' },
          { name: 'Target Gift Registry', url: 'https://target.com' }
        ],
        entourage: [
          { role: 'Maid of Honor', name: 'Juliana Smith' },
          { role: 'Best Man', name: 'James Carter' },
          { role: 'Bridesmaid', name: 'Emily Rose' },
          { role: 'Groomsman', name: 'Michael Brown' }
        ],
        timeline: [
          { time: '04:30 PM', title: 'Guest Arrival & Welcome Drinks', description: 'Begin the evening with a refreshing glass of champagne and live acoustic music.' },
          { time: '05:00 PM', title: 'The Ceremony', description: "Please take your seats as we exchange our vows and say 'I do' under the floral arch." },
          { time: '06:00 PM', title: 'Cocktail Hour', description: "Enjoy hors d'oeuvres, signature cocktails, and live jazz on the terrace." },
          { time: '07:30 PM', title: 'Reception Dinner & Dancing', description: 'Join us for a three-course dinner, toasts, and dancing under the stars.' }
        ]
      });
    } else if (selectedEventType === 'birthday') {
      setInvitationMode('full');
      setActiveTab('invite');
      setCustomText({
        title: "Leo's 30th Birthday Bash",
        date: 'Friday, October 16, 2026',
        location: 'The Penthouse Lounge, New York, NY',
        details: 'Heavy appetizers, open bar, and DJ set. No gifts, just your presence and dancing shoes!',
        couplePhoto: '/birthday_party.png',
        dressCodeText: 'Dress to impress! Think chic cocktail attire with neon accents or black tie optional.',
        dressColors: ['#ff007f', '#00f0ff', '#121212', '#ffffff'],
        registry: [
          { name: 'Travel & Vacation Fund', url: 'https://paypal.me' },
          { name: 'Amazon Wishlist', url: 'https://amazon.com' }
        ],
        entourage: [
          { role: 'Co-Host', name: 'Marcus Sterling' },
          { role: 'Guest DJ', name: 'DJ Electra' },
          { role: 'VIP Guest', name: 'Aria Winters' },
          { role: 'VIP Guest', name: 'Julian Vance' }
        ],
        timeline: [
          { time: '07:00 PM', title: 'Welcome Drinks', description: 'Check-in and grab a signature birthday cocktail at the sky bar.' },
          { time: '08:30 PM', title: 'Toasts & Cake Cutting', description: 'Gather around as we celebrate Leo entering a new decade.' },
          { time: '09:00 PM', title: 'Dance Floor Opens', description: 'DJ Electra takes over with live electronic beats and club mixes.' },
          { time: '11:30 PM', title: 'Late Night Tacos', description: 'Recharge with gourmet street tacos served on the balcony.' }
        ]
      });
    } else if (selectedEventType === 'baby') {
      setInvitationMode('full');
      setActiveTab('invite');
      setCustomText({
        title: 'Baby Shower for Sarah & Dan',
        date: 'Sunday, November 8, 2026',
        location: 'The Garden Greenhouse, Chicago, IL',
        details: 'Help us celebrate the upcoming arrival of our little one! Brunch and dessert will be served.',
        couplePhoto: '/baby_shower.png',
        dressCodeText: 'Pastel garden chic. Flowy dresses, light linen suits, and floral designs are encouraged.',
        dressColors: ['#a8dadc', '#f1faee', '#e63946', '#f4a261'],
        registry: [
          { name: 'BuyBuy Baby Registry', url: 'https://buybuybaby.com' },
          { name: 'Target Baby Registry', url: 'https://target.com' }
        ],
        entourage: [
          { role: 'Hostess', name: 'Jessica Miller' },
          { role: 'Hostess', name: 'Chloe Davis' },
          { role: 'Grandmother-to-be', name: 'Helena Miller' },
          { role: 'Grandfather-to-be', name: 'Arthur Miller' }
        ],
        timeline: [
          { time: '11:00 AM', title: 'Mimosa & Waffle Bar', description: 'Enjoy non-alcoholic mocktails and fresh Belgian waffles upon arrival.' },
          { time: '12:00 PM', title: 'Baby Shower Games', description: 'Test your baby trivia knowledge and play "Guess the Baby Food".' },
          { time: '01:30 PM', title: 'Gift Opening & Cupcakes', description: 'Sarah and Dan open gifts followed by a custom bakery tower.' }
        ]
      });
    } else if (selectedEventType === 'corporate') {
      setInvitationMode('full');
      setActiveTab('invite');
      setCustomText({
        title: 'VND Tech Summit 2026',
        date: 'Thursday, September 10, 2026',
        location: 'Metropolitan Convention Center, San Francisco, CA',
        details: 'Join SaaS founders, builders, and developers for a day of keynotes, workshops, and networking.',
        couplePhoto: '/corporate_summit.png',
        dressCodeText: 'Business casual or executive smart. Company shirts and blazers are recommended.',
        dressColors: ['#0f172a', '#3b82f6', '#10b981', '#f8fafc'],
        registry: [
          { name: 'Summit Agenda PDF', url: 'https://VND.com/agenda' },
          { name: 'Sponsorship Inquiries', url: 'https://VND.com/sponsor' }
        ],
        entourage: [
          { role: 'Keynote Speaker', name: 'Dr. Evelyn Carter' },
          { role: 'Panelist', name: 'Devon Lee' },
          { role: 'Panelist', name: 'Rachel Vance' },
          { role: 'Moderator', name: 'Alan Turing Jr.' }
        ],
        timeline: [
          { time: '09:00 AM', title: 'Registration & Coffee', description: 'Pick up badge and networking package in the main hall.' },
          { time: '10:00 AM', title: 'Keynote Address', description: 'Opening address detailing AI-driven web architectures.' },
          { time: '12:00 PM', title: 'Networking Luncheon', description: 'Connect with developers over a curated hot buffet lunch.' },
          { time: '02:00 PM', title: 'Breakout Workshops', description: 'Practical coding labs focusing on modern web frameworks.' }
        ]
      });
    }
  };

  const closePreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setAudioPlaying(false);
    setSelectedPreset(null);
    setSelectedTemplate(null);
  };

  const toggleSection = (sectionName) => {
    setExpandedSection(expandedSection === sectionName ? null : sectionName);
  };

  // Preset configuration helper
  const activeBg = selectedPreset ? selectedPreset.background : selectedTemplate?.sampleBg;
  const activeAccent = selectedPreset ? selectedPreset.primary : selectedTemplate?.accentColor;

  return (
    <main className={styles.templatesLayout}>
      <div className={styles.navbarSpacer}></div>

      <div className={styles.container}>
        {/* Page Header */}
        <div className={styles.header}>
          <span className={styles.badge}>INVITATION BUILDER</span>
          <h1 className={styles.title}>
            {selectedEventType === 'wedding' ? 'Your Dream Wedding Website' :
             selectedEventType === 'birthday' ? 'Vibrant Birthday Party Invitations' :
             selectedEventType === 'baby' ? 'Adorable Baby Shower Invitations' :
             selectedEventType === 'savethedate' ? 'Premium Save the Date Teaser Cards' :
             'Professional Corporate Event Invites'}
          </h1>
          <p className={styles.subtitle}>
            Select a premium designer template, customize the content details, and track guest RSVPs in real-time.
          </p>

          {/* Event type filter tabs */}
          <div className={styles.eventTypeToggleBar}>
            <button 
              type="button" 
              onClick={() => setSelectedEventType('wedding')}
              className={`${styles.eventTypeBtn} ${selectedEventType === 'wedding' ? styles.eventTypeBtnActive : ''}`}
            >
              💍 Wedding
            </button>
            <button 
              type="button" 
              onClick={() => setSelectedEventType('savethedate')}
              className={`${styles.eventTypeBtn} ${selectedEventType === 'savethedate' ? styles.eventTypeBtnActive : ''}`}
            >
              💌 Save the Date
            </button>
            <button 
              type="button" 
              onClick={() => setSelectedEventType('birthday')}
              className={`${styles.eventTypeBtn} ${selectedEventType === 'birthday' ? styles.eventTypeBtnActive : ''}`}
            >
              🎉 Birthday Party
            </button>
            <button 
              type="button" 
              onClick={() => setSelectedEventType('baby')}
              className={`${styles.eventTypeBtn} ${selectedEventType === 'baby' ? styles.eventTypeBtnActive : ''}`}
            >
              🍼 Baby Shower
            </button>
            <button 
              type="button" 
              onClick={() => setSelectedEventType('corporate')}
              className={`${styles.eventTypeBtn} ${selectedEventType === 'corporate' ? styles.eventTypeBtnActive : ''}`}
            >
              💼 Corporate Event
            </button>
          </div>
        </div>

        {/* Templates Grid */}
        <div className={styles.templatesGrid}>
          {TEMPLATES.map((tpl) => (
            <div 
              key={tpl.id} 
              className={`${styles.templateCard} ${
                tpl.id === 't_essential' ? styles.templateCard_modern :
                tpl.id === 't_noir' ? styles.templateCard_noir :
                tpl.id === 't_obsidian' ? styles.templateCard_obsidian : ''
              }`}
              style={{ position: 'relative' }}
            >
              {/* Premium Badge Overlay */}
              {tpl.id !== 't_arch' && (
                <div className={`${styles.cardPremiumBadge} ${
                  tpl.id === 't_essential' ? styles.badgeModern :
                  tpl.id === 't_noir' ? styles.badgeNoir :
                  tpl.id === 't_obsidian' ? styles.badgeObsidian : ''
                }`}>
                  {tpl.id === 't_essential' ? 'Chic Choice' :
                   tpl.id === 't_noir' ? 'Vogue Editorial' :
                   tpl.id === 't_obsidian' ? 'VIP Imperial' : ''}
                </div>
              )}

              <div 
                className={styles.cardPreviewBanner}
                style={{ background: tpl.sampleBg }}
              >
                <div className={styles.cardPreviewContent} style={{ color: tpl.accentColor }}>
                  <span className={styles.cardPreviewTitle} style={{ fontFamily: tpl.font }}>
                    {getDynamicTemplateName(tpl.id, selectedEventType)}
                  </span>
                  <span className={styles.cardPreviewSub}>
                    {selectedEventType === 'wedding' ? 'Save the Date' :
                     selectedEventType === 'birthday' ? 'Time to Party' :
                     selectedEventType === 'baby' ? 'Welcome Baby' : 'Tech Summit'}
                  </span>
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.cardHeaderRow}>
                  <h3 className={styles.cardTitle}>{getDynamicTemplateName(tpl.id, selectedEventType)}</h3>
                  <span className={`${styles.priceTag} ${styles.pricePaid}`}>
                    {getDynamicPrice(tpl.id, selectedEventType === 'savethedate' ? 'savethedate' : 'full').label}
                  </span>
                </div>
                <p className={styles.cardStyleText}>{tpl.style}</p>

                {/* Features list */}
                <ul className={styles.cardFeatureList}>
                  {tpl.features.map((feat, index) => (
                    <li key={index} className={styles.cardFeatureItem}>
                      <span className={styles.featureBullet}>✓</span> {feat}
                    </li>
                  ))}
                </ul>

                <div className={styles.vibeRow}>
                  <span className={styles.vibeLabel}>Vibe:</span>
                  <span className={styles.vibeValue}>{tpl.vibe}</span>
                </div>

                <div className={styles.btnRow}>
                  <button 
                    onClick={() => {
                      setActiveTab('invite');
                      setRsvpSuccess(false);
                      openPreview(tpl);
                    }}
                    className={styles.btnOutline}
                  >
                    🔍 Preview Template
                  </button>
                  <button 
                    onClick={() => handleSelectTemplate(tpl)}
                    className={styles.btnPrimary}
                  >
                    Buy & Customize
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Simulated Phone Invitation Preview Modal */}
      {selectedTemplate && (
        <div className={styles.modalOverlay} onClick={closePreview}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={closePreview}>×</button>
            
            {/* Mobile-only switcher tabs for small screen viewports */}
            <div className={styles.modalMobileTabs}>
              <button
                type="button"
                className={`${styles.mobileTabToggle} ${mobileEditorTab === 'edit' ? styles.mobileTabToggleActive : ''}`}
                onClick={() => setMobileEditorTab('edit')}
              >
                ✏️ Edit Details
              </button>
              <button
                type="button"
                className={`${styles.mobileTabToggle} ${mobileEditorTab === 'preview' ? styles.mobileTabToggleActive : ''}`}
                onClick={() => setMobileEditorTab('preview')}
              >
                👁️ Live Preview
              </button>
            </div>

            {/* Modal Layout splits into On-screen customization editor & simulated phone mockup */}
            <div className={styles.modalBody}>
              {/* Left Column: Editor controls */}
              <div className={`${styles.editorPanel} ${mobileEditorTab === 'edit' ? styles.mobileActive : styles.mobileHidden}`}>
                <h3 className={styles.editorTitle}>Live Editor</h3>
                <p className={styles.editorSubtitle}>Customize the text details displayed in the mobile mockup on the right.</p>

                {/* Invitation Mode Toggle */}
                <div className={styles.editorGroup} style={{ marginBottom: '20px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <label className={styles.editorLabel} style={{ display: 'block', marginBottom: '8px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#c9a96e' }}>
                    Select Builder Mode
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setInvitationMode('full');
                        setActiveTab('invite');
                      }}
                      className={`${styles.eventTypeBtn} ${invitationMode === 'full' ? styles.eventTypeBtnActive : ''}`}
                      style={{ flex: 1, padding: '8px 12px', fontSize: '0.75rem', borderRadius: '8px' }}
                    >
                      💍 Full Website
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInvitationMode('savethedate');
                        setActiveTab('savethedate');
                      }}
                      className={`${styles.eventTypeBtn} ${invitationMode === 'savethedate' ? styles.eventTypeBtnActive : ''}`}
                      style={{ flex: 1, padding: '8px 12px', fontSize: '0.75rem', borderRadius: '8px' }}
                    >
                      💌 Save the Date Teaser
                    </button>
                  </div>

                  {/* Mode Info Cards */}
                  <div style={{ marginTop: '10px', fontSize: '0.7rem', color: '#a0937d', background: 'rgba(0,0,0,0.15)', padding: '10px', borderRadius: '8px', borderLeft: `3px solid ${activeAccent || '#c9a96e'}`, lineHeight: '1.4' }}>
                    {invitationMode === 'savethedate' ? (
                      <p>
                        <strong>💌 Save the Date Teaser Mode</strong>: Best used immediately upon date confirmation. Gathers guest emails for the official launch, schedules Google Calendar reminders, and displays a live countdown.
                      </p>
                    ) : (
                      <p>
                        <strong>💍 Full Invitation Website Mode</strong>: Best used once the venue is finalized. Collects detailed RSVP preferences, dinner menu selections, wishlists, schedule timelines, and entourage roles.
                      </p>
                    )}
                  </div>
                </div>

                {/* 0. Premium Custom Color Theme presets selector */}
                {selectedTemplate.id !== 't_arch' && (
                  <div className={styles.accordionGroup}>
                    <div className={styles.accordionHeader} style={{ background: 'rgba(201, 169, 110, 0.08)' }}>
                      <span>🎨 Premium Color Preset Customizer</span>
                    </div>
                    <div className={styles.accordionBody}>
                      <span className={styles.editorLabel}>Select Luxury Color Theme</span>
                      <div className={styles.themePresetsRow}>
                        {THEME_PALETTES.map((pal) => (
                          <button
                            key={pal.id}
                            type="button"
                            className={`${styles.themePresetBubble} ${selectedPreset?.id === pal.id ? styles.themePresetBubbleActive : ''}`}
                            style={{ backgroundColor: pal.primary }}
                            onClick={() => setSelectedPreset(pal)}
                            title={pal.label}
                          />
                        ))}
                        <button
                          type="button"
                          className={`${styles.btnOutline} ${!selectedPreset ? styles.themePresetBubbleActive : ''}`}
                          style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '20px' }}
                          onClick={() => setSelectedPreset(null)}
                        >
                          Reset Default
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Accordion 1: General Details */}
                <div className={styles.accordionGroup}>
                  <div className={styles.accordionHeader} onClick={() => toggleSection('general')}>
                    <span>📋 General Details</span>
                    <span>{expandedSection === 'general' ? '▼' : '▶'}</span>
                  </div>
                  {expandedSection === 'general' && (
                    <div className={styles.accordionBody}>
                      <div className={styles.editorGroup}>
                        <label className={styles.editorLabel}>Invitation Names</label>
                        <div className={styles.inputWithAi}>
                          <input 
                            type="text" 
                            value={customText.title}
                            onChange={(e) => setCustomText(prev => ({ ...prev, title: e.target.value }))}
                            className={styles.editorInput}
                            style={{ flex: 1 }}
                          />
                          <button 
                            type="button" 
                            onClick={() => handleAICopywrite('title')} 
                            className={styles.aiWordingBtn}
                            title="AI Copywriter Sparkle Wording"
                          >
                            {aiLoadingField === 'title' ? (
                              <span className={`${styles.aiGenerating} ${styles.aiGenerating}`} style={{ display: 'inline-block' }}>✨</span>
                            ) : '✨'}
                          </button>
                        </div>
                      </div>

                      <div className={styles.editorGroup}>
                        <label className={styles.editorLabel}>Select Couple Photo</label>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                          {['/couple1.png', '/couple2.png', '/couple3.png'].map((path, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setCustomText(prev => ({ ...prev, couplePhoto: path }))}
                              style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '8px',
                                border: customText.couplePhoto === path ? '2px solid #c9a96e' : '1px solid #444',
                                backgroundImage: `url(${path})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                cursor: 'pointer',
                                padding: 0
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className={styles.editorGroup}>
                        <label className={styles.editorLabel}>Wedding Date</label>
                        <input 
                          type="text" 
                          value={customText.date}
                          onChange={(e) => setCustomText(prev => ({ ...prev, date: e.target.value }))}
                          className={styles.editorInput}
                        />
                      </div>

                      <div className={styles.editorGroup}>
                        <label className={styles.editorLabel}>Location</label>
                        <input 
                          type="text" 
                          value={customText.location}
                          onChange={(e) => setCustomText(prev => ({ ...prev, location: e.target.value }))}
                          className={styles.editorInput}
                        />
                      </div>

                      <div className={styles.editorGroup}>
                        <label className={styles.editorLabel}>Ceremony Details</label>
                        <div className={styles.inputWithAi}>
                          <textarea 
                            value={customText.details}
                            onChange={(e) => setCustomText(prev => ({ ...prev, details: e.target.value }))}
                            className={styles.editorInput}
                            style={{ flex: 1, minHeight: '60px', resize: 'vertical' }}
                          />
                          <button 
                            type="button" 
                            onClick={() => handleAICopywrite('details')} 
                            className={styles.aiWordingBtn}
                            title="AI Copywriter Sparkle Wording"
                          >
                            {aiLoadingField === 'details' ? (
                              <span className={`${styles.aiGenerating} ${styles.aiGenerating}`} style={{ display: 'inline-block' }}>✨</span>
                            ) : '✨'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Accordion 2: Dress Code */}
                {selectedTemplate.id !== 't_arch' && (
                  <div className={styles.accordionGroup}>
                    <div className={styles.accordionHeader} onClick={() => toggleSection('dress')}>
                      <span>👗 Dress Code</span>
                      <span>{expandedSection === 'dress' ? '▼' : '▶'}</span>
                    </div>
                    {expandedSection === 'dress' && (
                      <div className={styles.accordionBody}>
                        <div className={styles.editorGroup}>
                          <label className={styles.editorLabel}>Attire Guidelines</label>
                          <div className={styles.inputWithAi}>
                            <textarea 
                              value={customText.dressCodeText}
                              onChange={(e) => setCustomText(prev => ({ ...prev, dressCodeText: e.target.value }))}
                              className={styles.editorInput}
                              style={{ flex: 1, minHeight: '60px', resize: 'vertical' }}
                            />
                            <button 
                              type="button" 
                              onClick={() => handleAICopywrite('dressCodeText')} 
                              className={styles.aiWordingBtn}
                              title="AI Copywriter Sparkle Wording"
                            >
                              {aiLoadingField === 'dressCodeText' ? (
                                <span className={`${styles.aiGenerating} ${styles.aiGenerating}`} style={{ display: 'inline-block' }}>✨</span>
                              ) : '✨'}
                            </button>
                          </div>
                        </div>

                        <div className={styles.editorGroup}>
                          <label className={styles.editorLabel}>Color Swatches (Hex Codes)</label>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                            {customText.dressColors.map((color, idx) => (
                              <input
                                key={idx}
                                type="text"
                                value={color}
                                onChange={(e) => {
                                  const newColors = [...customText.dressColors];
                                  newColors[idx] = e.target.value;
                                  setCustomText(prev => ({ ...prev, dressColors: newColors }));
                                }}
                                className={styles.editorInput}
                                style={{ width: '65px', padding: '6px', textAlign: 'center', fontSize: '0.8rem' }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Accordion 3: Gift Registry */}
                {selectedTemplate.id !== 't_arch' && (
                  <div className={styles.accordionGroup}>
                    <div className={styles.accordionHeader} onClick={() => toggleSection('registry')}>
                      <span>🎁 Registries</span>
                      <span>{expandedSection === 'registry' ? '▼' : '▶'}</span>
                    </div>
                    {expandedSection === 'registry' && (
                      <div className={styles.accordionBody}>
                        {customText.registry.map((reg, idx) => (
                          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                            <span style={{ fontSize: '0.75rem', color: '#c9a96e', fontWeight: 'bold' }}>Link {idx + 1}</span>
                            <input
                              type="text"
                              placeholder="Store Name"
                              value={reg.name}
                              onChange={(e) => {
                                      const newRegistry = [...customText.registry];
                                      newRegistry[idx].name = e.target.value;
                                      setCustomText(prev => ({ ...prev, registry: newRegistry }));
                              }}
                              className={styles.editorInput}
                              style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                            />
                            <input
                              type="text"
                              placeholder="Link URL"
                              value={reg.url}
                              onChange={(e) => {
                                      const newRegistry = [...customText.registry];
                                      newRegistry[idx].url = e.target.value;
                                      setCustomText(prev => ({ ...prev, registry: newRegistry }));
                              }}
                              className={styles.editorInput}
                              style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Accordion 4: Entourage */}
                {selectedTemplate.id !== 't_arch' && selectedTemplate.id !== 't_essential' && (
                  <div className={styles.accordionGroup}>
                    <div className={styles.accordionHeader} onClick={() => toggleSection('party')}>
                      <span>👥 Entourage</span>
                      <span>{expandedSection === 'party' ? '▼' : '▶'}</span>
                    </div>
                    {expandedSection === 'party' && (
                      <div className={styles.accordionBody}>
                        {customText.entourage.map((member, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
                            <input
                              type="text"
                              value={member.role}
                              placeholder="Role"
                              onChange={(e) => {
                                const newEnt = [...customText.entourage];
                                newEnt[idx].role = e.target.value;
                                setCustomText(prev => ({ ...prev, entourage: newEnt }));
                              }}
                              className={styles.editorInput}
                              style={{ flex: 1, padding: '6px 10px', fontSize: '0.8rem' }}
                            />
                            <input
                              type="text"
                              value={member.name}
                              placeholder="Name"
                              onChange={(e) => {
                                const newEnt = [...customText.entourage];
                                newEnt[idx].name = e.target.value;
                                setCustomText(prev => ({ ...prev, entourage: newEnt }));
                              }}
                              className={styles.editorInput}
                              style={{ flex: 1.5, padding: '6px 10px', fontSize: '0.8rem' }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Accordion 5: Timeline */}
                <div className={styles.accordionGroup}>
                  <div className={styles.accordionHeader} onClick={() => toggleSection('timeline')}>
                    <span>📅 Timeline scheduler</span>
                    <span>{expandedSection === 'timeline' ? '▼' : '▶'}</span>
                  </div>
                  {expandedSection === 'timeline' && (
                    <div className={styles.accordionBody}>
                      {customText.timeline.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                          <span style={{ fontSize: '0.75rem', color: '#c9a96e', fontWeight: 'bold' }}>Event {idx + 1}</span>
                          <input
                            type="text"
                            value={item.time}
                            placeholder="Time"
                            onChange={(e) => {
                              const newTimeline = [...customText.timeline];
                              newTimeline[idx].time = e.target.value;
                              setCustomText(prev => ({ ...prev, timeline: newTimeline }));
                            }}
                            className={styles.editorInput}
                            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                          />
                          <input
                            type="text"
                            value={item.title}
                            placeholder="Event Title"
                            onChange={(e) => {
                              const newTimeline = [...customText.timeline];
                              newTimeline[idx].title = e.target.value;
                              setCustomText(prev => ({ ...prev, timeline: newTimeline }));
                            }}
                            className={styles.editorInput}
                            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                          />
                          <textarea
                            value={item.description}
                            placeholder="Description"
                            onChange={(e) => {
                              const newTimeline = [...customText.timeline];
                              newTimeline[idx].description = e.target.value;
                              setCustomText(prev => ({ ...prev, timeline: newTimeline }));
                            }}
                            className={styles.editorInput}
                            style={{ padding: '6px 10px', fontSize: '0.8rem', minHeight: '40px' }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Accordion 6: Background Music Configuration */}
                {selectedTemplate.id !== 't_arch' && selectedTemplate.id !== 't_essential' && (
                  <div className={styles.accordionGroup}>
                    <div className={styles.accordionHeader} onClick={() => toggleSection('audio')}>
                      <span>🎵 Background Music Settings</span>
                      <span>{expandedSection === 'audio' ? '▼' : '▶'}</span>
                    </div>
                    {expandedSection === 'audio' && (
                      <div className={styles.accordionBody}>
                        <div className={styles.editorGroup}>
                          <label className={styles.editorLabel}>Select Soundtrack</label>
                          <select
                            value={selectedTrack}
                            onChange={(e) => setSelectedTrack(e.target.value)}
                            className={styles.editorInput}
                            style={{
                              background: '#1a1a2e',
                              color: '#fff',
                              padding: '10px',
                              border: '1px solid rgba(201,169,110,0.2)'
                            }}
                          >
                            <option value="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3">Track 1 — Romance Classical (Acoustic Piano)</option>
                            <option value="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3">Track 2 — Forest Whisper (Acoustic Guitar)</option>
                            <option value="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3">Track 3 — Dreamy Sunset (Soft Strings)</option>
                            <option value="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3">Track 4 — Evening Lounge (Jazz Saxophone)</option>
                          </select>
                          <button
                            type="button"
                            onClick={togglePlayAudio}
                            className={styles.editorPublishBtn}
                            style={{
                              marginTop: '8px',
                              padding: '10px',
                              fontSize: '0.8rem',
                              background: audioPlaying ? 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)' : '',
                              color: '#fff'
                            }}
                          >
                            {audioPlaying ? '⏸ Stop Audio Test' : '▶ Play Audio Test'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Innovative RSVP Feed Dashboard (Real-time tracker) */}
                {invitationMode === 'full' && (
                  <div className={styles.rsvpFeedSection}>
                    <h4 className={styles.rsvpFeedTitle}>
                      <span>📬</span> Live Guest RSVP Feed (Real-Time Tracker)
                    </h4>

                    {/* Event-specific Poll summary */}
                    {selectedEventType === 'baby' && rsvpFeed.length > 0 && (
                      <div className={styles.genderPollContainer}>
                        <div className={styles.genderPollHeader}>
                          <strong>👶 Gender Guess Results:</strong>
                        </div>
                        {(() => {
                          const boyVotes = rsvpFeed.filter(r => r.genderGuess === 'boy').length;
                          const girlVotes = rsvpFeed.filter(r => r.genderGuess === 'girl').length;
                          const surpriseVotes = rsvpFeed.filter(r => r.genderGuess === 'surprise').length;
                          const totalVotes = boyVotes + girlVotes + surpriseVotes;
                          const boyPct = totalVotes > 0 ? Math.round((boyVotes / totalVotes) * 100) : 0;
                          const girlPct = totalVotes > 0 ? Math.round((girlVotes / totalVotes) * 100) : 0;
                          const surprisePct = totalVotes > 0 ? Math.round((surpriseVotes / totalVotes) * 100) : 0;
                          return (
                            <div style={{ marginTop: '6px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
                                <span style={{ color: '#8ecae6' }}>Boy: {boyVotes} ({boyPct}%)</span>
                                <span style={{ color: '#ffb703' }}>Surprise: {surpriseVotes} ({surprisePct}%)</span>
                                <span style={{ color: '#ffb5a7' }}>Girl: {girlVotes} ({girlPct}%)</span>
                              </div>
                              <div className={styles.genderPollTrack}>
                                <div className={styles.genderPollBarBoy} style={{ width: `${boyPct}%` }}></div>
                                <div className={styles.genderPollBarSurprise} style={{ width: `${surprisePct}%` }}></div>
                                <div className={styles.genderPollBarGirl} style={{ width: `${girlPct}%` }}></div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    <div className={styles.rsvpFeedList}>
                      {rsvpFeed.length === 0 ? (
                        <div className={styles.rsvpFeedEmpty}>
                          No guest submissions received yet. Fill out the RSVP form on the simulated phone mockup to watch this dashboard update.
                        </div>
                      ) : (
                        [...rsvpFeed].reverse().map((rsvp, idx) => (
                          <div key={idx} className={styles.rsvpFeedItem}>
                            <div className={styles.rsvpFeedHeader}>
                              <span>{rsvp.name}</span>
                              <span className={rsvp.attending === 'yes' ? styles.rsvpStatusAttending : styles.rsvpStatusDeclined}>
                                {rsvp.attending === 'yes' ? 'Attending' : 'Declined'}
                              </span>
                            </div>
                            <span className={styles.rsvpFeedMeal}>
                              {selectedEventType === 'wedding' && `Guests: ${rsvp.count} | Meal: ${rsvp.meal === 'beef' ? 'Filet Mignon' : rsvp.meal === 'salmon' ? 'Salmon' : 'Risotto'}`}
                              {selectedEventType === 'birthday' && `Guests: ${rsvp.count} | 🎵 Requested: "${rsvp.songRequest || 'None'}"`}
                              {selectedEventType === 'baby' && `Guests: ${rsvp.count} | 👶 Guess: ${rsvp.genderGuess === 'boy' ? 'Boy' : rsvp.genderGuess === 'girl' ? 'Girl' : 'Surprise'}`}
                              {selectedEventType === 'corporate' && `Company: ${rsvp.company || 'N/A'} | Title: ${rsvp.jobTitle || 'N/A'}`}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Save the Date Mailing List Subscription Feed */}
                {invitationMode === 'savethedate' && (
                  <div className={styles.rsvpFeedSection}>
                    <h4 className={styles.rsvpFeedTitle}>
                      <span>📬</span> Save the Date Mailing List ({subscribersFeed.length})
                    </h4>
                    <div className={styles.rsvpFeedList}>
                      {subscribersFeed.length === 0 ? (
                        <div className={styles.rsvpFeedEmpty}>
                          No subscriber registrations received yet. Enter your email in the subscription box on the mockup to watch this list populate.
                        </div>
                      ) : (
                        [...subscribersFeed].reverse().map((sub, idx) => (
                          <div key={idx} className={styles.rsvpFeedItem} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                            <div className={styles.rsvpFeedHeader}>
                              <span style={{ fontSize: '0.8rem', color: '#fff', wordBreak: 'break-all' }}>{sub.email}</span>
                              <span style={{ fontSize: '0.65rem', color: '#888' }}>{sub.date}</span>
                            </div>
                            <span style={{ fontSize: '0.65rem', color: '#c9a96e' }}>
                              Registered for Teaser notifications
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                <button 
                  onClick={() => {
                    handleSelectTemplate(selectedTemplate);
                    closePreview();
                  }}
                  className={styles.editorPublishBtn}
                >
                  Confirm & Buy ({getDynamicPrice(selectedTemplate.id, invitationMode).label})
                </button>
              </div>

              {/* Right Column: Simulated Phone Shell */}
              <div className={`${styles.phoneColumn} ${mobileEditorTab === 'preview' ? styles.mobileActive : styles.mobileHidden}`}>
                <div className={styles.phoneContainer}>
                  <div className={styles.phoneNotch}></div>
                  
                  <div 
                    className={`${styles.phoneScreen} ${
                      selectedTemplate.id === 't_arch' ? styles.archScreen :
                      selectedTemplate.id === 't_essential' ? styles.modernScreen :
                      selectedTemplate.id === 't_noir' ? styles.noirScreen :
                      selectedTemplate.id === 't_obsidian' ? styles.obsidianScreen : ''
                    } ${audioPlaying ? styles.audioPlaying : ''}`}
                    style={{ 
                      background: activeBg,
                      color: selectedTemplate.id === 't_noir' ? '#f5f0e8' : selectedTemplate.id === 't_obsidian' ? activeAccent : '#333333',
                      fontFamily: selectedTemplate.font
                    }}
                  >
                    {/* Hidden Audio Player */}
                    <audio 
                      ref={audioRef} 
                      src={selectedTrack} 
                      preload="auto" 
                      loop 
                    />

                    {/* Active Tab rendering */}
                    {activeTab === 'savethedate' && (
                      <div className={styles.savethedateContainer} style={{ fontFamily: selectedTemplate.font }}>
                        {/* Teaser Header/Crest */}
                        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '2px', color: activeAccent, fontWeight: 'bold' }}>
                            Save the Date
                          </span>
                          <div style={{ width: '40px', height: '1px', background: 'rgba(255,255,255,0.15)', margin: '8px auto' }}></div>
                        </div>

                        {/* Image Frame */}
                        <div style={{ borderRadius: selectedTemplate.id === 't_arch' ? '120px 120px 0 0' : '12px', overflow: 'hidden', border: `1px solid ${activeAccent}`, margin: '0 auto 16px', width: '85%', aspectRatio: '4/5', position: 'relative' }}>
                          <img 
                            src={customText.couplePhoto} 
                            alt="Teaser Poster" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                        </div>

                        {/* Text Content */}
                        <div style={{ textAlign: 'center', padding: '0 12px' }}>
                          <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '8px', lineHeight: '1.2' }}>
                            {customText.title}
                          </h2>
                          <p style={{ fontSize: '0.8rem', color: '#a0937d', fontStyle: 'italic', marginBottom: '16px' }}>
                            Are getting married!
                          </p>
                          
                          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px', marginBottom: '20px' }}>
                            <span style={{ display: 'block', fontSize: '0.65rem', color: activeAccent, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                              THE DATE
                            </span>
                            <span style={{ display: 'block', fontSize: '0.95rem', color: '#fff', fontWeight: 'bold' }}>
                              {customText.date}
                            </span>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: '#888', marginTop: '2px' }}>
                              {customText.location}
                            </span>
                          </div>
                        </div>

                        {/* Real-time Ticking Countdown Timer */}
                        <div className={styles.countdownContainer} style={{ borderColor: 'rgba(201,169,110,0.2)' }}>
                          <div className={styles.countdownBlock}>
                            <span className={styles.countdownNumber} style={{ color: activeAccent }}>{countdown.days}</span>
                            <span className={styles.countdownLabel}>Days</span>
                          </div>
                          <div className={styles.countdownBlock}>
                            <span className={styles.countdownNumber} style={{ color: activeAccent }}>{countdown.hours}</span>
                            <span className={styles.countdownLabel}>Hours</span>
                          </div>
                          <div className={styles.countdownBlock}>
                            <span className={styles.countdownNumber} style={{ color: activeAccent }}>{countdown.minutes}</span>
                            <span className={styles.countdownLabel}>Mins</span>
                          </div>
                          <div className={styles.countdownBlock}>
                            <span className={styles.countdownNumber} style={{ color: activeAccent }}>{countdown.seconds}</span>
                            <span className={styles.countdownLabel}>Secs</span>
                          </div>
                        </div>

                        {/* Add to Calendar Link Button */}
                        <div style={{ textAlign: 'center', margin: '20px 0' }}>
                          <a 
                            href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(customText.title)}&dates=20261120T170000Z/20261120T220000Z&details=${encodeURIComponent(customText.details)}&location=${encodeURIComponent(customText.location)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.calendarReminderBtn}
                            style={{ borderColor: activeAccent }}
                          >
                            📅 Add to Google Calendar
                          </a>
                        </div>

                        {/* Teaser Email subscription registration */}
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', margin: '0 12px 10px' }}>
                          <h4 style={{ fontSize: '0.8rem', color: '#fff', marginBottom: '6px', textAlign: 'center' }}>
                            Join Mailing List
                          </h4>
                          <p style={{ fontSize: '0.65rem', color: '#888', marginBottom: '12px', textAlign: 'center' }}>
                            Subscribe to receive the formal digital invitation and RSVP access once published!
                          </p>

                          {subscriberSuccess ? (
                            <div style={{ fontSize: '0.75rem', color: '#2ecc71', textAlign: 'center', padding: '6px', background: 'rgba(46,204,113,0.1)', borderRadius: '6px' }}>
                              🎉 Subscribed! We will keep you updated.
                            </div>
                          ) : (
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                if (subscriberEmail.trim()) {
                                  setSubscribersFeed(prev => [...prev, { email: subscriberEmail, date: new Date().toLocaleTimeString() }]);
                                  setSubscriberSuccess(true);
                                  setSubscriberEmail('');
                                  setTimeout(() => setSubscriberSuccess(false), 4000);
                                }
                              }}
                              className={styles.emailCollectorForm}
                            >
                              <input 
                                type="email" 
                                placeholder="your.email@domain.com"
                                value={subscriberEmail}
                                onChange={(e) => setSubscriberEmail(e.target.value)}
                                className={styles.emailCollectorInput}
                                required
                              />
                              <button 
                                type="submit" 
                                className={styles.emailCollectorBtn}
                                style={{ backgroundColor: activeAccent }}
                              >
                                Notify Me
                              </button>
                            </form>
                          )}
                        </div>
                      </div>
                    )}

                    {activeTab === 'invite' && (
                      selectedTemplate.id === 't_arch' ? (
                        <div className={styles.VNDInviteContainer}>
                          {/* Header Arched Banner */}
                          <div className={styles.VNDHeroSection}>
                            <div className={styles.VNDArcTextWrapper}>
                              <svg viewBox="0 0 220 110" className={styles.VNDArcSvg}>
                                <path id="curvePath" d="M 25,95 A 85,85 0 0,1 195,95" fill="none" />
                                <text className={styles.VNDArcText}>
                                  <textPath href="#curvePath" startOffset="50%" textAnchor="middle">
                                    YOU'RE CORDIALLY INVITED
                                  </textPath>
                                </text>
                              </svg>
                            </div>
                            
                            <div className={styles.VNDArchedImageFrame}>
                              <img 
                                src={customText.couplePhoto} 
                                alt="Couple" 
                                className={styles.VNDCouplePhoto} 
                              />
                            </div>
                          </div>

                          {/* Audio Waveform Section */}
                          <div className={styles.VNDWaveformSection}>
                            <div className={styles.waveformIcon}>
                              <span className={`${styles.waveBar} ${styles.waveBar1}`}></span>
                              <span className={`${styles.waveBar} ${styles.waveBar2}`}></span>
                              <span className={`${styles.waveBar} ${styles.waveBar3}`}></span>
                              <span className={`${styles.waveBar} ${styles.waveBar4}`}></span>
                              <span className={`${styles.waveBar} ${styles.waveBar5}`}></span>
                              <span className={`${styles.waveBar} ${styles.waveBar6}`}></span>
                              <span className={`${styles.waveBar} ${styles.waveBar7}`}></span>
                              <span className={`${styles.waveBar} ${styles.waveBar8}`}></span>
                              <span className={`${styles.waveBar} ${styles.waveBar9}`}></span>
                            </div>
                            <span className={styles.VNDWaveformSubtitle}>
                              TO SHARE IN THE CELEBRATION OF
                            </span>
                            <h2 className={styles.VNDCoupleNames}>
                              {customText.title}
                            </h2>
                          </div>

                          {/* Arched Date Section */}
                          <div className={styles.VNDDateSection}>
                            <div className={styles.VNDDateArchFrame}>
                              <span className={styles.VNDJoinUs}>JOIN US ON</span>
                              <span className={styles.VNDDateLarge}>11.20.2026</span>
                              <div className={styles.VNDDetailsBlock}>
                                <p className={styles.VNDTimeDetails}>{customText.details}</p>
                                <p className={styles.VNDLocationDetails}>{customText.location}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : selectedTemplate.id === 't_essential' ? (
                        <div className={styles.modernInviteContainer}>
                          <span className={styles.modernOverline}>You are cordially invited</span>
                          <h2 className={styles.modernCoupleNames}>{customText.title}</h2>
                          <span className={styles.modernSaveTheDate}>Save The Date</span>
                          <div className={styles.modernCoupleFrame}>
                            <img src={customText.couplePhoto} alt="Couple" className={styles.modernCouplePhoto} />
                          </div>

                          {/* Integrated Audio Player Mockup */}
                          <div className={styles.modernMusicPlayer} onClick={togglePlayAudio} style={{ cursor: 'pointer' }}>
                            <div className={styles.modernPlayBtn}>
                              {audioPlaying ? '⏸' : '▶'}
                            </div>
                            <div className={styles.modernMusicDetails}>
                              <span className={styles.modernMusicTitle}>Acoustic Love</span>
                              <span className={styles.modernMusicTrack}>{audioPlaying ? 'Now Playing' : 'Click to Play'}</span>
                              <div className={styles.modernMusicProgress}>
                                <div className={styles.modernMusicProgressBar} style={{ width: audioPlaying ? '70%' : '10%', transition: 'width 10s linear' }}></div>
                              </div>
                            </div>
                          </div>

                          <div className={styles.modernDetailsCard}>
                            <p className={styles.modernDate}>{customText.date}</p>
                            <p className={styles.modernLocation}>{customText.location}</p>
                            <p className={styles.modernSubtitleText}>{customText.details}</p>
                          </div>
                        </div>
                      ) : selectedTemplate.id === 't_noir' ? (
                        <div className={styles.noirInviteContainer}>
                          <div className={styles.noirMagazineHeader}>
                            <span className={styles.noirBrandTitle}>VND MAGAZINE</span>
                            <h2 className={styles.noirCoupleHeading}>{customText.title.replace(' & ', ' \u0026 ')}</h2>
                            <div className={styles.noirSubheaderRow}>
                              <span>Wedding Special Edition</span>
                              <span>July 2027</span>
                            </div>
                          </div>

                          <div className={styles.noirFullBleedFrame}>
                            <img src={customText.couplePhoto} alt="Couple" className={styles.noirCouplePhotoFull} />
                            <div className={styles.noirMagazineOverlay}>
                              <span className={styles.noirVolumeText}>Vol. XIV No. 3</span>
                              <p className={styles.noirHeadlineText}>Vows exchange in Malibu, followed by a formal reception dinner.</p>
                            </div>
                          </div>

                          <div className={styles.noirVinylSection} onClick={togglePlayAudio} style={{ cursor: 'pointer' }}>
                            <div className={styles.noirVinylContainer}>
                              <div className={`${styles.noirVinylRecord} ${audioPlaying ? styles.vinylPlaying : ''}`}></div>
                            </div>
                            <div className={styles.noirAudioInfo}>
                              <span className={styles.noirAudioStatus}>{audioPlaying ? 'Now Spinning' : 'Click to Spin & Play'}</span>
                              <span className={styles.noirAudioTrack}>01. First Dance - L-O-V-E</span>
                            </div>
                          </div>

                          <div className={styles.noirPlaylistGrid}>
                            <div className={`${styles.noirPlaylistItem} ${audioPlaying ? styles.noirPlaylistItemActive : ''}`}>
                              <span>01. First Dance (L-O-V-E)</span>
                              <span>3:24</span>
                            </div>
                            <div className={styles.noirPlaylistItem}>
                              <span>02. Ceremony (Clair de Lune)</span>
                              <span>4:15</span>
                            </div>
                            <div className={styles.noirPlaylistItem}>
                              <span>03. Reception (Cocktail Jazz)</span>
                              <span>24:00</span>
                            </div>
                          </div>

                          <div className={styles.noirDetailsSection}>
                            <div className={styles.noirDetailsItem}>
                              <span className={styles.noirDetailsLabel}>Date</span>
                              <span className={styles.noirDetailsVal}>{customText.date}</span>
                            </div>
                            <div className={styles.noirDetailsItem}>
                              <span className={styles.noirDetailsLabel}>Location</span>
                              <span className={styles.noirDetailsVal}>{customText.location}</span>
                            </div>
                            <div className={styles.noirDetailsItem}>
                              <span className={styles.noirDetailsLabel}>Timeline Info</span>
                              <span className={styles.noirDetailsVal}>{customText.details}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className={styles.obsidianInviteContainer}>
                          <div className={styles.obsidianGoldCrest}>
                            V ⚜ N
                          </div>
                          <span className={styles.obsidianOverline}>Imperial Invitation</span>
                          <h2 className={styles.obsidianCoupleNames}>{customText.title}</h2>
                          
                          <div className={styles.obsidianGildedFrame}>
                            <div className={styles.obsidianLargePhotoWrapper}>
                              <img src={customText.couplePhoto} alt="Couple" className={styles.obsidianPhoto} />
                            </div>
                            <div className={styles.obsidianSmallPhotoWrapper}>
                              <img src="/couple2.png" alt="Detail 1" className={styles.obsidianPhoto} />
                            </div>
                            <div className={styles.obsidianSmallPhotoWrapper}>
                              <img src="/couple3.png" alt="Detail 2" className={styles.obsidianPhoto} />
                            </div>
                          </div>

                          {/* Dynamic Audio Visualizer */}
                          <div className={styles.obsidianAudioVisualizer} onClick={togglePlayAudio} style={{ cursor: 'pointer' }}>
                            <div className={styles.obsidianVisualizerRow}>
                              <span className={`${styles.obsidianPulseBar} ${styles.obsidianPulseBar1}`}></span>
                              <span className={`${styles.obsidianPulseBar} ${styles.obsidianPulseBar2}`}></span>
                              <span className={`${styles.obsidianPulseBar} ${styles.obsidianPulseBar3}`}></span>
                              <span className={`${styles.obsidianPulseBar} ${styles.obsidianPulseBar4}`}></span>
                              <span className={`${styles.obsidianPulseBar} ${styles.obsidianPulseBar5}`}></span>
                              <span className={`${styles.obsidianPulseBar} ${styles.obsidianPulseBar6}`}></span>
                              <span className={`${styles.obsidianPulseBar} ${styles.obsidianPulseBar7}`}></span>
                              <span className={`${styles.obsidianPulseBar} ${styles.obsidianPulseBar8}`}></span>
                              <span className={`${styles.obsidianPulseBar} ${styles.obsidianPulseBar9}`}></span>
                              <span className={`${styles.obsidianPulseBar} ${styles.obsidianPulseBar10}`}></span>
                            </div>
                            <div className={styles.obsidianAudioStatus}>{audioPlaying ? 'Now Playing (Click to Pause)' : 'VIP Background Music (Click to Play)'}</div>
                            <div className={styles.obsidianAudioTrack}>Schubert's Ave Maria (Live Strings)</div>
                          </div>

                          <div className={styles.obsidianDateCard}>
                            <span className={styles.obsidianJoinLabel}>Save The Date</span>
                            <h3 className={styles.obsidianLargeDate}>{customText.date}</h3>
                            <div className={styles.obsidianDetailsBlock}>
                              <span className={styles.obsidianTimeDetails}>{customText.details}</span>
                              <span className={styles.obsidianLocationDetails}>{customText.location}</span>
                            </div>
                          </div>
                        </div>
                      )
                    )}

                    {activeTab === 'dress' && (
                      <div className={styles.mockupSectionContainer}>
                        <h3 className={styles.mockupSectionTitle}>
                          {selectedEventType === 'wedding' ? 'DRESS CODE' :
                           selectedEventType === 'corporate' ? 'EVENT DETAILS' :
                           'PARTY VIBE'}
                        </h3>
                        <div className={styles.inviteDivider} style={{ borderColor: activeAccent, margin: '8px auto 16px auto' }}></div>
                        
                        <div className={
                          selectedTemplate.id === 't_essential' ? styles.modernDressCard :
                          selectedTemplate.id === 't_noir' ? styles.noirDressCard :
                          selectedTemplate.id === 't_obsidian' ? styles.obsidianDressCard : ''
                        }>
                          <p className={styles.mockupSectionText}>{customText.dressCodeText}</p>
                          
                          <span className={styles.mockupSectionSub}>RECOMMENDED PALETTE</span>
                          <div className={styles.swatchesContainer}>
                            {customText.dressColors.map((color, i) => (
                              <div key={i} className={styles.swatchItem}>
                                <div 
                                  className={selectedTemplate.id === 't_obsidian' ? styles.obsidianSwatchCircle : styles.swatchCircle} 
                                  style={{ backgroundColor: color }}
                                ></div>
                                <span className={styles.swatchHex}>{color}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'timeline' && (
                      <div className={styles.mockupSectionContainer} style={{ paddingBottom: '30px' }}>
                        <h3 className={styles.mockupSectionTitle}>
                          {selectedEventType === 'wedding' ? 'TIMELINE' :
                           selectedEventType === 'corporate' ? 'SUMMIT AGENDA' :
                           selectedEventType === 'baby' ? 'SHOWER ACTIVITIES' :
                           'PARTY SCHEDULE'}
                        </h3>
                        <div className={styles.inviteDivider} style={{ borderColor: activeAccent, margin: '8px auto 16px auto' }}></div>
                        <div className={styles.timelineList}>
                          {customText.timeline.map((item, idx) => (
                            <div 
                              key={idx} 
                              className={
                                selectedTemplate.id === 't_essential' ? styles.modernTimelineItemCard :
                                selectedTemplate.id === 't_noir' ? styles.noirTimelineItemCard :
                                selectedTemplate.id === 't_obsidian' ? styles.obsidianTimelineItemCard : styles.timelineItemCard
                              }
                            >
                              {selectedTemplate.id === 't_essential' && (
                                <div className={styles.modernTimelineDot}></div>
                              )}
                              {selectedTemplate.id === 't_noir' && (
                                <>
                                  <div className={styles.noirTimelineDot}></div>
                                  <span className={styles.noirTimelineIndex}>0{idx + 1}</span>
                                </>
                              )}
                              {selectedTemplate.id === 't_obsidian' && (
                                <div className={styles.obsidianTimelineDot} style={{ color: activeAccent }}>♦</div>
                              )}
                              {selectedTemplate.id === 't_arch' && (
                                <div className={styles.timelineDotIndicator} style={{ backgroundColor: activeAccent }}></div>
                              )}
                              <div className={styles.timelineCardContent}>
                                <span className={styles.timelineTimeLabel}>{item.time}</span>
                                <h4 className={styles.timelineTitleLabel}>{item.title}</h4>
                                <p className={styles.timelineDescLabel}>{item.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'registry' && (
                      <div className={styles.mockupSectionContainer}>
                        <h3 className={styles.mockupSectionTitle}>
                          {selectedEventType === 'wedding' ? 'REGISTRY' :
                           selectedEventType === 'corporate' ? 'MATERIALS' :
                           selectedEventType === 'baby' ? 'BABY REGISTRY' :
                           'WISHLIST'}
                        </h3>
                        <div className={styles.inviteDivider} style={{ borderColor: activeAccent, margin: '8px auto 16px auto' }}></div>
                        <p className={styles.mockupSectionText}>
                          {selectedEventType === 'wedding' ? 'Your presence at our celebration is the greatest gift of all. However, if you wish to honor us with a gift, we are registered at:' :
                           selectedEventType === 'corporate' ? 'For attendee convenience, slides, resource materials, and agendas can be accessed below:' :
                           'If you would like to support us with gifts, here are our registered links:'}
                        </p>
                        <div className={styles.registryLinksGrid}>
                          {customText.registry.map((reg, idx) => (
                            <a 
                              key={idx} 
                              href={reg.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className={`${styles.registryMockupBtn} ${
                                selectedTemplate.id === 't_essential' ? styles.modernRegistryBtn :
                                selectedTemplate.id === 't_noir' ? styles.noirRegistryBtn :
                                selectedTemplate.id === 't_obsidian' ? styles.obsidianRegistryBtn : ''
                              }`}
                              style={{ borderColor: activeAccent, color: activeAccent }}
                            >
                              {reg.name} →
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'party' && (
                      <div className={styles.mockupSectionContainer} style={{ paddingBottom: '30px' }}>
                        <h3 className={styles.mockupSectionTitle}>
                          {selectedEventType === 'wedding' ? 'WEDDING PARTY' :
                           selectedEventType === 'corporate' ? 'FEATURED SPEAKERS' :
                           selectedEventType === 'baby' ? 'SHOWER HOSTS' :
                           'EVENT CO-HOSTS'}
                        </h3>
                        <div className={styles.inviteDivider} style={{ borderColor: activeAccent, margin: '8px auto 16px auto' }}></div>
                        <div className={styles.entourageListGrid}>
                          {customText.entourage.map((member, idx) => (
                            <div 
                              key={idx} 
                              className={`${styles.entourageMockupCard} ${
                                selectedTemplate.id === 't_essential' ? styles.modernPartyCard :
                                selectedTemplate.id === 't_noir' ? styles.noirPartyCard :
                                selectedTemplate.id === 't_obsidian' ? styles.obsidianPartyCard : ''
                              }`}
                            >
                              <div 
                                className={`${styles.entourageMockupAvatar} ${
                                  selectedTemplate.id === 't_essential' ? styles.modernPartyAvatar :
                                  selectedTemplate.id === 't_noir' ? styles.noirPartyAvatar :
                                  selectedTemplate.id === 't_obsidian' ? styles.obsidianPartyAvatar : ''
                                }`}
                                style={{ borderColor: activeAccent, color: activeAccent }}
                              >
                                {member.name ? member.name.charAt(0) : '?'}
                              </div>
                              <span className={styles.entourageMockupRole}>{member.role}</span>
                              <span className={styles.entourageMockupName}>{member.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'rsvp' && (
                      <div className={styles.mockupSectionContainer}>
                        <h3 className={styles.mockupSectionTitle}>RSVP ONLINE</h3>
                        <div className={styles.inviteDivider} style={{ borderColor: activeAccent, margin: '8px auto 12px auto' }}></div>
                        
                        {rsvpSuccess ? (
                          <div className={
                            selectedTemplate.id === 't_obsidian' ? styles.obsidianRsvpSuccessCard : styles.rsvpSuccessCard
                          }>
                            <div className={selectedTemplate.id === 't_obsidian' ? styles.obsidianSuccessIcon : styles.successIcon}>✓</div>
                            <h4 className={selectedTemplate.id === 't_obsidian' ? styles.obsidianSuccessTitle : styles.successTitle}>RSVP Confirmed</h4>
                            <p className={selectedTemplate.id === 't_obsidian' ? styles.obsidianSuccessText : styles.successText}>Thank you for responding, {rsvpForm.name || 'guest'}! Your details have been submitted successfully!</p>
                            <button 
                              onClick={() => setRsvpSuccess(false)}
                              className={selectedTemplate.id === 't_obsidian' ? styles.obsidianRsvpResetBtn : styles.rsvpResetBtn}
                              style={{ backgroundColor: activeAccent, color: '#fff' }}
                            >
                              Submit Another RSVP
                            </button>
                          </div>
                        ) : (
                          <form 
                            onSubmit={(e) => {
                              e.preventDefault();
                              setRsvpSuccess(true);
                              setRsvpFeed(prev => [...prev, {
                                name: rsvpForm.name || 'Anonymous Guest',
                                attending: rsvpForm.attending,
                                count: rsvpForm.count,
                                meal: rsvpForm.meal,
                                songRequest: rsvpForm.songRequest,
                                genderGuess: rsvpForm.genderGuess,
                                company: rsvpForm.company,
                                jobTitle: rsvpForm.jobTitle
                              }]);
                            }}
                            className={styles.rsvpMockupForm}
                          >
                            <div className={styles.rsvpFormGroup}>
                              <label className={styles.rsvpFormLabel}>Your Name</label>
                              <input 
                                type="text"
                                placeholder="Enter your full name"
                                value={rsvpForm.name}
                                onChange={(e) => setRsvpForm(prev => ({ ...prev, name: e.target.value }))}
                                className={`${styles.rsvpFormSelect} ${
                                  selectedTemplate.id === 't_essential' ? styles.modernRsvpSelect :
                                  selectedTemplate.id === 't_noir' ? styles.noirRsvpSelect :
                                  selectedTemplate.id === 't_obsidian' ? styles.obsidianRsvpSelect : ''
                                }`}
                                style={{ padding: '8px', fontSize: '0.75rem', background: selectedTemplate.id === 't_noir' ? '#111' : '#fff', color: selectedTemplate.id === 't_noir' ? '#fff' : '#333' }}
                                required
                              />
                            </div>

                            <div className={styles.rsvpFormGroup}>
                              <label className={styles.rsvpFormLabel}>Will you attend?</label>
                              <div className={styles.rsvpRadioRow}>
                                <label className={styles.rsvpRadioLabel}>
                                  <input 
                                    type="radio" 
                                    name="attending" 
                                    value="yes"
                                    checked={rsvpForm.attending === 'yes'}
                                    onChange={(e) => setRsvpForm(prev => ({ ...prev, attending: e.target.value }))}
                                  /> Attending
                                </label>
                                <label className={styles.rsvpRadioLabel}>
                                  <input 
                                    type="radio" 
                                    name="attending" 
                                    value="no"
                                    checked={rsvpForm.attending === 'no'}
                                    onChange={(e) => setRsvpForm(prev => ({ ...prev, attending: e.target.value }))}
                                  /> Decline
                                </label>
                              </div>
                            </div>

                            {selectedEventType !== 'corporate' && selectedTemplate.id !== 't_arch' && (
                              <div className={styles.rsvpFormGroup}>
                                <label className={styles.rsvpFormLabel}>Number of Guests</label>
                                <select 
                                  value={rsvpForm.count} 
                                  onChange={(e) => setRsvpForm(prev => ({ ...prev, count: e.target.value }))}
                                  className={`${styles.rsvpFormSelect} ${
                                    selectedTemplate.id === 't_essential' ? styles.modernRsvpSelect :
                                    selectedTemplate.id === 't_noir' ? styles.noirRsvpSelect :
                                    selectedTemplate.id === 't_obsidian' ? styles.obsidianRsvpSelect : ''
                                  }`}
                                >
                                  <option value="1">1 Guest</option>
                                  <option value="2">2 Guests</option>
                                  <option value="3">3 Guests</option>
                                  <option value="4">4 Guests</option>
                                </select>
                              </div>
                            )}

                            {selectedEventType === 'wedding' && selectedTemplate.id !== 't_arch' && (
                              <div className={styles.rsvpFormGroup}>
                                <label className={styles.rsvpFormLabel}>Meal Preference</label>
                                <select 
                                  value={rsvpForm.meal} 
                                  onChange={(e) => setRsvpForm(prev => ({ ...prev, meal: e.target.value }))}
                                  className={`${styles.rsvpFormSelect} ${
                                    selectedTemplate.id === 't_essential' ? styles.modernRsvpSelect :
                                    selectedTemplate.id === 't_noir' ? styles.noirRsvpSelect :
                                    selectedTemplate.id === 't_obsidian' ? styles.obsidianRsvpSelect : ''
                                  }`}
                                >
                                  <option value="beef">Grilled Filet Mignon</option>
                                  <option value="salmon">Atlantic Salmon</option>
                                  <option value="veg">Mushroom Risotto (V)</option>
                                </select>
                              </div>
                            )}

                            {selectedEventType === 'birthday' && selectedTemplate.id !== 't_arch' && (
                              <div className={styles.rsvpFormGroup}>
                                <label className={styles.rsvpFormLabel}>Favorite Dance Floor Song</label>
                                <input 
                                  type="text" 
                                  placeholder="Artist - Title"
                                  value={rsvpForm.songRequest}
                                  onChange={(e) => setRsvpForm(prev => ({ ...prev, songRequest: e.target.value }))}
                                  className={`${styles.rsvpFormSelect} ${
                                    selectedTemplate.id === 't_essential' ? styles.modernRsvpSelect :
                                    selectedTemplate.id === 't_noir' ? styles.noirRsvpSelect :
                                    selectedTemplate.id === 't_obsidian' ? styles.obsidianRsvpSelect : ''
                                  }`}
                                  style={{ padding: '8px', fontSize: '0.75rem', background: selectedTemplate.id === 't_noir' ? '#111' : '#fff', color: selectedTemplate.id === 't_noir' ? '#fff' : '#333' }}
                                />
                              </div>
                            )}

                            {selectedEventType === 'baby' && selectedTemplate.id !== 't_arch' && (
                              <div className={styles.rsvpFormGroup}>
                                <label className={styles.rsvpFormLabel}>Guess the Baby's Gender</label>
                                <div className={styles.rsvpRadioRow} style={{ flexWrap: 'wrap', gap: '6px' }}>
                                  <label className={styles.rsvpRadioLabel}>
                                    <input 
                                      type="radio" 
                                      name="genderGuess" 
                                      value="boy"
                                      checked={rsvpForm.genderGuess === 'boy'}
                                      onChange={(e) => setRsvpForm(prev => ({ ...prev, genderGuess: e.target.value }))}
                                    /> Boy 💙
                                  </label>
                                  <label className={styles.rsvpRadioLabel}>
                                    <input 
                                      type="radio" 
                                      name="genderGuess" 
                                      value="girl"
                                      checked={rsvpForm.genderGuess === 'girl'}
                                      onChange={(e) => setRsvpForm(prev => ({ ...prev, genderGuess: e.target.value }))}
                                    /> Girl 💖
                                  </label>
                                  <label className={styles.rsvpRadioLabel}>
                                    <input 
                                      type="radio" 
                                      name="genderGuess" 
                                      value="surprise"
                                      checked={rsvpForm.genderGuess === 'surprise'}
                                      onChange={(e) => setRsvpForm(prev => ({ ...prev, genderGuess: e.target.value }))}
                                    /> Surprise 💛
                                  </label>
                                </div>
                              </div>
                            )}

                            {selectedEventType === 'corporate' && selectedTemplate.id !== 't_arch' && (
                              <>
                                <div className={styles.rsvpFormGroup}>
                                  <label className={styles.rsvpFormLabel}>Company Name</label>
                                  <input 
                                    type="text" 
                                    placeholder="Enter your organization"
                                    value={rsvpForm.company}
                                    onChange={(e) => setRsvpForm(prev => ({ ...prev, company: e.target.value }))}
                                    className={`${styles.rsvpFormSelect} ${
                                      selectedTemplate.id === 't_essential' ? styles.modernRsvpSelect :
                                      selectedTemplate.id === 't_noir' ? styles.noirRsvpSelect :
                                      selectedTemplate.id === 't_obsidian' ? styles.obsidianRsvpSelect : ''
                                    }`}
                                    style={{ padding: '8px', fontSize: '0.75rem', background: selectedTemplate.id === 't_noir' ? '#111' : '#fff', color: selectedTemplate.id === 't_noir' ? '#fff' : '#333' }}
                                    required
                                  />
                                </div>
                                <div className={styles.rsvpFormGroup}>
                                  <label className={styles.rsvpFormLabel}>Job Title</label>
                                  <input 
                                    type="text" 
                                    placeholder="e.g. Lead Architect"
                                    value={rsvpForm.jobTitle}
                                    onChange={(e) => setRsvpForm(prev => ({ ...prev, jobTitle: e.target.value }))}
                                    className={`${styles.rsvpFormSelect} ${
                                      selectedTemplate.id === 't_essential' ? styles.modernRsvpSelect :
                                      selectedTemplate.id === 't_noir' ? styles.noirRsvpSelect :
                                      selectedTemplate.id === 't_obsidian' ? styles.obsidianRsvpSelect : ''
                                    }`}
                                    style={{ padding: '8px', fontSize: '0.75rem', background: selectedTemplate.id === 't_noir' ? '#111' : '#fff', color: selectedTemplate.id === 't_noir' ? '#fff' : '#333' }}
                                    required
                                  />
                                </div>
                              </>
                            )}

                            <button 
                              type="submit" 
                              className={`${styles.rsvpFormSubmitBtn} ${
                                selectedTemplate.id === 't_essential' ? styles.modernRsvpSubmit :
                                selectedTemplate.id === 't_noir' ? styles.noirRsvpSubmit :
                                selectedTemplate.id === 't_obsidian' ? styles.obsidianRsvpSubmit : ''
                              }`}
                              style={{ backgroundColor: activeAccent, color: '#fff' }}
                            >
                              Submit Response
                            </button>
                          </form>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Tab Navigation */}
                  {invitationMode === 'full' && (
                    <div className={styles.phoneTabsNav} style={{ borderTopColor: 'rgba(255,255,255,0.08)' }}>
                      <button 
                        onClick={() => setActiveTab('invite')}
                        className={`${styles.phoneTabBtn} ${activeTab === 'invite' ? styles.phoneTabActive : ''}`}
                      >
                        <span className={styles.tabIcon}>📧</span>
                        <span className={styles.tabLabel}>Invite</span>
                      </button>

                      {selectedTemplate.id !== 't_arch' && (
                        <button 
                          onClick={() => setActiveTab('dress')}
                          className={`${styles.phoneTabBtn} ${activeTab === 'dress' ? styles.phoneTabActive : ''}`}
                        >
                          <span className={styles.tabIcon}>
                            {selectedEventType === 'baby' ? '🍼' : selectedEventType === 'corporate' ? '📍' : '👗'}
                          </span>
                          <span className={styles.tabLabel}>
                            {selectedEventType === 'wedding' ? 'Dress' : selectedEventType === 'corporate' ? 'Details' : 'Vibe'}
                          </span>
                        </button>
                      )}

                      <button 
                        onClick={() => setActiveTab('timeline')}
                        className={`${styles.phoneTabBtn} ${activeTab === 'timeline' ? styles.phoneTabActive : ''}`}
                      >
                        <span className={styles.tabIcon}>📅</span>
                        <span className={styles.tabLabel}>
                          {selectedEventType === 'corporate' ? 'Agenda' : selectedEventType === 'baby' ? 'Activities' : 'Timeline'}
                        </span>
                      </button>

                      {selectedTemplate.id !== 't_arch' && (
                        <button 
                          onClick={() => setActiveTab('registry')}
                          className={`${styles.phoneTabBtn} ${activeTab === 'registry' ? styles.phoneTabActive : ''}`}
                        >
                          <span className={styles.tabIcon}>
                            {selectedEventType === 'corporate' ? '📄' : '🎁'}
                          </span>
                          <span className={styles.tabLabel}>
                            {selectedEventType === 'wedding' ? 'Registry' : selectedEventType === 'corporate' ? 'Materials' : selectedEventType === 'baby' ? 'Registry' : 'Wishlist'}
                          </span>
                        </button>
                      )}

                      {selectedTemplate.id !== 't_arch' && selectedTemplate.id !== 't_essential' && (
                        <button 
                          onClick={() => setActiveTab('party')}
                          className={`${styles.phoneTabBtn} ${activeTab === 'party' ? styles.phoneTabActive : ''}`}
                        >
                          <span className={styles.tabIcon}>
                            {selectedEventType === 'corporate' ? '🎙️' : '👥'}
                          </span>
                          <span className={styles.tabLabel}>
                            {selectedEventType === 'corporate' ? 'Speakers' : 'Party'}
                          </span>
                        </button>
                      )}

                      <button 
                        onClick={() => setActiveTab('rsvp')}
                        className={`${styles.phoneTabBtn} ${activeTab === 'rsvp' ? styles.phoneTabActive : ''}`}
                      >
                        <span className={styles.tabIcon}>📝</span>
                        <span className={styles.tabLabel}>RSVP</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
