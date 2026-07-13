'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWeddingStore } from '@/lib/store';
import styles from './page.module.css';

const INITIAL_PINS = [
  { id: 'pin_1', image: '/wedding_couple_bg.png', title: 'Elegant Couple Session', category: 'Attire', likes: 12, description: 'Classic silhouette style with neutral champagne tones.' },
  { id: 'pin_2', image: '/wedding_venue_bg.png', title: 'Malibu Sunset Arch', category: 'Venue', likes: 8, description: 'Soft, airy drapery under an arched wooden arbor by the ocean.' },
  { id: 'pin_3', image: '/wedding_table_bg.png', title: 'Gilded Dining Reception', category: 'Decor', likes: 15, description: 'Black slate tablecloths with champagne gold plates and warm candlelight.' },
  { id: 'pin_4', image: '/wedding_rings_bg.png', title: 'Vintage Diamond Bands', category: 'Details', likes: 6, description: 'Art-deco gold rings nested on black velvet cushions.' },
  { id: 'pin_5', image: '/couple2.png', title: 'Modern Editorial Portraits', category: 'Photography', likes: 18, description: 'Vogue-style closeups focusing on shadows and high contrast textures.' },
  { id: 'pin_6', image: '/couple3.png', title: 'Romantic Coastal Walk', category: 'Aesthetic', likes: 9, description: 'Warm sand beneath a flowing ivory bridal gown.' }
];

const PRESETS = [
  {
    id: 'gold',
    name: 'Champagne Gold',
    swatches: ['#020208', '#0d0d1a', '#c9a96e', '#a88b4a', '#f3e5ab'],
    emoji: '👑'
  },
  {
    id: 'noir',
    name: 'Noir Minimalist',
    swatches: ['#050505', '#1a1a1a', '#e5e5e5', '#a3a3a3', '#ffffff'],
    emoji: '⚫'
  },
  {
    id: 'emerald',
    name: 'Emerald Garden',
    swatches: ['#011c0f', '#31724f', '#d4af37', '#e8f5e9', '#0d0d1a'],
    emoji: '🌿'
  },
  {
    id: 'sunset',
    name: 'Sunset Terracotta',
    swatches: ['#2c1a32', '#d98880', '#f5cba7', '#f9ebd2', '#c9a96e'],
    emoji: '🌅'
  }
];

