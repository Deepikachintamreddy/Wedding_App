'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWeddingStore } from '@/lib/store';
import styles from './page.module.css';

const INITIAL_PINS = [
  { id: 'pin_1', image: '/wedding_couple_bg.png', title: 'Editorial Couple Portrait', category: 'Attire', likes: 14, description: 'Classic bespoke black-tie silhouette with champagne gold accents.' },
  { id: 'pin_2', image: '/wedding_venue_bg.png', title: 'Malibu Ocean Terrace Arch', category: 'Venue', likes: 11, description: 'Bespoke floral arbor framing the Pacific sunset.' },
  { id: 'pin_3', image: '/wedding_table_bg.png', title: 'Gilded Dining Tablescape', category: 'Decor', likes: 19, description: 'Navy linens with brushed gold chargers, crystal glassware, and ivory florals.' },
  { id: 'pin_4', image: '/wedding_rings_bg.png', title: 'Heirloom Diamond Bands', category: 'Details', likes: 8, description: 'Art-deco emerald-cut solitaires on plush velvet cushions.' },
  { id: 'pin_5', image: '/couple2.png', title: 'High-Fashion Magazine Stills', category: 'Photography', likes: 22, description: 'Editorial black-and-white portraiture curated by OVAimagination Events.' },
  { id: 'pin_6', image: '/couple3.png', title: 'Sunset Coastal Walk', category: 'Aesthetic', likes: 12, description: 'Warm shoreline glow illuminating custom couture ivory bridal silk.' }
];

const PRESETS = [
  {
    id: 'navy_gold',
    name: 'Elysian Navy & Gold',
    swatches: ['#0A192F', '#1E293B', '#D4AF37', '#F5E6C8', '#FFFFFF'],
    emoji: '👑'
  },
  {
    id: 'noir',
    name: 'Noir Minimalism',
    swatches: ['#050505', '#1A1A1A', '#E5E5E5', '#A3A3A3', '#FFFFFF'],
    emoji: '⚫'
  },
  {
    id: 'emerald',
    name: 'Royal Emerald Garden',
    swatches: ['#011C0F', '#31724F', '#D4AF37', '#E8F5E9', '#0A192F'],
    emoji: '🌿'
  },
  {
    id: 'sunset',
    name: 'Sunset Terracotta',
    swatches: ['#2C1A32', '#D98880', '#F5CBA7', '#F9EBD2', '#D4AF37'],
    emoji: '🌅'
  }
];

