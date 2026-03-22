'use client';
import { useState } from 'react';

const bg = '#070C18';
const card = '#0C1220';
const border = 'rgba(255,255,255,0.07)';
const text = '#F1F5F9';
const accent = '#10B981';
const muted = '#94A3B8';

const tabs = ['All', 'Unanswered', 'Replied'];

export default function CommentsPage() {
  const [activeTab, setActiveTab] = useState('All');

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: text, margin: 0 }}>Comment Inbox</h1>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: `1px solid ${border}`, paddingBottom: '0' }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeTab === tab ? accent : muted,
              fontWeight: activeTab === tab ? 700 : 400,
              padding: '0.65rem 1rem',
              fontSize: '0.9rem',
              cursor: 'pointer',
              borderBottom: activeTab === tab ? `2px solid ${accent}` : '2px solid transparent',
              marginBottom: '-1px',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Empty State */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '4rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
        <h3 style={{ color: text, marginBottom: '0.5rem' }}>No comments yet</h3>
        <p style={{ color: muted, margin: '0 auto', fontSize: '0.9rem', maxWidth: '380px' }}>
          Connect your accounts to start monitoring — connect your accounts to start monitoring.
        </p>
        <a href="/accounts" style={{ display: 'inline-block', marginTop: '1.5rem', background: accent, color: '#fff', padding: '0.65rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
          Connect Accounts
        </a>
      </div>
    </div>
  );
}
