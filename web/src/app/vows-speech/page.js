'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWeddingStore } from '@/lib/store';
import { api } from '@/lib/api';

const TRAITS_OPTIONS = [
  'Caring', 'Loving', 'Beautiful', 'Hilarious', 'Loyal', 'Adventurous', 
  'Supportive', 'Patient', 'Patient listener', 'Kind-hearted', 'Brilliant', 'Clumsy but sweet'
];

export default function VowsSpeechPage() {
  const router = useRouter();
  const store = useWeddingStore();
  const { user, loading, deductAiCredit, addTask } = store;

  // Form State
  const [role, setRole] = useState('Groom');
  const [partnerName, setPartnerName] = useState('');
  const [tone, setTone] = useState('Romantic');
  const [selectedTraits, setSelectedTraits] = useState([]);
  const [memories, setMemories] = useState('');

  // Result State
  const [generating, setGenerating] = useState(false);
  const [resultText, setResultText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    } else if (user) {
      // Auto fill partner name from "A & B" format if possible
      const parts = user.name.split('&');
      if (parts.length > 1) {
        setPartnerName(parts[1].trim());
      }
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh', background: '#0d0d1a' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(201, 169, 110, 0.15)', borderTopColor: '#c9a96e', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style jsx>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .flex-center { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #0d0d1a; }
        `}</style>
      </div>
    );
  }

  const handleTraitToggle = (trait) => {
    setSelectedTraits(prev => 
      prev.includes(trait) ? prev.filter(t => t !== trait) : [...prev, trait]
    );
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!partnerName.trim()) {
      alert('Please provide your partner or couple name.');
      return;
    }

    setGenerating(true);
    setResultText('');
    setErrorMsg('');

    try {
      const response = await api.generateSpeech(
        role, 
        partnerName, 
        selectedTraits, 
        memories, 
        tone
      );

      if (response.success) {
        setResultText(response.text);
        if (response.creditsUsed && user.role !== 'admin' && !user.eventPassActive) {
          deductAiCredit();
        }
      } else {
        setErrorMsg('Could not compile generation models. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Error occurred communicating with generation engine.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(resultText.replace(/[#*_-]/g, ''));
    alert('Copied to clipboard successfully!');
  };

  const handleSaveToChecklist = () => {
    addTask({
      title: `Review generated ${role === 'Groom' || role === 'Bride' ? 'vows' : 'wedding speech'}`,
      category: 'Planner',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days out
      notes: resultText.substring(0, 500) + '...',
      period: 'Upcoming',
      assignedTo: role === 'Bride' ? 'Bride' : role === 'Groom' ? 'Groom' : 'Both'
    });
    alert('Added to your Checklist schedule!');
  };

  return (
    <main className="vow-layout">
      <div className="navbar-spacer"></div>

      <div className="container py-8 max-w-5xl">
        <div className="flex-between mb-8 flex-wrap gap-4">
          <div>
            <span className="badge badge-gold">✨ AI Assistant Tool</span>
            <h1 className="h2 font-heading text-gold mt-2 mb-1">Vow & Speech Generator</h1>
            <p className="body-sm text-secondary">
              Let the VND intelligence engine draft beautiful, personalized wedding vows or guest speeches in seconds.
            </p>
          </div>
          <div className="credits-badge">
            <span className="badge badge-secondary">
              {user.eventPassActive ? 'Event Pass Active' : `✨ ${user.aiCredits ?? 15} Credits`}
            </span>
          </div>
        </div>

        <div className="vows-grid">
          {/* Left Column: Form Settings */}
          <div className="card glass-panel p-6">
            <h3 className="h4 text-gold font-heading mb-4 border-b pb-2">✍️ Speech Settings</h3>
            
            <form onSubmit={handleGenerate}>
              <div className="form-group mb-4">
                <label className="form-label">Your Role / Perspective</label>
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  className="form-select"
                >
                  <option value="Groom">🤵 Groom (Writing Vows)</option>
                  <option value="Bride">👰 Bride (Writing Vows)</option>
                  <option value="Best Man">🎙️ Best Man (Writing Toast Speech)</option>
                  <option value="Maid of Honor">🎙️ Maid of Honor (Writing Toast Speech)</option>
                  <option value="Father of the Bride">🎙️ Father of the Bride (Writing Speech)</option>
                  <option value="Mother of the Bride">🎙️ Mother of the Bride (Writing Speech)</option>
                </select>
              </div>

              <div className="form-group mb-4">
                <label className="form-label">
                  {role === 'Groom' || role === 'Bride' ? "Partner's First Name" : "Celebrant's Name"}
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Elena"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group mb-4">
                <label className="form-label">Target Tone</label>
                <select 
                  value={tone} 
                  onChange={(e) => setTone(e.target.value)}
                  className="form-select"
                >
                  <option value="Romantic">🌹 Romantic & Deep</option>
                  <option value="Funny">🤪 Funny & Sweet</option>
                  <option value="Tear-Jerker">😢 Emotional (Tear-Jerker)</option>
                  <option value="Heartfelt">❤️ Heartfelt & Sincere</option>
                  <option value="Traditional">🏛️ Classic & Traditional</option>
                </select>
              </div>

              <div className="form-group mb-4">
                <label className="form-label">Select Key Traits</label>
                <div className="traits-container flex-start gap-2 flex-wrap mt-2">
                  {TRAITS_OPTIONS.map(trait => (
                    <button
                      key={trait}
                      type="button"
                      onClick={() => handleTraitToggle(trait)}
                      className={`trait-chip ${selectedTraits.includes(trait) ? 'selected' : ''}`}
                    >
                      {trait}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group mb-6">
                <label className="form-label">Share a Favorite Memory or Story (Optional)</label>
                <textarea 
                  placeholder="e.g. We got caught in the rain on our second date and ended up eating cold pizza on the floor..."
                  value={memories}
                  onChange={(e) => setMemories(e.target.value)}
                  className="form-textarea"
                  style={{ minHeight: '100px' }}
                />
              </div>

              <button 
                type="submit" 
                disabled={generating || (!user.eventPassActive && (user.aiCredits ?? 0) <= 0)}
                className="btn btn-primary w-full py-3"
              >
                {generating ? '✨ Combining Math & Story Models...' : '✨ Generate Vows & Speeches'}
              </button>
            </form>
          </div>

          {/* Right Column: AI Output */}
          <div className="card glass-panel p-6 flex-col justify-between">
            <div>
              <h3 className="h4 text-gold font-heading mb-4 border-b pb-2">📋 Draft Preview</h3>
              
              {errorMsg && (
                <div className="bg-danger-opaque p-4 rounded-lg border border-danger text-danger mb-4">
                  ⚠️ {errorMsg}
                </div>
              )}

              {resultText ? (
                <div className="vows-result-box p-4 rounded-lg bg-secondary overflow-y-auto" style={{ maxHeight: '350px' }}>
                  <div className="result-text whitespace-pre-line text-primary body-sm">
                    {resultText.replace(/[#*_-]/g, '')}
                  </div>
                </div>
              ) : (
                <div className="flex-center py-12 text-center text-muted">
                  <span style={{ fontSize: '3rem' }}>✍️</span>
                  <p className="body-sm mt-3">
                    Your generated wedding writing proposal will show up here. Change the settings on the left and hit generate!
                  </p>
                </div>
              )}
            </div>

            {resultText && (
              <div className="flex gap-3 mt-4">
                <button 
                  onClick={handleCopyToClipboard}
                  className="btn btn-secondary flex-1"
                >
                  📋 Copy Text
                </button>
                <button 
                  onClick={handleSaveToChecklist}
                  className="btn btn-primary flex-1"
                >
                  💾 Save to Checklist
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .vow-layout {
          background: transparent;
          color: #f5f0e8;
          min-height: 100vh;
        }
        .navbar-spacer {
          height: 80px;
        }
        .max-w-5xl {
          max-width: 64rem;
          margin: 0 auto;
        }
        .vows-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 24px;
        }
        @media (max-width: 900px) {
          .vows-grid {
            grid-template-columns: 1fr;
          }
        }
        .bg-danger-opaque {
          background: rgba(239, 68, 68, 0.08);
          border-color: rgba(239, 68, 68, 0.2);
        }
        .bg-secondary {
          background: rgba(26, 26, 46, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .trait-chip {
          padding: 6px 12px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.05);
          color: #f5f0e8;
          border: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .trait-chip:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .trait-chip.selected {
          background: #c9a96e;
          color: #0d0d1a;
          border-color: #c9a96e;
        }
        .w-full {
          width: 100%;
        }
        .whitespace-pre-line {
          white-space: pre-line;
        }
      `}</style>
    </main>
  );
}
