'use client';

import { useState } from 'react';
import { useWeddingStore } from '@/lib/store';
import styles from './page.module.css';

const TEMPLATES = [
  {
    id: 't_arch',
    name: 'The Timeless Arch',
    style: 'Elegant Arch-framed layout with curved lettering overlay, 9-bar sound wave visualizer, double-lined arch date blocks, and vertical schedule timelines.',
    price: 20,
    priceLabel: 'Buy $20',
    color: '#ffffff',
    accentColor: '#111111',
    font: 'serif',
    sampleBg: 'linear-gradient(180deg, #fbfaf8 0%, #f5f2eb 100%)',
    vibe: 'High-fashion, editorial, curated',
    features: [
      'Elegant Arch-Framed Photo Layout',
      'Detailed Vertical Event Timeline',
      'Curated Dress Code & 4-Color Palette Guide',
      'Guest Accommodations & Travel Info Section',
      'Seamless Registry & One-Click RSVP'
    ]
  },
  {
    id: 't_essential',
    name: 'The Modern Essential',
    style: 'Modern minimalist layout with full screen photography, horizontal image slider gallery, integrated sound wave music player, and active entourage rosters.',
    price: 20,
    priceLabel: 'Buy $20',
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
      'Curated Photo Gallery with Background Music',
      'Wedding Party (Entourage) Showcase'
    ]
  },
  {
    id: 't_noir',
    name: 'The Noir Editorial',
    style: 'Luxury dark theme with magazine-style typography, full-bleed high-contrast couple photography, background track lists, and structured travel tip boards.',
    price: 14.99,
    priceLabel: 'Buy $14.99',
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
      'Seamless Registry & RSVP Flow'
    ]
  },
  {
    id: 't_obsidian',
    name: 'The Obsidian Romance',
    style: 'Dramatic black velvet theme accented with gold borders, multiple full-bleed portrait grids, staggered timeline scheduler, and customizable swatches.',
    price: 14.99,
    priceLabel: 'Buy $14.99',
    color: '#020208',
    accentColor: '#d4af37',
    font: 'serif',
    sampleBg: 'linear-gradient(135deg, #020208 0%, #0d0d1a 100%)',
    vibe: 'Luxury, dramatic, imperial',
    features: [
      'Dramatic Dark-Theme Aesthetic',
      'Three 9:16 Full-Bleed Portrait Layouts',
      'Elegant Staggered Event Timeline',
      'Visual Dress Code Color Swatches',
      'Multi-Link Gift Registry Integration',
      'Seamless Background Audio'
    ]
  }
];

