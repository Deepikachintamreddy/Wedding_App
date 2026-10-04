'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWeddingStore } from '@/lib/store';

export default function DemoLauncherPage() {
  const router = useRouter();
  const store = useWeddingStore();

  useEffect(() => {
    // Initialize the isolated demonstration workspace
    store.startDemoMode();
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex-center" style={{ minHeight: '100vh', background: '#0a192f', color: '#f5f0e8', textAlign: 'center', padding: '24px' }}>
      <div className="card glass-panel p-8 max-w-md flex-col items-center gap-4">
        <span style={{ fontSize: '3rem' }}>✨</span>
        <h1 className="h3 font-heading text-gold mb-1">Loading Interactive Demo</h1>
        <p className="body-sm text-secondary mb-4">
          Setting up an isolated sample workspace with Vanessa & Noah (Malibu, CA).
        </p>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(212, 175, 55, 0.2)', borderTopColor: '#d4af37', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
      <style jsx>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .flex-center { display: flex; align-items: center; justify-content: center; min-height: 100vh; }
        .max-w-md { max-width: 28rem; }
        .flex-col { display: flex; flex-direction: column; }
        .items-center { align-items: center; }
        .gap-4 { gap: 16px; }
        .p-8 { padding: 32px; }
        .mb-1 { margin-bottom: 4px; }
        .mb-4 { margin-bottom: 16px; }
      `}</style>
    </div>
  );
}