export default function MoodBoardPage() {
  const router = useRouter();
  const store = useWeddingStore();
  const { user, eventProfile, loading } = store;

  // Active States
  const [pins, setPins] = useState(INITIAL_PINS);
  const [swatches, setSwatches] = useState(['#0A192F', '#1E293B', '#D4AF37', '#F5E6C8', '#FFFFFF']);
  const [selectedPreset, setSelectedPreset] = useState('navy_gold');
  const [activeFilter, setActiveFilter] = useState('All');
  const [customColor, setCustomColor] = useState('#D4AF37');

  // Form state
  const [form, setForm] = useState({ title: '', image: '', category: 'Decor', description: '' });

  // AI Copilot state
  const [aiReport, setAiReport] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh', background: 'var(--color-navy-dark, #050d1a)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(212, 175, 55, 0.2)', borderTopColor: '#D4AF37', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style jsx global>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  // Presets Application
  const applyPreset = (preset) => {
    setSelectedPreset(preset.id);
    setSwatches(preset.swatches);
  };

  // Swatch custom addition / deletion
  const addCustomSwatch = () => {
    if (swatches.length >= 7) {
      alert('A maximum of 7 custom palette swatches is supported.');
      return;
    }
    if (!customColor.startsWith('#') || customColor.length !== 7) {
      alert('Please enter a valid hex code (e.g. #D4AF37).');
      return;
    }
    setSwatches(prev => [...prev, customColor]);
  };

  const removeSwatch = (index) => {
    setSwatches(prev => prev.filter((_, i) => i !== index));
  };

  // Pin Actions
  const handleLike = (id) => {
    setPins(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
  };

  const handleDeletePin = (id) => {
    setPins(prev => prev.filter(p => p.id !== id));
  };

  const handleAddPin = (e) => {
    e.preventDefault();
    if (!form.title || !form.image) {
      alert('Please provide a title and image source.');
      return;
    }
    const newPin = {
      id: `pin_${Date.now()}`,
      image: form.image,
      title: form.title,
      category: form.category,
      likes: 0,
      description: form.description || 'Curated mood board aesthetic element.'
    };
    setPins(prev => [newPin, ...prev]);
    setForm({ title: '', image: '', category: 'Decor', description: '' });
  };

  // AI Style Report Generator
  const generateAiReport = () => {
    setAiGenerating(true);
    setAiReport('');
    
    setTimeout(() => {
      const reports = {
        navy_gold: `Your design blueprint reflects the iconic Elysian Navy & Champagne Gold palette. Deep midnight tones paired with brushed metallics evoke a royal, high-society gala atmosphere. Recommended floral treatments include cascading ivory orchids and white garden roses surrounded by soft amber candelabras.`,
        noir: `A masterclass in modern Noir Minimalism. High-contrast monochromatic black, charcoal, and crisp linen create a bold editorial runway aesthetic. Recommended venue elements include architectural black steel arches, mirror-polished tables, and dramatic low-profile spotlighting.`,
        emerald: `An organic Royal Emerald Garden narrative. Rich forest greens combined with gold cutlery and warm organic wood evoke botanical luxury. Ideal for estate terraces, greenhouse ballrooms, and alfresco vineyard banquets under festoon lighting.`,
        sunset: `A warm Sunset Terracotta aesthetic. Soft terracotta, blush silk, and champagne hues bring warmth and romance. Ideal for coastal ceremonies and sunset beach receptions.`
      };

      const key = selectedPreset || 'navy_gold';
      setAiReport(reports[key] || reports.navy_gold);
      setAiGenerating(false);
    }, 1200);
  };

  // Filter Pins
  const filteredPins = pins.filter(p => activeFilter === 'All' || p.category === activeFilter);
  const categories = ['All', 'Venue', 'Decor', 'Attire', 'Details', 'Photography', 'Aesthetic'];

  return (
    <main className={styles.moodboardLayout}>
      <div className={styles.navbarSpacer}></div>
      
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.badge}>VISUAL AESTHETIC SUITE</span>
          <h1 className={styles.title}>Elysian Mood Board & Palette</h1>
          <p className={styles.subtitle}>
            Curate inspiration pins, customize your signature color swatches, and generate AI style blueprints with **OVAimagination Events**.
          </p>
        </div>

        {/* Two-Column Workspace */}
        <div className={styles.mainContent}>
          
          {/* Left Column: Masonry Board */}
          <div className={styles.gridSection}>
            <div className={styles.filterBar}>
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveFilter(cat)}
                  className={`${styles.filterBtn} ${activeFilter === cat ? styles.filterBtnActive : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className={styles.masonryGrid}>
              {filteredPins.length === 0 ? (
                <div 
                  style={{ 
                    gridColumn: '1/-1', 
                    textAlign: 'center', 
                    padding: '60px 20px', 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px dashed rgba(212,175,55,0.2)',
                    borderRadius: '16px',
                    color: '#D4AF37' 
                  }}
                >
                  No pins found in category "{activeFilter}". Add custom pins on the right or select another filter.
                </div>
              ) : (
                filteredPins.map(pin => (
                  <div key={pin.id} className={styles.pinCard}>
                    <div className={styles.pinImageWrapper}>
                      <img src={pin.image} alt={pin.title} className={styles.pinImage} />
                      <span className={styles.pinOverlay}>{pin.category}</span>
                    </div>
                    
                    <div className={styles.pinInfo}>
                      <h3 className={styles.pinTitle}>{pin.title}</h3>
                      <p className={styles.pinDesc}>{pin.description}</p>
                      
                      <div className={styles.pinFooter}>
                        <button 
                          type="button" 
                          onClick={() => handleLike(pin.id)} 
                          className={styles.likeBtn}
                          title="Like Pin"
                          aria-label={`Like ${pin.title}`}
                        >
                          ❤️ <span>{pin.likes}</span>
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handleDeletePin(pin.id)} 
                          className={styles.deleteBtn}
                          title="Delete Pin"
                          aria-label={`Delete ${pin.title}`}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Sticky Sidebar Controls */}
          <div className={styles.sidebar}>
            
            {/* Panel 1: Style Presets */}
            <div className={styles.panel}>
              <h3 className={styles.panelTitle}>
                <span>⚜️</span> Curated Elysian Presets
              </h3>
              <div className={styles.presetsGrid}>
                {PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={`${styles.presetBtn} ${selectedPreset === preset.id ? styles.presetBtnActive : ''}`}
                  >
                    <span style={{ fontSize: '1.2rem' }}>{preset.emoji}</span>
                    <span className={styles.presetName}>{preset.name}</span>
                    <div className={styles.presetIndicator}>
                      {preset.swatches.slice(2, 5).map((color, i) => (
                        <div 
                          key={i} 
                          className={styles.presetDot} 
                          style={{ backgroundColor: color }} 
                        />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Panel 2: Swatch Builder */}
            <div className={styles.panel}>
              <h3 className={styles.panelTitle}>
                <span>🎨</span> Interactive Color Swatches
              </h3>
              <div className={styles.swatchesContainer}>
                {swatches.map((color, idx) => (
                  <div 
                    key={idx} 
                    className={styles.swatch} 
                    style={{ backgroundColor: color }}
                    title={color}
                  >
                    <button 
                      type="button" 
                      onClick={() => removeSwatch(idx)}
                      className={styles.swatchRemove}
                      aria-label={`Remove color swatch ${color}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className={styles.colorPickerControls}>
                <input 
                  type="text" 
                  value={customColor} 
                  onChange={(e) => setCustomColor(e.target.value)}
                  placeholder="#D4AF37"
                  className={styles.colorInput}
                  aria-label="Hex color code"
                />
                <input 
                  type="color" 
                  value={customColor} 
                  onChange={(e) => setCustomColor(e.target.value)}
                  style={{ width: '40px', height: '36px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                  aria-label="Color picker"
                />
                <button 
                  type="button" 
                  onClick={addCustomSwatch}
                  className={styles.addSwatchBtn}
                >
                  Add Swatch
                </button>
              </div>
            </div>

            {/* Panel 3: Add Custom Pin */}
            <div className={styles.panel}>
              <h3 className={styles.panelTitle}>
                <span>📌</span> Add Custom Pin
              </h3>
              <form onSubmit={handleAddPin}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Pin Title</label>
                  <input 
                    type="text" 
                    placeholder="E.g. Crystal chandelier reception"
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Image Source</label>
                  <select 
                    value={form.image}
                    onChange={(e) => setForm(prev => ({ ...prev, image: e.target.value }))}
                    className={styles.select}
                    required
                  >
                    <option value="">Select Preloaded Image...</option>
                    <option value="/wedding_couple_bg.png">Editorial Couple Session</option>
                    <option value="/wedding_venue_bg.png">Malibu Sunset Ocean Arch</option>
                    <option value="/wedding_table_bg.png">Gilded Dining Tablescape</option>
                    <option value="/wedding_rings_bg.png">Diamond Rings on Velvet</option>
                    <option value="/couple1.png">Modern Beach Couple</option>
                    <option value="/couple2.png">Magazine Closeups</option>
                    <option value="/couple3.png">Romantic Coastal Walk</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Category</label>
                  <select 
                    value={form.category}
                    onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                    className={styles.select}
                  >
                    <option value="Venue">Venue</option>
                    <option value="Decor">Decor</option>
                    <option value="Attire">Attire</option>
                    <option value="Details">Details</option>
                    <option value="Photography">Photography</option>
                    <option value="Aesthetic">Aesthetic</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Styling Notes</label>
                  <textarea 
                    placeholder="Write custom aesthetic notes..."
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    className={styles.textarea}
                  />
                </div>
                <button type="submit" className={styles.submitBtn}>
                  Pin to Elysian Board
                </button>
              </form>
            </div>

            {/* Panel 4: AI Copilot */}
            <div className={styles.panel}>
              <h3 className={styles.panelTitle}>
                <span>✨</span> AI Style Copilot
              </h3>
              <div className={styles.aiCopilotBody}>
                <p className={styles.aiCopilotDesc}>
                  Analyze your curated inspiration pins and signature swatches to generate an expert design concept report.
                </p>
                <button 
                  type="button" 
                  onClick={generateAiReport}
                  className={styles.aiGenerateBtn}
                  disabled={aiGenerating}
                >
                  {aiGenerating ? (
                    <>
                      <span className={styles.aiGeneratingSpinner}>✨</span> Curating Blueprint...
                    </>
                  ) : (
                    '✨ Generate Style Blueprint'
                  )}
                </button>

                {aiReport && (
                  <div className={styles.aiReportBox}>
                    <span className={styles.aiReportTitle}>Aesthetic Blueprint</span>
                    <p>{aiReport}</p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </main>
  );
}