export default function TemplatesPage() {
  const store = useWeddingStore();
  const { user } = store;
  
  const [selectedTemplate, setSelectedTemplate] = useState(null); // template object for preview
  const [mobileEditorTab, setMobileEditorTab] = useState('edit'); // 'edit' or 'preview' active tab on mobile
  const [activeTab, setActiveTab] = useState('invite'); // 'invite', 'dress', 'timeline', 'registry', 'party', 'rsvp'
  const [expandedSection, setExpandedSection] = useState('general'); // active editor tab: 'general', 'dress', 'registry', 'party', 'timeline'
  
  // RSVP Form simulation
  const [rsvpForm, setRsvpForm] = useState({ attending: 'yes', count: '1', meal: 'beef', message: '' });
  const [rsvpSuccess, setRsvpSuccess] = useState(false);

  const [customText, setCustomText] = useState({
    title: 'Sarah & David',
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

  const handleSelectTemplate = (template) => {
    alert(`Great choice! Template "${template.name}" has been chosen. You will proceed to payment for ${template.priceLabel} upon publishing.`);
  };

  const openPreview = (template) => {
    setSelectedTemplate(template);
    setMobileEditorTab('edit');
  };

  const closePreview = () => {
    setSelectedTemplate(null);
  };

  const toggleSection = (sectionName) => {
    setExpandedSection(expandedSection === sectionName ? null : sectionName);
  };

  return (
    <main className={styles.templatesLayout}>
      <div className={styles.navbarSpacer}></div>

      <div className={styles.container}>
        {/* Page Header */}
        <div className={styles.header}>
          <span className={styles.badge}>INVITATION BUILDER</span>
          <h1 className={styles.title}>Your Dream Wedding Website & Invitations</h1>
          <p className={styles.subtitle}>
            Select a premium designer template, customize the content features, and share RSVP details with guests.
          </p>
        </div>

        {/* Templates Grid */}
        <div className={styles.templatesGrid}>
          {TEMPLATES.map((tpl) => (
            <div key={tpl.id} className={styles.templateCard}>
              <div 
                className={styles.cardPreviewBanner}
                style={{ background: tpl.sampleBg }}
              >
                <div className={styles.cardPreviewContent} style={{ color: tpl.accentColor }}>
                  <span className={styles.cardPreviewTitle} style={{ fontFamily: tpl.font }}>
                    {tpl.name}
                  </span>
                  <span className={styles.cardPreviewSub}>Save the Date</span>
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.cardHeaderRow}>
                  <h3 className={styles.cardTitle}>{tpl.name}</h3>
                  <span className={`${styles.priceTag} ${styles.pricePaid}`}>
                    {tpl.priceLabel}
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
                        <input 
                          type="text" 
                          value={customText.title}
                          onChange={(e) => setCustomText(prev => ({ ...prev, title: e.target.value }))}
                          className={styles.editorInput}
                        />
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
                        <textarea 
                          value={customText.details}
                          onChange={(e) => setCustomText(prev => ({ ...prev, details: e.target.value }))}
                          className={styles.editorInput}
                          style={{ minHeight: '60px', resize: 'vertical' }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Accordion 2: Dress Code */}
                <div className={styles.accordionGroup}>
                  <div className={styles.accordionHeader} onClick={() => toggleSection('dress')}>
                    <span>👗 Dress Code</span>
                    <span>{expandedSection === 'dress' ? '▼' : '▶'}</span>
                  </div>
                  {expandedSection === 'dress' && (
                    <div className={styles.accordionBody}>
                      <div className={styles.editorGroup}>
                        <label className={styles.editorLabel}>Attire Guidelines</label>
                        <textarea 
                          value={customText.dressCodeText}
                          onChange={(e) => setCustomText(prev => ({ ...prev, dressCodeText: e.target.value }))}
                          className={styles.editorInput}
                          style={{ minHeight: '60px', resize: 'vertical' }}
                        />
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

                {/* Accordion 3: Gift Registry */}
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

                {/* Accordion 4: Entourage */}
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

                <button 
                  onClick={() => {
                    handleSelectTemplate(selectedTemplate);
                    closePreview();
                  }}
                  className={styles.editorPublishBtn}
                >
                  Confirm & Buy ({selectedTemplate.priceLabel})
                </button>
              </div>

              {/* Right Column: Simulated Phone Shell */}
              <div className={`${styles.phoneColumn} ${mobileEditorTab === 'preview' ? styles.mobileActive : styles.mobileHidden}`}>
                <div className={styles.phoneContainer}>
                  <div className={styles.phoneNotch}></div>
                  
                  <div 
                    className={styles.phoneScreen}
                    style={{ 
                      background: selectedTemplate.sampleBg,
                      color: selectedTemplate.id === 't_noir' ? '#f5f0e8' : selectedTemplate.id === 't_obsidian' ? '#d4af37' : '#333333'
                    }}
                  >
                    {/* Active Tab rendering */}
                    {activeTab === 'invite' && (
                      selectedTemplate.id === 't_arch' ? (
                        <div className={styles.elysianInviteContainer}>
                          {/* Header Arched Banner */}
                          <div className={styles.elysianHeroSection}>
                            <div className={styles.elysianArcTextWrapper}>
                              <svg viewBox="0 0 220 110" className={styles.elysianArcSvg}>
                                <path id="curvePath" d="M 25,95 A 85,85 0 0,1 195,95" fill="none" />
                                <text className={styles.elysianArcText}>
                                  <textPath href="#curvePath" startOffset="50%" textAnchor="middle">
                                    YOU'RE CORDIALLY INVITED
                                  </textPath>
                                </text>
                              </svg>
                            </div>
                            
                            <div className={styles.elysianArchedImageFrame}>
                              <img 
                                src={customText.couplePhoto} 
                                alt="Couple" 
                                className={styles.elysianCouplePhoto} 
                              />
                            </div>
                          </div>

                          {/* Audio Waveform Section */}
                          <div className={styles.elysianWaveformSection}>
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
                            <span className={styles.elysianWaveformSubtitle}>
                              TO SHARE IN THE CELEBRATION OF
                            </span>
                            <h2 className={styles.elysianCoupleNames}>
                              {customText.title}
                            </h2>
                          </div>

                          {/* Arched Date Section */}
                          <div className={styles.elysianDateSection}>
                            <div className={styles.elysianDateArchFrame}>
                              <span className={styles.elysianJoinUs}>JOIN US ON</span>
                              <span className={styles.elysianDateLarge}>11.20.2026</span>
                              <div className={styles.elysianDetailsBlock}>
                                <p className={styles.elysianTimeDetails}>{customText.details}</p>
                                <p className={styles.elysianLocationDetails}>{customText.location}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className={styles.inviteContent} style={{ color: selectedTemplate.accentColor }}>
                          <span className={styles.inviteOverline} style={{ color: selectedTemplate.accentColor }}>
                            YOU ARE CORDIALLY INVITED TO THE WEDDING OF
                          </span>
                          
                          <h2 className={styles.inviteTitle} style={{ fontFamily: selectedTemplate.font, color: selectedTemplate.accentColor }}>
                            {customText.title}
                          </h2>
                          
                          <div className={styles.inviteDivider} style={{ borderColor: selectedTemplate.accentColor }}></div>
                          
                          <div className={styles.standardMockupPhotoFrame}>
                            <img src={customText.couplePhoto} alt="Couple" className={styles.standardMockupPhoto} />
                          </div>

                          <p className={styles.inviteDate}>{customText.date}</p>
                          <p className={styles.inviteLocation}>{customText.location}</p>
                          <p className={styles.inviteDetails}>{customText.details}</p>
                        </div>
                      )
                    )}

                    {activeTab === 'dress' && (
                      <div className={styles.mockupSectionContainer}>
                        <h3 className={styles.mockupSectionTitle}>DRESS CODE</h3>
                        <div className={styles.inviteDivider} style={{ borderColor: selectedTemplate.accentColor, margin: '8px auto 16px auto' }}></div>
                        <p className={styles.mockupSectionText}>{customText.dressCodeText}</p>
                        
                        <span className={styles.mockupSectionSub}>RECOMMENDED PALETTE</span>
                        <div className={styles.swatchesContainer}>
                          {customText.dressColors.map((color, i) => (
                            <div key={i} className={styles.swatchItem}>
                              <div className={styles.swatchCircle} style={{ backgroundColor: color }}></div>
                              <span className={styles.swatchHex}>{color}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'timeline' && (
                      <div className={styles.mockupSectionContainer} style={{ paddingBottom: '30px' }}>
                        <h3 className={styles.mockupSectionTitle}>TIMELINE</h3>
                        <div className={styles.inviteDivider} style={{ borderColor: selectedTemplate.accentColor, margin: '8px auto 16px auto' }}></div>
                        <div className={styles.timelineList}>
                          {customText.timeline.map((item, idx) => (
                            <div key={idx} className={styles.timelineItemCard}>
                              <div className={styles.timelineDotIndicator} style={{ backgroundColor: selectedTemplate.accentColor }}></div>
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
                        <h3 className={styles.mockupSectionTitle}>REGISTRY</h3>
                        <div className={styles.inviteDivider} style={{ borderColor: selectedTemplate.accentColor, margin: '8px auto 16px auto' }}></div>
                        <p className={styles.mockupSectionText}>Your presence at our celebration is the greatest gift of all. However, if you wish to honor us with a gift, we are registered at:</p>
                        <div className={styles.registryLinksGrid}>
                          {customText.registry.map((reg, idx) => (
                            <a 
                              key={idx} 
                              href={reg.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className={styles.registryMockupBtn}
                              style={{ borderColor: selectedTemplate.accentColor, color: selectedTemplate.accentColor }}
                            >
                              {reg.name} →
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'party' && (
                      <div className={styles.mockupSectionContainer} style={{ paddingBottom: '30px' }}>
                        <h3 className={styles.mockupSectionTitle}>WEDDING PARTY</h3>
                        <div className={styles.inviteDivider} style={{ borderColor: selectedTemplate.accentColor, margin: '8px auto 16px auto' }}></div>
                        <div className={styles.entourageListGrid}>
                          {customText.entourage.map((member, idx) => (
                            <div key={idx} className={styles.entourageMockupCard}>
                              <div className={styles.entourageMockupAvatar} style={{ borderColor: selectedTemplate.accentColor, color: selectedTemplate.accentColor }}>
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
                        <div className={styles.inviteDivider} style={{ borderColor: selectedTemplate.accentColor, margin: '8px auto 12px auto' }}></div>
                        
                        {rsvpSuccess ? (
                          <div className={styles.rsvpSuccessCard}>
                            <div className={styles.successIcon}>✓</div>
                            <h4 className={styles.successTitle}>RSVP Confirmed</h4>
                            <p className={styles.successText}>Thank you for responding. Your details have been submitted successfully!</p>
                            <button 
                              onClick={() => setRsvpSuccess(false)}
                              className={styles.rsvpResetBtn}
                              style={{ backgroundColor: selectedTemplate.accentColor, color: '#fff' }}
                            >
                              Submit Another RSVP
                            </button>
                          </div>
                        ) : (
                          <form 
                            onSubmit={(e) => {
                              e.preventDefault();
                              setRsvpSuccess(true);
                            }}
                            className={styles.rsvpMockupForm}
                          >
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

                            <div className={styles.rsvpFormGroup}>
                              <label className={styles.rsvpFormLabel}>Number of Guests</label>
                              <select 
                                value={rsvpForm.count} 
                                onChange={(e) => setRsvpForm(prev => ({ ...prev, count: e.target.value }))}
                                className={styles.rsvpFormSelect}
                              >
                                <option value="1">1 Guest</option>
                                <option value="2">2 Guests</option>
                                <option value="3">3 Guests</option>
                                <option value="4">4 Guests</option>
                              </select>
                            </div>

                            <div className={styles.rsvpFormGroup}>
                              <label className={styles.rsvpFormLabel}>Meal Preference</label>
                              <select 
                                value={rsvpForm.meal} 
                                onChange={(e) => setRsvpForm(prev => ({ ...prev, meal: e.target.value }))}
                                className={styles.rsvpFormSelect}
                              >
                                <option value="beef">Grilled Filet Mignon</option>
                                <option value="salmon">Atlantic Salmon</option>
                                <option value="veg">Mushroom Risotto (V)</option>
                              </select>
                            </div>

                            <button 
                              type="submit" 
                              className={styles.rsvpFormSubmitBtn}
                              style={{ backgroundColor: selectedTemplate.accentColor, color: '#fff' }}
                            >
                              Submit Response
                            </button>
                          </form>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Tab Navigation */}
                  <div className={styles.phoneTabsNav} style={{ borderTopColor: 'rgba(255,255,255,0.08)' }}>
                    <button 
                      onClick={() => setActiveTab('invite')}
                      className={`${styles.phoneTabBtn} ${activeTab === 'invite' ? styles.phoneTabActive : ''}`}
                    >
                      <span className={styles.tabIcon}>📧</span>
                      <span className={styles.tabLabel}>Invite</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('dress')}
                      className={`${styles.phoneTabBtn} ${activeTab === 'dress' ? styles.phoneTabActive : ''}`}
                    >
                      <span className={styles.tabIcon}>👗</span>
                      <span className={styles.tabLabel}>Dress</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('timeline')}
                      className={`${styles.phoneTabBtn} ${activeTab === 'timeline' ? styles.phoneTabActive : ''}`}
                    >
                      <span className={styles.tabIcon}>📅</span>
                      <span className={styles.tabLabel}>Timeline</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('registry')}
                      className={`${styles.phoneTabBtn} ${activeTab === 'registry' ? styles.phoneTabActive : ''}`}
                    >
                      <span className={styles.tabIcon}>🎁</span>
                      <span className={styles.tabLabel}>Registry</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('party')}
                      className={`${styles.phoneTabBtn} ${activeTab === 'party' ? styles.phoneTabActive : ''}`}
                    >
                      <span className={styles.tabIcon}>👥</span>
                      <span className={styles.tabLabel}>Party</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('rsvp')}
                      className={`${styles.phoneTabBtn} ${activeTab === 'rsvp' ? styles.phoneTabActive : ''}`}
                    >
                      <span className={styles.tabIcon}>📝</span>
                      <span className={styles.tabLabel}>RSVP</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