export default function MoodBoardPage() {
  const router = useRouter();
  const store = useWeddingStore();
  const { user, loading } = store;

  // Active States
  const [pins, setPins] = useState(INITIAL_PINS);
  const [swatches, setSwatches] = useState(['#020208', '#0d0d1a', '#c9a96e', '#a88b4a', '#f3e5ab']);
  const [selectedPreset, setSelectedPreset] = useState('gold');
  const [activeFilter, setActiveFilter] = useState('All');
  const [customColor, setCustomColor] = useState('#ffffff');

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
      <div className="flex-center" style={{ minHeight: '100vh', background: '#0d0d1a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(201, 169, 110, 0.15)', borderTopColor: '#c9a96e', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
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
      alert('A maximum of 7 custom theme colors is allowed.');
      return;
    }
    if (!customColor.startsWith('#') || customColor.length !== 7) {
      alert('Please enter a valid hex code (e.g. #ffffff).');
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
      alert('Please provide a title and image path.');
      return;
    }
    const newPin = {
      id: `pin_${Date.now()}`,
      image: form.image,
      title: form.title,
      category: form.category,
      likes: 0,
      description: form.description || 'Custom added mood board inspiration element.'
    };
    setPins(prev => [newPin, ...prev]);
    setForm({ title: '', image: '', category: 'Decor', description: '' });
  };

  // AI Style Report Generator
  const generateAiReport = async () => {
    setAiGenerating(true);
    setAiReport('');

    // Build a context-aware prompt from current pins and swatches
    const pinSummary = pins.map(p => `${p.title} (${p.category})`).join(', ');
    const swatchList = swatches.join(', ');
    const prompt = `Analyze my wedding mood board aesthetic. My current inspiration pins are: ${pinSummary}. My color palette is: ${swatchList}. My selected preset vibe is "${selectedPreset || 'gold'}". Write a professional, 3-paragraph wedding design concept proposal describing the overall aesthetic, recommended venue styling, and styling tips.`;

    try {
      const { api } = await import('@/lib/api');
      if (api.isAuthenticated()) {
        const response = await api.sendAiChat(prompt);
        if (response && response.text) {
          // Strip markdown headers for cleaner display in the report box
          setAiReport(response.text.replace(/^###\s*/gm, '').replace(/\*\*/g, ''));
          setAiGenerating(false);
          return;
        }
      }
    } catch (err) {
      console.warn('AI backend unavailable for moodboard report, using local fallback:', err);
    }
    
    // Local fallback if backend is unreachable
    const reports = {
      gold: `Your design profile showcases a majestic Champagne Gold theme. Combining deep celestial blacks and midnight blues with soft ivory and gold swatches outlines a timeless, royal atmosphere. The curated dining setups and diamond ring captures point toward a high-society luxury banquet aesthetic, suited perfectly for a grand hotel foyer or classical manor reception.`,
      noir: `A masterpiece in monochromatic Noir Minimalism. By sticking strictly to neutral charcoal, soft stone greys, and high-contrast whites, your mood board establishes a sharp, high-end editorial vibe. Rely on architectural venue structures, bold monochrome drapery, and low-glow candlelight to achieve this dramatic, artistic Vogue runway wedding.`,
      emerald: `An organic, fresh Emerald Garden narrative. Joining deep forest green tones with rich foliage accents and champagne gold highlights creates a majestic natural paradise. Pinned imagery hints at coastal sunset walks and ocean-side arches, suggesting a luxury bohemian styling best expressed through open-air dining tables under twinkling string lights.`,
      sunset: `A warm, relaxed Sunset Terracotta romance. The dusty rose, peach-blossom, and warm sand palette evokes an intimate seaside wedding. Complemented by vintage lace dresses and sand-walk photography, this profile channels beachside sunset vibes, making it feel deeply emotional, natural, and incredibly cozy.`
    };

    const key = selectedPreset || 'gold';
    setAiReport(reports[key] || reports.gold);
    setAiGenerating(false);
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
          <span className={styles.badge}>Pinterest Style Board</span>
          <h1 className={styles.title}>Wedding Mood Board</h1>
          <p className={styles.subtitle}>
            Collect inspiration pins, curate your custom theme swatches, and let the AI Copilot define your ultimate wedding aesthetic.
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
                    border: '1px dashed rgba(201,169,110,0.15)',
                    borderRadius: '16px',
                    color: '#a0937d' 
                  }}
                >
                  No pins found in category "{activeFilter}". Click "Add Custom Inspiration Pin" on the right or change the filter.
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
                        >
                          ❤️ <span>{pin.likes}</span>
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handleDeletePin(pin.id)} 
                          className={styles.deleteBtn}
                          title="Delete Pin"
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
                <span>⚜️</span> Curated Vibe Presets
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
                  placeholder="#ffffff"
                  className={styles.colorInput}
                />
                <input 
                  type="color" 
                  value={customColor} 
                  onChange={(e) => setCustomColor(e.target.value)}
                  style={{ width: '40px', height: '36px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                />
                <button 
                  type="button" 
                  onClick={addCustomSwatch}
                  className={styles.addSwatchBtn}
                >
                  Add
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
                    placeholder="E.g. Table centerpiece"
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
                    <option value="/wedding_couple_bg.png">Elegant Couple Session</option>
                    <option value="/wedding_venue_bg.png">Malibu Sunset Arch</option>
                    <option value="/wedding_table_bg.png">Gilded Dining Reception</option>
                    <option value="/wedding_rings_bg.png">Vintage Diamond Rings</option>
                    <option value="/couple1.png">Modern Beach couple</option>
                    <option value="/couple2.png">Magazine Closeups</option>
                    <option value="/couple3.png">Romantic Coastal walk</option>
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
                  <label className={styles.label}>Notes</label>
                  <textarea 
                    placeholder="Write styling thoughts..."
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    className={styles.textarea}
                  />
                </div>
                <button type="submit" className={styles.submitBtn}>
                  Pin to Board
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
                  Analyze your current inspiration pins and custom swatches to draft a professional design concept proposal.
                </p>
                <button 
                  type="button" 
                  onClick={generateAiReport}
                  className={styles.aiGenerateBtn}
                  disabled={aiGenerating}
                >
                  {aiGenerating ? (
                    <>
                      <span className={styles.aiGeneratingSpinner}>✨</span> Generating...
                    </>
                  ) : (
                    '✨ Generate Design Report'
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
